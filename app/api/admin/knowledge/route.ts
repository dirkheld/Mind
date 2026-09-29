import { requireAdmin } from "@/lib/admin/auth";
import { mutationSchema } from "@/lib/admin/schema";
import { getKnowledgeWorkspace, publishKnowledge, saveKnowledge } from "@/lib/admin/store";
import { AppError, errorResponse } from "@/lib/errors";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await requireAdmin(); return Response.json(await getKnowledgeWorkspace(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const origin = new URL(process.env.AUTH_URL!).origin;
    if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") throw new AppError("ORIGIN", "Diese Anfrage ist nicht zulässig.", 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AppError("FORMAT", "JSON erwartet.", 415);
    const reader = request.body?.getReader();
    if (!reader) throw new AppError("INPUT", "Inhalt fehlt.");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 1_000_000) { await reader.cancel(); throw new AppError("SIZE", "Der Inhalt ist zu groß (maximal 1 MB).", 413); } chunks.push(value); }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new AppError("INPUT", "Die Eingabe konnte nicht gelesen werden."); }
    const parsed = mutationSchema.safeParse(body);
    if (!parsed.success) throw new AppError("INPUT", "Bitte prüfe Prompt, Pflichtfelder, Quellen-URLs und Textlängen.");
    if (parsed.data.action === "save") await saveKnowledge(parsed.data.draft, parsed.data.expectedVersion);
    else await publishKnowledge(parsed.data.expectedVersion, user.id);
    return Response.json(await getKnowledgeWorkspace(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
