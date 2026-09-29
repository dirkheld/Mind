import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/admin/policy";
import { getKnowledgeWorkspace } from "@/lib/admin/store";
import { AdminEditor } from "@/components/admin-editor";
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = { title: "Administration", robots: { index: false, follow: false } };
export default async function Admin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.emailVerified || !isAdminEmail(user.email)) notFound();
  return <AppShell admin><nav className="admin-subnav admin-page" aria-label="Administration"><Link href="/admin" aria-current="page">Gesprächsgrundlage</Link><Link href="/admin/users">Nutzer & Nutzung</Link></nav><AdminEditor initial={await getKnowledgeWorkspace()}/></AppShell>;
}
