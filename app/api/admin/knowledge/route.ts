import { requireAdmin } from "@/lib/admin/auth";
import { mutationSchema } from "@/lib/admin/schema";
import { getKnowledgeWorkspace, publishKnowledge, saveKnowledge } from "@/lib/admin/store";
import { AppError, errorResponse } from "@/lib/errors";
import { readPrivateMutation } from "@/lib/http/json";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await requireAdmin(); return Response.json(await getKnowledgeWorkspace(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const body = await readPrivateMutation(request, 1_000_000);
    const parsed = mutationSchema.safeParse(body);
    if (!parsed.success) throw new AppError("INPUT", "Bitte prüfe Prompt, Pflichtfelder, Quellen-URLs und Textlängen.");
    if (parsed.data.action === "save") await saveKnowledge(parsed.data.draft, parsed.data.expectedVersion);
    else await publishKnowledge(parsed.data.expectedVersion, user.id);
    return Response.json(await getKnowledgeWorkspace(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
