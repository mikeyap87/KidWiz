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

  return (
    <div className="onboarding-shell">
      <div className="page-width onboarding-layout">
        <section className="onboarding-main">
          <div className="section-heading section-heading-tight">
            <p className="eyebrow eyebrow-dark">KidWiz family setup</p>
            <h1>Set up a first week parents can actually trust.</h1>
            <p>
              Choose the goals, rhythm, and coaching tone KidWiz should use
              before your child starts their first learning session.
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
            <div className="launch-preview-stack">
              <div className="launch-brief-panel">
                <div className="launch-brief-copy">
                  <p className="eyebrow eyebrow-dark">Parent launch brief</p>
                  <h2>Your first week is ready to review.</h2>
                  <span>
                    KidWiz will open with a clear child path, parent-readable
                    progress, and safety controls visible in the family area.
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

                {firstLesson ? (
                  <div className="launch-brief-next">
                    <div>
                      <span>{firstPreview.child.name}'s first move</span>
                      <strong>{firstLesson.title}</strong>
                    </div>
                    <p>{firstLesson.summary}</p>
                  </div>
                ) : null}
              </div>

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
          <div className="sidebar-block onboarding-summary onboarding-progress-card">
            <p className="eyebrow eyebrow-dark">Launch checklist</p>
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
          </div>

          <div className="sidebar-block onboarding-summary">
            <p className="eyebrow eyebrow-dark">Selected priorities</p>
            <div className="summary-chip-row">
              {selectedGoals.length ? (
                selectedGoals.map((goal) => (
                  <span key={goal.id} className="summary-chip">
                    {goal.title}
                  </span>
                ))
              ) : (
                <span className="summary-chip">Pick goals to begin</span>
              )}
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

          <div className="sidebar-block onboarding-summary onboarding-help-card">
            <p className="eyebrow eyebrow-dark">Need help choosing?</p>
            <strong>Start with the goal you already talk about at home.</strong>
            <p>
              Parents can restart setup from Family Hub later, so this does not
              have to be perfect on the first pass.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
