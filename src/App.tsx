import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number[];
};

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
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true);
        const response = await fetch("/questions.csv");

        if (!response.ok) {
          throw new Error("questions.csv konnte nicht geladen werden.");
        }

        const text = await response.text();
        const parsed = parseQuestionsFromCsv(text);
        setAllQuestions(parsed);
      } catch (error) {
        console.error(error);
        setAllQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const currentQuestion = quizQuestions[currentIndex];
  const quizCount = quizQuestions.length;
  const quizFinished = quizCount > 0 && currentIndex >= quizCount;

  const remainingNewQuestionsCount = useMemo(
    () =>
      allQuestions.filter(
        (question) => !excludedQuestionIds.includes(question.id)
      ).length,
    [allQuestions, excludedQuestionIds]
  );

  const progressPercent =
    quizCount > 0 ? Math.min((score.answered / quizCount) * 100, 100) : 0;

  function startQuiz() {
    if (allQuestions.length === 0) return;

    const requested = Number.parseInt(quizSizeInput, 10);
    const safeRequested = Number.isNaN(requested) ? 10 : requested;
    const clampedCount = Math.max(
      1,
      Math.min(safeRequested, allQuestions.length)
    );

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
    const clampedCount = Math.max(
      1,
      Math.min(safeRequested, remainingPool.length)
    );

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
                disabled={isLoading || totalDatabankCount === 0}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={startQuiz}
              disabled={isLoading || totalDatabankCount === 0}
            >
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
          {isLoading ? (
            <p className="empty-state">Fragen werden geladen ...</p>
          ) : totalDatabankCount === 0 ? (
            <p className="empty-state">
              Es konnten keine Fragen geladen werden. Bitte prüfe die Datei
              <strong> questions.csv </strong> im public-Ordner.
            </p>
          ) : quizCount === 0 ? (
            <p className="empty-state">
              Bitte zuerst die gewünschte Anzahl an Fragen eingeben und „Quiz starten“ klicken.
            </p>
          ) : quizFinished ? (
            <div>
              <div className="progress-wrap">
                <div className="progress-top">
                  <span>
                    {isRetryMode
                      ? "Wiederholung abgeschlossen"
                      : "Quiz abgeschlossen"}
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
                  Es sind keine weiteren neuen Fragen mehr übrig. Du hast alle bisher richtig beantwortet.
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
