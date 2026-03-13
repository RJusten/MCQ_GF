import React, { useMemo, useState } from "react";
import "./styles.css";

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number[];
};

const PRELOADED_CSV = `Frage,OptionA,OptionB,OptionC,OptionD,Korrekt
"Ein Täuschungsalarm ist ein ordnungsgemäßes Auslösen der Brandmeldeanlage ohne reales Feuer und damit einem notwendigen Eingreifen der Feuerwehr in Form von Lösch- oder Rettungsmaßnahmen.","Wahr","Falsch","","","A"
"Was zählt zu den Aufgaben eines Gruppenführers auf der Anfahrt zur Einsatzstelle?","Informationsweitergabe an die Mannschaft (Lage)","Überprüfung der Funktionseinteilung der Mannschaft","Alarmierung des Kreiswehrführers","","A;B"
"Wann sind Einsätze der Feuerwehr kostenfrei?","Im Rahmen der unmittelbaren Gefahrenabwehr (hoheitliche Aufgaben)","Nur wenn das Hilfeersuchen über den Notruf (Leitstelle) an die Feuerwehr gestellt wird.","Innerhalb des Amtsbereiches bei gemeindeübergreifender Hilfe.","","A;C"
"Der Winkel zwischen Zugseil und zu ziehender Last sollte im Idealfall 90° betragen.","Wahr","Falsch","","","A"
"Für welche der folgenden Ereignisse ist eine Einsatzplanung sinnvoll?","Türöffnungen","Gefahrguteinsätze","Einsätze bei Hochwasser","","B;C"
"Welchen taktischen Einsatzwert besitzt ein Löschgruppenfahrzeug?","Technische Hilfeleistung größeren Umfangs","Durchführung einer Brandbekämpfung","Fördern von Löschwasser","","B;C"
"Welche der folgenden Antworten sind Einsatzgrundsätze bei Maschinenunfällen?","Demontage (systematischer Auseinanderbau der Maschine)","Schützen (Erhalten von Sachwerten)","Schneiden (Einsatz von Säge, Trennschleifer oder Autogenschneidgerät zur Befreiung)","","A;C"
"Was gehört zur stofflichen Vorbereitung einer Unterrichtseinheit?","Das Thema festlegen","Festlegen einer Ausbildungsmethode bzw. -form (z.B. Gruppenarbeit)","Die Kleiderordnung der Teilnehmenden festlegen","","A"
"Ab welchem Zeitraum spricht man von einer Traumafolgestörung?","Stunden","Monate/Jahre","Tage/Wochen","","B"
"Was kennzeichnet eine offene Bauweise?","Bebauung von Grundstücken mit freistehenden Gebäuden.","Gebäude mit Dachterrassen","Abstandsflächen zur seitlichen Grundstücksgrenze","","A;C"
"Welche Aussagen zu Brandfluchthauben sind richtig?","Sie dienen zum Schutz vor Atemgiften im Brandrauch.","Es befinden sich 2 Stück in der Standardbeladung bei TSF-W, MLF, LF und HLF.","Für Brandfluchthauben gilt eine Alterbeschränkung.","","A;B"
"Welche Aussagen zur Arbeit mit der losen Rolle sind richtig?","Die lose Rolle bewegt sich in Zugrichtung.","Der Festpunkt muss die doppelte Kraft aufnehmen.","Die aufzuwendende Zugkraft verdoppelt sich.","","A"
"Sie wollen an einer Einsatzstelle die Einsatzleitung an eine übergeordnete Führungskraft übergeben. Was müssen Sie machen um den Wechsel der Einsatzleitung zu vollziehen?","Den Betroffenen mitteilen, dass die Einsatzleitung gewechselt hat.","Allen am Einsatz beteiligten Kräften den Wechsel der Einsatzleitung mitteilen.","Die gelbe Kennzeichnungsweste des Einsatzleiters übergeben.","","B;C"
"Welche der folgenden Punkte sind Eigenschutzmaßnahmen im Brandeinsatz?","Ständige Bereitstellung eines Sicherheitstrupps.","Benutzung von Brandfluchthauben.","Benutzung geeigneter persönlicher Schutzausrüstung.","","A;C"
"Welche Vorteile bietet der autoritäre Führungsstil?","Kurz anhaltende Verbesserung der Arbeitsleistung.","Lässt den Mitarbeitenden viele Freiheiten.","Eigene Entscheidungsfindung der Mitarbeitenden.","","A"
"Eine harte Bedachung ist beständig gegen Wärmestrahlung und Flugfeuer. Sie kann unter Auflagen auch aus brennbaren Baustoffen bestehen.","Wahr","Falsch","","","A"
"In welchen Fällen ist eine Sofortrettung durchzuführen?","Bei akuter Absturzgefahr.","Bei Anweisung durch den Rettungsdienst.","Bei eintretender Dunkelheit.","","A;B"
"Was sind die Vorteile eines Lehrgesprächs?","Motivation der Teilnehmer.","Es werden keine Vorbereitungen benötigt.","Mitarbeit der Teilnehmer.","","A;C"
"Beim Einsatz von Mittelschaum ...","...kann zur Verringerung des Schaummittelbedarfs statt dem Mittelschaumstrahlrohr ein Kombinationsschaumstrahlrohr verwendet werden.","...ist der Bedarf an Schaummittelbehältern überschlägig zu ermitteln. Dazu ist die ungefähre einzuschäumende Fläche durch die Verschäumungszahl des Schaumstrahlrohres zu dividieren.","...ist darauf zu achten, dass der Druck am Schaumstrahlrohr mindestens 5 bar beträgt.","","B;C"
"Welche der folgenden Funktionen sind Führungsfunktionen im Einsatz nach der FwDV100?","Einsatzabschnittsleiter","Einheitsführer","Atemschutzüberwachung","","A;B"
"Was ist unter dem Begriff Objektschutz zu verstehen?","Der Schutz von speziellen Objekten in Verantwortung des Gemeindewehrführers.","Die Versorgung von besonderen Objekten mit zusätzlichem Löschwasser und entsprechenden Löscheinrichtungen in Verantwortung des Betreibers.","Die Ausstattung von Objekten mit einer BMA.","","B"
"Im §38 der StVO wird das Wegerecht geregelt. Ebenso ist dort hinterlegt, welche Auswirkungen von blauem Blinklicht in Zusammenhang mit dem Einsatzhorn ausgehen. Es ordnet anderen Verkehrsteilnehmenden an sofort freie Bahn zu schaffen.","Wahr","Falsch","","","A"
"Was gehört zu den Gefahren der Einsatzstelle gemäß Gefahrenmatrix (AAAA C EEEE)?","Chemische Stoffe","Angstreaktion","Biologische Gefahren","","A;B"
"Was trifft auf ein Tragkraftspritzenfahrzeug mit Wasser (TSF-W) zu?","Es hat eine Gruppenbesatzung (1/8).","Es hat eine Staffelbesatzung (1/5)","Es hat eine Zusatzbeladung für eine Staffel (1/5).","","B"
"Welche der nachfolgenden Maßnahmen nutzen die Löschwirkung Ersticken?","Abkühlen einer Flüssigkeit unter den Flammpunkt.","Abkühlen eines brennbaren Stoffes unter die Zündtemperatur.","Abdecken eines brennbaren Stoffes mit Schaum.","","A;C"
"Was zählt zu einem motivierenden Unterricht?","Die Lösung selbst finden lassen.","Die Voraussetzungen für eine Teilnahme nennen.","Unaufmerksame Teilnehmer nicht beachten","","A;B"
"Welches Verhalten haben Natursteine unter Brandeinwirkung?","Entzündbar ab ca. 500 °C.","Völliger Zerfall ab ca. 1000°C bei Kalksteinen.","Teilweises, schlagartiges Zerplatzen.","","B;C"
"Welche Eigenschaften sollten Führungskräfte haben?","Glaubwürdigkeit","Entschlusskraft und Entschlussfreudigkeit","Risikobereitschaft","","A;B"
"Sind Wärmeleitung, Feuerbrücken und Phänomene der schlagartigen Brandausbreitung Möglichkeiten der Brandausbreitung?","Wahr","Falsch","","","A"
"Welche Quellen eignen sich für eine stoffliche Vorbereitung? (Auch wenn sie teilweise kritisch betrachtet werden müssen)","Merkblätter des Unfallversicherers","Beiträge aus dem Internet","Verpflegungsplan für die Teilnehmenden","","A;B"
"Welche Löschwirkung hat Schaumschwer?","Verdrängen von Luftsauerstoff","Inhibition","Trennen","","C"
"Welche Überlegungen stellen Sie bei Objekten mit Nagelplattenbindern an?","Im Brandfall darf nur von einem geringen Feuerwiderstand und Einsturzgefahr ausgegangen werden.","Die Schadensauswirkung kann von außen nur schwer beurteilt werden.","Diese Tragwerke sind statisch so berechnet, dass sie bei Versagen einer Verbindungsstelle stark einsturzgefährdet sind.","","A;B;C"
"In welchen Fällen wird in der Regel nachgefordert?","Wenn ich mit einer Gruppe allein in den Einsatz gehe muss immer nachgefordert werden.","Wenn die Gesamtstärke der Mannschaft für die Einsatzsituation nicht ausreichend ist.","Wenn ich als Gruppenführer dauerhaft die Einsatzleitung übernehmen müsste und mehr als eine Gruppe im Einsatz ist.","","B;C"
"Sie übergeben als Gruppenführer die Einsatzstelle/Einsatzleitung an Ihren Wehrführer. Was muss ein Übergabegespräch beinhalten?","Wiederholen aller Lagemeldungen an die Leitstelle","Erkundungsergebnisse aus der Lagefeststellung, sowie festgestellte Gefahren.","Bereits durchgeführte Maßnahmen.","","B;C"
"Welche Aussagen in Hinblick auf die Fahrzeugausstattung ist richtig? (Gehen Sie von Fahrzeugbeladungen nach Norm aus!)","TSF haben keine Atemschutzgeräte in der Beladung.","Bei allen TSF, MLF, LF und HLF gehören 4 Atemschutzgeräte zur Standardbeladung.","Bei allen LF und HLF befinden sich mindestens 2 Atemschutzgeräte im Mannschaftsraum.","","B;C"
"Was zählt zu den ortsfesten brandschutztechnischen Einrichtungen?","Notduschen","Feuerlöscher","Steigleitungen","","B;C"
"Der kritische Wohnungsbrand unterstellt einen Brand im ersten Obergeschoss eines Gebäudes, in dem der Treppenraum als erster baulicher Rettungsweg verraucht ist und die Menschenrettung über Rettungsmittel der Feuerwehr als zweiten Rettungsweg erfolgen muss.","Wahr","Falsch","","","A"
"Welche Informationen können aus der Buchstaben/Zahlen Kombination im oberen Teil der Gefahrgutwarntafel entnommen werden?","Haupt- und Nebengefahr","Menge des Gefahrgut","Hinweise auf Einsatzmaßnahmen (Maßnahmengruppen)","","A;C"
"Ab welchem Zeitraum spricht man von einer Belastungsstörung / Traumafolgestörung?","Stunden","Tage","Monate/Jahre","","C"
"In welche Bereiche (Kategorien) teilt sich das System PSNV auf?","PSNV-E (Einsatzkräfte)","PSNV-B (Betroffene)","Krisenintervention","Feuerwehrseelsorge","A;B"
"Was können körperliche Reaktionen auf aussergewöhnliche Belastungen sein?","regelmäßig wiederkehrende Erinnerungen (Flashbacks)","Schlafprobleme","Blendempfindlichkeit","Müdigkeit, Erschöpfung","","A;B;D"
"Was sollte der Gruppenführer in Hinblick auf die PSNV an der Einsatzstelle tun?","PSNV Kräfte anfordern (PSNV E und PSNV B)","belastete Personen erkennen, auch Betroffene","Der PSNV Bereich wird vollständig durch PSNV Fachkräfte geregelt.","Ausschließlich die Einsatzleitung befindet über PSNV Maßnahmen.","A;B"
"Was versteht man unter aussergewöhnlichen Belastungen?","Müdigkeit","persönliche Hilflosigkeit","Einsätze mit Kindern","Einsätze mit Kameradinnen oder Kameraden bzw. persönlichem Bezug","Lustlosigkeit","B;C;D"
"Wer stellt das Angebot PSNV-E zur Verfügung?","Die Kreisfeuerwehrverbände (KFV)","Der Landesfeuerwehrverband (LFV)","Die Kommune","Die Landesfeuerwehrschule (LFS)","A"
"Welche Eigenschaften treffen auf Stahl zu?","gute Wärmeleitfähigkeit.","Verliert unter Wärmeeinwirkung an Stabilität.","hohe Tragfähigkeit.","Dehnt sich unter Wärmeeinwirkung aus.","Auch unter Wärmeeinwirkung eine hohe Festigkeit.","A;B;D"
"Welche Eigenschaften treffen bei Beton zu?","plötzliches Bauteilversagen insbesondere bei Spannbeton.","Gute Feuerwiderstandsfähigkeit","hohe Druckfestigkeit","geringes Bauteilgewicht.","A;B;C"
"Wie kann überschlägig die Abbrandrate von Holz beziffert werden?","0,5 - 1 cm pro Minute","0,5 - 1 m pro Minute","0,5 - 1 mm pro Minute","2 - 3 cm pro Minute","C"
"Was ist eine G-Verglasung?","Das 'G' steht für den Werkstoff Glas.","Sie verhindert den Durchtritt von Feuer und Rauch.","Sie verhindert den Durchtritt von Feuer, Rauch und Wärmestrahlung.","","B"
"Was ist eine F-Verglasung?","Zwischen zwei Glasscheiben befindet sich eine Verbundmasse, die bei Wärmebeaufschlagung aufschäumt.","Sie verhindert den Durchtritt von Feuer, Rauch und Wärmestrahlung.","Das 'F' in der Bezeichnung steht für 'Faserverbundstoff'","","A;B"
"Ein Bauteil trägt die Bezeichnung F90-AB. Was bedeutet das? Es handelt sich dabei um ein Bauteil, dass aus nicht brennbaren Baustoffen mit geringen Anteilen aus brennbaren Baustoffen (Baustoffklasse B) besteht und eine 90 minütige Feuerwiderstandsdauer aufweist.","Wahr","Falsch","","","A"
"Die Einheitstemperaturzeitkurve (ETK) ist eine Temperaturverlaufskurve, die den Verlauf der Temperatur eines Normbrandes darstellt. Sie wird zur Klassifizierung der Feuerwiderstandsdauer von Bauteilen eingesetzt.","Wahr","Falsch","","","A"
"Was ist die Bauweise?","Stellung der Gebäude in Bezug auf die Grundstücksgrenzen.","Es bezeichnet die verwendeten Baustoffe, sowie die Zusammenfügung der Baustoffe","","","A"
"Welche Arten der Bauweise werden unterschieden?","offene Bauweise (Länge der Gebäudefronten bis max. 50 m)","massive Bauweise","geschlossene Bauweise (Länge der Gebäudefronten > 50m, geschlossene Straßenrandbebauung)","nicht massive Bauweise","A;C"
"Welche Bauarten werden unterschieden?","offene Bauart","geschlossene Bauart","massive Bauart (selbsttragend)","nicht massiv (z.B. tragendes Fachwerk)","C;D"
"Welcher Winkel ist für die Zugrichtung ideal?","120°","180°","90°","45°","C"
"Wie lautet das Hebelgesetz, wenn der Hebel im Gleichgewicht ist?","Last * Kraftarm = Kraft * Lastarm","Kraft = Last * Lastarm / Kraftarm","Kraft * Kraftarm = Last * Lastarm","Kraft * Kraftarm = 0","C"
"Ab wann kann ein Gegenstand kippen, wenn eine Kraft auf ihn wirkt ?","Wenn die Kraft unterhalb des Schwerpunktes wirkt.","Wenn die Kraft oberhalb des Schwerpunktes wirkt.","","","B"
"Wie wird eine feste Rolle auch genannt?","Klapprolle","Kraftrolle","Zugrolle","Umlenkrolle","D"
"Wie verhält sich die feste Rolle in Bezug auf die Kraft (Kraftaufwand)?","Der Kraftaufwand verändert sich nicht, da die Kraft nur umgeleitet wird.","Der Kraftaufwand halbiert sich ungefähr. Dafür muss aber mit dem Zugseil ein höherer Weg zurückgelegt werden.","Rollen verändern den Kraftaufwand nicht.","","","A"
"Wie verhält sich die lose Rolle in Bezug auf die Kraft (Kraftaufwand)?","Der Seilweg verlängert sich zwar, jedoch ändert sich der Kraftaufwand nicht.","Die lose Rolle lenkt die Kraft nur um. Auf den Kraftaufwand hat sie keinen Einfluss.","Der Kraftaufwand halbiert sich ungefähr. Jedoch muss ca. der doppelte Seilweg aufgewendet werden.","","","C"
"Die goldene Regel der Mechanik lautet: 'Was an Kraft gespart wird, muss an Weg zugelegt werden.'","Wahr","Falsch","","","A"
"Wenn ein einseitiger Hebel eingesetzt wird kann im Gegensatz zum zweiseitigen Hebel eine höhere Last angehoben werden. Vorausgesetzt bei beiden Hebelvarianten wird die gleich Kraft eingesetzt.","Wahr","Falsch","","","A"
"Sie setzen im Hilfeleistungseinsatz hydraulisches Rettungsgerät ein. Welche Grundsätze sind zu beachten?","Es muss mindestens ein 2-facher Brandschutz vorhanden sein.","Es muss mindestens eine Führungskraft mit der Qualifikation Zugführer vor Ort sein.","Sie müssen mindestens eine Löschgruppe vor Ort haben.","Es muss ein 2. hydraulischer Rettungssatz an der Einsatzstelle sein.","A;D"
"In welcher Reihenfolge stehen die Bestandteile des Führungsvorganges?","Lagefeststellung, Planung, Befehlsgebung","Erkundung/Kontrolle, Entschluss/Beurteilung, Befehl/Lagemeldung","Lagefeststellung, Befehlsgebung, Planung","Planung, Lagefeststellung, Befehlsgebung","A;B"
"In welche Teilbereiche gliedert sich das Führungssystem nach der FwDV 100?","Führungsorganisation, Führungsvorgang, Führungsmittel","Erkundung, Beurteilung, Befehlsgebung","Führungsstil, Fachwissen, Führungsmittel","Führungsgehilfe, Leitstelle, Führungsmittel","A"
"Der Einsatzbefehl beim Einsatz ohne Bereitstellung oder generell nach der abschließenden Befehlsabgabe schließt mit dem Kommando ""Zum Einsatz vor!""","Wahr","Falsch","","","B"
"In welcher Reihenfolge läuft i.d.R. die Erkundung ab?","Frontalansicht, Befragung betroffener, rückwärtige Ansicht, Prüfung von Zugänglichkeiten","Frontalansicht, Befragung Betroffener, Prüfung von Zugänglichkeiten, rückwärtige Ansicht","Befragung Betroffener, Frontalansicht, rückwärtige Ansicht, Prüfung von Zugänglichkeiten","","B"
"Welche Gefahren gehören zur Gefahrenmatrix?","Schaulustige, Ansteckungsgefahr, Rauch","Angstreaktion, Ausbreitung, Erkrankung/Verletzung, Chemische Gefahren, Explosion","atomare-, biologische-, chemische Gefahren","Atemgifte, Atomare Gefahren, Einsturz/Absturz, Elektrizität","B;D"
"Kennzeichnen Sie die korrekte Lagemeldung nach dem Schema MELDEN(A)!","Eine Löschgruppe, ein RTW zur Einsatzstelle. Hier brennt ein Wäschetrockner. Retten die Person mit Leiter. Sicherheitstrupp ist gestellt.","Rückmeldung vom Zimmerbrand, Löschmaßnahmen laufen, 1 Löschgruppe, 1 RTW zum Einsatzort","Florian Schleswig Holstein 20-45-01 mit Lagemeldung, Einsatzstelle Westerstraße 45, 1 Person in der Wohnung eingeschlossen, Menschenrettung über tragbare Leiter ist eingeleitet, 1 Trupp unter PA mit 1 C-Rohr im Einsatz, Nachforderung 1 weitere Löschgruppe, 1 RTW, 1 NEF","Florian Schleswig Holstein 20-45-01 mit Lagemeldung, Einsatzstelle Westerstraße 45, Zimmerbrand nach vermutetem technischen Defekt an Wäschetrockner, 1 Person in der Wohnung eingeschlossen, Menschenrettung über tragbare Leiter ist eingeleitet, 1 Trupp unter PA mit 1 C-Rohr im Einsatz, Nachforderung 1 weitere Löschgruppe, 1 RTW, 1 NEF, Aufstellung Feuerwehr und Rettungsdienst Westerstraße Höhe Haus Nr. 2","D"
"Was zählt einsatztaktisch zu den 4 Möglichkeiten der Gefahrenabwehr im Sinne des Entschlusses?","Der Einsatzschwerpunkt ist die taktische Variante der Gefahrenabwehr.","Der Gefahrenschwerpunkt ist die taktische Variante der Gefahrenabwehr.","Verteidigen, in Sicherheit bringen, Angreifen, Rückzug","Menschenrettung, Brandbekämpfung, Riegelstellung","C"
"Bei einem Einsatz mit Bereitstellung enthält der Befehl zunächst erste Lage, Wasserentnahmestelle, Lage des Verteilers.","Wahr","Falsch","","","A"
"Was sind Führungsmittel?","Fernmeldeskizze, Einsatzleitwagen, Führungsgruppe","Befehlsschema, Gefahrenmatrix, Lagemeldung","Funkgeräte, Lagekarten, Nachschlagewerke","","C"
"Was ist die ""kalte Lage"" und was gehört zu ihr?","Die Lage nach der Erkundung (betroffene Personen, Schaden, Zugänglichkeit Gebäude)","Informationen, die schon vor dem Eintreffen am Einsatzort zur Verfügung stehen (Zeit, Witterung, Lage des Einsatzobjektes, Einsatzauftrag (Einsatzstichwort), verfügbares Personal)","Die Lage nach abgeschlossener Menschenrettung (Anzahl der geretteten Personen, Verletzungen, benötigte Rettungsmittel)","Die Lage nach Abschluss der Brandbekämpfung (genutzte Strahlrohre, Zerstörungsgrad)","B"
"Wie lautet das Befehlsschema?","Einheit, Auftrag, Mittel, Ziel, Weg","Einheit, Auftrag, Mittel, Weg, Ziel","Wasserentnahmestelle, Lage des Verteilers","Einheit, Mittel, Auftrag, Weg, Ziel","A"
"Wann ist eine Lagemeldung an die Leitstelle abzusetzen?","Bei kleineren Einsätzen (z.B. Türöffnung usw.) sind keine Lagemeldungen notwendig","Wenn der Einsatzleiter es für nötig hält","Bei jeder Lageänderung und ggfs. in zeitlich regelmäßigen Abständen","Nach jeder Lagebesprechung","C;D"
"Was sind Aufgaben des Wassertrupps in der Brandbekämpfung?","Herstellen der Wasserversorgung zwischen dem Verteiler und den Strahlrohren","Bestimmt den Ort der Pumpe","Herstellung einer Wasserversorgung zwischen Wasserentnahme, Pumpe und Verteiler","Übernahme der Funktion Sicherheitstrupp","C;D"
"Der Angriffstrupp setzt immer den Verteiler?","Wahr","Falsch","","","A"
"Wie lautet die GAMS Regel?","Gefahr erkennen, Absperrmaßnahmen, Menschenrettung, Spezialkräfte","Gefahrenmatrix, Absperrmaßnahmen, Menschenrettung, Sicherungsmaßnahmen","Gefahr erkennen, Ausbreitung verhindern, Menschenrettung, Spezialkräfte","","A"
"Welcher Grundsatz gilt für die Absperrmaßnahmen, wenn der Gefahrstoff noch nicht erkannt ist?","5m Gefahrenbereich – 10 m Absperrbereich","50m Gefahrenbereich – 100m Absperrbereich","So lange der Stoff nicht bekannt ist, brauchen keine Festlegungen zur Absperrung getroffen werden.","100m Gefahrenbereich – 200m Absperrbereich","B"
"Was beinhaltet die Schutzausrüstung der Körperschutzform (KSF) 1?","Persönliche Schutzausrüstung zur Brandbekämpfung mit Pressluftatmer und Kontaminationsschutzhaube.","Da die KSF 1 beim Gefahrgut-Ersteinsatz zur Menschenrettung dient, muss sie keinen besonderen Anforderungen entsprechen.","Die Kontaminationsschutzhaube kann hilfsweise durch die Feuerschutzhaube ersetzt werden.","Die KSF 1 besteht grundsätzlich aus einem Chemikalienschutzanzug (CSA).","A;C"
"Welche Aufgabe hat der Angriffstrupp im Gefahrgut-Ersteinsatz?","Er sperrt die Einsatzstelle ab.","Er baut die Dekontaminationsstelle auf.","Er führt die Menschenrettung unter Körperschutzform (KSF) 1 durch.","Er betreut Betroffene.","C"
"Welche Aufgabe hat der Wassertrupp im Gefahrgut-Ersteinsatz?","Er führt die Menschenrettung durch.","Er sperrt die Einsatzstelle ab und wird Sicherheitstrupp.","Er fängt austretendes Gefahrgut auf.","Er baut die Dekontaminationsstelle auf.","B"
"Welche Aufgabe hat der Schlauchtrupp im Gefahrgut-Ersteinsatz?","Er wird Sicherheitstrupp.","Er sperrt die Einsatzstelle ab.","Er baut die Dekontaminationsstelle auf.","Er unterstützt den Angriffstrupp bei der Menschenrettung.","C"
"Die obere Ziffer der Warntafel gibt Auskunft darüber, um welchen Stoff es sich handelt.","Wahr","Falsch","","","B"
"Die untere Ziffer gibt Rückschlüsse auf die grundlegenden Stoffeigenschaften.","Wahr","Falsch","","","B"
"Worin besteht der Unterschied zwischen Gefahrgut und Gefahrstoff?","Sie unterscheiden sich im Aggregatzustand.","Sie unterscheiden sich in der Art der Verpackung.","Sie unterscheiden sich in der Menge.","Gefahrgüter sind Gefahrstoffe, die auf Straße, Schiene, zu Wasser und in der Luft transportiert werden.","D"
"Bei welcher Gefahrengruppe ist ein Einsatz ohne besondere Schutzausrüstung (KSF 1) möglich?","Gefahrengruppe 3","Gefahrengruppe 1","In keiner Gefahrengruppe darf auf Sonderausrüstung verzichtet werden.","Gefahrengruppe 2","B"
"Wer erkundet zusammen mit den Einheitsführer im inneren eines Gebäudes?","Der Angriffstrupp mit Kleinlöschgerät und ggfs. druckloser C-Leitung","Der Schlauchtrupp","Der Wassertrupp","Der Melder mit Kleinlöschgerät","A"
"Wie nennt man den Punkt den der Einheitsführer als erstes ansteuert?","Feuerwehrschlüsseldepot (FSD) gekennzeichnet durch die Blitzleuchte","Zunächst wird der benannte Gebäudeverantwortliche aufgesucht.","FAT (Feuerwehranzeigetabelau) und FBF (Feuerwehrbedienfeld)","Der erste nicht versperrte Zugang wird verwendet.","A"
"Welche Aufgabe hat der Melder beim Einsatz mit einer Brandmeldeanlage (BMA)?","Da der Einheitsführer am FAT und FBF bleibt, erkundet er mit dem Angriffstrupp die Lage.","Er verbleibt im Fahrzeug und übermittelt die Lagemeldungen an die Leitstelle.","Er begleitet den Einheitsführer bei der Erkundung.","Er unterstützt den Wassertrupp, da meistens in eine Steigleitung eingespeist werden muss.","Er verbleibt am FBF (Feuerwehrbedienfeld) und am FAT (Feuerwehranzeigetabelau) und hält Kontakt zum Einheitsführer.","E"
"Wann wird bei einem Einsatz mit einer Brandmeldeanlage die erste Lagemeldung an die Leitstelle abgesetzt?","Sobald die Erkundung abgeschlossen ist.","Sobald der Einheitsführer an der Bedienstelle mit Feuerwehrbedienfeld (FBF) und Feuerwehranzeigetabelau (FAT) angekommen ist und den ausgelösten Melder identifiziert hat.","Wenn feststeht ob es sich um einen Täuschungsalarm oder ein bestätigtes Feuer handelt.","Sobald man an der Einsatzstelle eingetroffen ist.","B"
"Aus welchem Paragrafen der Landesbauordnung SH lassen sich die Ziele des vorbeugenden Brandschutz ableiten?","§ 3 Allgemeine Anforderungen","§ 15 Brandschutz","§ 17a Bauarten","","B"
"Wie gehen wir als örtliche Freiwillige Feuerwehr mit Anfragen von Bürgern, Bauherrn, Behörden / Ämtern zum Vorbeugenden Brandschutz um?","Anfragen zu Belangen des Vorbeugenden Brandschutzes dürfen und sollen gerne entgegen genommen werden. Die Wehrführung entscheidet über die weitere Vorgehensweise, z.B. Kontaktaufnahme mit der zuständigen Ordnungsbehörde, Bauaufsicht oder Brandschutzdienststelle. Die Wehrführung berät die Bürgermeisterin oder den Bürgermeister als Träger der Feuerwehr in allen Fragen des Feuerwehrwesens.","Die Feuerwehr führt einen Termin vor Ort durch und legt dort entsprechende Maßnahmen fest.","Es muss eine schriftliche Stellungnahme durch die Wehrführung abgegeben werden.","","","A"
"Wir stellen ein Problem im Vorbeugenden Brandschutz bei einer Objektbegehung, einer Einsatzübung, einem Einsatz oder bei der Brandschutzerziehung und Brandschutzaufklärung fest – was dann?","Sie dokumentieren die Feststellung, fertigen eine schriftliche Stellungnahme und fordern zur Abstellung des Missstandes auf.","Da sie als Feuerwehr nicht zuständig sind, unternehmen Sie nichts.","Bei der Durchführung von Objektbegehungen, Einsatzübungen oder der Brandschutzerziehung und Brandschutzaufklärung ist unbedingt darauf zu achten, dass durch die beteiligten Feuerwehrangehörigen keine eigenständige „Brandschau“, „Brandschutzprüfung“ oder ähnliches durchgeführt wird. Bauaufsichtliche / baurechtliche Belange und der Arbeitsschutz fallen nicht in den Aufgabenbereich der örtlichen Feuerwehr. Auffälligkeiten beim Brandschutz sollten vor Ort kurz angesprochen, aber nicht diskutiert werden. Sie sind in Abstimmung mit dem Objektverantwortlichen der zuständigen Wehrführung zu melden. Die Wehrführung entscheidet über die weitere Vorgehensweise.","","","C"
"Auf welche Weise kann ein zweiter Rettungsweg sichergestellt werden?","Rettungsgeräte der Feuerwehr (tragbare Leitern)","baulich- 2. notwendige Treppe","Sprungrettungsgeräte der Feuerwehr","Anwendung von Brandfluchthauben","Sicherheitstreppenraum","A;B;E"
"Bis zu welcher Höhe ist die 4-teilige Steckleiter als zweiter Rettungsweg zugelassen?","Bis zum 2. Obergeschoss","Brüstungshöhe < 8m des höchsten zur Rettung geeigneten Fensters","Zur Menschenrettung auch bis zum 3. Obergeschoss","","B"
"Was ist ein Sicherheitstreppenraum?","Ein Treppenraum mit besonderer Größe um eine größere Menge an flüchtenden Personen aufzunehmen.","Ein Treppenraum, der durch bauliche Maßnahmen gegen das Eindringen von Rauch und Feuer geschützt ist.","Ein Treppenraum mit besonderer Sicherheitsbeleuchtung zur Kennzeichnung des Rettungsweges.","","","B"
"Für welche Bereiche der Löschwasserversorgung ist die Gemeinde zuständig?","Löschwasserversorgung über die Sammelwasserversorgung (Hydranten)","Den Grundschutz in der Löschwasserversorgung","Den Objektschutz für Betriebe, wenn dieses die Baugenehmigung erfordert","Löschwasserversorgung über Bohrbrunnen, Löschwasserzisternen oder offene Wasserentnahmestellen","A;B;D"
"Der Objektschutz beinhaltet das Vorhalten von Brandschutzeinrichtungen, die den Grundschutz der Kommune übersteigen. Dazu zählen das Vorhalten von Steigleitungen, ortsfeste Löschanlagen oder Löschwasserbevorratung oder – vorhaltung auf dem Grundstück.","Wahr","Falsch","","","A"
"Wer stellt in der Regel die Brandsicherheitswache?","Der Veranstalter stellt die Brandsicherheitswache.","Die genehmigende Behörde (Ordnungsbehörde) stellt die Brandsicherheitswache.","Sie wird von der öffentlich zuständigen Feuerwehr gestellt.","","C"
"Welche Mindestqualifikation (abgeschlossene Ausbildung) ist für die Teilnehmer der Brandsicherheitswache gefordert?","Truppmannausbildung","Gruppenführerausbildung","Truppführerausbildung","","C"`;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseQuestionsFromCsv(csv: string): Question[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  if (headers[0] !== "frage" || headers[headers.length - 1] !== "korrekt") {
    return [];
  }

  const letterMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
  };

  return lines.slice(1).map((line, idx) => {
    const cols = parseCsvLine(line);

    const question = cols[0];
    const options = cols.slice(1, -1).filter((o) => o && o.length > 0);

    const correctRaw = (cols[cols.length - 1] || "")
      .split(";")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);

    const correct = correctRaw
      .map((letter) => letterMap[letter])
      .filter((value) => value !== undefined && value < options.length);

    return {
      id: idx + 1,
      question,
      options,
      correct,
    };
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SimpleMcqTestTool() {
  const allQuestions = useMemo(() => parseQuestionsFromCsv(PRELOADED_CSV), []);
  const totalDatabankCount = allQuestions.length;

  const [quizSizeInput, setQuizSizeInput] = useState("10");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, answered: 0 });
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [excludedQuestionIds, setExcludedQuestionIds] = useState<number[]>([]);

  const currentQuestion = quizQuestions[currentIndex];
  const quizCount = quizQuestions.length;
  const quizFinished = quizCount > 0 && currentIndex >= quizCount;

  const remainingNewQuestionsCount = allQuestions.filter(
    (question) => !excludedQuestionIds.includes(question.id)
  ).length;

  const progressPercent =
    quizCount > 0 ? Math.min((score.answered / quizCount) * 100, 100) : 0;

  function startQuiz() {
    if (allQuestions.length === 0) return;

    const requested = Number.parseInt(quizSizeInput, 10);
    const safeRequested = Number.isNaN(requested) ? 10 : requested;
    const clampedCount = Math.max(1, Math.min(safeRequested, allQuestions.length));

    const randomSet = shuffleArray(allQuestions).slice(0, clampedCount);

    setQuizQuestions(randomSet);
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(false);
    setExcludedQuestionIds([]);
    setQuizSizeInput(String(clampedCount));
  }

  function retryWrongQuestions() {
    if (wrongQuestions.length === 0) return;

    setQuizQuestions(wrongQuestions);
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(true);
    setQuizSizeInput(String(wrongQuestions.length));
  }

  function startNewQuizWithoutCorrectAnswers() {
    const remainingPool = allQuestions.filter(
      (question) => !excludedQuestionIds.includes(question.id)
    );

    if (remainingPool.length === 0) return;

    const requested = Number.parseInt(quizSizeInput, 10);
    const safeRequested = Number.isNaN(requested) ? 10 : requested;
    const clampedCount = Math.max(1, Math.min(safeRequested, remainingPool.length));

    const randomSet = shuffleArray(remainingPool).slice(0, clampedCount);

    setQuizQuestions(randomSet);
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(false);
    setQuizSizeInput(String(clampedCount));
  }

  function toggleAnswer(index: number) {
    if (result || quizFinished) return;

    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  }

  function checkAnswer() {
    if (!currentQuestion || result || selected.length === 0) return;

    const correctSorted = [...currentQuestion.correct].sort().join(",");
    const selectedSorted = [...selected].sort().join(",");
    const isCorrect = correctSorted === selectedSorted;

    setResult(isCorrect ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      answered: prev.answered + 1,
    }));

    if (isCorrect) {
      setExcludedQuestionIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
    } else {
      setWrongQuestions((prev) => {
        const alreadyIncluded = prev.some((q) => q.id === currentQuestion.id);
        return alreadyIncluded ? prev : [...prev, currentQuestion];
      });
    }
  }

  function nextQuestion() {
    if (quizCount === 0) return;

    const next = currentIndex + 1;
    setCurrentIndex(next);
    setSelected([]);
    setResult(null);
  }

  function resetCurrentQuiz() {
    if (quizCount === 0) return;

    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(false);
    setExcludedQuestionIds([]);
  }

  function formatCorrectAnswers(question: Question) {
    return question.correct
      .map(
        (index) =>
          `${String.fromCharCode(65 + index)}. ${question.options[index]}`
      )
      .join(" | ");
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <section className="hero-card">
          <h1 className="hero-title">Prüfungsvorbereitung Gruppenführer</h1>
          <p className="hero-subtitle">Kurs 0801 und 0802</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Fragen in der Datenbank</div>
              <div className="stat-value">{totalDatabankCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Beantwortet</div>
              <div className="stat-value">{score.answered}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Richtig</div>
              <div className="stat-value">{score.correct}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Falsch</div>
              <div className="stat-value">{score.wrong}</div>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <div className="controls-row">
            <div className="input-group">
              <label htmlFor="quiz-size" className="input-label">
                Anzahl der Fragen
              </label>
              <input
                id="quiz-size"
                className="number-input"
                type="number"
                min={1}
                max={totalDatabankCount || 1}
                value={quizSizeInput}
                onChange={(e) => setQuizSizeInput(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={startQuiz}>
              Quiz starten
            </button>

            <button
              className="btn btn-neutral"
              onClick={resetCurrentQuiz}
              disabled={quizCount === 0}
            >
              Quiz zurücksetzen
            </button>
          </div>
        </section>

        <section className="panel-card">
          {quizCount === 0 ? (
            <p className="empty-state">
              Bitte zuerst die gewünschte Anzahl an Fragen eingeben und „Quiz starten“ klicken.
            </p>
          ) : quizFinished ? (
            <div>
              <div className="progress-wrap">
                <div className="progress-top">
                  <span>
                    {isRetryMode ? "Wiederholung abgeschlossen" : "Quiz abgeschlossen"}
                  </span>
                  <span>
                    {quizCount} / {quizCount}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: "100%" }} />
                </div>
              </div>

              <h3 className="question-title">
                {isRetryMode ? "Wiederholung beendet." : "Stark gemacht."}
              </h3>

              <p className="empty-state">
                Ergebnis: {score.correct} richtig, {score.wrong} falsch
              </p>

              {wrongQuestions.length > 0 && (
                <p className="empty-state">
                  Du kannst jetzt nur die falsch beantworteten Fragen erneut üben.
                </p>
              )}

              {remainingNewQuestionsCount > 0 ? (
                <p className="empty-state">
                  Alternativ kannst du ein neues zufälliges Set starten, wobei bereits richtig
                  beantwortete Fragen ausgeblendet werden.
                </p>
              ) : (
                <p className="empty-state">
                  Es sind keine weiteren neuen Fragen mehr übrig. Du hast alle bisher richtig
                  beantwortet.
                </p>
              )}

              <div className="actions-row">
                {wrongQuestions.length > 0 && (
                  <button className="btn btn-primary" onClick={retryWrongQuestions}>
                    Nur falsche Fragen wiederholen
                  </button>
                )}

                {remainingNewQuestionsCount > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={startNewQuizWithoutCorrectAnswers}
                  >
                    Neue Fragen ohne bereits richtige starten
                  </button>
                )}
              </div>
            </div>
          ) : !currentQuestion ? (
            <p className="empty-state">Es sind keine Fragen geladen.</p>
          ) : (
            <div>
              <div className="progress-wrap">
                <div className="progress-top">
                  <span>
                    {isRetryMode
                      ? `Wiederholung: Frage ${currentIndex + 1} von ${quizCount}`
                      : `Frage ${currentIndex + 1} von ${quizCount}`}
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <h3 className="question-title">{currentQuestion.question}</h3>

              <div className="answers-list">
                {currentQuestion.options.map((option, i) => (
                  <div key={i} className="answer-option">
                    <label className="answer-label">
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleAnswer(i)}
                        disabled={!!result}
                      />
                      <span>
                        <span className="answer-letter">
                          {String.fromCharCode(65 + i)}.
                        </span>{" "}
                        {option}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="actions-row">
                <button
                  className="btn btn-primary"
                  onClick={checkAnswer}
                  disabled={selected.length === 0 || !!result}
                >
                  Antwort prüfen
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={nextQuestion}
                  disabled={!result}
                >
                  Nächste Frage
                </button>
              </div>

              {result && (
                <div
                  className={`feedback-box ${
                    result === "correct" ? "feedback-correct" : "feedback-wrong"
                  }`}
                >
                  {result === "correct" ? (
                    <strong>Richtig.</strong>
                  ) : (
                    <>
                      <strong>Falsch.</strong>
                      <div style={{ marginTop: 8 }}>
                        Richtige Antwort(en): {formatCorrectAnswers(currentQuestion)}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="footer-note">
          Ausschließlich entwickelt für die Prüfungsvorbereitung Gruppenführer
          E-Learning März 2026 · <strong>Powered by Richie</strong>
        </div>
      </div>
    </div>
  );
}
