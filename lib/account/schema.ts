import { z } from "zod";
export const whatsappPolicyVersion = "2026-09-28-v1";
export const whatsappConsentText = "Ich möchte MIND über WhatsApp nutzen und erlaube dafür die Speicherung meiner Telefonnummer. Der Versand wird erst nach gesonderter Information zum Anbieter und Verifizierung meiner Nummer aktiviert. Ich kann diese Einwilligung jederzeit hier widerrufen.";
export const accountMutation = z.discriminatedUnion("action", [
  z.object({ action: z.literal("whatsapp"), expectedVersion: z.number().int().positive(), consent: z.boolean(), phone: z.string().max(40) }).strict().refine(value => !value.consent || /^\+[1-9]\d{7,14}$/.test(value.phone.replace(/[\s()-]/g, "")), "Bitte eine internationale Telefonnummer angeben, z. B. +49 …"),
  z.object({ action: z.literal("revoke-sessions") }).strict(),
]);
