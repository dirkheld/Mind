import { requireUser } from "@/lib/auth/session";
import { getAccount } from "@/lib/account/store";
import { AccountPanel } from "@/components/account-panel";
export default async function Settings() {
  const user = await requireUser();
  return <AccountPanel initial={await getAccount(user.id)}/>;
}
