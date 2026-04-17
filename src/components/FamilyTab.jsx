import { Bot, Brain, Compass, RefreshCw, ShieldCheck, Users } from "lucide-react";
import {
  celebrationStyles,
  familyGoals,
  familyRituals,
  trustSignals,
  weeklyRhythms,
  coachStyles,
} from "../data/kidwizData";

export function FamilyTab({
  appState,
  assignedTrackIds,
  onChangeCelebrationStyle,
  onChangeCoachStyle,
  onChangeRhythm,
  onGenerateFreshWeek,
  onResetDemo,
  onRestartOnboarding,
  onToggleBodyBoundaries,
  onToggleGoal,
  onToggleTrackAssignment,
  selectedCelebrationStyle,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
  selectedRhythm,
  trackProgressRows,
  visibleTracks,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Family controls</p>
        <h1>Parents can shape the product instead of just observing it.</h1>
        <p>
          This local test build includes goal selection, weekly rhythm, coach
          style, celebration style, track assignment, and a fresh-week generator.
        </p>
      </div>

      <div className="family-grid">
        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Family priorities</h2>
          </div>
          <div className="goal-chip-row">
            {familyGoals.map((goal) => (
              <button
                key={goal.id}
                className={`summary-chip-button ${
                  selectedGoals.some((item) => item.id === goal.id)
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => onToggleGoal(goal.id)}
                type="button"
              >
                {goal.title}
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Compass size={18} />
            <h2>Weekly rhythm</h2>
          </div>
          <div className="stack-list">
            {weeklyRhythms.map((rhythm) => (
              <button
                key={rhythm.id}
                className={`stack-row ${
                  selectedRhythm.id === rhythm.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeRhythm(rhythm.id)}
                type="button"
              >
                <strong>{rhythm.title}</strong>
                <span>{rhythm.copy}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Bot size={18} />
            <h2>Coach and celebration</h2>
          </div>
          <div className="stack-list">
            {coachStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCoachStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCoachStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
          <div className="stack-list stack-list-tight">
            {celebrationStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCelebrationStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCelebrationStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="family-grid family-grid-secondary">
        <article className="surface-panel">
          <div className="panel-head">
            <ShieldCheck size={18} />
            <h2>Trust center</h2>
          </div>
          <button
            className={`toggle-button ${
              appState.bodyBoundariesUnlocked ? "is-selected" : ""
            }`}
            onClick={onToggleBodyBoundaries}
            type="button"
          >
            <div>
              <span>Sensitive topic track</span>
              <strong>
                {appState.bodyBoundariesUnlocked ? "Unlocked" : "Locked"}
              </strong>
            </div>
          </button>
          <div className="trust-list">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="trust-row">
                <strong>{signal.title}</strong>
                <span>{signal.copy}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Brain size={18} />
            <h2>{selectedChild.name}&apos;s assigned tracks</h2>
          </div>
          <div className="assign-grid">
            {visibleTracks.map((track) => {
              const assigned = assignedTrackIds.includes(track.id);
              const progress = trackProgressRows.find((item) => item.id === track.id);

              return (
                <button
                  key={track.id}
                  className={`assign-tile ${assigned ? "is-selected" : ""}`}
                  onClick={() => onToggleTrackAssignment(track.id)}
                  type="button"
                >
                  <strong>{track.title}</strong>
                  <span>{progress?.progress ?? 0}% progress</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <RefreshCw size={18} />
            <h2>Local testing tools</h2>
          </div>
          <div className="tool-list">
            <button className="inline-action" onClick={onGenerateFreshWeek} type="button">
              Generate fresh week
            </button>
            <button className="inline-action" onClick={onRestartOnboarding} type="button">
              Restart onboarding
            </button>
            <button className="inline-action" onClick={onResetDemo} type="button">
              Reset local demo
            </button>
          </div>

          <div className="ritual-list">
            {familyRituals.map((ritual) => (
              <div key={ritual.title} className="ritual-row">
                <strong>{ritual.title}</strong>
                <span>{ritual.copy}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
