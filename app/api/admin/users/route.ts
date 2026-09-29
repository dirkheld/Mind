import { requireAdmin } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/users";
import { errorResponse } from "@/lib/errors";
export async function GET(request: Request) {
  try {
    await requireAdmin(); const params = new URL(request.url).searchParams;
    const page = Math.max(1, Math.min(10000, Math.floor(Number(params.get("page")) || 1)));
    return Response.json(await listAdminUsers((params.get("q") ?? "").trim().slice(0, 200), page), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
