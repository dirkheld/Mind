# Adminbereich für Gesprächsgrundlagen

## Zugang

`/admin` ist nur für angemeldete, verifizierte und aktive Konten zugänglich, deren E-Mail in der serverseitigen Umgebungsvariable `ADMIN_EMAILS` steht. Mehrere Adressen werden durch Kommas getrennt. Eine leere Variable gibt niemandem Zugriff. Eine Freigabe ist weder durch Selbstregistrierung noch durch Clientparameter möglich. Nach einer Änderung der Umgebungsvariable den Server neu starten.

Lokal ist die vom Betreiber angegebene Adresse in `.env` eingetragen. Die Datei wird nicht versioniert. Die Anmeldung nutzt den bestehenden E-Mail-Link-Ablauf. Im lokalen Testbetrieb liegt die Mail in `.local/mail`; für echten E-Mail-Versand muss SMTP eingerichtet werden. Anmeldelinks niemals veröffentlichen.

## Bedienung

1. Systemprompt bearbeiten. Die erste Vorlage greift die vereinbarte Haltung auf.
2. Quellen hinzufügen: Titel, Literaturangabe, URL, Fachtext/Zusammenfassung und Hinweise zur Evidenz oder fachlichen Prüfung. Volltext wird eingefügt; PDF-Upload, automatische URL-Extraktion und Vektorsuche sind noch nicht enthalten.
3. Geeignete Quellen für die Gesprächsgrundlage auswählen. Neue Quellen sind zunächst nicht ausgewählt.
4. Entwurf speichern. Dies verändert keine vorhandene Freigabe.
5. Gespeicherte Fassung bewusst freigeben. Es entsteht ein unveränderlicher Snapshot mit Version, Zeitpunkt und Konto-ID der freigebenden Person. Die letzten 20 Freigaben werden angezeigt; ältere bleiben gespeichert.

Maximal 30 Quellen, 20.000 Zeichen Fachtext je Quelle, 30.000 Zeichen Prompt, 1 MB pro API-Anfrage. Ungespeicherte Änderungen werden angezeigt; Neuladen über den Editor fragt vor Verwerfen nach. Bei einem Versionskonflikt bleiben lokale Eingaben erhalten. Vor dem Laden eines fremden neueren Stands eigene Änderungen bei Bedarf kopieren.

## Technische Grenze zur Gesprächsfunktion

`getPublishedKnowledge()` in `lib/admin/store.ts` liefert ausschließlich den aktiven Snapshot und ausgewählte Quellen. Ohne Freigabe liefert es `null`. Der spätere Gesprächsdienst muss diesen Einstieg verwenden, Ressourcen als Referenzdaten behandeln und zusätzliche Safety-Regeln außerhalb bearbeitbarer Fachtexte durchsetzen. Es gibt noch keinen Modellaufruf, kein Retrieval und keine Bewertung der Quellenqualität. Speichern/Freigeben allein bindet kein LLM an.

Die Adminbibliothek ist intern und veröffentlicht keine Blogartikel. Entwürfe und Freigaben liegen in PostgreSQL und unterliegen dessen Backup-/Zugriffsschutz; keine gesonderte Inhaltsverschlüsselung implementiert. Versionshistorie hat derzeit keine automatische Löschfrist. Keine persönlichen Gesprächsinhalte oder Geheimnisse als Quellen eintragen.

## Sicherheit und Prüfungen

Jeder API-Aufruf prüft die aktuelle Session und Adminadresse. Mutationen benötigen denselben Origin wie `AUTH_URL`, JSON und gültige Felder. Ressourcen-URLs erlauben nur HTTP(S) und werden nicht serverseitig abgerufen. Inhalte werden als Text dargestellt. Schreibzugriffe verwenden Versionsvergleich; Freigaben erfolgen in einer Transaktion. Die Quelle einer Änderung kommt aus der Sitzung, nicht aus einer übergebenen Konto-ID.

Geprüft: Typecheck, ESLint, Produktionsbuild, 13 Unit-Tests, 5 Datenbanktests und 3 echte HTTP-Authentifizierungstests. Neue Tests decken fehlenden/falschen/unverifizierten Adminzugang, Origin-Schutz, Eingabegrenzen, persistente Entwürfe, unveränderliche Freigaben, ausgewählte Quellen und konkurrierende Freigaben ab. Browserprüfung mit dem konfigurierten Admin über den lokalen E-Mail-Link, Promptanzeige und Speichern einer Quellenangabe.
