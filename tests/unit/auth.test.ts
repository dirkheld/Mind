import { describe, it, expect } from "vitest";
import { emailSchema, isActive, safeRedirect } from "@/lib/auth/policy";
import { loginKey } from "@/lib/auth/rate-limit";
import { environmentSchema } from "@/lib/config/env";
import { AppError, errorResponse } from "@/lib/errors";
describe("identity policy", () => {
  it("normalizes email and rejects ambiguous identifiers", () => {
    expect(emailSchema.parse(" Alex@Example.DE ")).toBe("alex@example.de");
    for (const value of ["alex@example.de,other@example.de", "invalid", "a\nb@example.de"]) expect(emailSchema.safeParse(value).success).toBe(false);
  });
  it("denies suspended, pending, deleted and soft-deleted accounts", () => {
    expect(isActive("ACTIVE")).toBe(true);
    for (const state of ["SUSPENDED", "DELETION_PENDING", "DELETED", "unknown"]) expect(isActive(state)).toBe(false);
    expect(isActive("ACTIVE", new Date())).toBe(false);
  });
  it("prevents open redirects including protocol-relative and credential URLs", () => {
    const origin = "https://mind.example";
    for (const value of ["https://evil.example", "//evil.example", "https://mind.example@evil.example", "javascript:alert(1)"]) expect(safeRedirect(value, origin)).toBe(`${origin}/app`);
    expect(safeRedirect("/app/settings", origin)).toBe(`${origin}/app/settings`);
  });
  it("stores only a keyed hash of login addresses", () => {
    const key = loginKey("alex@example.de", "secret");
    expect(key).not.toContain("alex");
    expect(key).toBe(loginKey("alex@example.de", "secret"));
    expect(key).not.toBe(loginKey("alex@example.de", "other-secret"));
  });
});
describe("configuration and errors", () => {
  it("requires a PostgreSQL URL and strong secret", () => {
    const env = { DATABASE_URL: "postgresql://localhost/mind", AUTH_SECRET: "a".repeat(32), AUTH_URL: "https://mind.example", EMAIL_SERVER: "smtp://localhost:1025", EMAIL_FROM: "noreply@mind.example" };
    expect(environmentSchema.safeParse(env).success).toBe(true);
    expect(environmentSchema.safeParse({ ...env, AUTH_SECRET: "short" }).success).toBe(false);
    expect(environmentSchema.safeParse({ ...env, DATABASE_URL: "file:./db.sqlite" }).success).toBe(false);
  });
  it("returns structured errors without leaking stack or internal details", async () => {
    const response = errorResponse(new Error("DATABASE_PASSWORD=secret"));
    const text = await response.text();
    expect(response.status).toBe(500); expect(text).not.toContain("secret");
    expect(JSON.parse(text).error.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(errorResponse(new AppError("AUTHENTICATION_ERROR", "Bitte melde dich an.", 401)).status).toBe(401);
  });
});
