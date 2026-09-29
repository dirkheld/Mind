import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Brand } from "@/components/brand";
export default function CheckEmail() { return <main id="main" className="centered-page"><Brand /><div className="message-card"><MailCheck size={38} /><h1>Schau in dein Postfach.</h1><p>Wenn die Anfrage erfolgreich war, erhältst du einen Anmeldelink. Er ist 15 Minuten gültig und kann einmal verwendet werden.</p><p className="subtle">Prüfe auch deinen Spam-Ordner.</p><Link className="button" href="/login">Zurück zur Anmeldung</Link></div></main>; }
