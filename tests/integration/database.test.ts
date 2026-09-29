import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { randomUUID } from "node:crypto";
describe("PostgreSQL foundation", () => {
  const run = randomUUID();
  afterAll(async () => {
    await db.user.deleteMany({ where: { email: { endsWith: `@${run}.test` } } });
    await db.rateLimitBucket.deleteMany({ where: { key: { startsWith: run } } });
    await db.$disconnect();
  });
  it("creates isolated identities with safe defaults and cascades sessions", async () => {
    const first = await db.user.create({ data: { email: `a@${run}.test`, profile: { create: {} }, preferences: { create: {} } }, include: { profile: true, preferences: true } });
    const second = await db.user.create({ data: { email: `b@${run}.test` } });
    expect(first.id).not.toBe(second.id);
    expect(first.profile?.timezone).toBeNull();
    expect(first.preferences?.whatsappEnabled).toBe(false);
    expect(first.preferences?.planRemindersEnabled).toBe(false);
    const token = randomUUID();
    await db.session.create({ data: { userId: first.id, sessionToken: token, expires: new Date(Date.now()+60_000) } });
    expect(await db.session.findFirst({ where: { sessionToken: token, userId: second.id } })).toBeNull();
    await db.user.delete({ where: { id: first.id } });
    expect(await db.session.findUnique({ where: { sessionToken: token } })).toBeNull();
    expect(await db.profile.findUnique({ where: { userId: first.id } })).toBeNull();
  });
  it("enforces one-use verification tokens", async () => {
    const identifier = `token@${run}.test`; const token = randomUUID();
    await db.verificationToken.create({ data: { identifier, token, expires: new Date(Date.now()+60000) } });
    await db.verificationToken.delete({ where: { identifier_token: { identifier, token } } });
    await expect(db.verificationToken.delete({ where: { identifier_token: { identifier, token } } })).rejects.toThrow();
  });
  it("atomically limits concurrent requests and resets an expired window", async () => {
    const key = `${run}:concurrent`; const now = new Date();
    const results = await Promise.all(Array.from({ length: 12 }, ()=>consumeRateLimit(key, 5, 60_000, now)));
    expect(results.filter(Boolean)).toHaveLength(5);
    expect(await consumeRateLimit(key, 5, 60_000, new Date(now.getTime()+60_001))).toBe(true);
  });
  it("rolls back an invalid account bundle", async () => {
    const email = `rollback@${run}.test`;
    await expect(db.$transaction(async tx => { await tx.user.create({ data: { email } }); await tx.user.create({ data: { email } }); })).rejects.toThrow();
    expect(await db.user.findUnique({ where: { email } })).toBeNull();
  });
});
