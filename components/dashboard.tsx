"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Send } from "lucide-react";

const topics = [
  { id: "thoughts", label: "Meine Gedanken kommen nicht zur Ruhe", short: "Gedanken & Gefühle", people: ["mira", "leo", "sam"] },
  { id: "relationships", label: "Etwas zwischen mir und anderen", short: "Beziehungen", people: ["sam", "mira", "leo"] },
  { id: "self", label: "Ich möchte mich besser verstehen", short: "Mich selbst verstehen", people: ["mira", "sam", "leo"] },
  { id: "change", label: "Ich stecke gerade fest", short: "Veränderung", people: ["leo", "sam", "mira"] },
  { id: "open", label: "Ich weiß noch nicht genau", short: "Einfach ins Gespräch kommen", people: ["sam", "mira", "leo"] },
];
const companions: Record<string, { name: string; style: string; description: string; initial: string }> = {
  mira: { name: "Mira", style: "Ruhig & einfühlsam", description: "Raum für deine Gedanken. Fragen, die dir helfen, dich selbst besser zu verstehen.", initial: "m" },
  leo: { name: "Leo", style: "Klar & anregend", description: "Ein frischer Blick auf das, was dich beschäftigt. Mit konkreten Anregungen für deinen Alltag.", initial: "l" },
  sam: { name: "Sam", style: "Offen & neugierig", description: "Verschiedene Blickwinkel erkunden. Ohne gleich eine Antwort finden zu müssen.", initial: "s" },
};
export function Dashboard({ alias, children }: { preview?: boolean; alias?: string | null; children?: React.ReactNode }) {
  const [stage, setStage] = useState<"topic" | "avatar" | "conversation">("topic");
  const [topic, setTopic] = useState("self");
  const [thought, setThought] = useState("");
  const [selected, setSelected] = useState("mira");
  const heading = useRef<HTMLHeadingElement>(null);
  const currentTopic = topics.find(item => item.id === topic)!;
  const person = companions[selected];
  function go(next: typeof stage) { setStage(next); requestAnimationFrame(() => heading.current?.focus()); }
  function chooseTopic(id: string) { setTopic(id); setSelected(topics.find(item => item.id === id)!.people[0]); }
  return <div className={`conversation-entry stage-${stage}`}>
    {stage !== "topic" && <button className="conversation-back" onClick={() => go(stage === "conversation" ? "avatar" : "topic")}><ArrowLeft size={16}/>{stage === "conversation" ? "Andere Begleitung wählen" : "Zurück zu deinem Thema"}</button>}
    {stage === "topic" && <>
      <div className="entry-heading"><span className="eyebrow">{alias ? `SCHÖN, DASS DU DA BIST, ${alias.toUpperCase()}.` : "EIN GESPRÄCH. RAUM FÜR DICH."}</span><h1 ref={heading} tabIndex={-1}>Was beschäftigt<br/><em>dich gerade?</em></h1><p>Manchmal hilft es, die Dinge auszusprechen.<br/>Du musst noch nicht wissen, wo du anfangen möchtest.</p></div>
      <form className="topic-form" onSubmit={event => { event.preventDefault(); go("avatar"); }}><label className="sr-only" htmlFor="thought">Worum soll es in deinem Gespräch gehen?</label><textarea id="thought" value={thought} onChange={event => setThought(event.target.value)} maxLength={1200} rows={3} placeholder="Ich würde gerne über etwas sprechen …"/><div className="topic-form-bottom"><span>Ein paar Worte reichen. Oder wähle unten ein Thema.</span><button className="round-next" type="submit" aria-label="Passende Begleitung finden"><ArrowRight size={23}/></button></div></form>
      <fieldset className="topic-options"><legend>Vielleicht geht es dir gerade so …</legend>{topics.map(item => <button type="button" key={item.id} className="topic-chip" onClick={() => { chooseTopic(item.id); go("avatar"); }}>{item.label}<ArrowRight size={14}/></button>)}</fieldset>
      <p className="entry-footnote">Zuhören. Verstehen. Neue Perspektiven entdecken.</p>
    </>}
    {stage === "avatar" && <>
      <div className="entry-heading"><span className="eyebrow">{thought.trim() ? "DEIN THEMA, DEINE WAHL" : currentTopic.short.toUpperCase()}</span><h1 ref={heading} tabIndex={-1}>Mit wem möchtest<br/><em>du sprechen?</em></h1><p>Wähle die Art von Gespräch, die sich für dich gut anfühlt.<br/>Alle drei sind KI-Avatare von MIND.</p></div>
      {thought.trim() && <p className="topic-quote">„{thought.trim()}“</p>}
      <div className="companion-options" role="group" aria-label="Gesprächsbegleitung wählen">{currentTopic.people.map((id, index) => { const companion = companions[id]; return <button key={id} type="button" className={`companion-card ${selected === id ? "selected" : ""}`} aria-pressed={selected === id} onClick={() => setSelected(id)}><span className={`companion-avatar avatar-${id}`} aria-hidden="true">{companion.initial}<span>·</span></span><span className="companion-name">{companion.name}</span><span className="companion-style">{companion.style}</span><span className="companion-description">{companion.description}</span><span className="companion-choice">{selected === id ? <><Check size={15}/> Ausgewählt</> : index === 0 ? "Ein Einstieg für dein Thema" : "Diese Begleitung wählen"}</span></button>; })}</div>
      <button className="button begin-conversation" onClick={() => go("conversation")}>Mit {person.name} sprechen <ArrowRight size={19}/></button><p className="entry-footnote">Du kannst deine Begleitung jederzeit wechseln.</p>
    </>}
    {stage === "conversation" && <div className="conversation-room"><div className="conversation-person"><span className={`companion-avatar avatar-${selected}`} aria-hidden="true">{person.initial}<span>·</span></span><div><h1 ref={heading} tabIndex={-1}>{person.name}</h1><p>{person.style} · KI-Avatar</p></div><MessageCircle size={22}/></div><div className="conversation-transcript"><span className="conversation-date">DEIN GESPRÄCH</span><p className="topic-message">{thought.trim() || currentTopic.label}</p><div className="intro-message"><span className="sample-label">So könnte dein Gespräch beginnen</span><p>{selected === "mira" ? "Du musst deine Gedanken noch nicht sortiert haben. Was möchtest du gerade besser verstehen?" : selected === "leo" ? "Lass uns einen frischen Blick darauf werfen. Was würdest du gerne aus diesem Gespräch mitnehmen?" : "Es muss noch keine klare Frage sein. Was geht dir gerade durch den Kopf?"}</p></div></div><div className="conversation-unavailable" role="status"><strong>Gespräche sind hier noch nicht verfügbar.</strong><p>Du kannst dein Thema und deine Begleitung auswählen. Ein Austausch mit dem Avatar ist aktuell nicht möglich. Deine Eingabe wird nicht versendet oder dauerhaft gespeichert.</p></div><div className="conversation-composer"><label className="sr-only" htmlFor="message">Deine Nachricht</label><textarea id="message" rows={2} disabled placeholder="Nachrichten sind aktuell nicht verfügbar"/><button disabled aria-label="Nachrichtenversand nicht verfügbar"><Send size={20}/></button></div></div>}
    <p className="preview-disclosure">Psychoedukation und Selbstreflexion · Dein Tempo. Deine Entscheidung.</p>
    {stage === "topic" && children}
  </div>;
}
