import {
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  Lock,
  NotebookPen,
  Rocket,
  ScrollText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { TrackGlyph } from "../lib/uiConfig";
import { isLessonUnlocked } from "../lib/progression";

export function CoursesTab({
  activeLesson,
  activeLessonAnswer,
  activeLessonExperience,
  activeLessonMilestoneIds,
  activeTrack,
  answeredCorrectly,
  answeredOption,
  childCompletedJourneyIds,
  childCompletedLessonIds,
  childPlaylistLessonIds,
  coachResponseMode,
  onAnswer,
  onChangeCoachMode,
  onOpenChildReflectionStarter,
  onOpenParentNoteStarter,
  onSelectLesson,
  onSelectPracticeChoice,
  onSelectTrack,
  onToggleJourney,
  onToggleComplete,
  onToggleLessonMilestone,
  onTogglePlaylist,
  trackProgressRows,
  visibleTracks,
}) {
  const lessonIndex = activeTrack.lessons.findIndex(
    (lesson) => lesson.id === activeLesson.id,
  );
  const nextLesson = activeTrack.lessons[lessonIndex + 1] ?? null;
  const lessonComplete = childCompletedLessonIds.includes(activeLesson.id);
  const familyChatDone = childCompletedJourneyIds.includes("family-chat");
  const lessonStages = activeLessonExperience.stages;
  const practicePanel = activeLessonExperience.practicePanel;
  const lessonStageCount = lessonStages.filter((stage) =>
    activeLessonMilestoneIds.includes(stage.id),
  ).length;
  const checkpointCount = answeredCorrectly ? 1 : 0;
  const lessonMoveCount = lessonStages.length + 1;
  const completedMoveCount = lessonStageCount + checkpointCount;
  const lessonProgressPercent = Math.round(
    (completedMoveCount / lessonMoveCount) * 100,
  );
  const lessonReadyToCelebrate =
    lessonStageCount === lessonStages.length && answeredCorrectly;
  const completionLabel = lessonComplete
    ? "Mark incomplete"
    : lessonReadyToCelebrate
      ? "Celebrate lesson"
      : "Mark complete anyway";

  function renderPracticeOption(option) {
    const selected = activeLessonExperience.selectedPracticeChoice?.id === option.id;
    const sharedClassName = `practice-option ${selected ? "is-selected" : ""}`;

    if (practicePanel.variant === "dialogue") {
      return (
        <button
          key={option.id}
          className={`${sharedClassName} practice-option-dialogue`}
          onClick={() => onSelectPracticeChoice(option.id)}
          type="button"
        >
          <p>{option.speaker}</p>
          <strong>{option.title}</strong>
          <span>{option.copy}</span>
          <em>{option.outcome}</em>
        </button>
      );
    }

    if (practicePanel.variant === "ladder" || practicePanel.variant === "planner") {
      return (
        <button
          key={option.id}
          className={`${sharedClassName} practice-option-step`}
          onClick={() => onSelectPracticeChoice(option.id)}
          type="button"
        >
          <div className="practice-step-badge">{option.step}</div>
          <div>
            <p>{practicePanel.variant === "planner" ? "Tiny start" : "Brave step"}</p>
            <strong>{option.title}</strong>
            <span>{option.copy}</span>
            <em>{option.outcome}</em>
          </div>
        </button>
      );
    }

    if (practicePanel.variant === "scan") {
      return (
        <button
          key={option.id}
          className={`${sharedClassName} practice-option-scan`}
          onClick={() => onSelectPracticeChoice(option.id)}
          type="button"
        >
          <div className="practice-signal-chip">{option.signal}</div>
          <div>
            <strong>{option.title}</strong>
            <span>{option.copy}</span>
            <em>{option.outcome}</em>
          </div>
        </button>
      );
    }

    if (practicePanel.variant === "script") {
      return (
        <button
          key={option.id}
          className={`${sharedClassName} practice-option-script`}
          onClick={() => onSelectPracticeChoice(option.id)}
          type="button"
        >
          <p>{option.eyebrow}</p>
          <strong>{option.title}</strong>
          <span>{option.copy}</span>
          <em>{option.outcome}</em>
        </button>
      );
    }

    return (
      <button
        key={option.id}
        className={`${sharedClassName} practice-option-card`}
        onClick={() => onSelectPracticeChoice(option.id)}
        type="button"
      >
        <p>{option.eyebrow}</p>
        <strong>{option.title}</strong>
        <span>{option.copy}</span>
        <em>{option.outcome}</em>
      </button>
    );
  }

  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Course library</p>
        <h1>Each track now teaches with its own lesson playbook.</h1>
        <p>
          Tracks still unlock in sequence, but each lesson now carries its own
          rhythm, proof-of-learning moment, and parent follow-through loop.
        </p>
      </div>

      <div className="track-grid">
        {visibleTracks.map((track) => {
          const row = trackProgressRows.find((item) => item.id === track.id);

          return (
            <button
              key={track.id}
              className={`track-tile ${
                activeTrack.id === track.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectTrack(track.id)}
              type="button"
            >
              <div className="track-tile-top">
                <TrackGlyph category={track.category} />
                {row?.assigned ? <BadgeCheck size={16} /> : null}
              </div>
              <h3>{track.title}</h3>
              <p>{track.summary}</p>
              <span>{row?.status.label ?? "Ready to start"}</span>
            </button>
          );
        })}
      </div>

      <div className="learning-layout">
        <section className="surface-panel">
          <div className="panel-head">
            <Compass size={18} />
            <h2>{activeTrack.title}</h2>
          </div>

          <p className="panel-copy">{activeTrack.parentPromise}</p>

          <div className="track-detail-grid">
            <div>
              <p>Child promise</p>
              <strong>{activeTrack.childPromise}</strong>
            </div>
            <div>
              <p>Capstone</p>
              <strong>{activeTrack.project}</strong>
            </div>
          </div>

          <div className="lesson-list">
            {activeTrack.lessons.map((lesson, lessonIndex) => {
              const complete = childCompletedLessonIds.includes(lesson.id);
              const queued = childPlaylistLessonIds.includes(lesson.id);
              const unlocked = complete
                ? true
                : isLessonUnlocked(activeTrack, lesson.id, childCompletedLessonIds);

              return (
                <button
                  key={lesson.id}
                  className={`lesson-row ${
                    activeLesson.id === lesson.id ? "is-selected" : ""
                  } ${!unlocked ? "is-locked" : ""}`}
                  disabled={!unlocked}
                  onClick={() => onSelectLesson(lesson.id)}
                  type="button"
                >
                  <div>
                    <p>
                      Lesson {lessonIndex + 1} · {lesson.duration}
                    </p>
                    <h3>{lesson.title}</h3>
                    <span>
                      {unlocked
                        ? lesson.summary
                        : "Finish the lesson above to unlock this step."}
                    </span>
                  </div>
                  <div className="lesson-status">
                    {queued ? <em>playlist</em> : null}
                    {complete ? <Check size={16} /> : unlocked ? null : <Lock size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Rocket size={18} />
            <h2>{activeLesson.title}</h2>
          </div>

          <p className="lesson-copy">{activeLesson.summary}</p>

          <div className="detail-pills">
            <span>{activeLessonExperience.trackPlaybookLabel}</span>
            <span>{activeLessonExperience.ageLens.label}</span>
            <span>{activeLesson.activity}</span>
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

          <p className="coach-callout">{activeLesson.coachModes[coachResponseMode]}</p>
          <p className="lesson-subcopy">{activeLessonExperience.headerCopy}</p>
          <p className="lesson-age-note">{activeLessonExperience.ageLens.summary}</p>

          <div className="practice-panel">
            <div className="panel-head">
              <Rocket size={18} />
              <h2>{practicePanel.title}</h2>
            </div>
            <p className="panel-copy">{practicePanel.prompt}</p>
            <p className="practice-panel-helper">{practicePanel.helper}</p>

            <div
              className={`practice-options practice-options-${practicePanel.variant}`}
            >
              {practicePanel.options.map((option) => renderPracticeOption(option))}
            </div>

            <p className="practice-selection-note">
              {activeLessonExperience.selectedPracticeChoice
                ? `Saved practice move: ${activeLessonExperience.practiceChoiceNote}`
                : practicePanel.unselectedNote}
            </p>
          </div>

          <div className="lesson-momentum">
            <div className="lesson-momentum-head">
              <div>
                <p>Lesson path</p>
                <h3>
                  {completedMoveCount} of {lessonMoveCount} lesson moves complete
                </h3>
              </div>
              <strong>{lessonProgressPercent}%</strong>
            </div>

            <div className="lesson-progress-meter" aria-hidden="true">
              <span style={{ width: `${lessonProgressPercent}%` }} />
            </div>

            <div className="lesson-stage-list">
              {lessonStages.map((stage) => {
                const stageComplete = activeLessonMilestoneIds.includes(stage.id);

                return (
                  <div
                    key={stage.id}
                    className={`lesson-stage-row ${stageComplete ? "is-complete" : ""}`}
                  >
                    <div>
                      <p>{stage.label}</p>
                      <strong>{stage.title}</strong>
                      <span>{stage.copy}</span>
                    </div>
                    <button
                      className={`stage-toggle ${stageComplete ? "is-selected" : ""}`}
                      onClick={() => onToggleLessonMilestone(stage.id)}
                      type="button"
                    >
                      {stageComplete ? "Done" : "Mark done"}
                    </button>
                  </div>
                );
              })}

              <div
                className={`lesson-stage-row ${answeredCorrectly ? "is-complete" : ""}`}
              >
                <div>
                  <p>Checkpoint</p>
                  <strong>Lock in the skill</strong>
                  <span>
                    {answeredCorrectly
                      ? activeLesson.quiz.success
                      : "Answer the checkpoint below to finish the lesson path."}
                  </span>
                </div>
                <span
                  className={`lesson-stage-status ${
                    answeredCorrectly ? "is-complete" : ""
                  }`}
                >
                  {answeredCorrectly ? "Cleared" : "Open"}
                </span>
              </div>
            </div>
          </div>

          <div className="quiz-panel">
            <div className="panel-head">
              <Target size={18} />
              <h2>{activeLesson.quiz.question}</h2>
            </div>

            <div className="quiz-options">
              {activeLesson.quiz.options.map((option, optionIndex) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    activeLessonAnswer === optionIndex ? "is-selected" : ""
                  }`}
                  onClick={() => onAnswer(optionIndex)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            {answeredOption ? (
              <p className={`quiz-feedback ${answeredCorrectly ? "is-right" : "is-wrong"}`}>
                {answeredCorrectly
                  ? activeLesson.quiz.success
                  : `${answeredOption} is close, but ${activeLesson.quiz.success.toLowerCase()}`}
              </p>
            ) : (
              <p className="quiz-feedback">
                Pick one answer to test the lesson before moving on.
              </p>
            )}
          </div>

          <div className="lesson-proof-panel">
            <div className="panel-head">
              <ScrollText size={18} />
              <h2>{activeLessonExperience.proofTitle}</h2>
            </div>
            <p className="panel-copy">{activeLessonExperience.proofCopy}</p>

            <div className="lesson-follow-list">
              <div className="lesson-follow-row">
                <p>Child reflection starter</p>
                <strong>{activeLessonExperience.reflectionPrompt}</strong>
                <span>Use this when opening the child journal so the lesson turns into language.</span>
              </div>
              <div className="lesson-follow-row">
                <p>{activeLessonExperience.familyMissionTitle}</p>
                <strong>{activeLessonExperience.familyMissionCopy}</strong>
              </div>
            </div>
          </div>

          {lessonComplete || lessonReadyToCelebrate ? (
            <div className="lesson-complete-strip">
              <div className="panel-head">
                <Sparkles size={18} />
                <h2>{lessonComplete ? "Lesson complete" : "Ready to celebrate"}</h2>
              </div>
              <p className="panel-copy">
                {lessonComplete
                  ? `This lesson is logged for the week. ${activeLessonExperience.celebrationLine}`
                  : `The guided steps and checkpoint are done. ${activeLessonExperience.celebrationLine}`}
              </p>
              <div className="detail-pills detail-pills-support">
                <span>
                  {nextLesson
                    ? `Next lesson: ${nextLesson.title}`
                    : `Capstone ready: ${activeTrack.project}`}
                </span>
                <span>{activeLessonExperience.familyMissionTitle}</span>
              </div>
            </div>
          ) : null}

          <div className="lesson-follow-through">
            <div className="panel-head">
              <Users size={18} />
              <h2>Parent follow-through</h2>
            </div>

            <div className="lesson-follow-list">
              {activeLessonExperience.parentPrompts.map((prompt) => (
                <div key={prompt.label} className="lesson-follow-row">
                  <p>{prompt.label}</p>
                  <strong>{prompt.text}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="action-row lesson-action-row">
            <button
              className={`inline-action ${
                childPlaylistLessonIds.includes(activeLesson.id) ? "is-selected" : ""
              }`}
              onClick={() => onTogglePlaylist(activeLesson.id)}
              type="button"
            >
              {childPlaylistLessonIds.includes(activeLesson.id)
                ? "Remove from playlist"
                : "Add to playlist"}
            </button>
            <button
              className={`inline-action ${familyChatDone ? "is-selected" : ""}`}
              onClick={() => onToggleJourney("family-chat")}
              type="button"
            >
              {familyChatDone ? "Family chat logged" : "Mark family chat done"}
            </button>
            <button
              className="inline-action"
              onClick={onOpenChildReflectionStarter}
              type="button"
            >
              <Sparkles size={14} />
              Open child reflection
            </button>
            <button
              className="inline-action"
              onClick={onOpenParentNoteStarter}
              type="button"
            >
              <NotebookPen size={14} />
              Open parent note starter
            </button>
            <button
              className={`inline-action ${lessonComplete ? "is-selected" : ""}`}
              onClick={() => onToggleComplete(activeLesson.id)}
              type="button"
            >
              {completionLabel}
            </button>
            {lessonComplete && nextLesson ? (
              <button
                className="inline-action"
                onClick={() => onSelectLesson(nextLesson.id)}
                type="button"
              >
                Open next lesson
                <ArrowRight size={14} />
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}
