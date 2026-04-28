import { useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Bot,
  Brain,
  CircleHelp,
  HelpCircle,
  Lightbulb,
  Map,
  MessageSquareText,
  NotebookPen,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { buildSparkTutorSafetyStudio } from "../lib/progression";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

const learningStudioModes = [
  {
    id: "learn",
    label: "Learn",
    icon: MessageSquareText,
    prompt: "Help me understand the next step in this lesson.",
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: HelpCircle,
    prompt: "Ask me one question from this lesson and explain the answer.",
  },
  {
    id: "explain",
    label: "Explain",
    icon: Lightbulb,
    prompt: "Explain this lesson in a different way with a kid-friendly example.",
  },
  {
    id: "visualize",
    label: "Visual",
    icon: Sparkles,
    prompt: "Describe a simple visual I can picture for this lesson.",
  },
  {
    id: "notebook",
    label: "Notebook",
    icon: BookMarked,
    prompt: "Turn this lesson into a short notebook note I can remember later.",
  },
];

export function CoachTab({
  aiServerStatus,
  activeLesson,
  activeTrack,
  coachCards,
  coachResponseMode,
  learningStudio,
  onChangeCoachMode,
  onSelectTab,
  onSendLearningStudioPrompt,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  const [studioMode, setStudioMode] = useState("learn");
  const [studioPrompt, setStudioPrompt] = useState("");
  const [activeConsole, setActiveConsole] = useState("safety");
  const [studioStatus, setStudioStatus] = useState({
    state: "idle",
    message: "Tutor room ready. Choose a mode or ask about the active lesson.",
    result: null,
  });
  const tutorSafety = buildSparkTutorSafetyStudio({
    activeLesson,
    activeTrack,
    selectedChild,
    selectedCoachStyle,
    coachResponseMode,
  });
  const selectedStudioMode =
    learningStudioModes.find((mode) => mode.id === studioMode) ??
    learningStudioModes[0];
  const latestTurn = learningStudio.turns[0] ?? null;
  const latestSafetyDecision =
    studioStatus.result?.safetyDecision ?? latestTurn?.safetyDecision ?? {
      status: "not_checked",
      source: "local-ui",
      reason: "No live prompt has been checked yet.",
    };
  const latestParentSummary =
    studioStatus.result?.parentSummary ??
    latestTurn?.parentSummary ??
    "No parent review summary yet.";
  const latestNotebookSaved = Boolean(
    studioStatus.notebookCard ?? learningStudio.notebookCards[0],
  );
  const resolvedAiServerStatus = aiServerStatus ?? {
    state: "checking",
    configured: false,
    message: "Checking the Learning Studio connection.",
  };
  const liveAiStatus =
    studioStatus.state === "loading"
      ? {
          tone: "loading",
          label: "Checking",
          message: studioStatus.message,
        }
      : studioStatus.state === "error"
        ? {
            tone: "error",
            label: "Needs setup",
            message: studioStatus.message,
          }
        : resolvedAiServerStatus.state === "online" &&
            resolvedAiServerStatus.configured
          ? {
              tone: "ready",
              label: "Live AI ready",
              message: resolvedAiServerStatus.message,
            }
          : resolvedAiServerStatus.state === "online"
            ? {
                tone: "error",
                label: "Live AI not configured",
                message: resolvedAiServerStatus.message,
              }
            : resolvedAiServerStatus.state === "offline"
              ? {
                  tone: "error",
                  label: "Offline",
                  message: resolvedAiServerStatus.message,
                }
              : {
                  tone: "loading",
                  label: "Checking",
                  message: resolvedAiServerStatus.message,
                };
  const modeNotes = coachCards.slice(0, 3);
  const memoryCounts = {
    turns: learningStudio.turns.length,
    notebook: learningStudio.notebookCards.length,
    questions: learningStudio.questionBankItems.length,
    safety: learningStudio.safetyEvents.length,
  };

  function applyMode(mode) {
    setStudioMode(mode.id);
    setStudioPrompt((current) => current || mode.prompt);
  }

  async function handleLearningStudioSubmit(event) {
    event.preventDefault();

    setStudioStatus({
      state: "loading",
      message: "Checking safety, then asking Spark for a lesson-scoped answer.",
      result: null,
    });

    const response = await onSendLearningStudioPrompt({
      mode: studioMode,
      prompt: studioPrompt,
    });

    setStudioStatus({
      state: response.ok ? "ready" : "error",
      message: response.ok
        ? response.notebookCard
          ? "Spark answered and saved a notebook card."
          : "Spark answered with a parent-visible safety summary."
        : response.result.suggestedNextAction,
      result: response.result,
      notebookCard: response.notebookCard,
    });
  }

  return (
    <section className="kidwiz-game-shell game-tutor-room" aria-label="KidWiz tutor room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Tutor room</p>
            <h1>Wiz Spark for {selectedChild.name}</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Tutor status">
          <span className="game-stat">
            <strong>{liveAiStatus.label}</strong>
            AI status
          </span>
          <span className="game-stat">
            <strong>{selectedStudioMode.label}</strong>
            mode
          </span>
          <span className="game-stat">
            <strong>{latestSafetyDecision.status.replaceAll("_", " ")}</strong>
            safety
          </span>
        </div>
      </header>

      <div className="game-board game-tutor-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "coach" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-tutor-stage" aria-label="Tutor conversation stage">
          <section className="game-tutor-chat">
            <div className="game-tutor-companion">
              <img alt="" src="/brand/kidwiz-bot.png" />
              <div>
                <p>{selectedCoachStyle.title}</p>
                <h2>{activeLesson.title}</h2>
                <span>
                  {selectedChild.name} is learning {activeTrack.title}. Goals:
                  {` ${selectedGoals.map((goal) => goal.title).join(", ") || "family growth"}`}.
                </span>
              </div>
            </div>

            <div className="game-mode-dock" aria-label="Tutor modes">
              {learningStudioModes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    className={studioMode === mode.id ? "is-selected" : ""}
                    onClick={() => applyMode(mode)}
                    type="button"
                  >
                    <Icon size={16} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            <form className="game-tutor-form" onSubmit={handleLearningStudioSubmit}>
              <label htmlFor="game-tutor-prompt">
                {selectedStudioMode.label} mode
              </label>
              <textarea
                id="game-tutor-prompt"
                onChange={(event) => setStudioPrompt(event.target.value)}
                placeholder={selectedStudioMode.prompt}
                value={studioPrompt}
              />
              <div className="game-tutor-submit">
                <span>{studioStatus.message}</span>
                <button
                  className="solid-button"
                  disabled={studioStatus.state === "loading"}
                  type="submit"
                >
                  Ask Spark
                  <Send size={16} />
                </button>
              </div>
            </form>

            <article className="game-response-card">
              <p>Child answer</p>
              <strong>
                {studioStatus.result?.childAnswer ??
                  latestTurn?.childAnswer ??
                  "Ask Spark a lesson question to create the first live answer."}
              </strong>
            </article>
          </section>

          <section className="game-tutor-notes" aria-label="Tutor coaching notes">
            {modeNotes.map((card) => (
              <article key={card.title}>
                <p>{card.title}</p>
                <strong>{card.copy}</strong>
              </article>
            ))}
          </section>
        </main>

        <aside className="game-console" aria-label="Parent tutor console">
          <div className="game-console-tabs" role="tablist">
            <button
              className={activeConsole === "safety" ? "is-active" : ""}
              onClick={() => setActiveConsole("safety")}
              type="button"
            >
              Safety
            </button>
            <button
              className={activeConsole === "memory" ? "is-active" : ""}
              onClick={() => setActiveConsole("memory")}
              type="button"
            >
              Memory
            </button>
            <button
              className={activeConsole === "setup" ? "is-active" : ""}
              onClick={() => setActiveConsole("setup")}
              type="button"
            >
              Setup
            </button>
          </div>

          {activeConsole === "safety" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <ShieldCheck size={22} />
                <div>
                  <p>Parent safety review</p>
                  <h2>{latestSafetyDecision.status.replaceAll("_", " ")}</h2>
                </div>
              </div>
              <article className="game-parent-safety">
                <p>{latestSafetyDecision.reason}</p>
                <strong>{latestParentSummary}</strong>
                <span>
                  {latestNotebookSaved
                    ? "Notebook card saved"
                    : "No notebook card saved yet"}
                </span>
              </article>
              {tutorSafety.samplePrompts.slice(0, 1).map((prompt) => (
                <article key={prompt.label} className="game-signal-card">
                  <p>{prompt.label}</p>
                  <strong>{prompt.decision}</strong>
                  <span>{prompt.parentLog}</span>
                </article>
              ))}
            </div>
          ) : null}

          {activeConsole === "memory" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <Trophy size={22} />
                <div>
                  <p>Learner memory</p>
                  <h2>{memoryCounts.turns} turns</h2>
                </div>
              </div>
              <div className="game-memory-strip">
                <span>{memoryCounts.notebook} notes</span>
                <span>{memoryCounts.questions} questions</span>
                <span>{memoryCounts.safety} safety</span>
              </div>
              {(learningStudio.notebookCards[0] || learningStudio.questionBankItems[0]) ? (
                <article className="game-signal-card">
                  <p>Latest save</p>
                  <strong>
                    {learningStudio.notebookCards[0]?.title ??
                      learningStudio.questionBankItems[0]?.question}
                  </strong>
                  <span>
                    {learningStudio.notebookCards[0]?.body ??
                      learningStudio.questionBankItems[0]?.answer}
                  </span>
                </article>
              ) : (
                <article className="game-signal-card">
                  <p>Ready</p>
                  <strong>Use Quiz or Notebook to save the first memory.</strong>
                </article>
              )}
            </div>
          ) : null}

          {activeConsole === "setup" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <Server size={22} />
                <div>
                  <p>Live AI setup</p>
                  <h2>{liveAiStatus.label}</h2>
                </div>
              </div>
              <p>{liveAiStatus.message}</p>
              <div className="game-coach-tone-dock" aria-label="Coach tone">
                {["gentle", "playful", "stretch"].map((mode) => (
                  <button
                    key={mode}
                    className={coachResponseMode === mode ? "is-selected" : ""}
                    onClick={() => onChangeCoachMode(mode)}
                    type="button"
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <article className={`game-signal-card is-${liveAiStatus.tone}`}>
                {liveAiStatus.tone === "error" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                <strong>
                  {resolvedAiServerStatus.configured
                    ? "Use a dedicated KidWiz key before launch."
                    : "No-key fallback should stay visible for review."}
                </strong>
              </article>
            </div>
          ) : null}
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Tutor actions">
        <button onClick={() => onSelectTab("courses")} type="button">
          <Brain size={16} />
          Learn
        </button>
        <button onClick={() => applyMode(learningStudioModes[1])} type="button">
          <HelpCircle size={16} />
          Quiz
        </button>
        <button onClick={() => applyMode(learningStudioModes[4])} type="button">
          <BookMarked size={16} />
          Notebook
        </button>
        <button onClick={() => onSelectTab("journal")} type="button">
          <NotebookPen size={16} />
          Reflect
        </button>
        <button onClick={() => onSelectTab("family")} type="button">
          <ShieldCheck size={16} />
          Parent
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <CircleHelp size={16} />
          Help
        </button>
      </footer>
    </section>
  );
}
