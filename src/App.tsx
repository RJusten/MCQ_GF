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
"Der Angriffstrupp setzt immer den Verteiler?","Wahr","Falsch","","","A"`
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
"Aus welchem Paragrafen der Landesbauordnung SH lassen sich die Ziele des vorbeugenden Brandschutz ableiten?","§ 3 ""Allgemeine Anforderungen""","§ 15 ""Brandschutz""","§ 17a ""Bauarten""","","B"
"Wie gehen wir als örtliche Freiwillige Feuerwehr mit Anfragen von Bürgern, Bauherrn, Behörden / Ämtern zum Vorbeugenden Brandschutz um?","Anfragen zu Belangen des Vorbeugenden Brandschutzes dürfen und sollen gerne entgegen genommen werden. Die Wehrführung entscheidet über die weitere Vorgehensweise, z.B. Kontaktaufnahme mit der zuständigen Ordnungsbehörde, Bauaufsicht oder Brandschutzdienststelle. Die Wehrführung berät die Bürgermeisterin oder den Bürgermeister als Träger der Feuerwehr in allen Fragen des Feuerwehrwesens.","Die Feuerwehr führt einen Termin vor Ort durch und legt dort entsprechende Maßnahmen fest.","Es muss eine schriftliche Stellungnahme durch die Wehrführung abgegeben werden.","","","A"
"Wir stellen ein Problem im Vorbeugenden Brandschutz bei einer Objektbegehung, einer Einsatzübung, einem Einsatz oder bei der Brandschutzerziehung und Brandschutzaufklärung fest – was dann?","Sie dokumentieren die Feststellung, fertigen eine schriftliche Stellungnahme und fordern zur Abstellung des Missstandes auf.","Da sie als Feuerwehr nicht zuständig sind, unternehmen Sie nichts.","Bei der Durchführung von Objektbegehungen, Einsatzübungen oder der Brandschutzerziehung und Brandschutzaufklärung ist unbedingt darauf zu achten, dass durch die beteiligten Feuerwehrangehörigen keine eigenständige „Brandschau“, „Brandschutzprüfung“ oder ähnliches durchgeführt wird. Bauaufsichtliche / baurechtliche Belange und der Arbeitsschutz fallen nicht in den Aufgabenbereich der örtlichen Feuerwehr. Auffälligkeiten beim Brandschutz sollten vor Ort kurz angesprochen, aber nicht diskutiert werden. Sie sind in Abstimmung mit dem Objektverantwortlichen der zuständigen Wehrführung zu melden. Die Wehrführung entscheidet über die weitere Vorgehensweise.","","","C"
"Auf welche Weise kann ein zweiter Rettungsweg sichergestellt werden?","Rettungsgeräte der Feuerwehr (tragbare Leitern)","baulich- 2. notwendige Treppe","Sprungrettungsgeräte der Feuerwehr","Anwendung von Brandfluchthauben","Sicherheitstreppenraum","A;B;E"
"Bis zu welcher Höhe ist die 4-teilige Steckleiter als zweiter Rettungsweg zugelassen?","Bis zum 2. Obergeschoss","Brüstungshöhe < 8m des höchsten zur Rettung geeigneten Fensters","Zur Menschenrettung auch bis zum 3. Obergeschoss","","B"
"Was ist ein Sicherheitstreppenraum?","Ein Treppenraum mit besonderer Größe um eine größere Menge an flüchtenden Personen aufzunehmen.","Ein Treppenraum, der durch bauliche Maßnahmen gegen das Eindringen von Rauch und Feuer geschützt ist.","Ein Treppenraum mit besonderer Sicherheitsbeleuchtung zur Kennzeichnung des Rettungsweges.","","","B"
"Für welche Bereiche der Löschwasserversorgung ist die Gemeinde zuständig?","Löschwasserversorgung über die Sammelwasserversorgung (Hydranten)","Den Grundschutz in der Löschwasserversorgung","Den Objektschutz für Betriebe, wenn dieses die Baugenehmigung erfordert","Löschwasserversorgung über Bohrbrunnen, Löschwasserzisternen oder offene Wasserentnahmestellen","A;B;D"
"Der Objektschutz beinhaltet das Vorhalten von Brandschutzeinrichtungen, die den Grundschutz der Kommune übersteigen. Dazu zählen das Vorhalten von Steigleitungen, ortsfeste Löschanlagen oder Löschwasserbevorratung oder – vorhaltung auf dem Grundstück.","Wahr","Falsch","","","A"
"Wer stellt in der Regel die Brandsicherheitswache?","Der Veranstalter stellt die Brandsicherheitswache.","Die genehmigende Behörde (Ordnungsbehörde) stellt die Brandsicherheitswache.","Sie wird von der öffentlich zuständigen Feuerwehr gestellt.","","C"
"Welche Mindestqualifikation (abgeschlossene Ausbildung) ist für die Teilnehmer der Brandsicherheitswache gefordert?","Truppmannausbildung","Gruppenführerausbildung","Truppführerausbildung","","C"
  ;

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

  const qIndex = headers.indexOf("frage");
  const a = headers.indexOf("optiona");
  const b = headers.indexOf("optionb");
  const c = headers.indexOf("optionc");
  const d = headers.indexOf("optiond");
  const correctCol = headers.indexOf("korrekt");

  if (qIndex === -1 || a === -1 || b === -1 || correctCol === -1) {
    return [];
  }

  const letterMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };

  return lines.slice(1).map((line, idx) => {
    const cols = parseCsvLine(line);

    const question = cols[qIndex];
    const options = [cols[a], cols[b], cols[c], cols[d]].filter(
      (o) => o && o.length > 0
    );

    const correctRaw = (cols[correctCol] || "")
      .split(";")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);

    const correct = correctRaw
      .map((letter) => letterMap[letter])
      .filter((value) => value !== undefined);

    return {
      id: idx + 1,
      question,
      options,
      correct,
    };
  });
}

export default function SimpleMcqTestTool() {
  const [questions] = useState<Question[]>(() => parseQuestionsFromCsv(PRELOADED_CSV));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, answered: 0 });

  const currentQuestion = questions[currentIndex];
  const questionCount = useMemo(() => questions.length, [questions]);

  function toggleAnswer(index: number) {
    if (result) return;

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
  }

  function nextQuestion() {
    if (questions.length === 0) return;

    const next = currentIndex + 1 >= questions.length ? 0 : currentIndex + 1;
    setCurrentIndex(next);
    setSelected([]);
    setResult(null);
  }

  function resetSession() {
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, wrong: 0, answered: 0 });
  }

  function formatCorrectAnswers(question: Question) {
    return question.correct
      .map((index) => `${String.fromCharCode(65 + index)}. ${question.options[index]}`)
      .join(" | ");
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Prüfungsvorbereitung Gruppenführer</h1>
      <h2>Kurs 0801 und 0802</h2>

      <div style={{ marginBottom: 20 }}>
        <div>Geladene Fragen: {questionCount}</div>
        <div>Beantwortet: {score.answered}</div>
        <div>Richtig: {score.correct}</div>
        <div>Falsch: {score.wrong}</div>
        {questionCount > 0 && <div>Aktuelle Frage: {currentIndex + 1} / {questionCount}</div>}
      </div>

      <div>
        <button onClick={nextQuestion}>Nächste Frage</button>
        <button onClick={resetSession} style={{ marginLeft: 10 }}>
          Zurücksetzen
        </button>

        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          {!currentQuestion ? (
            <p>Es sind keine Fragen geladen.</p>
          ) : (
            <div>
              <h3>{currentQuestion.question}</h3>

              <div style={{ marginTop: 10 }}>
                {currentQuestion.options.map((option, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <label style={{ cursor: result ? "default" : "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleAnswer(i)}
                        disabled={!!result}
                      />{" "}
                      <strong>{String.fromCharCode(65 + i)}.</strong> {option}
                    </label>
                  </div>
                ))}
              </div>

              <button
                style={{ marginTop: 12 }}
                onClick={checkAnswer}
                disabled={selected.length === 0 || !!result}
              >
                Antwort prüfen
              </button>

              {result && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 6,
                    background: result === "correct" ? "#ecfdf5" : "#fef2f2",
                    border: "1px solid #ddd",
                  }}
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
        </div>
      </div>
    </div>
  );
}
