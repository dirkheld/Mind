import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
try {
  // Fixed identifiers; bounded work so a maintenance run cannot hold a large lock.
  for (const [table, expiry] of [["sessions", "expires"], ["verification_tokens", "expires"], ["rate_limit_buckets", "expiresAt"]]) {
    const count = await db.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "${expiry}" < NOW() AND id IN (SELECT id FROM "${table}" WHERE "${expiry}" < NOW() ORDER BY "${expiry}" LIMIT 1000)`);
    console.log(JSON.stringify({ table, expiredRowsRemoved: count }));
  }
} finally { await db.$disconnect(); }
