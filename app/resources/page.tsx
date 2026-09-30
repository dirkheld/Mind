import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ResourceCards } from "@/components/home-information";
export const metadata = { title: "Ressources · MIND" };
export default function Resources() {
  return <AppShell preview><div className="resources-page"><Link className="text-link" href="/">← Zum Gesprächseinstieg</Link><header className="resources-title"><span className="eyebrow">RESSOURCES</span><h1>Verstehen beginnt<br/><em>mit Neugier.</em></h1><p>Artikel und Selbsteinschätzungen für einen bewussten Blick auf deinen Alltag. Psychoedukation – keine Therapie und keine Diagnose.</p></header><ResourceCards/><section className="editorial-note"><h2>Wissen mit nachvollziehbaren Quellen.</h2><p>Jeder Beitrag nennt seine fachliche Grundlage und den Stand der Recherche. So kannst du nachlesen, woher eine Einordnung stammt, und dich selbst vertiefen. Persönliche Reflexionsfragen sind als Anregungen erkennbar.</p><p>Unsere Selbsteinschätzung hilft dir, eigene Beobachtungen zu sortieren. Sie ist eine offene Reflexion ohne diagnostische Bewertung und kein validierter ADHS-Test.</p><Link className="text-link" href="/#faq">Mehr über MIND und seine Grenzen →</Link></section></div></AppShell>;
}
