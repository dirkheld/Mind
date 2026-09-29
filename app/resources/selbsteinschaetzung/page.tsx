import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SelfReflection } from "@/components/self-reflection";
export const metadata = { title: "Aufmerksamkeit reflektieren · MIND" };
export default function Reflection() {
  return <AppShell preview><div className="reading-page"><Link className="text-link" href="/resources">← Alle Ressourcen</Link><span className="eyebrow">SELBSTEINSCHÄTZUNG</span><h1>Wie erlebe ich meine Aufmerksamkeit?</h1><p className="article-lead">Ein ruhiger Moment, um eigene Erfahrungen zu sortieren.</p><aside className="editorial-note"><h2>Reflexion – keine Diagnose.</h2><p>Diese offenen Fragen wurden für MIND formuliert. Sie sind kein validierter ADHS-Test und kein medizinisches Screening. Sie können ADHS weder bestätigen noch ausschließen. Es gibt keine automatische Interpretation deiner Antworten.</p><Link className="text-link" href="/resources/aufmerksamkeit-und-adhs">Warum eine Diagnose mehr braucht →</Link></aside><SelfReflection/></div></AppShell>;
}
