import "server-only";
import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { mindDb?: PrismaClient };
export const db = globalDb.mindDb ?? new PrismaClient({ log: [] });
if (process.env.NODE_ENV !== "production") globalDb.mindDb = db;
