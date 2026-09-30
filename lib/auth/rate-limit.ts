import { createHmac, randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";

// Atomic PostgreSQL upsert, shared across processes; no raw email or IP is stored.
export async function consumeRateLimit(key: string, limit: number, windowMs: number, now = new Date()) {
  const expires = new Date(now.getTime() + windowMs);
  const result = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO rate_limit_buckets (id, key, count, "expiresAt")
    VALUES (${randomUUID()}::uuid, ${key}, 1, ${expires})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limit_buckets."expiresAt" <= ${now} THEN 1 ELSE LEAST(rate_limit_buckets.count, ${limit}) + 1 END,
      "expiresAt" = CASE WHEN rate_limit_buckets."expiresAt" <= ${now} THEN ${expires} ELSE rate_limit_buckets."expiresAt" END
    RETURNING count`;
  return result[0].count <= limit;
}
export function loginKey(email: string, secret: string) {
  return "login:" + createHmac("sha256", secret).update(email).digest("hex");
}
