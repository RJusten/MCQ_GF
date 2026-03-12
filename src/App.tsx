import React, { useMemo, useState } from "react";
import "./styles.css";

type Question = {
  id: number;
  question: string;
  options: string[]; // 2–4 Optionen
  correct: number[]; // eine oder mehrere richtige Antworten
};

export default function SimpleMcqTestTool() {
  const sampleCsv = `Frage,OptionA,OptionB,OptionC,OptionD,Korrekt
Ein Täuschungsalarm ist ein ordnungsgemäßes Auslösen der Brandmeldeanlage ohne reales Feuer.,Wahr,Falsch,,,A
Welche Zahlen sind gerade?,1,2,3,4,B;D`;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, answered: 0 });
  const [csvInput, setCsvInput] = useState(sampleCsv);
  const [importMessage, setImportMessage] = useState("");

  const currentQuestion = questions[currentIndex];

  const remainingCount = useMemo(() => questions.length, [questions]);

  function toggleAnswer(index: number) {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  }

  function checkAnswer() {
    if (!currentQuestion || result) return;

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

  function parseCsvLine(line: string) {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
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

  function importFromCsv() {
    try {
      const lines = csvInput
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error("Bitte mindestens eine Frage einfügen.");
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

      const qIndex = headers.indexOf("frage");
      const a = headers.indexOf("optiona");
      const b = headers.indexOf("optionb");
      const c = headers.indexOf("optionc");
      const d = headers.indexOf("optiond");
      const correctCol = headers.indexOf("korrekt");

      if (qIndex === -1 || a === -1 || b === -1 || correctCol === -1) {
        throw new Error(
          "Kopfzeile muss enthalten: Frage, OptionA, OptionB, OptionC, OptionD, Korrekt"
        );
      }

      const letterMap: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };

      const parsed: Question[] = lines.slice(1).map((line, idx) => {
        const cols = parseCsvLine(line);

        const question = cols[qIndex];

        const options = [cols[a], cols[b], cols[c], cols[d]].filter(
          (o) => o && o.length > 0
        );

        if (options.length < 2) {
          throw new Error(`Zeile ${idx + 2}: mindestens zwei Optionen nötig.`);
        }

        const correctRaw = cols[correctCol]
          .split(";")
          .map((x) => x.trim().toUpperCase());

        const correct = correctRaw.map((l) => letterMap[l]);

        return {
          id: idx + 1,
          question,
          options,
          correct,
        };
      });

      setQuestions(parsed);
      setCurrentIndex(0);
      setSelected([]);
      setResult(null);
      setScore({ correct: 0, wrong: 0, answered: 0 });

      setImportMessage(`${parsed.length} Fragen geladen.`);
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : "Importfehler");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Prüfungsvorbereitung Gruppenführer</h1>
      <h2>Kurs 0801 und 0802</h2>

      <div style={{ marginBottom: 20 }}>
        <div>Geladene Fragen: {remainingCount}</div>
        <div>Beantwortet: {score.answered}</div>
        <div>Richtig: {score.correct}</div>
        <div>Falsch: {score.wrong}</div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}
      >
        <div>
          <button onClick={nextQuestion}>Nächste Frage</button>
          <button onClick={resetSession} style={{ marginLeft: 10 }}>
            Zurücksetzen
          </button>

          <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16 }}>
            {!currentQuestion ? (
              <p>Bitte zuerst Fragen laden.</p>
            ) : (
              <div>
                <h3>{currentQuestion.question}</h3>

                <div style={{ marginTop: 10 }}>
                  {currentQuestion.options.map((o, i) => (
                    <div key={i}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selected.includes(i)}
                          onChange={() => toggleAnswer(i)}
                        />{" "}
                        <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                      </label>
                    </div>
                  ))}
                </div>

                <button style={{ marginTop: 12 }} onClick={checkAnswer}>
                  Antwort prüfen
                </button>

                {result && (
                  <div style={{ marginTop: 12 }}>
                    {result === "correct" ? "Richtig" : "Falsch"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3>Fragen aus Excel / CSV einfügen</h3>

          <pre style={{ background: "#f5f5f5", padding: 10 }}>{sampleCsv}</pre>

          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            style={{ width: "100%", height: 200 }}
          />

          <button style={{ marginTop: 10 }} onClick={importFromCsv}>
            Fragen laden
          </button>

          {importMessage && <p>{importMessage}</p>}
        </div>
      </div>
    </div>
  );
}
