export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function errorResponse(error: unknown) {
  const known = error instanceof AppError;
  const requestId = crypto.randomUUID();
  if (!known) console.error(JSON.stringify({ event: "request.failed", requestId }));
  return Response.json({ error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "Das hat gerade nicht funktioniert. Bitte versuche es erneut.", requestId } }, { status: known ? error.status : 500, headers: { "Cache-Control": "no-store" } });
}
