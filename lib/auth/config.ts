import "server-only";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db/client";
import { getEnvironment } from "@/lib/config/env";
import { emailSchema, isActive, safeRedirect } from "./policy";
import { consumeRateLimit, loginKey } from "./rate-limit";
import { sendLoginEmail } from "./mail";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = getEnvironment();
  const adapter = PrismaAdapter(db);
  return {
    secret: env.AUTH_SECRET,
    adapter: {
      ...adapter,
      async createUser(data) {
        return db.user.create({ data: {
          ...data, email: emailSchema.parse(data.email),
          profile: { create: {} }, preferences: { create: {} },
        } });
      },
      async getSessionAndUser(token) {
        const session = await db.session.findUnique({ where: { sessionToken: token }, include: { user: true } });
        if (!session || !isActive(session.user.status, session.user.deletedAt)) return null;
        const { user, ...sessionData } = session;
        return { user, session: sessionData };
      },
    },
    session: { strategy: "database", maxAge: 7 * 24 * 60 * 60 },
    events: {
      async signIn({ user }) {
        if (user.id) await db.user.update({ where: { id: user.id }, data: { loginCount: { increment: 1 }, lastLoginAt: new Date() } });
      },
    },
    pages: { signIn: "/login", error: "/login", verifyRequest: "/login/check-email", newUser: "/app/settings" },
    providers: [Nodemailer({
      server: env.EMAIL_SERVER, from: env.EMAIL_FROM, maxAge: 15 * 60,
      normalizeIdentifier: value => emailSchema.parse(value),
      sendVerificationRequest: ({ identifier, url }) => sendLoginEmail(identifier, url, env.EMAIL_SERVER, env.EMAIL_FROM),
    })],
    callbacks: {
      async signIn({ user, email }) {
        const address = emailSchema.safeParse(user.email);
        if (!address.success) return false;
        if (email?.verificationRequest) {
          const globalAllowed = await consumeRateLimit("login:global", 200, 15 * 60_000);
          if (!globalAllowed) return false;
          const allowed = await consumeRateLimit(loginKey(address.data, env.AUTH_SECRET), 5, 15 * 60_000);
          if (!allowed) return false;
        }
        const existing = await db.user.findUnique({ where: { email: address.data } });
        return !existing || isActive(existing.status, existing.deletedAt);
      },
      async session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
      redirect: ({ url, baseUrl }) => safeRedirect(url, baseUrl),
    },
    logger: { error() { console.error(JSON.stringify({ event: "auth.error" })); } },
  };
});
