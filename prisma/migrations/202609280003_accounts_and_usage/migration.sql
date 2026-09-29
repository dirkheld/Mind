ALTER TABLE "users" ADD COLUMN "loginCount" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "user_preferences" ADD COLUMN "whatsappPhone" TEXT, ADD COLUMN "whatsappConsentAt" TIMESTAMP(3), ADD COLUMN "whatsappVerifiedAt" TIMESTAMP(3), ADD COLUMN "consentVersion" TEXT, ADD COLUMN "settingsVersion" INTEGER NOT NULL DEFAULT 1;
CREATE TABLE "usage_summaries" (
 "userId" UUID PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
 "conversations" INTEGER NOT NULL DEFAULT 0 CHECK ("conversations" >= 0),
 "messages" INTEGER NOT NULL DEFAULT 0 CHECK ("messages" >= 0),
 "tokens" INTEGER NOT NULL DEFAULT 0 CHECK ("tokens" >= 0), "lastUsedAt" TIMESTAMP(3)
);
CREATE TABLE "payments" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 "providerReference" TEXT NOT NULL UNIQUE, "amountMinor" INTEGER NOT NULL CHECK ("amountMinor" >= 0),
 "currency" TEXT NOT NULL DEFAULT 'EUR', "status" TEXT NOT NULL CHECK ("status" IN ('PENDING','PAID','FAILED','REFUNDED')),
 "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");
CREATE TABLE "payment_cards" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 "providerReference" TEXT NOT NULL UNIQUE, "brand" TEXT NOT NULL,
 "last4" VARCHAR(4) NOT NULL CHECK ("last4" ~ '^[0-9]{4}$'),
 "expiryMonth" INTEGER NOT NULL CHECK ("expiryMonth" BETWEEN 1 AND 12), "expiryYear" INTEGER NOT NULL
);
CREATE INDEX "payment_cards_userId_idx" ON "payment_cards"("userId");
CREATE TABLE "consent_events" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 "action" TEXT NOT NULL CHECK ("action" IN ('GRANTED','REVOKED','NUMBER_CHANGED')),
 "policyVersion" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "consent_events_userId_createdAt_idx" ON "consent_events"("userId", "createdAt");
