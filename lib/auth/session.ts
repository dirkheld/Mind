import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./config";
import { db } from "@/lib/db/client";
import { isActive } from "./policy";
export const currentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: {
    id: true, email: true, emailVerified: true, status: true, deletedAt: true,
    profile: { select: { alias: true, locale: true, timezone: true, onboardingCompleted: true } },
  } });
  return user && isActive(user.status, user.deletedAt) ? user : null;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
