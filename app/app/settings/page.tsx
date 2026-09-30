import { requireUser } from "@/lib/auth/session";
import { getAccount } from "@/lib/account/store";
import { AccountPanel } from "@/components/account-panel";
import { parsePage } from "@/lib/http/pagination";
export default async function Settings({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const user = await requireUser();
  const page = parsePage((await searchParams).page);
  return <AccountPanel key={page} initial={await getAccount(user.id, page)}/>;
}
