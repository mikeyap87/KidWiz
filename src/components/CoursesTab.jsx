import { BadgeCheck, Check, Compass, Lock, Rocket, Target } from "lucide-react";
import { TrackGlyph } from "../lib/uiConfig";
import { isLessonUnlocked } from "../lib/progression";

export function CoursesTab({
  activeLesson,
  activeLessonAnswer,
  activeTrack,
  answeredCorrectly,
  answeredOption,
  childCompletedLessonIds,
  childPlaylistLessonIds,
  coachResponseMode,
  onAnswer,
  onChangeCoachMode,
  onSelectLesson,
  onSelectTrack,
  onToggleComplete,
  onTogglePlaylist,
  trackProgressRows,
  visibleTracks,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Course library</p>
        <h1>Each track now has progression, prerequisites, and checkpoints.</h1>
        <p>
          Lessons unlock in sequence, tracks show status, and the weekly playlist
          can point children toward the next best step instead of random content.
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

          <div className="action-row">
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
              className={`inline-action ${
                childCompletedLessonIds.includes(activeLesson.id) ? "is-selected" : ""
              }`}
              onClick={() => onToggleComplete(activeLesson.id)}
              type="button"
            >
              {childCompletedLessonIds.includes(activeLesson.id)
                ? "Mark incomplete"
                : "Mark complete"}
            </button>
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
        </section>
      </div>
    </section>
  );
}
