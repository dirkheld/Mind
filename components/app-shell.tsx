"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Brand } from "./brand";
export function AppShell({ children, preview = false, admin = false }: { children: React.ReactNode; preview?: boolean; alias?: string | null; admin?: boolean }) {
  function openFaq(event: React.MouseEvent<HTMLAnchorElement>) { if (window.location.pathname === "/") { event.preventDefault(); window.location.hash = "faq"; window.location.reload(); } }

  return <div className="conversation-shell"><header className="conversation-header"><Brand/><span className="header-thought">Ein bisschen mehr du.</span><nav aria-label="Hauptnavigation">{admin && <Link href="/admin" className="quiet-account">Admin</Link>}<Link href="/resources" className="quiet-account">Ressources</Link><Link href="/#faq" onClick={openFaq} className="quiet-account">FAQ</Link>{preview ? <Link href="/login" className="quiet-account">Anmelden</Link> : <><Link href="/app" className="quiet-account">Gespräch</Link><Link href="/app/settings" className="quiet-account">Mein Bereich</Link><button className="icon-button" aria-label="Abmelden" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={19}/></button></>}</nav></header><main id="main">{children}</main><footer className="conversation-footer"><span>MIND · Psychoedukation und Selbstreflexion. Keine Therapie. Keine Diagnose.</span><Link href="/privacy">Datenschutz</Link><Link href="/#faq" onClick={openFaq}>Über MIND</Link></footer></div>;
}




