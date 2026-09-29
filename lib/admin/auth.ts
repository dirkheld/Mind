import { currentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { isAdminEmail } from "./policy";
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Bitte melde dich an.", 401);
  if (!user.emailVerified || !isAdminEmail(user.email)) throw new AppError("FORBIDDEN", "Dieser Bereich ist nur für die Administration zugänglich.", 403);
  return user;
}
