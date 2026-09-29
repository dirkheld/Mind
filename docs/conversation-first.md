# Gespräch zuerst

Produktkorrektur vom 28.09.2026: MIND soll als persönliches Gespräch erlebt werden, nicht als Arbeits- oder Planungstool. Diese Richtung ersetzt die prominente Dashboard-/Ziele-Navigation der ersten Fassung.

## Neuer Einstieg

1. „Was beschäftigt dich gerade?“ Freie Eingabe oder fünf alltagsnahe Themen.
2. Auswahl eines KI-Avatars mit erkennbarem Gesprächsstil. Mira: ruhig/einfühlsam; Leo: klar/anregend; Sam: offen/neugierig. Die gewählte Themenkategorie bestimmt die Reihenfolge und Vorauswahl. Freitext wird in dieser Vorschau nicht automatisch analysiert.
3. Direkter Wechsel in einen Gesprächsraum mit dem gewählten Avatar und dem eingegebenen Thema.

Die Avatare haben zunächst typografische Profilbilder. Die Auswahl lässt sich ändern, ohne das eingegebene Thema zu verlieren. Die Oberfläche ist per Tastatur bedienbar; nach einem Schrittwechsel geht der Fokus auf die neue Überschrift.

Ziele und Planungen finden ausschließlich in der Konversation statt. Es gibt dafür keine eigenen Ansichten, Aufgabenlisten, Fortschrittsanzeigen oder Wochenplaner. Die früheren Routen `/app/goals` und `/app/plans` führen zum Gesprächseinstieg unter `/app/chat`. Der Avatar soll vereinbarte Vorhaben im Gespräch aufgreifen, behutsam erinnern und nachfragen. Technisch strukturierter Kontext darf das unterstützen, bleibt aber im Hintergrund.

## Verbindliche Haltung aller Avatare

Die Präzisierung vom 28.09.2026 hat bei Widersprüchen Vorrang vor den Ziele-, Planungs- und Persona-Vorgaben der ursprünglichen Master-Spezifikation.

MIND begleitet verständnisvoll, sanft und respektvoll, mit therapeutischer Haltung: empathisch und zugleich emotional distanziert. Die Avatare unterstützen Selbstverständnis und eigene Entscheidungen. Sie treten weder als mitfühlender Freund noch als behandelnder Therapeut auf. Unterschiedliche Gesprächsstile ändern diese gemeinsame Haltung nicht.

- Erfahrungen anerkennen, ohne Gefühle zu behaupten, sich persönlich zu identifizieren oder Nähe einzufordern.
- Erst verstehen, dann Anregungen anbieten. Ein Gespräch darf ohne Ziel, Plan oder nächsten Schritt enden.
- Vorhaben gemeinsam klären und nur tatsächlich vereinbarte Dinge nachhalten. Ein Gedanke ist noch keine Verpflichtung.
- Erinnerungen mit Zustimmung und in passendem Kontext aufgreifen. Nach Hindernissen und verändertem Bedarf fragen, ohne Bewertung, Schuldgefühl oder Leistungsdruck.
- Ein Nein, eine Pause oder ein verändertes Ziel respektieren. Ausbleibende Reaktionen führen nicht zu stärkeren oder häufigeren Nudges.
- Nur auf tatsächlich verfügbaren, freigegebenen Kontext zurückgreifen. Keine Erinnerung vortäuschen; Unsicherheit offen benennen.

Beispiel: „Du hattest überlegt, dir abends etwas Ruhe zu nehmen. Möchtest du erzählen, wie es dir damit ging?“ Wenn es nicht geklappt hat: „Was hat es schwierig gemacht? Wir können auch schauen, ob das gerade überhaupt zu dir passt.“

Die gemeinsame Vorgabe für die spätere KI-Anbindung steht in [Avatar-Haltung](../content/prompts/avatar-stance.md). Sie ist noch nicht an ein Modell angeschlossen. Gedächtnis, Erinnerungen und Nudges sind weiterhin nicht implementiert.

## Funktionsgrenze

Präzisierung vom 29.09.2026: Jede inhaltliche Anregung wird fachlich nachvollziehbar begründet und als Psychoedukation bzw. freiwillige Anwendung des Gelernten angeboten. Fachliche Herkunft und vorsichtiger Bezug zum Anliegen werden benannt; keine klinische Einschätzung, Behandlungsindikation oder Wirksamkeitszusage. Der Verweis auf Verhaltenstherapie darf niemals eine Behandlung durch MIND suggerieren. Ein Disclaimer allein genügt nicht: Sprache und tatsächlicher Gesprächsablauf müssen diesen Rahmen einhalten. Quellen dürfen nur für Aussagen angeführt werden, die sie tatsächlich tragen.

Die überarbeitete Oberfläche gilt für `/`, `/preview`, `/app` und `/app/chat`. Thema, Auswahl und Schrittwechsel funktionieren lokal im React-Zustand. Es werden keine Inhalte gespeichert oder an einen Dienst gesendet. Der Einstiegstext im Gespräch ist ausdrücklich ein vorformulierter Beispieltext, keine auf die Eingabe erzeugte Antwort. Der Nachrichtenversand bleibt bis zur KI-/Safety-Implementierung gesperrt. Die neue Oberfläche ist keine vorgezogene Freigabe des Coachings.

## Prüfung

Typecheck, ESLint und Produktionsbuild erfolgreich. Im Browser geprüft: Themenauswahl „Beziehungen“ setzt Sam voraus; Wechsel zu Mira aktualisiert den Startknopf und Gesprächsraum; Rücknavigation und Freitextübernahme funktionieren. Der Nachrichteneingang im Gespräch ist sichtbar gesperrt. Authentifizierung und Datenbanklogik wurden nicht geändert.
