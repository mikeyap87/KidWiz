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
  const selectedRhythm =
    weeklyRhythms.find((rhythm) => rhythm.id === weeklyRhythmId) ??
    weeklyRhythms[0];
  const selectedCoachStyle =
    coachStyles.find((style) => style.id === coachStyleId) ?? coachStyles[1];
  const selectedCelebrationStyle =
    celebrationStyles.find((style) => style.id === celebrationStyleId) ??
    celebrationStyles[0];
  const selectedGoalTitles = selectedGoals.map((goal) => goal.title);
  const selectedGoalPhrase =
    selectedGoalTitles.length > 0
      ? selectedGoalTitles.join(", ")
      : "your first two priorities";
  const goalLimitReached = selectedGoalIds.length >= 3;
  const previewPlaylists = useMemo(
    () =>
      childProfiles.map((child) => ({
        child,
        target: weeklyTargetsByChild?.[child.id] ?? {
          lessons: 3,
          stories: 2,
          reflections: 2,
        },
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
  const stepGuidance = [
    {
      title: "Choose the strongest signals",
      copy:
        "Pick two or three priorities so the first week feels focused instead of busy.",
    },
    {
      title: "Set the home rhythm",
      copy:
        "Match KidWiz to the week your family can actually keep, then choose the tone adults want reinforced.",
    },
    {
      title: "Review the first-week plan",
      copy:
        "Check what each child will start with, what parents should say first, and how wins will be noticed.",
    },
  ];
  const setupSummary = [
    {
      label: "Goals",
      value:
        selectedGoalIds.length >= 2
          ? `${selectedGoalIds.length} priorities`
          : `${Math.max(0, 2 - selectedGoalIds.length)} more needed`,
      copy:
        selectedGoalIds.length >= 2
          ? selectedGoalPhrase
          : "Choose at least two before continuing.",
    },
    {
      label: "Rhythm",
      value: selectedRhythm.title,
      copy: selectedRhythm.copy,
    },
    {
      label: "Coach tone",
      value: selectedCoachStyle.title,
      copy: selectedCoachStyle.copy,
    },
    {
      label: "Celebration",
      value: selectedCelebrationStyle.title,
      copy: selectedCelebrationStyle.copy,
    },
  ];
  const parentScript = `This week we are practicing ${selectedGoalPhrase.toLowerCase()} in small steps. I will notice effort first, and we will use ${selectedRhythm.title.toLowerCase()} so KidWiz fits our real week.`;

  return (
    <div className="onboarding-shell">
      <div className="page-width onboarding-layout">
        <section className="onboarding-main">
          <div className="section-heading section-heading-tight on-dark">
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

          <section className="onboarding-guidance-strip">
            <div>
              <p className="eyebrow eyebrow-dark">Parent decision guide</p>
              <h2>{stepGuidance[step].title}</h2>
              <p>{stepGuidance[step].copy}</p>
            </div>
            <span>{selectedGoalIds.length}/3 goals selected</span>
          </section>

          {step === 0 ? (
            <>
              <div className="onboarding-choice-note">
                <strong>Keep the first week focused.</strong>
                <span>
                  Select two or three goals. You can change this later in Family
                  Hub after seeing how the week feels.
                </span>
              </div>
              <div className="choice-grid">
                {familyGoals.map((goal) => {
                  const isSelected = selectedGoalIds.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      aria-pressed={isSelected}
                      className={`choice-tile ${isSelected ? "is-selected" : ""}`}
                      disabled={goalLimitReached && !isSelected}
                      onClick={() => onToggleGoal(goal.id)}
                      type="button"
                    >
                      <div className="choice-tile-icon">
                        <GoalGlyph goalId={goal.id} />
                      </div>
                      <h3>{goal.title}</h3>
                      <p>{goal.copy}</p>
                    </button>
                  );
                })}
              </div>
            </>
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
            <>
              <section className="onboarding-launch-plan">
                <div className="onboarding-launch-copy">
                  <p className="eyebrow eyebrow-dark">First-week parent plan</p>
                  <h2>KidWiz is ready to open with a clear adult role.</h2>
                  <p>
                    The setup choices now become a parent-readable plan before
                    the family enters the dashboard.
                  </p>
                </div>
                <div className="onboarding-script-card">
                  <p>Tonight's parent script</p>
                  <strong>{parentScript}</strong>
                  <span>
                    Use this as the first handoff from setup into the child
                    experience.
                  </span>
                </div>
              </section>

              <div className="preview-grid">
                {previewPlaylists.map(({ child, lessons, target }) => (
                  <article key={child.id} className="preview-panel">
                    <p>{child.name}</p>
                    <h3>{child.todayTheme}</h3>
                    <span>{child.supportSpot}</span>
                    <div className="onboarding-target-row">
                      <span>{target.lessons} lessons</span>
                      <span>{target.stories} stories</span>
                      <span>{target.reflections} reflections</span>
                    </div>
                    <div className="preview-lesson-list">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="preview-lesson-row">
                          <strong>
                            {index === 0 ? "Start here: " : ""}
                            {lesson.title}
                          </strong>
                          <span>{lesson.trackTitle}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </>
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
              {selectedGoals.length > 0 ? (
                selectedGoals.map((goal) => (
                  <span key={goal.id} className="summary-chip">
                    {goal.title}
                  </span>
                ))
              ) : (
                <span className="summary-chip">Choose two goals</span>
              )}
            </div>
            <p>
              Pick at least two goals. KidWiz uses these to build the first weekly
              playlist and coach prompts for each child.
            </p>
          </div>

          <div className="sidebar-block onboarding-plan-summary">
            <p className="eyebrow eyebrow-dark">Launch plan</p>
            <div className="onboarding-plan-list">
              {setupSummary.map((item) => (
                <div key={item.label} className="onboarding-plan-row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
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
