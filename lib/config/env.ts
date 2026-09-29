import { z } from "zod";
export const environmentSchema = z.object({
  DATABASE_URL: z.string().url().refine(v => /^(postgresql|postgres):/.test(v), "PostgreSQL-Verbindung erforderlich"),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  EMAIL_SERVER: z.string().url().refine(v => /^smtps?:/.test(v)),
  EMAIL_FROM: z.string().min(3),
});
export function getEnvironment() {
  const result = environmentSchema.safeParse(process.env);
  if (!result.success) throw new Error("MIND-Konfiguration unvollständig. Bitte .env.example prüfen.");
  if (process.env.NODE_ENV === "production" && !new URL(result.data.AUTH_URL).hostname.match(/^(localhost|127\.0\.0\.1)$/) && !result.data.AUTH_URL.startsWith("https://")) {
    throw new Error("HTTPS ist für den Produktivbetrieb erforderlich.");
  }
  return result.data;
}
