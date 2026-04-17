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
            {childJournalEntries.map((entry) => (
              <article key={entry.id} className="entry-row">
                <p>
                  {entry.title} · {entry.dateLabel}
                </p>
                <h3>{entry.mood}</h3>
                <span>{entry.body}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Parent notes</h2>
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
            {parentJournalEntries.map((entry) => (
              <article key={entry.id} className="entry-row">
                <p>
                  {entry.title} · {entry.dateLabel}
                </p>
                <span>{entry.body}</span>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
