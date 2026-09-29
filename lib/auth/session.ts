import { redirect } from "next/navigation";
import { auth } from "./config";
import { db } from "@/lib/db/client";
import { isActive } from "./policy";
export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, include: { profile: true, preferences: true } });
  return user && isActive(user.status, user.deletedAt) ? user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
