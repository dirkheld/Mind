import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";

// HTTP end-to-end tests against the running local application and SMTP inbox.
// No authentication bypass: each session is obtained through Auth.js's real flow.
const base = process.env.AUTH_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("E2E tests require a local test server.");
const suffix = `${randomUUID()}.test`;
class Client {
  cookies = new Map<string,string>();
  async request(path: string, init: RequestInit = {}) {
    const response = await fetch(new URL(path,base), { ...init, redirect: "manual", headers: { ...init.headers, cookie: [...this.cookies].map(([k,v])=>`${k}=${v}`).join("; ") } });
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(";",1)[0]; const equals = pair.indexOf("=");
      this.cookies.set(pair.slice(0,equals),pair.slice(equals+1));
    }
    return response;
  }
  async csrf() { return (await (await this.request("/api/auth/csrf")).json()).csrfToken as string; }
  async requestLink(email: string) {
    const csrfToken = await this.csrf();
    const sent = await this.request("/api/auth/signin/nodemailer", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" }, body: new URLSearchParams({ csrfToken, email, callbackUrl: `${base}/app` }) });
    expect(sent.status).toBe(200);
    const result = await sent.json();
    expect(result.url).not.toContain("error=");
    let link = "";
    for (let attempt = 0; attempt < 30 && !link; attempt++) {
      for (const file of await readdir(".local/mail").catch(()=>[])) {
        const raw = (await readFile(`.local/mail/${file}`,"utf8")).replace(/=\r?\n/g, "").replace(/=3D/g,"=").replace(/&amp;/g,"&");
        if (!raw.includes(email)) continue;
        link = raw.match(/https?:\/\/[^\s<>"']+\/api\/auth\/callback\/nodemailer\?[^\s<>"']+/)?.[0] || "";
      }
      if (!link) await new Promise(resolve=>setTimeout(resolve,100));
    }
    expect(link, "local SMTP inbox must contain a verification link").toBeTruthy();
    return link;
  }
  async login(email: string) {
    const link = await this.requestLink(email);
    const callback = await this.request(link);
    expect(callback.status).toBe(302);
    const me = await this.request("/api/me");
    expect(me.status).toBe(200);
    return { user: await me.json(), link };
  }
}
describe("real authentication flow", () => {
  afterAll(async()=> { await db.user.deleteMany({ where: { email: { endsWith: suffix } } }); await db.$disconnect(); });
  it("protects personal routes and rejects requests without CSRF", async()=> {
    const client = new Client();
    expect((await client.request("/api/me")).status).toBe(401);
    expect((await client.request("/api/admin/knowledge")).status).toBe(401);
    expect((await client.request("/api/account")).status).toBe(401);
    expect((await client.request("/api/admin/users")).status).toBe(401);
    expect((await client.request("/admin")).headers.get("location")).toContain("/login");
    const page = await client.request("/app");
    expect(page.status).toBe(307); expect(page.headers.get("location")).toContain("/login");
    const invalid = await client.request("/api/auth/signin/nodemailer", { method: "POST", headers: { "Content-Type":"application/x-www-form-urlencoded" }, body: `email=invalid@${suffix}` });
    expect(invalid.headers.get("location")).toContain("MissingCSRF");
  }, 30_000);
  it("creates a verified account, isolates identities, prevents replay and revokes suspended access", async()=> {
    const a = new Client(); const b = new Client();
    const first = await a.login(`first@${suffix}`);
    const second = await b.login(`second@${suffix}`);
    expect(first.user.id).not.toBe(second.user.id);
    expect((await a.request("/api/admin/knowledge")).status).toBe(403);
    expect((await a.request("/api/admin/users")).status).toBe(403);
    expect((await a.request("/api/admin/knowledge", { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify({ action: "publish", expectedVersion: 1 }) })).status).toBe(403);
    const attemptedIdor = await (await a.request(`/api/me?userId=${second.user.id}`)).json();
    expect(attemptedIdor.id).toBe(first.user.id);
    const replay = await new Client().request(first.link);
    expect(replay.headers.get("location")).toContain("error=Verification");
    await db.user.update({ where: { id: first.user.id }, data: { status: "SUSPENDED" } });
    expect((await a.request("/api/me")).status).toBe(401);
    expect((await b.request("/api/me")).status).toBe(200);
    const csrfToken = await b.csrf();
    await b.request("/api/auth/signout", { method: "POST", headers: { "Content-Type":"application/x-www-form-urlencoded" }, body: new URLSearchParams({ csrfToken, callbackUrl: base }) });
    expect((await b.request("/api/me")).status).toBe(401);
  }, 60_000);
  it("rejects expired verification links and expired sessions", async()=> {
    const client = new Client();
    const email = `expired@${suffix}`;
    const link = await client.requestLink(email);
    await db.verificationToken.updateMany({ where: { identifier: email }, data: { expires: new Date(Date.now()-60_000) } });
    const callback = await client.request(link);
    expect(callback.headers.get("location")).toContain("error=Verification");
    expect((await client.request("/api/me")).status).toBe(401);
    const { user } = await client.login(`session@${suffix}`);
    await db.session.updateMany({ where: { userId: user.id }, data: { expires: new Date(Date.now()-60_000) } });
    expect((await client.request("/api/me")).status).toBe(401);
  }, 60_000);
  it("isolates account settings, records consent, erases the phone on revocation and revokes all own sessions", async () => {
    const a = new Client(); const b = new Client();
    const first = await a.login(`settings-a@${suffix}`); const second = await b.login(`settings-b@${suffix}`);
    const own = await (await a.request(`/api/account?userId=${second.user.id}`)).json();
    expect(own.email).toBe(`settings-a@${suffix}`);
    const body = { action: "whatsapp", expectedVersion: own.preferences.settingsVersion, consent: true, phone: "+49 151 23456789" };
    const post = (data: unknown, origin = base) => a.request("/api/account", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data) });
    expect((await post(body, "https://attacker.test")).status).toBe(403);
    expect((await post({ ...body, userId: second.user.id })).status).toBe(400);
    expect((await post({ ...body, phone: "123" })).status).toBe(400);
    const savedResponse = await post(body); expect(savedResponse.status).toBe(200); const saved = await savedResponse.json();
    expect(saved.preferences.whatsappPhone).toBe("+4915123456789"); expect(saved.preferences.whatsappConsentAt).toBeTruthy();
    expect((await post(body)).status).toBe(409);
    const untouched = await (await b.request("/api/account")).json(); expect(untouched.preferences.whatsappPhone).toBeNull();
    const prefs = await db.userPreferences.findUniqueOrThrow({ where: { userId: first.user.id } }); expect(prefs.whatsappEnabled).toBe(false); expect(prefs.whatsappVerifiedAt).toBeNull();
    const revoked = await (await post({ ...body, expectedVersion: saved.preferences.settingsVersion, consent: false, phone: "" })).json();
    expect(revoked.preferences.whatsappPhone).toBeNull(); expect(revoked.preferences.whatsappConsentAt).toBeNull();
    expect(await db.consentEvent.count({ where: { userId: first.user.id } })).toBe(2);
    expect((await db.user.findUniqueOrThrow({ where: { id: first.user.id } })).loginCount).toBe(1);
    const secondSession = new Client(); await secondSession.login(`settings-a@${suffix}`);
    expect((await post({ action: "revoke-sessions" })).status).toBe(200);
    expect((await a.request("/api/account")).status).toBe(401); expect((await secondSession.request("/api/account")).status).toBe(401);
    expect((await b.request("/api/account")).status).toBe(200);
  }, 60_000);
});
