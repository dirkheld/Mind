import { db } from "@/lib/db/client";
import { cardSelect, paymentSelect } from "@/lib/account/store";
export async function listAdminUsers(search: string, page: number) {
  const where = search ? { email: { contains: search, mode: "insensitive" as const } } : {};
  const [users, count] = await db.$transaction([
    db.user.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip: (page - 1) * 20, take: 20, select: {
      id: true, email: true, status: true, createdAt: true, loginCount: true, lastLoginAt: true,
      usage: { select: { conversations: true, messages: true, tokens: true, lastUsedAt: true } },
      cards: { select: cardSelect },
      payments: { select: paymentSelect, orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { payments: true } },
    } }),
    db.user.count({ where }),
  ]);
  return { users, count, page };
}
