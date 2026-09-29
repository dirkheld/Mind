import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAdminEmail } from "@/lib/admin/policy";
import { knowledgeSchema } from "@/lib/admin/schema";
import { initialKnowledge } from "@/lib/admin/defaults";
import { AppError } from "@/lib/errors";
const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), get: vi.fn(), save: vi.fn(), publish: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ currentUser: mocks.currentUser }));
vi.mock("@/lib/admin/store", () => ({ getKnowledgeWorkspace: mocks.get, saveKnowledge: mocks.save, publishKnowledge: mocks.publish }));
import { GET, POST } from "@/app/api/admin/knowledge/route";
import { requireAdmin } from "@/lib/admin/auth";
describe("admin authorization and input boundary", () => {
  beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("ADMIN_EMAILS", "owner@example.test"); vi.stubEnv("AUTH_URL", "http://localhost:3000"); mocks.currentUser.mockResolvedValue({ id: "owner", email: "owner@example.test", emailVerified: new Date() }); mocks.get.mockResolvedValue({ version: 1 }); });
  it("denies missing configuration and requires exact email matches", () => { expect(isAdminEmail("a@b.test", "")).toBe(false); expect(isAdminEmail("OWNER@example.test", " owner@example.test ")).toBe(true); expect(isAdminEmail("owner@example.test.attacker.test", "owner@example.test")).toBe(false); });
  it("rejects anonymous, ordinary and unverified users for reads and writes", async () => {
    for (const [user, status] of [[null, 401], [{ email: "other@example.test", emailVerified: new Date() }, 403], [{ email: "owner@example.test", emailVerified: null }, 403]] as const) {
      mocks.currentUser.mockResolvedValue(user);
      expect((await GET()).status).toBe(status);
      expect((await POST(new Request("http://localhost:3000/api/admin/knowledge", { method: "POST" }))).status).toBe(status);
    }
    expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("checks identity again on every operation", async () => { expect(await requireAdmin()).toHaveProperty("id", "owner"); mocks.currentUser.mockResolvedValue(null); await expect(requireAdmin()).rejects.toBeInstanceOf(AppError); });
  it("rejects cross-origin and missing-origin writes", async () => {
    for (const origin of ["https://attacker.test", ""]) expect((await POST(new Request("http://localhost:3000/api/admin/knowledge", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{}" }))).status).toBe(403);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("validates data and size before saving and returns conflicts", async () => {
    const request = (body: string) => new Request("http://localhost:3000/api/admin/knowledge", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body });
    expect((await POST(request("{"))).status).toBe(400);
    expect((await POST(request("x".repeat(1_000_001)))).status).toBe(413);
    const invalid = await POST(request(JSON.stringify({ action: "save", expectedVersion: 1, draft: { ...initialKnowledge, systemPrompt: "" } })));
    expect(invalid.status).toBe(400);
    mocks.save.mockRejectedValue(new AppError("CONFLICT", "conflict", 409));
    expect((await POST(request(JSON.stringify({ action: "save", expectedVersion: 1, draft: initialKnowledge })))).status).toBe(409);
  });
  it("keeps admin reads uncached and accepts only explicit valid publications", async () => { const response = await GET(); expect(response.headers.get("cache-control")).toBe("no-store"); const request = new Request("http://localhost:3000/api/admin/knowledge", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ action: "publish", expectedVersion: 2 }) }); expect((await POST(request)).status).toBe(200); expect(mocks.publish).toHaveBeenCalledWith(2, "owner"); });
  it("rejects executable source URLs and oversized prompts", () => { const resource = { id: "15f63db7-97e4-4fbc-b577-819b823e25ea", title: "Source", citation: "", content: "Text", notes: "", enabled: false, url: "javascript:alert(1)" }; expect(knowledgeSchema.safeParse({ ...initialKnowledge, resources: [resource] }).success).toBe(false); expect(knowledgeSchema.safeParse({ ...initialKnowledge, systemPrompt: "x".repeat(30001) }).success).toBe(false); });
});
