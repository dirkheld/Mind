import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "MIND – Versteh dich besser", template: "%s | MIND" }, description: "Psychologisches Wissen, Selbstreflexion und kleine Schritte für deinen Alltag.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main">Zum Inhalt</a>{children}</body></html>;
}
