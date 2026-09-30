import "server-only";
import { createTransport } from "nodemailer";
export async function sendLoginEmail(email: string, url: string, server: string, from: string) {
  const transport = createTransport(server);
  const result = await transport.sendMail({
    to: email, from, subject: "Dein Anmeldelink für MIND",
    text: `Willkommen bei MIND.\n\nMit diesem Link öffnest du deinen persönlichen Bereich:\n${url}\n\nDer Link ist 15 Minuten gültig und kann einmal verwendet werden.\nWenn du ihn nicht angefordert hast, ignoriere diese E-Mail.`,
  });
  if (result.rejected.length || result.pending?.length) throw new Error("E-Mail konnte nicht zugestellt werden.");
}
