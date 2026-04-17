import {
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  Lock,
  NotebookPen,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { TrackGlyph } from "../lib/uiConfig";
import { isLessonUnlocked } from "../lib/progression";

export function CoursesTab({
  activeLesson,
  activeLessonAnswer,
  activeLessonMilestoneIds,
  activeTrack,
  answeredCorrectly,
  answeredOption,
  childCompletedJourneyIds,
  childCompletedLessonIds,
  childPlaylistLessonIds,
  coachResponseMode,
  nextRitual,
  onAnswer,
  onChangeCoachMode,
  onOpenParentNoteStarter,
  onSelectLesson,
  onSelectTrack,
  onToggleJourney,
  onToggleComplete,
  onToggleLessonMilestone,
  onTogglePlaylist,
  selectedCelebrationStyle,
  selectedChild,
  trackProgressRows,
  visibleTracks,
}) {
  const lessonIndex = activeTrack.lessons.findIndex(
    (lesson) => lesson.id === activeLesson.id,
  );
  const nextLesson = activeTrack.lessons[lessonIndex + 1] ?? null;
  const lessonComplete = childCompletedLessonIds.includes(activeLesson.id);
  const familyChatDone = childCompletedJourneyIds.includes("family-chat");
  const lessonStages = [
    {
      id: "coach-cue",
      label: "Coach cue",
      title: "Set the tone",
      copy: activeLesson.coachModes[coachResponseMode],
    },
    {
      id: "activity",
      label: "Mini mission",
      title: "Try the skill",
      copy: activeLesson.activity,
    },
    {
      id: "parent-bridge",
      label: "Bring it home",
      title: "Talk it through",
      copy: activeLesson.parentCue,
    },
  ];
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
  const celebrationMessageByStyle = {
    effort:
      "Name the effort it took to stay with the lesson, even if parts felt wobbly.",
    curiosity:
      "Ask what felt new, surprising, or worth trying again after the checkpoint.",
    "follow-through":
      "Call out the follow-through it took to finish the practice and lock it in.",
  };
  const celebrationMessage =
    celebrationMessageByStyle[selectedCelebrationStyle.id] ??
    "Notice what helped the lesson stick today.";
  const completionLabel = lessonComplete
    ? "Mark incomplete"
    : lessonReadyToCelebrate
      ? "Celebrate lesson"
      : "Mark complete anyway";

  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Course library</p>
        <h1>Lessons should feel guided, interactive, and easy to carry into real life.</h1>
        <p>
          Tracks still unlock in sequence, but each lesson now works like a mini
          mission with guided steps, a checkpoint, and a parent follow-through loop.
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
            <span>{activeLesson.activity}</span>
            <span>{activeLesson.parentCue}</span>
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

          {lessonComplete || lessonReadyToCelebrate ? (
            <div className="lesson-complete-strip">
              <div className="panel-head">
                <Sparkles size={18} />
                <h2>{lessonComplete ? "Lesson complete" : "Ready to celebrate"}</h2>
              </div>
              <p className="panel-copy">
                {lessonComplete
                  ? `${selectedChild.name} has this lesson logged for the week. ${celebrationMessage}`
                  : `${selectedChild.name} finished the guided steps and cleared the checkpoint. ${celebrationMessage}`}
              </p>
              <div className="detail-pills detail-pills-support">
                <span>
                  {nextLesson
                    ? `Next lesson: ${nextLesson.title}`
                    : `Capstone ready: ${activeTrack.project}`}
                </span>
                <span>{nextRitual.title}</span>
              </div>
            </div>
          ) : null}

          <div className="lesson-follow-through">
            <div className="panel-head">
              <Users size={18} />
              <h2>Parent follow-through</h2>
            </div>

            <div className="lesson-follow-list">
              <div className="lesson-follow-row">
                <p>Ask</p>
                <strong>{activeLesson.parentCue}</strong>
              </div>
              <div className="lesson-follow-row">
                <p>Celebrate</p>
                <strong>{selectedCelebrationStyle.title}</strong>
                <span>{selectedCelebrationStyle.copy}</span>
              </div>
              <div className="lesson-follow-row">
                <p>Tonight&apos;s ritual</p>
                <strong>{nextRitual.title}</strong>
                <span>{nextRitual.copy}</span>
              </div>
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
