import { z } from "zod";
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export function isActive(status: string, deletedAt: Date | null = null) {
  return status === "ACTIVE" && deletedAt === null;
}
export function safeRedirect(url: string, baseUrl: string) {
  try {
    const target = new URL(url, baseUrl);
    return target.origin === new URL(baseUrl).origin ? target.href : new URL("/app", baseUrl).href;
  } catch { return new URL("/app", baseUrl).href; }
}
