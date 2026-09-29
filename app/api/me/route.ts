import { currentUser } from "@/lib/auth/session";
import { AppError, errorResponse } from "@/lib/errors";
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) throw new AppError("AUTHENTICATION_ERROR", "Bitte melde dich an.", 401);
    return Response.json({ id: user.id, email: user.email, profile: user.profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
