import { useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  ClipboardCheck,
  HelpCircle,
  Lightbulb,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildSparkTutorSafetyStudio } from "../lib/progression";

const learningStudioModes = [
  {
    id: "learn",
    label: "Learn with me",
    icon: MessageSquareText,
    prompt: "Help me understand the next step in this lesson.",
  },
  {
    id: "quiz",
    label: "Quiz me",
    icon: HelpCircle,
    prompt: "Ask me one question from this lesson and explain the answer.",
  },
  {
    id: "explain",
    label: "Explain another way",
    icon: Lightbulb,
    prompt: "Explain this lesson in a different way with a kid-friendly example.",
  },
  {
    id: "visualize",
    label: "Show a visual idea",
    icon: Sparkles,
    prompt: "Describe a simple visual I can picture for this lesson.",
  },
  {
    id: "notebook",
    label: "Save to notebook",
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
  onSendLearningStudioPrompt,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  const [studioMode, setStudioMode] = useState("learn");
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioStatus, setStudioStatus] = useState({
    state: "idle",
    message: "Local preview is ready. Checking whether live AI is configured.",
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
      reason: "No live Learning Studio prompt has been checked yet.",
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
    message: "Checking the local Learning Studio server.",
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
                  label: "AI server offline",
                  message: resolvedAiServerStatus.message,
                }
              : {
                  tone: "loading",
                  label: "Checking local server",
                  message: resolvedAiServerStatus.message,
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
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Spark Coach studio</p>
        <h1>Bounded AI-style guidance, still safe enough for family review.</h1>
        <p>
          This local version can call the live Learning Studio AI when the
          server has an OpenAI key, while still keeping prompts lesson-scoped
          and parent-reviewable.
        </p>
      </div>

      <div className="coach-hero">
        <div>
          <p>{selectedCoachStyle.title}</p>
          <h2>
            {selectedChild.name} is currently working through {activeTrack.title}.
          </h2>
          <span>
            Priority goals: {selectedGoals.map((goal) => goal.title).join(", ")}.
          </span>
        </div>
        <div className="mode-toggle-row">
          {["gentle", "playful", "stretch"].map((mode) => (
            <button
              key={mode}
              className={`mode-toggle ${
                coachResponseMode === mode ? "is-selected" : ""
              }`}
              onClick={() => onChangeCoachMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="coach-grid">
        {coachCards.map((card) => (
          <article key={card.title} className="coach-card">
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
          </article>
        ))}
      </div>

      <section className="learning-studio-panel">
        <div className="learning-studio-head">
          <div>
            <div className="panel-head">
              <Sparkles size={18} />
              <h2>KidWiz Learning Studio</h2>
            </div>
            <p>
              A live-AI lesson workspace inspired by DeepTutor, but bounded to
              KidWiz lessons, age bands, parent visibility, and local memory.
            </p>
          </div>
          <div className={`studio-status-card is-${liveAiStatus.tone}`}>
            <p>Live AI status</p>
            <strong>{liveAiStatus.label}</strong>
            <span>{liveAiStatus.message}</span>
          </div>
        </div>

        <div className="learning-mode-grid">
          {learningStudioModes.map((mode) => {
            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                className={`learning-mode-button ${
                  studioMode === mode.id ? "is-selected" : ""
                }`}
                onClick={() => applyMode(mode)}
                type="button"
              >
                <Icon size={18} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <form className="learning-studio-form" onSubmit={handleLearningStudioSubmit}>
          <label htmlFor="learning-studio-prompt">
            {selectedStudioMode.label} for {selectedChild.name}
          </label>
          <textarea
            id="learning-studio-prompt"
            onChange={(event) => setStudioPrompt(event.target.value)}
            placeholder={selectedStudioMode.prompt}
            value={studioPrompt}
          />
          <div className="learning-studio-submit-row">
            <span>
              Active lesson: {activeTrack.title} · {activeLesson.title}
            </span>
            <button
              className="inline-action"
              disabled={studioStatus.state === "loading"}
              type="submit"
            >
              <Send size={16} />
              Ask Spark
            </button>
          </div>
        </form>

        <div className="learning-studio-response-grid">
          <article className="studio-answer-card">
            <p>Child-facing answer</p>
            <strong>
              {studioStatus.result?.childAnswer ??
                latestTurn?.childAnswer ??
                "Ask Spark a lesson question to create the first live answer."}
            </strong>
          </article>

          <article className="studio-parent-card">
            <p>Parent safety review</p>
            <strong>{latestSafetyDecision.status.replaceAll("_", " ")}</strong>
            <span>{latestSafetyDecision.reason}</span>
            <small>{latestParentSummary}</small>
            <em>{latestNotebookSaved ? "Notebook card saved" : "No notebook card saved yet"}</em>
          </article>
        </div>

        <div className="learning-memory-grid">
          <article className="learning-memory-card">
            <p>Recent tutor turns</p>
            {learningStudio.turns.length ? (
              learningStudio.turns.slice(0, 3).map((turn) => (
                <div key={turn.id} className="learning-memory-row">
                  <strong>{turn.mode.replaceAll("_", " ")}</strong>
                  <span>{turn.prompt}</span>
                </div>
              ))
            ) : (
              <span>No live tutor turns saved yet.</span>
            )}
          </article>

          <article className="learning-memory-card">
            <p>Notebook</p>
            {learningStudio.notebookCards.length ? (
              learningStudio.notebookCards.slice(0, 3).map((card) => (
                <div key={card.id} className="learning-memory-row">
                  <strong>{card.title}</strong>
                  <span>{card.body}</span>
                </div>
              ))
            ) : (
              <span>Use Save to notebook to create the first durable note.</span>
            )}
          </article>

          <article className="learning-memory-card">
            <p>Question bank</p>
            {learningStudio.questionBankItems.length ? (
              learningStudio.questionBankItems.slice(0, 3).map((item) => (
                <div key={item.id} className="learning-memory-row">
                  <strong>{item.question}</strong>
                  <span>{item.answer}</span>
                </div>
              ))
            ) : (
              <span>Use Quiz me to save the first review question.</span>
            )}
          </article>

          <article className="learning-memory-card">
            <p>Safety events</p>
            {learningStudio.safetyEvents.length ? (
              learningStudio.safetyEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="learning-memory-row">
                  <strong>{event.status.replaceAll("_", " ")}</strong>
                  <span>{event.reason}</span>
                </div>
              ))
            ) : (
              <span>No parent-review events have been logged for this child.</span>
            )}
          </article>
        </div>
      </section>

      <section className="surface-panel">
        <div className="panel-head">
          <Sparkles size={18} />
          <h2>{activeLesson.title}</h2>
        </div>
        <p className="coach-callout">{activeLesson.coachModes[coachResponseMode]}</p>
      </section>

      <section className="spark-safety-panel">
        <div className="spark-safety-head">
          <div>
            <div className="panel-head">
              <ShieldCheck size={18} />
              <h2>{tutorSafety.title}</h2>
            </div>
            <p>{tutorSafety.copy}</p>
          </div>
          <span>{tutorSafety.posture}</span>
        </div>

        <div className="spark-guardrail-grid">
          {tutorSafety.guardrails.map((guardrail) => (
            <article
              key={guardrail.label}
              className={`spark-guardrail-card is-${guardrail.tone}`}
            >
              <p>{guardrail.label}</p>
              <strong>{guardrail.status}</strong>
              <span>{guardrail.copy}</span>
            </article>
          ))}
        </div>

        <div className="spark-prompt-lab">
          {tutorSafety.samplePrompts.map((prompt) => (
            <article key={prompt.label} className={`spark-prompt-card is-${prompt.tone}`}>
              <div className="spark-prompt-card-head">
                {prompt.tone === "warn" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <ClipboardCheck size={18} />
                )}
                <div>
                  <p>{prompt.label}</p>
                  <strong>{prompt.decision}</strong>
                </div>
              </div>
              <blockquote>{prompt.childPrompt}</blockquote>
              <div className="spark-response-box">
                <p>Mock Spark response</p>
                <span>{prompt.response}</span>
              </div>
              <div className="spark-parent-log">
                <p>Parent summary</p>
                <span>{prompt.parentLog}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="spark-moderation-checklist">
          <p>Production safety checklist</p>
          {tutorSafety.moderationChecklist.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </section>
  );
}
