import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

type Question = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correct: number[];
};

type Score = {
  correct: number;
  wrong: number;
  answered: number;
};

const ALL_TOPICS = "__ALLE_THEMEN__";

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

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  const topicIndex = headers.indexOf("thema");
  const questionIndex = headers.indexOf("frage");
  const correctIndex = headers.lastIndexOf("korrekt");

  if (questionIndex === -1 || correctIndex === -1) {
    return [];
  }

  const optionStart = questionIndex + 1;
  const optionEnd = correctIndex;

  const letterMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
  };

  const questions: Question[] = [];

  lines.slice(1).forEach((line, idx) => {
    const cols = parseCsvLine(line);

    const topic =
      topicIndex !== -1 && cols[topicIndex] ? cols[topicIndex].trim() : "Allgemein";

    const question = cols[questionIndex]?.trim() || "";
    const rawOptions = cols.slice(optionStart, optionEnd);
    const options = rawOptions.filter((o) => o && o.trim().length > 0);

    const correctRaw = (cols[correctIndex] || "")
      .split(";")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);

    const correct = correctRaw
      .map((letter) => letterMap[letter])
      .filter((value) => value !== undefined && value < options.length);

    if (!question || options.length === 0 || correct.length === 0) {
      return;
    }

    questions.push({
      id: idx + 1,
      topic,
      question,
      options,
      correct,
    });
  });

  return questions;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatCorrectAnswers(question: Question) {
  return question.correct
    .map((index) => `${String.fromCharCode(65 + index)}. ${question.options[index]}`)
    .join(" | ");
}

export default function SimpleMcqTestTool() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS);
  const [quizSizeInput, setQuizSizeInput] = useState("10");

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const [currentRunScore, setCurrentRunScore] = useState<Score>({
    correct: 0,
    wrong: 0,
    answered: 0,
  });

  const [sessionScore, setSessionScore] = useState<Score>({
    correct: 0,
    wrong: 0,
    answered: 0,
  });

  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [excludedQuestionIds, setExcludedQuestionIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("/questions.csv", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("questions.csv konnte nicht geladen werden.");
        }

        const csv = await response.text();
        const parsed = parseQuestionsFromCsv(csv);

        if (parsed.length === 0) {
          throw new Error(
            "Es wurden 0 Fragen erkannt. Bitte prüfe die CSV-Struktur und den Header."
          );
        }

        setAllQuestions(parsed);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unbekannter Fehler beim Laden.";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const topics = useMemo(() => {
    const uniqueTopics = Array.from(new Set(allQuestions.map((q) => q.topic)));
    return uniqueTopics
      .filter((topic): topic is string => Boolean(topic))
      .sort((a, b) => a.localeCompare(b, "de"));
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    if (selectedTopic === ALL_TOPICS) {
      return allQuestions;
    }
    return allQuestions.filter((q) => q.topic === selectedTopic);
  }, [allQuestions, selectedTopic]);

  const totalDatabankCount = filteredQuestions.length;

  useEffect(() => {
    if (isLoading) return;

    if (totalDatabankCount > 0) {
      setQuizSizeInput(String(totalDatabankCount));
    } else {
      setQuizSizeInput("0");
    }
  }, [selectedTopic, totalDatabankCount, isLoading]);

  const currentQuestion = quizQuestions[currentIndex];
  const quizCount = quizQuestions.length;
  const quizFinished = quizCount > 0 && currentIndex >= quizCount;

  const remainingNewQuestionsCount = filteredQuestions.filter(
    (question) => !excludedQuestionIds.includes(question.id)
  ).length;

  const progressPercent =
    quizCount > 0 ? Math.min((currentRunScore.answered / quizCount) * 100, 100) : 0;

  function resetQuestionView() {
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setCurrentRunScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(false);
    setExcludedQuestionIds([]);
  }

  function startQuiz() {
    if (filteredQuestions.length === 0) return;

    const requested = Number.parseInt(quizSizeInput, 10);
    const safeRequested = Number.isNaN(requested) ? 10 : requested;
    const clampedCount = Math.max(1, Math.min(safeRequested, filteredQuestions.length));

    const randomSet = shuffleArray(filteredQuestions).slice(0, clampedCount);

    setQuizQuestions(randomSet);
    setCurrentIndex(0);
    setSelected([]);
    setResult(null);
    setCurrentRunScore({ correct: 0, wrong: 0, answered: 0 });
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
    setCurrentRunScore({ correct: 0, wrong: 0, answered: 0 });
    setWrongQuestions([]);
    setIsRetryMode(true);
    setQuizSizeInput(String(wrongQuestions.length));
  }

  function startNewQuizWithoutCorrectAnswers() {
    const remainingPool = filteredQuestions.filter(
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
    setCurrentRunScore({ correct: 0, wrong: 0, answered: 0 });
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

    setCurrentRunScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      answered: prev.answered + 1,
    }));

    setSessionScore((prev) => ({
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
    resetQuestionView();
  }

  function resetWholeSession() {
    resetQuestionView();
    setSessionScore({ correct: 0, wrong: 0, answered: 0 });
  }

  function handleTopicChange(newTopic: string) {
    setSelectedTopic(newTopic);
    resetQuestionView();
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <section className="hero-card">
          <h1 className="hero-title">Vorbereitungslehrgang Gruppenführungsausbildung</h1>
          <p className="hero-subtitle">Ein Angebot des KFV Stormarns</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Fragen in der Datenbank</div>
              <div className="stat-value">{totalDatabankCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Beantwortet</div>
              <div className="stat-value">{sessionScore.answered}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Richtig</div>
              <div className="stat-value">{sessionScore.correct}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Falsch</div>
              <div className="stat-value">{sessionScore.wrong}</div>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <div className="controls-row">
            <div className="input-group">
              <label htmlFor="topic-select" className="input-label">
                Thema
              </label>
              <select
                id="topic-select"
                className="number-input"
                value={selectedTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={isLoading}
              >
                <option value={ALL_TOPICS}>Alle Themen</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="quiz-size" className="input-label">
                Anzahl der Fragen
              </label>
              <input
                id="quiz-size"
                className="number-input"
                type="number"
                min={1}
                max={Math.max(totalDatabankCount, 1)}
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

            <button
              className="btn btn-secondary"
              onClick={resetWholeSession}
              disabled={sessionScore.answered === 0 && quizCount === 0}
            >
              Alles zurücksetzen
            </button>
          </div>
        </section>

        <section className="panel-card">
          {isLoading ? (
            <p className="empty-state">Fragen werden geladen ...</p>
          ) : loadError ? (
            <p className="empty-state">
              Es konnten keine Fragen geladen werden. Bitte prüfe die Datei{" "}
              <strong>questions.csv</strong> im public-Ordner.
              <br />
              <br />
              Fehler: {loadError}
            </p>
          ) : totalDatabankCount === 0 ? (
            <p className="empty-state">
              Für das gewählte Thema wurden keine Fragen gefunden.
            </p>
          ) : quizCount === 0 ? (
            <p className="empty-state">
              Thema auswählen, Anzahl festlegen und dann „Quiz starten“ klicken.
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
                Ergebnis dieses Durchgangs: {currentRunScore.correct} richtig,{" "}
                {currentRunScore.wrong} falsch
              </p>

              <p className="empty-state">
                Sitzung gesamt: {sessionScore.correct} richtig, {sessionScore.wrong} falsch
              </p>

              {wrongQuestions.length > 0 && (
                <p className="empty-state">
                  Du kannst jetzt nur die falsch beantworteten Fragen erneut üben.
                </p>
              )}

              {remainingNewQuestionsCount > 0 ? (
                <p className="empty-state">
                  Alternativ kannst du ein neues zufälliges Set starten, wobei bereits
                  richtig beantwortete Fragen im aktuell gewählten Thema ausgeblendet
                  werden.
                </p>
              ) : (
                <p className="empty-state">
                  Es sind keine weiteren neuen Fragen mehr übrig.
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
                    Neue Fragen ohne bereits Richtige starten
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

              <div style={{ marginBottom: 10, color: "#6b7280", fontWeight: 600 }}>
                Thema: {currentQuestion.topic}
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
          Ausschließlich entwickelt für den Vorbereitungslehrgang Gruppenführungsausbildung des Kreisfeuerwehrverbandes Stormarn. <strong>Powered by Richard Justenhoven</strong>
        </div>
      </div>
    </div>
  );
}
