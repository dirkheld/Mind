import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/auth/session";
export default async function Chat() { const user = await requireUser(); return <Dashboard alias={user.profile?.alias}/>; }
