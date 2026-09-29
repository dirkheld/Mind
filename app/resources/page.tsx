import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ResourceCards } from "@/components/home-information";
export const metadata = { title: "Ressources · MIND" };
export default function Resources() {
  return <AppShell preview><div className="resources-page"><Link className="text-link" href="/">← Zum Gesprächseinstieg</Link><header className="resources-title"><span className="eyebrow">RESSOURCES</span><h1>Verstehen beginnt<br/><em>mit Neugier.</em></h1><p>Artikel und Selbsteinschätzungen für einen bewussten Blick auf deinen Alltag. Psychoedukation – keine Therapie und keine Diagnose.</p></header><ResourceCards/><section className="editorial-note"><h2>Wissen mit nachvollziehbaren Quellen.</h2><p>Unsere ersten Artikel nennen die verwendeten Fachinformationen und den Stand der Recherche. Eine umfassende Literaturbasis für die Gespräche ist noch im Aufbau. Die Beiträge sind redaktionelle Entwürfe; eine unabhängige fachliche Prüfung steht noch aus.</p><p>Die Selbsteinschätzung ist eine offene Reflexion. Sie ist kein validiertes Screening. Ein wissenschaftlich geprüfter ADHS-Fragebogen ist derzeit nicht eingebunden.</p><Link className="text-link" href="/#faq">Mehr über MIND und seine Grenzen →</Link></section></div></AppShell>;
}
