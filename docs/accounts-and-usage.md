# Nutzerverwaltung und Mein Bereich

Stand: 29.09.2026.

## Admin: `/admin/users`

Zugriff ausschließlich für verifizierte aktive Konten aus `ADMIN_EMAILS`, wie im Prompt-Admin. Die Datenbankabfrage verwendet eine explizite Feldliste: E-Mail, Kontostatus, Registrierung, Anmeldezähler/-zeitpunkt, technische KI-Nutzungszähler, maskierte Kartenmetadaten und die letzten fünf Zahlungen. Suche nach E-Mail, 20 Konten je Seite.

Keine Gesprächsinhalte, Themen, Zusammenfassungen, Selbsteinschätzungen, Telefonnummern, Sessiontokens oder Zahlungsanbieter-Referenzen werden an diesen Client geliefert. Der API-Endpunkt `/api/admin/users` prüft die Adminrechte erneut. Dies begrenzt die App-Oberfläche; es ist keine Zusage, dass Infrastrukturadministratoren technisch keinen Datenbankzugriff haben.

Erfolgreiche Anmeldungen werden über das Auth.js-Ereignis gezählt, erstmals ab Einführung dieser Funktion. Frühere Anmeldungen werden nicht rückwirkend geschätzt. KI-Gesprächs-/Nachrichten-/Tokenzähler sind als getrennte numerische Tabelle vorbereitet, aber noch nicht an eine Gesprächspipeline angeschlossen. Leerstände zeigen „Noch nicht erfasst“.

## Nutzer: `/app/settings`

„Mein Bereich“ zeigt das eigene Konto, Zahlungsmittel und alle eigenen Zahlungen. Die Identität stammt ausschließlich aus der aktuellen Sitzung; eine fremde Nutzer-ID ist kein zulässiger Schreibparameter.

Die Anmeldung bleibt passwortlos per E-Mail-Link. Deshalb gibt es keine Passwortänderung. „Auf allen Geräten abmelden“ löscht alle eigenen Datenbanksitzungen und meldet auch den aktuellen Browser ab; fremde Konten bleiben unberührt.

## WhatsApp

Freiwillige Einwilligung mit dem Text und der Version aus `lib/account/schema.ts`. Zustimmung erfordert eine internationale Nummer; Leerzeichen, Klammern und Bindestriche werden entfernt. Formale Nummernvalidierung ersetzt keinen Besitznachweis.

Gespeichert werden die aktuelle Telefonnummer, Einwilligungszeitpunkt/-version und ein Nachweisereignis. Gleichzeitige Änderungen werden über einen Versionsvergleich abgefangen. Widerruf entfernt Telefonnummer, Verifizierungsstatus und Einwilligung aus dem Profil und deaktiviert alle WhatsApp-Versandflags. Der Ereignisnachweis enthält keine frühere Nummer. Aufbewahrung von Nachweisen und Backups ist vor Produktionsbetrieb festzulegen.

Es gibt noch keinen WhatsApp-Anbieter, keinen Nummern-Verifizierungsablauf und keinen Versand. Speichern der Einwilligung aktiviert den Kanal ausdrücklich nicht. Vor Versand sind konkrete Anbieterinformation, Rechtsgrundlage, Besitznachweis und die erforderliche Zustimmung zum tatsächlich angebotenen Dienst umzusetzen.

## Zahlungen

Modelle speichern Zahlungsstatus, Betrag in kleinster Währungseinheit, Währung und Zeitpunkte sowie Kartenmarke, letzte vier Ziffern und Ablaufdatum. Vollständige Kartennummern und CVC haben weder Eingabefelder noch Datenbankspalten. Die referenzierten Anbieter-IDs bleiben serverseitig.

Noch kein Checkout, Kartenwechsel, Rechnungsexport, Abonnement oder Webhook. Keine erfundenen Zahlungsdaten in der Oberfläche. Ein späterer Anbieter muss Karten außerhalb von MIND erfassen und Zahlungseinträge über verifizierte, idempotente serverseitige Ereignisse befüllen. Die vorhandene UI ist dafür eine Leseansicht, kein Zahlungsdienst.

## Prüfung

Typecheck, ESLint und Produktionsbuild bestanden. 13 Unit-Tests, 6 Datenbanktests und 4 HTTP-E2E-Tests erfolgreich. Die neuen Tests prüfen die explizite Feldauswahl der Adminantwort, maskierte Karteninformationen, Kontentrennung, Origin-Schutz, abgelehnte fremde Nutzer-IDs, Telefonnummernvalidierung, Versionskonflikte, Einwilligungsnachweis, Entfernen der Nummer beim Widerruf und Abmeldung aller eigenen Sitzungen ohne Einfluss auf fremde Konten. Nach einer lokalen Datenbank-Verbindungsstörung wurde die Entwicklungsinstanz neu gestartet; der vollständige Datenbank-Testlauf war danach erfolgreich.

Im Browser mit dem Adminzugang geprüft: „Mein Bereich“, Telefonnummernfeld abhängig von Zustimmung, Navigation zur Nutzerübersicht und E-Mail-Suche. Die reale Adminadresse wurde nicht für einen WhatsApp-Opt-in verwendet; Zustimmungs-/Widerrufsabläufe liefen mit temporären Testkonten.
