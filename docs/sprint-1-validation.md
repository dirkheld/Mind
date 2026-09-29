# Sprint 1 – Prüfbericht

Stand: 28.09.2026. Umgebung: Windows, Node.js 24, Next.js 16.3.6, React 19.3.0, Prisma 6.19.3, Auth.js 5.0.0-beta.32.

## Ergebnis

| Prüfung | Ergebnis |
|---|---|
| Initiale PostgreSQL-Migration | Erfolgreich angewendet |
| Typecheck | Erfolgreich |
| ESLint | Erfolgreich, keine Warnungen |
| Unit-Tests | 6 erfolgreich |
| Datenbankintegration | 4 erfolgreich |
| HTTP-E2E am Produktionsbuild | 3 erfolgreich |
| Produktionsbuild | Erfolgreich |
| Desktop-Browser | Vorschau und Startseite visuell geprüft; Navigation und Registrierungsformular geprüft |
| Schmale Ansicht | Vorschau visuell geprüft; kein Seitenüberlauf; Navigation horizontal scrollbar |

## Geprüfte Fälle

- Normalisierung und Validierung von E-Mail-Adressen.
- Gesperrte, zur Löschung vorgemerkte und gelöschte Konten werden abgewiesen.
- Externe Weiterleitungen werden verhindert.
- Login-Limit-Schlüssel enthalten keine E-Mail im Klartext.
- Konfigurationsfehler und interne Fehler geben keine Secrets oder Stacktraces aus.
- Atomare Kontoanlage, getrennte Identitäten und kaskadierendes Entfernen von Sitzungen/Profilen.
- Verifikationstokens sind einmal verwendbar.
- Zwölf gleichzeitige Limit-Anfragen erlauben genau fünf Zugriffe; der Ablauf eines Zeitfensters setzt das Limit zurück.
- Fehlgeschlagene Transaktion wird vollständig zurückgerollt.
- Nicht authentifizierte Seitenaufrufe werden zur Anmeldung geleitet, `/api/me` liefert 401.
- Anmeldung ohne CSRF-Token wird zurückgewiesen.
- Echte E-Mail-Verifikation mit lokalem SMTP-Empfänger erstellt das Konto und eine Session.
- Manipulierte Nutzer-ID in einem API-Aufruf gibt keine fremden Daten zurück.
- Wiederverwendete und abgelaufene Anmeldelinks werden abgewiesen.
- Gesperrte Konten und abgelaufene Sessions verlieren den API-Zugriff.
- Abmeldung widerruft die Sitzung.

## Behobene Prüfprobleme

- Windows-Sandbox blockierte den Test-Runner und den Prisma-Download. Nach Ausführung mit Freigabe bestanden die Prüfungen.
- Die lokale Prisma-Entwicklungsinstanz verursachte Prepared-Statement-Konflikte zwischen Prozessen. `pgbouncer=true` wurde für diese lokale Instanz gesetzt.
- Der anfänglich zu große Verbindungspool überschritt beim erneuten Paralleltest die Grenze der Entwicklungsinstanz. Mit `connection_limit=3` bestehen Integration und E2E. Keine Testfälle wurden dafür entfernt.
- Der laufende Entwicklungsserver sperrte unter Windows die native Prisma-DLL. Nach Beenden des Servers liefen Generierung und Build erfolgreich.
- Mobile Navigation blendete zunächst die Einstellungen aus. Der Zugang zu Einstellungen und Abmeldung wurde ergänzt.

## Grenzen

Die 13 Tests decken das Fundament ab, nicht die vollständigen Abnahmeszenarien aus der Master-Spezifikation. Keine Aussage über KI-Safety, WhatsApp, Zahlungen, Belastbarkeit im Produktionsmaßstab, vollständige Barrierefreiheit oder Datenschutzkonformität. Die CI-Datei wurde angelegt; ein Lauf bei GitHub wurde nicht ausgelöst. Die integrierte Browseransicht wurde geprüft, kein separater automatisierter Browser-E2E-Runner verwendet.

Die Anwendung ist lokal gestartet und nicht öffentlich veröffentlicht. Weitere Produktionsvoraussetzungen stehen in README.md.

## Nächster Sprint

Sprint 2: Nutzerprofil mit Alias und Browser-Zeitzone, Onboarding, Conversations/Messages als persistente Grundlage, Ziele, Schritte, Wochenpläne und Journal. Neue Modelle erhalten eigene Migrationen sowie Tests zur Nutzerisolation. Kein aktives KI-Coaching vor Fertigstellung und Prüfung der Safety-Pipeline.
