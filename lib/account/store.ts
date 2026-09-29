import { db } from "@/lib/db/client";
import { AppError } from "@/lib/errors";
import { whatsappPolicyVersion } from "./schema";
export const cardSelect = { id: true, brand: true, last4: true, expiryMonth: true, expiryYear: true } as const;
export const paymentSelect = { id: true, amountMinor: true, currency: true, status: true, paidAt: true, createdAt: true } as const;
export async function getAccount(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: {
    email: true, status: true,
    preferences: { select: { whatsappPhone: true, whatsappConsentAt: true, whatsappVerifiedAt: true, settingsVersion: true } },
    cards: { select: cardSelect },
    payments: { select: paymentSelect, orderBy: { createdAt: "desc" } },
  } });
  return { ...user, preferences: user.preferences ? { ...user.preferences, whatsappConsentAt: user.preferences.whatsappConsentAt?.toISOString() ?? null, whatsappVerifiedAt: user.preferences.whatsappVerifiedAt?.toISOString() ?? null } : null,
    payments: user.payments.map(payment => ({ ...payment, createdAt: payment.createdAt.toISOString(), paidAt: payment.paidAt?.toISOString() ?? null })) };
}
export async function saveWhatsapp(userId: string, consent: boolean, rawPhone: string, expectedVersion: number) {
  const phone = consent ? rawPhone.replace(/[\s()-]/g, "") : null;
  await db.$transaction(async tx => {
    const current = await tx.userPreferences.findUnique({ where: { userId } });
    if (!current || current.settingsVersion !== expectedVersion) throw new AppError("CONFLICT", "Die Einstellungen wurden inzwischen geändert. Bitte lade die Seite neu.", 409);
    const changed = await tx.userPreferences.updateMany({ where: { userId, settingsVersion: expectedVersion }, data: {
      whatsappPhone: phone, whatsappConsentAt: consent ? new Date() : null, consentVersion: consent ? whatsappPolicyVersion : null,
      whatsappVerifiedAt: null, whatsappEnabled: false, whatsappNudgesEnabled: false, settingsVersion: { increment: 1 },
    } });
    if (!changed.count) throw new AppError("CONFLICT", "Die Einstellungen wurden inzwischen geändert. Bitte lade die Seite neu.", 409);
    if (consent || current.whatsappConsentAt) await tx.consentEvent.create({ data: { userId, action: consent ? current.whatsappConsentAt && current.whatsappPhone !== phone ? "NUMBER_CHANGED" : "GRANTED" : "REVOKED", policyVersion: whatsappPolicyVersion } });
  });
}
