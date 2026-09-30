"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const [pending,setPending] = useState(false);
  const [error,setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await signIn("nodemailer", { email: data.get("email"), redirect: false, redirectTo: "/app" });
      if (result?.error) { setError("Der Link konnte nicht angefordert werden. Bitte versuche es später erneut."); setPending(false); }
      else router.push("/login/check-email");
    } catch { setError("Keine Verbindung. Bitte versuche es erneut."); setPending(false); }
  }
  return <form onSubmit={submit} className="auth-form"><label htmlFor="email">Deine E-Mail-Adresse</label><div className="input-icon"><Mail size={19} /><input id="email" name="email" type="email" autoComplete="email" placeholder="du@beispiel.de" required maxLength={254} disabled={pending} /></div><p className="field-note">Wir schicken dir einen Anmeldelink. Du brauchst kein Passwort.</p>{signup && <label className="check-label"><input type="checkbox" required /> <span>Ich habe verstanden, dass MIND Psychoedukation und Selbstreflexion bietet und keine Therapie oder Diagnose ersetzt.</span></label>}<button className="button full" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} /> Link wird angefordert …</> : <>Anmeldelink anfordern <ArrowRight size={18} /></>}</button><p role="alert" className="error-text">{error}</p></form>;
}
