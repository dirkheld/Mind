import { parsePage } from "@/lib/http/pagination";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/users";
import { errorResponse } from "@/lib/errors";
export async function GET(request: Request) {
  try {
    await requireAdmin(); const params = new URL(request.url).searchParams;
    const page = parsePage(params.get("page"));
    return Response.json(await listAdminUsers((params.get("q") ?? "").trim().slice(0, 200), page), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
