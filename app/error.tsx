"use client";
export default function ErrorPage({ reset }: { reset: ()=>void }) { return <main id="main" className="centered-page"><h1>Das hat gerade nicht geklappt.</h1><p>Bitte versuche es noch einmal.</p><button className="button" onClick={reset}>Erneut versuchen</button></main>; }
