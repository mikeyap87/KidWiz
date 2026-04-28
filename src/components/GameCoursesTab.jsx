import {
  BadgeCheck,
  BookOpen,
  Bot,
  Brain,
  Check,
  CircleHelp,
  Lock,
  Map,
  NotebookPen,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { buildLessonExperience } from "../lib/lessonExperience";
import {
  getTrackProgress,
  getTrackStatus,
  isLessonUnlocked,
} from "../lib/progression";
import { TrackGlyph } from "../lib/uiConfig";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

export function CoursesTab({
  activeLesson,
  activeLessonAnswer,
  activeLessonMilestoneIds,
  activeLessonPracticeChoiceId,
  activeTrack,
  answeredCorrectly,
  answeredOption,
  childCompletedLessonIds,
  childPlaylistLessonIds,
  coachResponseMode,
  nextRitual,
  onAnswer,
  onOpenChildReflectionStarter,
  onOpenParentNoteStarter,
  onSelectLesson,
  onSelectTab,
  onSelectTrack,
  onToggleComplete,
  onToggleLessonMilestone,
  onTogglePlaylist,
  assignedTrackIds,
  selectedCelebrationStyle,
  selectedChild,
  visibleTracks,
}) {
  const trackRows = visibleTracks.map((track) => ({
    ...track,
    progress: getTrackProgress(selectedChild, track, childCompletedLessonIds),
    assigned: assignedTrackIds.includes(track.id),
    status: getTrackStatus(track, childCompletedLessonIds),
  }));
  const lessonIndex = activeTrack.lessons.findIndex(
    (lesson) => lesson.id === activeLesson.id,
  );
  const activeLessonExperience = buildLessonExperience({
    childAge: selectedChild.age,
    childName: selectedChild.name,
    coachMode: coachResponseMode,
    celebrationStyle: selectedCelebrationStyle,
    lesson: activeLesson,
    nextRitual,
    practiceChoiceId: activeLessonPracticeChoiceId,
    track: activeTrack,
  });
  const lessonComplete = childCompletedLessonIds.includes(activeLesson.id);
  const unlockedLessons = activeTrack.lessons.filter((lesson) =>
    isLessonUnlocked(activeTrack, lesson.id, childCompletedLessonIds),
  );
  const currentStage = activeLessonExperience.stages?.[0] ?? {
    id: "read",
    title: "Start the mission",
    copy: activeLesson.summary,
  };
  const stageDone = activeLessonMilestoneIds.includes(currentStage.id);
  const quizOptions = activeLesson.quiz.options ?? [];
  const activeProgress = getTrackProgress(
    selectedChild,
    activeTrack,
    childCompletedLessonIds,
  );
  const hasAnswered = activeLessonAnswer !== undefined && activeLessonAnswer !== null;

  return (
    <section className="kidwiz-game-shell game-learn-room" aria-label="KidWiz learn room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Learn room</p>
            <h1>{activeTrack.title}</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Lesson status">
          <span className="game-stat">
            <strong>{activeProgress}%</strong>
            track
          </span>
          <span className="game-stat">
            <strong>{lessonIndex + 1}/{activeTrack.lessons.length}</strong>
            mission
          </span>
          <span className="game-stat">
            <strong>{lessonComplete ? "Done" : "Open"}</strong>
            status
          </span>
        </div>
      </header>

      <div className="game-board game-learn-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "courses" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-learn-stage" aria-label="Playable lesson">
          <aside className="game-track-dock" aria-label="Learning zones">
            {trackRows.slice(0, 8).map((track) => (
              <button
                key={track.id}
                aria-label={`Open ${track.title} learning zone`}
                className={activeTrack.id === track.id ? "is-selected" : ""}
                onClick={() => onSelectTrack(track.id)}
                type="button"
              >
                <TrackGlyph category={track.category} size={18} />
                <span>{track.shortTitle ?? track.title}</span>
                {track.assigned ? <BadgeCheck size={14} /> : null}
              </button>
            ))}
          </aside>

          <section className="game-lesson-stage">
            <div className="game-lesson-hero">
              <div>
                <p>Mission {lessonIndex + 1}</p>
                <h2>{activeLesson.title}</h2>
                <span>{activeLesson.summary}</span>
              </div>
              <button
                className={lessonComplete ? "ghost-button ghost-button-dark" : "solid-button"}
                onClick={() => onToggleComplete(activeLesson.id)}
                type="button"
              >
                {lessonComplete ? "Undo complete" : "Complete mission"}
              </button>
            </div>

            <div className="game-lesson-playfield">
              <article className="game-play-card is-primary">
                <p>Step 1</p>
                <strong>{currentStage.title}</strong>
                <span>{currentStage.copy}</span>
                <button
                  className="inline-action"
                  onClick={() => onToggleLessonMilestone(currentStage.id)}
                  type="button"
                >
                  {stageDone ? "Step done" : "Mark step"}
                  <Check size={14} />
                </button>
              </article>

              <article className="game-play-card">
                <p>Step 2</p>
                <strong>{activeLessonExperience.practicePanel.title}</strong>
                <span>{activeLessonExperience.practicePanel.prompt}</span>
                <button
                  className="inline-action"
                  onClick={() => onSelectTab("coach")}
                  type="button"
                >
                  Ask tutor
                  <Sparkles size={14} />
                </button>
              </article>

              <article className="game-play-card">
                <p>Quiz</p>
                <strong>{activeLesson.quiz.question}</strong>
                <div className="game-quiz-options">
                  {quizOptions.map((option, index) => (
                    <button
                      key={option}
                      aria-label={`Answer quiz option ${index + 1}: ${option}`}
                      className={activeLessonAnswer === index ? "is-selected" : ""}
                      onClick={() => onAnswer(index)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {hasAnswered ? (
                  <span>
                    {answeredCorrectly
                      ? "Correct. This mission is ready to lock in."
                      : `${answeredOption} is close. Try the checkpoint again when ready.`}
                  </span>
                ) : null}
              </article>
            </div>
          </section>
        </main>

        <aside className="game-console" aria-label="Lesson console">
          <div className="game-console-tabs" role="tablist">
            <button className="is-active" type="button">Path</button>
            <button onClick={() => onSelectTab("coach")} type="button">Tutor</button>
            <button onClick={() => onSelectTab("family")} type="button">Parent</button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <Trophy size={22} />
              <div>
                <p>Mission path</p>
                <h2>{unlockedLessons.length}/{activeTrack.lessons.length} open</h2>
              </div>
            </div>
            <div className="game-meter">
              <span style={{ width: `${activeProgress}%` }} />
            </div>
            <div className="game-lesson-list">
              {activeTrack.lessons.map((lesson) => {
                const unlocked = isLessonUnlocked(
                  activeTrack,
                  lesson.id,
                  childCompletedLessonIds,
                );
                const done = childCompletedLessonIds.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    className={activeLesson.id === lesson.id ? "is-selected" : ""}
                    disabled={!unlocked}
                    onClick={() => onSelectLesson(lesson.id)}
                    type="button"
                  >
                    {done ? <Check size={14} /> : unlocked ? <Target size={14} /> : <Lock size={14} />}
                    <span>{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Learn actions">
        <button onClick={() => onTogglePlaylist(activeLesson.id)} type="button">
          <BookOpen size={16} />
          {childPlaylistLessonIds.includes(activeLesson.id) ? "In playlist" : "Playlist"}
        </button>
        <button onClick={() => onOpenChildReflectionStarter(activeLessonExperience.childReflectionStarter)} type="button">
          <NotebookPen size={16} />
          Reflect
        </button>
        <button onClick={() => onSelectTab("coach")} type="button">
          <Bot size={16} />
          Tutor
        </button>
        <button onClick={() => onOpenParentNoteStarter(activeLessonExperience.parentNoteStarter)} type="button">
          <Users size={16} />
          Parent note
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <CircleHelp size={16} />
          Help
        </button>
      </footer>
    </section>
  );
}
