import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/admin/policy";
export const dynamic = "force-dynamic";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell alias={user.profile?.alias} admin={!!user.emailVerified && isAdminEmail(user.email)}>{children}</AppShell>;
}
