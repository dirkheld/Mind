import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
const sections: Record<string, [string,string]> = { journal: ["Mein Journal", "Festhalten, was dich beschäftigt und was sich verändert."], methods: ["Impulse & Übungen", "Psychologisches Wissen verständlich und praktisch anwenden."] };
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "goals" || section === "plans") redirect("/app/chat");
  const content = sections[section]; if (!content) notFound();
  return <div className="dashboard"><span className="eyebrow">DEIN PERSÖNLICHER BEREICH</span><h1>{content[0]}</h1><p className="subtle">{content[1]}</p><div className="feature-pending"><Sprout size={42} strokeWidth={1.3}/><h2>Hier entsteht dein nächster Schritt.</h2><p>Dieser Bereich wird in einer kommenden Version freigeschaltet.<br />Dein Konto ist bereits eingerichtet.</p><Link className="button secondary" href="/app"><ArrowLeft size={17}/> Zur Übersicht</Link></div></div>;
}
