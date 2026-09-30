import { AppError } from "@/lib/errors";
export async function readPrivateMutation(request: Request, limit = 8000) {
  if (request.headers.get("origin") !== new URL(process.env.AUTH_URL!).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new AppError("ORIGIN", "Diese Anfrage ist nicht zulässig.", 403);
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") throw new AppError("FORMAT", "JSON erwartet.", 415);
  if (Number(request.headers.get("content-length")) > limit) throw new AppError("SIZE", "Die Anfrage ist zu groß.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("INPUT", "Inhalt fehlt.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new AppError("SIZE", "Die Anfrage ist zu groß.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; } catch { throw new AppError("INPUT", "Die Eingabe konnte nicht gelesen werden."); }
}
