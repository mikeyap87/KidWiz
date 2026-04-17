import {
  Award,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  MessagesSquare,
  NotebookPen,
  Sparkles,
  Target,
} from "lucide-react";

export function DashboardTab({
  childSummaries,
  familyMetrics,
  onAdjustWeeklyTarget,
  onChangeFocusTrack,
  onOpenLesson,
  onSelectChild,
  selectedChildId,
  visibleTracks,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Parent dashboard</p>
        <h1>One place to see what is working, what needs help, and what comes next.</h1>
        <p>
          This view turns KidWiz into something much closer to a real SaaS
          workspace by combining weekly targets, progress, recommendations, and
          child-by-child summaries.
        </p>
      </div>

      <div className="dashboard-summary-grid">
        <article className="summary-card">
          <div className="summary-card-icon">
            <BookOpen size={18} />
          </div>
          <strong>{familyMetrics.lessonsDone}</strong>
          <span>Lessons completed across the family</span>
        </article>
        <article className="summary-card">
          <div className="summary-card-icon">
            <MessagesSquare size={18} />
          </div>
          <strong>{familyMetrics.storiesDone}</strong>
          <span>Story branches completed</span>
        </article>
        <article className="summary-card">
          <div className="summary-card-icon">
            <NotebookPen size={18} />
          </div>
          <strong>{familyMetrics.reflectionsSaved}</strong>
          <span>Child reflections saved</span>
        </article>
        <article className="summary-card">
          <div className="summary-card-icon">
            <Award size={18} />
          </div>
          <strong>{familyMetrics.badgesEarned}</strong>
          <span>Badges earned across both children</span>
        </article>
      </div>

      <div className="dashboard-child-grid">
        {childSummaries.map((summary) => (
          <article
            key={summary.child.id}
            className={`dashboard-child-card ${
              selectedChildId === summary.child.id ? "is-selected" : ""
            }`}
          >
            <div className="dashboard-child-head">
              <div>
                <p>{summary.child.levelTitle}</p>
                <h2>{summary.child.name}</h2>
                <span>{summary.child.todayTheme}</span>
              </div>
              <button
                className="inline-action"
                onClick={() => onSelectChild(summary.child.id)}
                type="button"
              >
                {selectedChildId === summary.child.id ? "Viewing" : "View child"}
              </button>
            </div>

            <div className="dashboard-metric-row">
              <div>
                <strong>{summary.completedLessons}</strong>
                <span>lessons</span>
              </div>
              <div>
                <strong>{summary.completedStories}</strong>
                <span>stories</span>
              </div>
              <div>
                <strong>{summary.journalCount}</strong>
                <span>reflections</span>
              </div>
              <div>
                <strong>{summary.badgesEarned}</strong>
                <span>badges</span>
              </div>
            </div>

            <div className="dashboard-insight-grid">
              <div className="dashboard-insight">
                <p>Strongest track</p>
                <strong>{summary.strongestTrack.title}</strong>
                <span>{summary.strongestTrack.progress}% progress</span>
              </div>
              <div className="dashboard-insight">
                <p>Needs support</p>
                <strong>{summary.supportTrack.title}</strong>
                <span>{summary.supportTrack.progress}% progress</span>
              </div>
            </div>

            <div className="dashboard-recommendation">
              <div className="panel-head">
                <LayoutDashboard size={18} />
                <h2>Recommended next lesson</h2>
              </div>
              {summary.recommendedLesson ? (
                <button
                  className="list-row"
                  onClick={() =>
                    onOpenLesson(
                      summary.child.id,
                      summary.recommendedLesson.lesson.id,
                    )
                  }
                  type="button"
                >
                  <div>
                    <strong>{summary.recommendedLesson.lesson.title}</strong>
                    <span>
                      {summary.recommendedLesson.track.title} ·{" "}
                      {summary.recommendedLesson.reason}
                    </span>
                  </div>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <p className="panel-copy">
                  Every currently visible lesson is complete for this child.
                </p>
              )}
            </div>

            <div className="dashboard-targets">
              <div className="panel-head">
                <Target size={18} />
                <h2>Weekly targets</h2>
              </div>

              <div className="target-control-list">
                {[
                  { key: "lessons", label: "Lessons", current: summary.weeklyTarget.lessons },
                  { key: "stories", label: "Stories", current: summary.weeklyTarget.stories },
                  {
                    key: "reflections",
                    label: "Reflections",
                    current: summary.weeklyTarget.reflections,
                  },
                ].map((target) => (
                  <div key={target.key} className="target-edit-row">
                    <span>{target.label}</span>
                    <div className="target-counter">
                      <button
                        className="counter-button"
                        onClick={() =>
                          onAdjustWeeklyTarget(summary.child.id, target.key, -1)
                        }
                        type="button"
                      >
                        -
                      </button>
                      <strong>{target.current}</strong>
                      <button
                        className="counter-button"
                        onClick={() =>
                          onAdjustWeeklyTarget(summary.child.id, target.key, 1)
                        }
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <label className="target-select-label">
                <span>Focus track</span>
                <select
                  className="target-select"
                  value={summary.weeklyTarget.focusTrackId}
                  onChange={(event) =>
                    onChangeFocusTrack(summary.child.id, event.target.value)
                  }
                >
                  {visibleTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="dashboard-progress-grid">
              {[
                {
                  label: "Lesson target",
                  value: summary.lessonTargetProgress,
                },
                {
                  label: "Story target",
                  value: summary.storyTargetProgress,
                },
                {
                  label: "Reflection target",
                  value: summary.reflectionTargetProgress,
                },
              ].map((item) => (
                <div key={item.label} className="dashboard-progress-row">
                  <div className="progress-row-head">
                    <strong>{item.label}</strong>
                    <span>{item.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-child-footer">
              <Sparkles size={16} />
              <span>{summary.supportMessage}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
