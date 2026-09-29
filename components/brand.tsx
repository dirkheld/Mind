import Link from "next/link";
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand ${inverse ? "inverse" : ""}`} aria-label="MIND Startseite"><span className="brand-mark" aria-hidden="true">m<span>·</span></span><span>MIND</span></Link>;
}
