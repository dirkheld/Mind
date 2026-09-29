"use client";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { getAccount } from "@/lib/account/store";
import { whatsappConsentText } from "@/lib/account/schema";
import { BillingDetails } from "./billing-details";
type Account = Awaited<ReturnType<typeof getAccount>>;
export function AccountPanel({ initial }: { initial: Account }) {
  const [account, setAccount] = useState(initial);
  const [consent, setConsent] = useState(!!initial.preferences?.whatsappConsentAt);
  const [phone, setPhone] = useState(initial.preferences?.whatsappPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  async function save(revoke = false) {
    setBusy(true); setFeedback(""); setError(false);
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "whatsapp", consent: revoke ? false : consent, phone: revoke ? "" : phone, expectedVersion: account.preferences?.settingsVersion ?? 1 }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "Speichern fehlgeschlagen.");
      setAccount(result); setConsent(!!result.preferences?.whatsappConsentAt); setPhone(result.preferences?.whatsappPhone ?? "");
      setFeedback(result.preferences?.whatsappConsentAt ? "Einwilligung und Telefonnummer gespeichert. WhatsApp-Versand ist noch nicht aktiv." : "WhatsApp ist ausgeschaltet. Eine zuvor gespeicherte Telefonnummer wurde entfernt.");
    } catch (cause) { setError(true); setFeedback(cause instanceof Error ? cause.message : "Verbindung fehlgeschlagen."); }
    finally { setBusy(false); }
  }
  async function revokeSessions() {
    if (!window.confirm("Auf allen Geräten abmelden? Auch diese Sitzung wird beendet.")) return;
    setBusy(true); setFeedback("");
    try { const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "revoke-sessions" }) }); if (!response.ok) throw new Error("Abmelden fehlgeschlagen. Bitte versuche es erneut."); await signOut({ callbackUrl: "/login" }); }
    catch (cause) { setError(true); setFeedback(cause instanceof Error ? cause.message : "Abmelden fehlgeschlagen."); setBusy(false); }
  }
  return <div className="account-page"><header className="admin-heading"><span className="eyebrow">MEIN BEREICH</span><h1>Dein Konto. Deine Entscheidungen.</h1><p>Hier verwaltest du deinen Zugang, Zahlungen und die Erlaubnis für WhatsApp.</p></header><section className="admin-panel"><h2>Anmeldung & Sicherheit</h2><dl className="account-facts"><div><dt>E-Mail-Adresse</dt><dd>{account.email}</dd></div><div><dt>Anmeldung</dt><dd>Persönlicher E-Mail-Link</dd></div></dl><p>Du benötigst kein Passwort. Für jede Anmeldung bekommst du einen einmaligen Link. Deshalb gibt es hier kein Passwort, das du ändern musst.</p><button className="button secondary" disabled={busy} onClick={() => void revokeSessions()}>Auf allen Geräten abmelden</button><p className="field-help">Beendet auch deine aktuelle Sitzung. Danach kannst du einen neuen Anmeldelink anfordern.</p></section><section className="admin-panel"><h2>Zahlungen & Karte</h2><BillingDetails cards={account.cards} payments={account.payments}/><p className="field-help">Der Zahlungsanbieter ist noch nicht angebunden. Es werden derzeit keine Zahlungen über MIND eingezogen. Kartenverwaltung und Rechnungsdownload folgen mit der Zahlungsanbindung. Vollständige Kartennummern und Prüfnummern werden hier nicht erfasst.</p></section><section className="admin-panel"><h2>WhatsApp · deine Wahl</h2><p>WhatsApp ist optional. Du kannst MIND auch ohne Telefonnummer nutzen.</p><p className="account-channel-status">{account.preferences?.whatsappConsentAt ? "Einwilligung gespeichert · Versand noch nicht aktiv" : "Keine Einwilligung · WhatsApp ausgeschaltet"}</p><form onSubmit={event => { event.preventDefault(); void save(); }}><fieldset disabled={busy} className="admin-fields"><label className="whatsapp-consent"><input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); setFeedback(""); }}/><span>{whatsappConsentText}</span></label>{consent && <><label htmlFor="whatsapp-phone">Deine Telefonnummer mit Ländervorwahl</label><input id="whatsapp-phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+49 …" value={phone} onChange={event => setPhone(event.target.value)}/><p className="field-help">Die Nummer ist noch nicht verifiziert. Aus der Speicherung folgt keine automatische Kontaktaufnahme.</p></>}<div className="reflection-actions"><button className="button" type="submit">{busy ? "Wird gespeichert …" : "WhatsApp-Einstellung speichern"}</button>{account.preferences?.whatsappConsentAt && <button className="button secondary" type="button" onClick={() => void save(true)}>Einwilligung widerrufen</button>}</div></fieldset></form><p className="subtle">Beim Widerruf entfernen wir die Telefonnummer aus deinem Profil. Der Zeitpunkt der Einwilligung und des Widerrufs bleibt als Nachweis gespeichert, ohne die frühere Nummer.</p><Link className="text-link" href="/privacy">Datenschutzhinweise →</Link></section><p className={error ? "admin-feedback error" : "admin-feedback"} role={error ? "alert" : "status"}>{feedback}</p></div>;
}

