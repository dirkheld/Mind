# Supabase-Datenbank

Projekt: `mind`, Organisation `uhbuzeufeskggalhxshd`, Region Frankfurt (`eu-central-1`).
Dashboard: https://supabase.com/dashboard/project/zfskxhlkgehrrbtgdluu

## Verbindung

- Auth.js bleibt für die Anmeldung zuständig. Supabase stellt PostgreSQL bereit.
- `DATABASE_URL`: eigener Serverzugang `mind_app` über den Session-Pooler mit TLS, `sslmode=require`, `sslaccept=strict` und `sslcert=certs/supabase-ca.crt`. Prisma 6 löst den Zertifikatspfad relativ zum Verzeichnis `prisma` auf. Das öffentliche Supabase-Stammzertifikat liegt in `prisma/certs` und muss mit ausgeliefert werden.
- `DIRECT_URL` in `.env`: derselbe eingeschränkte Zugang wie `DATABASE_URL`. Der administrative Zugang steht separat in `.env.migrations` und wird nur vom Migrationsskript geladen. Auf einem Produktionshost gehört er ausschließlich in den Deployment-Job, nicht in das Dateisystem der App.
- Zugangsdaten stehen ausschließlich in ignorierten lokalen Umgebungsdateien. Niemals `NEXT_PUBLIC_` verwenden.
- Der Supabase Data API-Zugriff ist deaktiviert. Neue Tabellen werden nicht automatisch für API-Rollen freigegeben.
- Serverseitige SSL-Pflicht ist aktiviert; das Dashboard bestätigt die Einstellung.
- RLS ist auf den Anwendungstabellen aktiviert. Es gibt keine Freigabepolicies für `anon` oder `authenticated`.
- Der vertrauenswürdige Serverzugang umgeht RLS und erhält ausschließlich Datenrechte auf Anwendungstabellen. Die Nutzertrennung prüft die App anhand der Auth.js-Sitzung. RLS ersetzt diese Prüfung nicht.
- Supabase-Projektadministratoren verfügen weiterhin über Datenbankzugriff. Der eingeschränkte MIND-Adminbereich ist davon unabhängig.

## Migrationen und Tests

`npm run db:migrate` wendet versionierte Migrationen über `DIRECT_URL` an. Gegen die echte Datenbank niemals `migrate reset` oder `db push --force-reset` ausführen.

Für Tests enthält `.env.test` die bisherige lokale Datenbankverbindung. Vitest blockiert externe Datenbankhosts. Integrationsprüfungen laufen ausschließlich lokal. E2E-Tests benötigen zusätzlich eine App-Instanz, die ebenfalls mit der lokalen Testdatenbank gestartet wurde.

In dieser Arbeitskopie verwendet `.env.test` dafür `AUTH_URL=http://localhost:3001`; Port 3000 gehört zur App mit der Supabase-Verbindung. Der bisherige fachliche Adminentwurf wurde übernommen. Lokale Testnutzer, Sitzungen und Anmeldetokens wurden nicht übertragen.

Für lokale Migrationen `npm run db:migrate:test` verwenden. Der Befehl liest `.env.test` und blockiert externe Datenbankhosts. In CI sind beide URLs explizit auf den lokalen PostgreSQL-Dienst gesetzt.

Die zusätzlichen Rollenrechte sind in `scripts/supabase-permissions.sql` dokumentiert und auf Supabase angewendet: keine automatischen Freigaben neuer Tabellen an API- oder App-Rollen; keine UPDATE/DELETE-Rechte der App auf Wissensfreigaben und Einwilligungsnachweisen; 15 Sekunden Timeout für SQL-Anweisungen und inaktive Transaktionen. Neue Anwendungstabellen brauchen künftig explizite Grants. Die Rollenregeln sind Infrastrukturkonfiguration, keine zweite Historie der Prisma-Tabellenmigrationen.

`npm run db:cleanup` entfernt pro Lauf maximal 1.000 abgelaufene Sitzungen, Verifikationstokens und Rate-Limit-Einträge je Tabelle. Der Job ist noch nicht automatisch eingeplant. Er löscht keine Konten, Zahlungen oder fachlichen Inhalte.

## Betrieb

Das Anlegen der Datenbank schaltet weder öffentliche Registrierung noch Mailversand, Zahlungen oder KI-Gespräche frei. Backups, Wiederherstellung, Löschfristen und produktiver SMTP-Versand müssen für den öffentlichen Betrieb eingerichtet und geprüft werden.

Referenz: https://supabase.com/docs/guides/database/prisma
