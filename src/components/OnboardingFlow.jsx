import { useMemo } from "react";
import {
  celebrationStyles,
  childProfiles,
  familyGoals,
  weeklyRhythms,
  coachStyles,
} from "../data/kidwizData";
import { trustSignals } from "../data/kidwizMarketingData";
import {
  buildSuggestedPlaylistForChild,
  findLessonById,
  findTrackByLessonId,
} from "../lib/progression";
import { GoalGlyph } from "../lib/uiConfig";

export function OnboardingFlow({
  bodyBoundariesUnlocked,
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
  selectedGoalIds,
  selectedGoals,
  step,
  weeklyTargetsByChild,
  weeklyRhythmId,
}) {
  const previewPlaylists = useMemo(
    () =>
      childProfiles.map((child) => ({
        child,
        lessons: buildSuggestedPlaylistForChild(
          selectedGoalIds,
          child.id,
          bodyBoundariesUnlocked,
          weeklyTargetsByChild?.[child.id],
        )
          .map((lessonId) => {
            const lesson = findLessonById(lessonId);
            const track = findTrackByLessonId(lessonId);
            return lesson
              ? {
                  ...lesson,
                  trackTitle: track?.title ?? "",
                }
              : null;
          })
          .filter(Boolean),
      })),
    [bodyBoundariesUnlocked, selectedGoalIds, weeklyTargetsByChild],
  );

  const selectedRhythm =
    weeklyRhythms.find((rhythm) => rhythm.id === weeklyRhythmId) ??
    weeklyRhythms[0];
  const selectedCoachStyle =
    coachStyles.find((style) => style.id === coachStyleId) ?? coachStyles[0];
  const selectedCelebrationStyle =
    celebrationStyles.find((style) => style.id === celebrationStyleId) ??
    celebrationStyles[0];
  const firstPreview = previewPlaylists[0];
  const firstLesson = firstPreview?.lessons?.[0];
  const goalSummary = selectedGoals.length
    ? selectedGoals.map((goal) => goal.title).join(", ")
    : "Choose at least two priorities";
  const setupChecklist = [
    {
      label: "Parent priorities",
      detail:
        selectedGoalIds.length >= 2
          ? `${selectedGoalIds.length} goals selected`
          : "Pick at least two goals",
      complete: selectedGoalIds.length >= 2,
      current: step === 0,
    },
    {
      label: "Weekly rhythm",
      detail: selectedRhythm.title,
      complete: Boolean(weeklyRhythmId),
      current: step === 1,
    },
    {
      label: "Coach tone",
      detail: selectedCoachStyle.title,
      complete: Boolean(coachStyleId),
      current: step === 1,
    },
    {
      label: "First-week plan",
      detail: firstLesson ? firstLesson.title : "Preview the child plan",
      complete: step === 2,
      current: step === 2,
    },
  ];
  const stepTitle =
    step === 0
      ? "Pick two family powers."
      : step === 1
        ? "Tune the weekly rhythm."
        : "Launch the first quest.";
  const stepCopy =
    step === 0
      ? "Choose at least two goals. KidWiz uses these to build the first child missions and parent proof."
      : step === 1
        ? "Set how often KidWiz should guide practice, how Spark should talk, and what gets celebrated."
        : "Review the plan, then open the game room with Today already pointing to the next mission.";
  const actionLabel =
    step < 2 ? `Continue to ${step === 0 ? "rhythm" : "launch"}` : "Launch KidWiz";

  return (
    <div className="onboarding-shell setup-quest-shell">
      <section className="kidwiz-game-shell setup-quest-room" aria-label="KidWiz setup quest">
        <header className="game-hud setup-quest-hud">
          <div className="game-brand">
            <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
            <div>
              <p>Setup Quest</p>
              <h1>{stepTitle}</h1>
            </div>
          </div>

          <div className="game-hud-stats" aria-label="Setup progress">
            <span className="game-stat">
              <strong>{step + 1}/3</strong>
              quest step
            </span>
            <span className="game-stat">
              <strong>{selectedGoalIds.length}</strong>
              goals
            </span>
            <span className="game-stat">
              <strong>{selectedRhythm.title}</strong>
              rhythm
            </span>
          </div>
        </header>

        <div className="setup-quest-board">
          <main className="setup-quest-stage" aria-label="Setup decision">
            <div className="setup-quest-intro">
              <p>Parent launch path</p>
              <h2>{stepTitle}</h2>
              <span>{stepCopy}</span>
            </div>

            <div className="step-row setup-quest-steps" aria-label="Setup steps">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className={`step-pill ${step === item ? "is-active" : ""}`}
                >
                  <span>{item + 1}</span>
                  <strong>
                    {item === 0 ? "Goals" : item === 1 ? "Rhythm" : "Launch"}
                  </strong>
                </div>
              ))}
            </div>

            {step === 0 ? (
              <div className="setup-goal-grid">
                {familyGoals.map((goal) => (
                  <button
                    key={goal.id}
                    aria-pressed={selectedGoalIds.includes(goal.id)}
                    className={`choice-tile setup-goal-tile ${
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
              <div className="setup-choice-grid">
                <section className="setup-choice-panel">
                  <h3>Weekly rhythm</h3>
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
                </section>

                <section className="setup-choice-panel">
                  <h3>Coach style</h3>
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
                </section>

                <section className="setup-choice-panel">
                  <h3>Celebrate</h3>
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
                </section>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="setup-launch-grid">
                <article className="launch-brief-panel setup-launch-brief">
                  <div className="launch-brief-copy">
                    <p className="eyebrow eyebrow-dark">Parent launch brief</p>
                    <h2>Your first week is ready.</h2>
                    <span>
                      KidWiz will open with a clear child path, parent proof,
                      and safety controls visible in the Parent room.
                    </span>
                  </div>

                  <div className="launch-brief-grid">
                    <div className="launch-brief-item">
                      <span>Goals</span>
                      <strong>{goalSummary}</strong>
                    </div>
                    <div className="launch-brief-item">
                      <span>Rhythm</span>
                      <strong>{selectedRhythm.title}</strong>
                    </div>
                    <div className="launch-brief-item">
                      <span>Coach</span>
                      <strong>{selectedCoachStyle.title}</strong>
                    </div>
                    <div className="launch-brief-item">
                      <span>Celebrates</span>
                      <strong>{selectedCelebrationStyle.title}</strong>
                    </div>
                  </div>

                  {firstLesson && firstPreview ? (
                    <div className="launch-brief-next">
                      <div>
                        <span>{firstPreview.child.name}&apos;s first move</span>
                        <strong>{firstLesson.title}</strong>
                      </div>
                      <p>{firstLesson.summary}</p>
                    </div>
                  ) : null}
                </article>

                <div className="preview-grid setup-preview-grid">
                  {previewPlaylists.slice(0, 2).map(({ child, lessons }) => (
                    <article key={child.id} className="preview-panel">
                      <p>{child.name}</p>
                      <h3>{child.todayTheme}</h3>
                      <span>{child.supportSpot}</span>
                      <div className="preview-lesson-list">
                        {lessons.slice(0, 3).map((lesson) => (
                          <div key={lesson.id} className="preview-lesson-row">
                            <strong>{lesson.title}</strong>
                            <span>{lesson.trackTitle}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </main>

          <aside className="game-console setup-quest-console" aria-label="Parent trust console">
            <div className="game-console-tabs" role="tablist">
              <button className="is-active" type="button">Quest</button>
              <button type="button">Safety</button>
              <button type="button">Proof</button>
            </div>

            <div className="game-console-panel">
              <div className="game-console-hero">
                <div className="setup-console-badge">{step + 1}</div>
                <div>
                  <p>Launch checklist</p>
                  <h2>{canAdvance ? "Ready for next step" : "Pick two goals"}</h2>
                </div>
              </div>

              <div className="onboarding-mini-checklist">
                {setupChecklist.map((item) => (
                  <div
                    key={item.label}
                    className={`onboarding-check-row ${
                      item.complete ? "is-complete" : ""
                    } ${item.current ? "is-current" : ""}`}
                  >
                    <span>{item.complete ? "Done" : "Next"}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>

              <article className="game-signal-card setup-selected-goals">
                <p>Selected priorities</p>
                <strong>{goalSummary}</strong>
                <span>
                  Parents can restart setup from the Parent room later.
                </span>
              </article>

              <div className="setup-safety-list" aria-label="Safety promises">
                {trustSignals.slice(0, 3).map((signal) => (
                  <span key={signal.title}>
                    <strong>{signal.title}</strong>
                    {signal.copy}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <footer className="game-action-bar setup-quest-actions" aria-label="Setup actions">
          <button
            className="ghost-button ghost-button-dark"
            disabled={step === 0}
            onClick={onBack}
            type="button"
          >
            Back
          </button>

          {!canAdvance ? (
            <span className="setup-blocked-state">Choose at least two goals</span>
          ) : null}

          <button
            className="solid-button"
            disabled={!canAdvance}
            onClick={step < 2 ? onNext : onFinish}
            type="button"
          >
            {actionLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}
