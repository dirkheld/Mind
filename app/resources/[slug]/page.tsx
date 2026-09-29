import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { articles } from "@/lib/resources";
export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find(item => item.slug === slug);
  if (!article) notFound();
  return <AppShell preview><article className="reading-page"><Link className="text-link" href="/resources">← Alle Ressourcen</Link><span className="eyebrow">WISSEN · {article.category}</span><h1>{article.title}</h1><p className="article-lead">{article.summary}</p><p className="article-meta">MIND · Redaktioneller Entwurf · Quellenstand: 28. September 2026</p>{article.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<aside className="editorial-note"><h2>Quelle & Einordnung</h2><p>Grundlage: <a href={article.url} rel="noreferrer">{article.source}</a>. Die Quelle belegt die allgemeinen Informationen, keine Wirksamkeit von MIND.</p><p>Dieser Beitrag dient der Psychoedukation. Er stellt keine Diagnose und ersetzt keine fachliche Abklärung. Eine unabhängige fachliche Prüfung des Beitrags steht noch aus.</p></aside>{slug === "aufmerksamkeit-und-adhs" && <Link className="button secondary" href="/resources/selbsteinschaetzung">Eigene Beobachtungen sortieren →</Link>}<p className="article-return"><Link className="text-link" href="/">Zum Gesprächseinstieg →</Link></p></article></AppShell>;
}
