import { currentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { accountMutation } from "@/lib/account/schema";
import { getAccount, saveWhatsapp } from "@/lib/account/store";
import { readPrivateMutation } from "@/lib/http/json";
import { AppError, errorResponse } from "@/lib/errors";
export async function GET() {
  try { const user = await currentUser(); if (!user) throw new AppError("AUTH", "Bitte melde dich an.", 401); return Response.json(await getAccount(user.id), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const user = await currentUser(); if (!user) throw new AppError("AUTH", "Bitte melde dich an.", 401);
    const parsed = accountMutation.safeParse(await readPrivateMutation(request));
    if (!parsed.success) throw new AppError("INPUT", "Bitte prüfe deine Eingaben und die Telefonnummer mit Ländervorwahl.");
    if (parsed.data.action === "revoke-sessions") { await db.session.deleteMany({ where: { userId: user.id } }); return Response.json({ signedOut: true }); }
    await saveWhatsapp(user.id, parsed.data.consent, parsed.data.phone, parsed.data.expectedVersion);
    return Response.json(await getAccount(user.id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
