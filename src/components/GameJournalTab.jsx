import {
  ArrowRight,
  Bot,
  Brain,
  BookOpen,
  Map,
  MessagesSquare,
  NotebookPen,
  Target,
  Users,
} from "lucide-react";
import { buildJournalInsightCoach } from "../lib/progression";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "stories", label: "Story", icon: MessagesSquare },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

function JournalEntryPreview({ entries, emptyCopy }) {
  const entry = entries[0];

  if (!entry) {
    return (
      <article className="game-journal-log">
        <p>Latest note</p>
        <strong>Waiting for the first signal</strong>
        <span>{emptyCopy}</span>
      </article>
    );
  }

  return (
    <article className="game-journal-log">
      <p>{entry.dateLabel}</p>
      <strong>{entry.mood ?? entry.title}</strong>
      <span>{entry.body}</span>
    </article>
  );
}

export function JournalTab({
  childCompletedLessonIds,
  childJournalDraft,
  childJournalEntries,
  childJournalMood,
  moodOptions,
  onOpenLesson,
  onChildDraftChange,
  onChildMoodChange,
  onParentDraftChange,
  onSaveChildJournal,
  onSaveParentJournal,
  onSelectTab,
  parentJournalDraft,
  parentJournalEntries,
  selectedChild,
  visibleTracks,
}) {
  const journalInsight = buildJournalInsightCoach({
    child: selectedChild,
    childJournalEntries,
    visibleTracks,
    completedLessonIds: childCompletedLessonIds,
  });

  return (
    <section className="kidwiz-game-shell game-journal-room" aria-label="KidWiz journal room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Reflection room for {selectedChild.name}</p>
            <h1>Journal checkpoint</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Journal status">
          <span className="game-stat">
            <strong>{childJournalEntries.length}</strong>
            child notes
          </span>
          <span className="game-stat">
            <strong>{parentJournalEntries.length}</strong>
            parent notes
          </span>
          <span className="game-stat">
            <strong>{childJournalMood}</strong>
            mood
          </span>
        </div>
      </header>

      <div className="game-board game-journal-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "journal" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-journal-stage" aria-label="Journal stage">
          <section className="game-journal-hero">
            <img alt="" src="/assets/generated/kidwiz-story-journal.jpg" />
            <div>
              <p>{journalInsight.title}</p>
              <h2>{journalInsight.likelyNeed}</h2>
              <span>{journalInsight.moodTrend}</span>
            </div>
          </section>

          <section className="game-journal-grid" aria-label="Journal inputs">
            <article className="game-journal-card">
              <div className="game-journal-card-head">
                <NotebookPen size={18} />
                <div>
                  <p>{selectedChild.name}&apos;s note</p>
                  <strong>Capture the feeling</strong>
                </div>
              </div>

              <form className="game-journal-form" onSubmit={onSaveChildJournal}>
                <button className="game-save-chip" type="submit">
                  Save
                </button>
                <div className="game-mood-dock">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      className={childJournalMood === mood ? "is-selected" : ""}
                      onClick={() => onChildMoodChange(mood)}
                      type="button"
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                <textarea
                  value={childJournalDraft}
                  onChange={(event) => onChildDraftChange(event.target.value)}
                  placeholder="Today I felt proud when..."
                />
                <button className="solid-button game-save-button" type="submit">
                  Save reflection
                </button>
              </form>

              <JournalEntryPreview
                entries={childJournalEntries}
                emptyCopy="One sentence is enough to start a useful memory trail."
              />
            </article>

            <article className="game-journal-card">
              <div className="game-journal-card-head">
                <Users size={18} />
                <div>
                  <p>Parent note</p>
                  <strong>Keep the family pattern</strong>
                </div>
              </div>

              <form className="game-journal-form" onSubmit={onSaveParentJournal}>
                <button className="game-save-chip" type="submit">
                  Save
                </button>
                <textarea
                  value={parentJournalDraft}
                  onChange={(event) => onParentDraftChange(event.target.value)}
                  placeholder="What support seems to help right now?"
                />
                <button className="solid-button game-save-button" type="submit">
                  Save parent note
                </button>
              </form>

              <JournalEntryPreview
                entries={parentJournalEntries}
                emptyCopy="Parent notes become the memory system for the week."
              />
            </article>
          </section>
        </main>

        <aside className="game-console" aria-label="Journal insight console">
          <div className="game-console-tabs" role="tablist">
            <button className="is-active" type="button">Pattern</button>
            <button onClick={() => onSelectTab("courses")} type="button">Lesson</button>
            <button onClick={() => onSelectTab("family")} type="button">Parent</button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <Brain size={22} />
              <div>
                <p>Mood pattern</p>
                <h2>{journalInsight.title}</h2>
              </div>
            </div>
            <article className="game-signal-card">
              <p>Parent response idea</p>
              <strong>{journalInsight.parentResponse}</strong>
              <span>{journalInsight.latestSignal}</span>
            </article>
            <article className="game-signal-card">
              <p>Recommended practice</p>
              {journalInsight.recommendedPractice ? (
                <>
                  <strong>{journalInsight.recommendedPractice.lesson.title}</strong>
                  <span>{journalInsight.recommendedPractice.copy}</span>
                  <button
                    className="inline-action"
                    onClick={() =>
                      onOpenLesson(journalInsight.recommendedPractice.lesson.id)
                    }
                    type="button"
                  >
                    Open lesson
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <strong>Save one reflection first</strong>
                  <span>KidWiz will suggest a better next practice after the first note.</span>
                </>
              )}
            </article>
          </div>
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Journal actions">
        <button onClick={() => onSelectTab("overview")} type="button">
          <Map size={16} />
          Map
        </button>
        <button onClick={() => onSelectTab("courses")} type="button">
          <BookOpen size={16} />
          Learn
        </button>
        <button onClick={() => onSelectTab("coach")} type="button">
          <Bot size={16} />
          Tutor
        </button>
        <button onClick={() => onSelectTab("stories")} type="button">
          <MessagesSquare size={16} />
          Story
        </button>
        <button onClick={() => onSelectTab("family")} type="button">
          <Users size={16} />
          Parent
        </button>
      </footer>
    </section>
  );
}
