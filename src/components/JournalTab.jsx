import { NotebookPen, Users } from "lucide-react";

export function JournalTab({
  childJournalDraft,
  childJournalEntries,
  childJournalMood,
  moodOptions,
  onChildDraftChange,
  onChildMoodChange,
  onParentDraftChange,
  onSaveChildJournal,
  onSaveParentJournal,
  parentJournalDraft,
  parentJournalEntries,
  selectedChild,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Private reflection</p>
        <h1>Two journals, one clearer picture of what helps.</h1>
        <p>
          Children can reflect with a mood cue. Parents can keep notes about what
          is working, what needs support, and what family rituals to try next.
        </p>
      </div>

      <div className="journal-layout">
        <article className="surface-panel">
          <div className="panel-head">
            <NotebookPen size={18} />
            <h2>{selectedChild.name}&apos;s journal</h2>
          </div>

          <div className="journal-guidance">
            <p>Starter idea</p>
            <strong>Notice one tiny brave move, one wobble, or one question.</strong>
            <span>Short, honest reflections are enough. The goal is memory, not perfection.</span>
          </div>

          <form className="journal-form" onSubmit={onSaveChildJournal}>
            <div className="mood-row">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  className={`mood-pill ${
                    childJournalMood === mood ? "is-selected" : ""
                  }`}
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
            <button className="solid-button" type="submit">
              Save reflection
            </button>
          </form>

          <div className="entry-list">
            {childJournalEntries.length ? (
              childJournalEntries.map((entry) => (
                <article key={entry.id} className="entry-row">
                  <p>
                    {entry.title} · {entry.dateLabel}
                  </p>
                  <h3>{entry.mood}</h3>
                  <span>{entry.body}</span>
                </article>
              ))
            ) : (
              <article className="entry-row entry-row-empty">
                <p>First reflection waiting</p>
                <strong>{selectedChild.name} has not saved a journal note yet.</strong>
                <span>Use the prompt above and keep it simple. One sentence is enough to start a real streak.</span>
              </article>
            )}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Parent notes</h2>
          </div>

          <div className="journal-guidance">
            <p>Parent prompt</p>
            <strong>Write down what helped, what felt sticky, and what to try next.</strong>
            <span>These notes become the memory system for the family, especially when the week gets busy.</span>
          </div>

          <form className="journal-form" onSubmit={onSaveParentJournal}>
            <textarea
              value={parentJournalDraft}
              onChange={(event) => onParentDraftChange(event.target.value)}
              placeholder="What support seems to help the most right now?"
            />
            <button className="solid-button" type="submit">
              Save parent note
            </button>
          </form>

          <div className="entry-list">
            {parentJournalEntries.length ? (
              parentJournalEntries.map((entry) => (
                <article key={entry.id} className="entry-row">
                  <p>
                    {entry.title} · {entry.dateLabel}
                  </p>
                  <span>{entry.body}</span>
                </article>
              ))
            ) : (
              <article className="entry-row entry-row-empty">
                <p>Parent note waiting</p>
                <strong>No parent notes saved yet.</strong>
                <span>Capture one pattern you want to remember before the next lesson, story, or family ritual.</span>
              </article>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
