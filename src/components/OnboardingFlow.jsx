import {
  celebrationStyles,
  familyGoals,
  weeklyRhythms,
  coachStyles,
} from "../data/kidwizData";
import { trustSignals } from "../data/kidwizMarketingData";
import { GoalGlyph } from "../lib/uiConfig";

export function OnboardingFlow({
  canAdvance,
  celebrationStyleId,
  coachStyleId,
  onBack,
  onFinish,
  onNext,
  onSelectCelebrationStyle,
  onSelectCoachStyle,
  onSelectRhythm,
  onToggleGoal,
  previewPlaylists,
  selectedGoalIds,
  selectedGoals,
  step,
  weeklyRhythmId,
}) {
  return (
    <div className="onboarding-shell">
      <div className="page-width onboarding-layout">
        <section className="onboarding-main">
          <div className="section-heading section-heading-tight">
            <p className="eyebrow eyebrow-dark">KidWiz family setup</p>
            <h1>Shape the learning rhythm before the app opens.</h1>
            <p>
              This local setup flow helps us test how KidWiz can adapt to a real
              family instead of dropping everyone into the same generic product.
            </p>
          </div>

          <div className="step-row" aria-label="Setup steps">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`step-pill ${step === item ? "is-active" : ""}`}
              >
                <span>{item + 1}</span>
                <strong>
                  {item === 0 ? "Goals" : item === 1 ? "Rhythm" : "Preview"}
                </strong>
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div className="choice-grid">
              {familyGoals.map((goal) => (
                <button
                  key={goal.id}
                  className={`choice-tile ${
                    selectedGoalIds.includes(goal.id) ? "is-selected" : ""
                  }`}
                  onClick={() => onToggleGoal(goal.id)}
                  type="button"
                >
                  <div className="choice-tile-icon">
                    <GoalGlyph goalId={goal.id} />
                  </div>
                  <h3>{goal.title}</h3>
                  <p>{goal.copy}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="onboarding-choice-columns">
              <div>
                <h2>Weekly rhythm</h2>
                <div className="stack-list">
                  {weeklyRhythms.map((rhythm) => (
                    <button
                      key={rhythm.id}
                      className={`stack-row ${
                        weeklyRhythmId === rhythm.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectRhythm(rhythm.id)}
                      type="button"
                    >
                      <strong>{rhythm.title}</strong>
                      <span>{rhythm.copy}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2>Coach style</h2>
                <div className="stack-list">
                  {coachStyles.map((style) => (
                    <button
                      key={style.id}
                      className={`stack-row ${
                        coachStyleId === style.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectCoachStyle(style.id)}
                      type="button"
                    >
                      <strong>{style.title}</strong>
                      <span>{style.copy}</span>
                    </button>
                  ))}
                </div>

                <h2 className="section-subhead">What gets celebrated</h2>
                <div className="stack-list">
                  {celebrationStyles.map((style) => (
                    <button
                      key={style.id}
                      className={`stack-row ${
                        celebrationStyleId === style.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectCelebrationStyle(style.id)}
                      type="button"
                    >
                      <strong>{style.title}</strong>
                      <span>{style.copy}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="preview-grid">
              {previewPlaylists.map(({ child, lessons }) => (
                <article key={child.id} className="preview-panel">
                  <p>{child.name}</p>
                  <h3>{child.todayTheme}</h3>
                  <span>{child.supportSpot}</span>
                  <div className="preview-lesson-list">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="preview-lesson-row">
                        <strong>{lesson.title}</strong>
                        <span>{lesson.trackTitle}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="onboarding-actions">
            <button
              className="ghost-button ghost-button-dark"
              disabled={step === 0}
              onClick={onBack}
              type="button"
            >
              Back
            </button>

            {step < 2 ? (
              <button
                className="solid-button"
                disabled={!canAdvance}
                onClick={onNext}
                type="button"
              >
                Continue
              </button>
            ) : (
              <button className="solid-button" onClick={onFinish} type="button">
                Launch KidWiz
              </button>
            )}
          </div>
        </section>

        <aside className="onboarding-side">
          <div className="sidebar-block onboarding-summary">
            <p className="eyebrow eyebrow-dark">Selected priorities</p>
            <div className="summary-chip-row">
              {selectedGoals.map((goal) => (
                <span key={goal.id} className="summary-chip">
                  {goal.title}
                </span>
              ))}
            </div>
            <p>
              Pick at least two goals. KidWiz uses these to build the first weekly
              playlist and coach prompts for each child.
            </p>
          </div>

          <div className="sidebar-block onboarding-summary">
            <p className="eyebrow eyebrow-dark">Safety promises</p>
            <ul className="promise-list">
              {trustSignals.map((signal) => (
                <li key={signal.title}>
                  <strong>{signal.title}</strong>
                  <span>{signal.copy}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
