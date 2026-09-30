# MIND

Deutsche Web-App für Selbstreflexion und kleine, realistische Handlungsschritte.

## Stand

**Sprint 1: Fundament.** Umsetzung gemäß Abschnitt 80 der [Master-Spezifikation](MIND_CODEX_SPEC.md). Enthalten sind Next.js, React, TypeScript, Tailwind, PostgreSQL/Prisma, Auth.js mit E-Mail-Links, Datenbanksessions, geschützte Seiten und die deutsche App-Hülle.

Der Einstieg wurde anschließend auf ein Gespräch ausgerichtet: Thema → KI-Avatar wählen → Gesprächsraum. Ziele und Planung gehören ausschließlich ins Gespräch. Alle Avatare begleiten empathisch mit professioneller emotionaler Distanz. Die Auswahl und Navigation funktionieren; die Texte im Gespräch sind gekennzeichnete Beispiele. Die verbindliche Produktkorrektur steht in [Gespräch zuerst](docs/conversation-first.md), die gemeinsame Haltung in [Avatar-Haltung](content/prompts/avatar-stance.md).

Die Startseite enthält FAQs zur Psychoedukation, zu Grenzen und Datenschutz. Unter `/resources` stehen zwei Artikel mit Quellen und eine lokale Selbsteinschätzung zu Aufmerksamkeit ohne diagnostische Auswertung. Siehe [Inhalte und Datenschutz](docs/content-and-privacy.md).

Coaching, Onboarding, Ziele, Wochenplanung, Journal, Memory, Methoden, WhatsApp, Nudges und Bezahlung sind noch nicht implementiert. Die App erzeugt keine KI-Antworten. Keine Produktionsfreigabe.

## Lokal starten

Die laufende Installation verwendet Supabase PostgreSQL in Frankfurt. Einrichtung, Zugriffsmodell und getrennte Testdatenbank: [Supabase](docs/supabase.md).

Ergebnisse, behobene Schwachstellen und verbleibende Betriebsaufgaben: [Technischer Review vom 30.09.2026](docs/review-2026-09-30.md).

Voraussetzung: Node.js 24, npm und PostgreSQL. Abhängigkeiten sind in `package-lock.json` festgeschrieben.

```sh
npm ci
npm run db:generate
```

1. `.env.example` nach `.env` kopieren.
2. `AUTH_SECRET` auf einen zufälligen Wert mit mindestens 32 Zeichen setzen, beispielsweise erzeugt mit `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
3. PostgreSQL starten und `DATABASE_URL` setzen. Keine Produktivdatenbank für Tests verwenden.
4. `AUTH_URL=http://localhost:3000` setzen. Im öffentlichen Betrieb sind HTTPS und ein echter SMTP-Dienst erforderlich.

**Option A – Docker:** `POSTGRES_PASSWORD` lokal setzen, dann `docker compose up -d`. Das gleiche Passwort in `DATABASE_URL` verwenden. Der Port ist nur an die Loopback-Adresse gebunden.

**Option B – ohne Docker:** `npx prisma dev --name mind --port 51213 --db-port 51214 --shadow-db-port 51215`. Die ausgegebene PostgreSQL-URL verwenden. Für die lokale Prisma-Entwicklungsinstanz `&pgbouncer=true` ergänzen und `connection_limit=3` setzen: Die Instanz erlaubt insgesamt nur zehn Verbindungen, die App und Tests teilen müssen. So werden außerdem Prepared-Statement-Konflikte zwischen Prozessen vermieden. Das ist eine Entwicklungsinstanz, kein Ersatz für eine produktive PostgreSQL-Installation.

```sh
npm run db:migrate
npm run mail:local
```

In einem zweiten Terminal:

```sh
npm run dev
```

- Startseite: http://localhost:3000
- Vorschau ohne Anmeldung: http://localhost:3000/preview
- Geschützter Bereich: http://localhost:3000/app

Der lokale SMTP-Empfänger speichert Test-E-Mails als `.local/mail/*.eml`. Er versendet keine externen E-Mails. Den Link aus der passenden Datei im Browser öffnen. Diese Dateien enthalten einmalige Anmeldelinks und sind wie `.env` von Git ausgeschlossen. Für regulären Versand `EMAIL_SERVER` und `EMAIL_FROM` durch die Angaben des eigenen SMTP-Anbieters ersetzen.

## Prüfungen

```sh
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm run start
```

`npm run test:integration` benötigt die migrierte lokale Testdatenbank. `npm run test:e2e` benötigt zusätzlich die laufende App und `npm run mail:local`. Die E2E-Prüfung durchläuft den echten Auth.js-HTTP-Ablauf, ohne Test-Login oder Umgehung der Authentifizierung. Browser-Layoutprüfungen sind davon getrennt.

Unter Windows vor `npm run build` den Entwicklungsserver beenden: Ein laufender Prozess kann die native Prisma-DLL sperren. Nach dem Build mit `npm run start` neu starten.

## Architektur

### Administration

Unter `/admin` können freigeschaltete Konten den Systemprompt und fachliche Quellen dauerhaft speichern und versioniert freigeben. Zugriff über die serverseitige Variable `ADMIN_EMAILS` und einen verifizierten E-Mail-Login. [Bedienung, Einrichtung und Grenzen](docs/admin.md). Die Anbindung dieser Grundlage an echte KI-Gespräche steht noch aus.

`/admin/users` zeigt Nutzer, technische Nutzungszahlen und maskierte Zahlungsdaten ohne Gesprächsinhalte. Unter `/app/settings` verwalten Nutzer ihre WhatsApp-Einwilligung und Telefonnummer, sehen ihre Zahlungen und können alle eigenen Sitzungen beenden. Anmeldung weiterhin per E-Mail-Link. Zahlungsanbieter und WhatsApp-Versand sind noch nicht angeschlossen. [Details](docs/accounts-and-usage.md).

- `app/`: Routen, geschützte App-Hülle und schlanke HTTP-Handler.
- `components/`: deutsche Oberfläche, responsive Navigation und Anmeldeformular.
- `lib/auth/`: Auth.js-Adapterkonfiguration, Statusprüfung, E-Mail-Versand und persistente Anmeldelimits.
- `lib/db/`: gemeinsam genutzter Prisma-Client; keine Abfragelogs mit Nutzerdaten.
- `lib/config/`: validierte Umgebung. Keine tatsächlichen Secrets im Repository.
- `prisma/`: Schema und initiale SQL-Migration.
- `tests/`: Unit-, PostgreSQL-Integrations- und HTTP-E2E-Tests.
- `docs/`: Bestandsaufnahme, Entscheidungen und Prüfbericht.

Für spätere Hintergrundaufgaben ist BullMQ mit Redis vorgesehen; die Ausführung gehört zu den späteren Sprints. In Sprint 1 wird noch keine Warteschlange installiert oder betrieben.

## Authentifizierung und Grenzen

E-Mail-Link: 15 Minuten gültig, einmal verwendbar. Session: sieben Tage, serverseitig widerrufbar. Konten werden erst nach Bestätigung der E-Mail angelegt. Gesperrte und zur Löschung vorgemerkte Konten erhalten keinen Zugriff. Profile und standardmäßig ausgeschaltete Benachrichtigungseinstellungen entstehen atomar mit dem Nutzer. Die Zeitzone bleibt bis zur späteren Browser-/Nutzerkonfiguration leer.

Die API liest die Identität ausschließlich aus der Sitzung. Vom Client mitgegebene Nutzer-IDs ändern die Identität nicht. Anmeldeversuche werden atomar in PostgreSQL begrenzt (fünf je E-Mail pro 15 Minuten, zusätzlich 200 insgesamt). E-Mail-Adressen stehen dabei nur als HMAC im Limit-Schlüssel. Auth.js übernimmt CSRF und Verifikationstokens. Weiterleitungen bleiben auf derselben Origin.

## Vor dem öffentlichen Betrieb

Die restlichen Sprints und Produktionsabnahme fehlen. Insbesondere: echte SMTP-Konfiguration, Betreiber-/Datenschutztexte, Datenexport und Kontolöschung, Datenaufbewahrung und bereinigende Jobs, infrastrukturelle Limits, Monitoring, Backups und Restore-Test, Sicherheitsprüfung sowie die Safety-/Coaching-Implementierung. Auth.js v5 ist aktuell eine Beta; die im Lockfile festgeschriebene Version muss vor der Produktionsfreigabe erneut bewertet werden. Keine öffentlichen Registrierungen oder echten psychologischen Inhalte mit dieser Entwicklungsfassung sammeln.

## Offizielle Referenzen

Am 28.09.2026 geprüft:

- [Auth.js: Nodemailer und E-Mail-Verifikation](https://authjs.dev/getting-started/providers/nodemailer)
- [Auth.js: Prisma-Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Next.js: Authentifizierung](https://nextjs.org/docs/app/guides/authentication) sowie die mit Next.js ausgelieferten lokalen Dokumente.
- [Prisma: lokale PostgreSQL-Entwicklung](https://docs.prisma.io/docs/postgres/database/local-development)

OpenAI-, WhatsApp- und Stripe-APIs werden erst in den jeweiligen Sprints nach Prüfung der dann aktuellen offiziellen Dokumentation angebunden.
