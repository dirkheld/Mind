import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";
import { getAccount } from "@/lib/account/store";
import { listAdminUsers } from "@/lib/admin/users";
describe("minimal admin and billing views", () => {
  const email = `billing-${randomUUID()}@example.test`;
  afterAll(async () => { await db.user.deleteMany({ where: { email } }); await db.$disconnect(); });
  it("returns safe card metadata and usage without secrets, phone or content", async () => {
    const user = await db.user.create({ data: { email, preferences: { create: { whatsappPhone: "+4915123456789" } }, cards: { create: { providerReference: `private-${randomUUID()}`, brand: "visa", last4: "4242", expiryMonth: 12, expiryYear: 2030 } }, payments: { create: { providerReference: `private-${randomUUID()}`, amountMinor: 1200, currency: "EUR", status: "PAID" } }, usage: { create: { conversations: 2, messages: 8, tokens: 300 } } } });
    const result = await listAdminUsers(email, 1); expect(result.count).toBe(1);
    expect(Object.keys(result.users[0]).sort()).toEqual(["id", "email", "status", "createdAt", "loginCount", "lastLoginAt", "usage", "cards", "payments", "_count"].sort());
    expect(result.users[0].cards[0].last4).toBe("4242");
    const json = JSON.stringify(result); expect(json).not.toContain("providerReference"); expect(json).not.toContain("+4915123456789"); expect(json).not.toContain("sessionToken");
    const own = await getAccount(user.id); expect(own.cards[0].last4).toBe("4242"); expect(JSON.stringify(own)).not.toContain("providerReference"); expect(own.payments[0].amountMinor).toBe(1200);
  }, 15000);
});
