import { requireUser } from "@/lib/auth/session";
import { Dashboard } from "@/components/dashboard";
export default async function Page() { const user = await requireUser(); return <Dashboard alias={user.profile?.alias} />; }
