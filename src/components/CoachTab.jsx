import { Sparkles } from "lucide-react";

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
    </section>
  );
}
