import { AlertTriangle, ClipboardCheck, ShieldCheck, Sparkles } from "lucide-react";
import { buildSparkTutorSafetyStudio } from "../lib/progression";

export function CoachTab({
  activeLesson,
  activeTrack,
  coachCards,
  coachResponseMode,
  onChangeCoachMode,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  const tutorSafety = buildSparkTutorSafetyStudio({
    activeLesson,
    activeTrack,
    selectedChild,
    selectedCoachStyle,
    coachResponseMode,
  });

  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Spark Coach studio</p>
        <h1>Bounded AI-style guidance, still safe enough for family review.</h1>
        <p>
          This local version does not call a model yet, but it behaves like a
          coach layer: it adapts tone, learning prompts, and family follow-ups.
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
