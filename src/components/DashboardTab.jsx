import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Brain,
  BookOpen,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  MessagesSquare,
  Minus,
  NotebookPen,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  buildChildSummaries,
  buildParentDailyBrief,
  buildParentProgressNarrative,
  buildParentReviewQueue,
  buildParentWeeklyReport,
} from "../lib/progression";

function TrendDelta({ deltaLabel, deltaTone }) {
  const Icon =
    deltaTone === "up"
      ? ArrowUpRight
      : deltaTone === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <span className={`dashboard-delta-pill is-${deltaTone}`}>
      <Icon size={14} />
      {deltaLabel} vs last week
    </span>
  );
}

export function DashboardTab({
  appState,
  nextRitual,
  onAdjustWeeklyTarget,
  onApplyPlanningNudge,
  onChangeFocusTrack,
  onDismissPlanningNudge,
  onOpenFamily,
  onOpenJournal,
  onOpenLesson,
  onOpenStory,
  onSelectChild,
  selectedCelebrationStyle,
  selectedCoachStyle,
  selectedGoals,
  selectedChildId,
  selectedRhythm,
  visibleTracks,
}) {
  const childSummaries = useMemo(
    () =>
      buildChildSummaries({
        bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
        selectedGoalIds: appState.selectedGoalIds,
        visibleTracks,
        weeklyHistoryByChild: appState.weeklyHistoryByChild,
        assignedTrackIdsByChild: appState.assignedTrackIdsByChild,
        completedJourneyIdsByChild: appState.completedJourneyIdsByChild,
        completedLessonIdsByChild: appState.completedLessonIdsByChild,
        childJournalEntriesByChild: appState.childJournalEntriesByChild,
        playlistLessonIdsByChild: appState.playlistLessonIdsByChild,
        storyChoicesByChild: appState.storyChoicesByChild,
        weeklyTargetsByChild: appState.weeklyTargetsByChild,
        planningNudgeStateByChild: appState.planningNudgeStateByChild,
      }),
    [appState, visibleTracks],
  );
  const familyMetrics = useMemo(
    () => ({
      lessonsDone: childSummaries.reduce(
        (total, summary) => total + summary.completedLessons,
        0,
      ),
      storiesDone: childSummaries.reduce(
        (total, summary) => total + summary.completedStories,
        0,
      ),
      reflectionsSaved: childSummaries.reduce(
        (total, summary) => total + summary.journalCount,
        0,
      ),
      badgesEarned: childSummaries.reduce(
        (total, summary) => total + summary.badgesEarned,
        0,
      ),
    }),
    [childSummaries],
  );
  const weeklyReport = useMemo(
    () =>
      buildParentWeeklyReport({
        childSummaries,
        familyMetrics,
        nextRitual,
        selectedCelebrationStyle,
        selectedCoachStyle,
        selectedGoals,
        selectedRhythm,
        weeklyHistoryByChild: appState.weeklyHistoryByChild,
      }),
    [
      appState.weeklyHistoryByChild,
      childSummaries,
      familyMetrics,
      nextRitual,
      selectedCelebrationStyle,
      selectedCoachStyle,
      selectedGoals,
      selectedRhythm,
    ],
  );
  const reviewQueue = useMemo(
    () =>
      buildParentReviewQueue({
        childSummaries,
        appState,
        nextRitual,
      }),
    [appState, childSummaries, nextRitual],
  );
  const dailyBrief = useMemo(
    () =>
      buildParentDailyBrief({
        childSummaries,
        nextRitual,
        reviewQueue,
        selectedRhythm,
        weeklyReport,
      }),
    [childSummaries, nextRitual, reviewQueue, selectedRhythm, weeklyReport],
  );
  const progressNarrative = useMemo(
    () =>
      buildParentProgressNarrative({
        childSummaries,
        familyMetrics,
        selectedGoals,
        selectedRhythm,
        weeklyReport,
      }),
    [childSummaries, familyMetrics, selectedGoals, selectedRhythm, weeklyReport],
  );

  function handleReportAction(item) {
    if (item.actionType === "lesson" && item.lessonId) {
      onOpenLesson(item.childId, item.lessonId);
      return;
    }

    if (item.actionType === "story" && item.storyId) {
      onOpenStory(item.storyId, item.childId);
      return;
    }

    if (item.actionType === "family") {
      onOpenFamily();
      return;
    }

    if (item.actionType === "journal") {
      onOpenJournal(item.childId);
      return;
    }

    if (item.childId) {
      onSelectChild(item.childId);
    }
  }

  function handlePlanningNudge(summary, action) {
    if (action.type === "focus" && action.trackId) {
      onChangeFocusTrack(summary.child.id, action.trackId);
      return;
    }

    if (action.type === "target" && action.key && action.delta) {
      onAdjustWeeklyTarget(summary.child.id, action.key, action.delta);
    }
  }

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

      <section className="surface-panel daily-brief-panel">
        <div className="daily-brief-main">
          <div>
            <div className="panel-head">
              <Sparkles size={18} />
              <h2>{dailyBrief.eyebrow}</h2>
            </div>
            <div className="daily-brief-copy">
              <p>{weeklyReport.readinessLabel}</p>
              <h2>{dailyBrief.title}</h2>
              <span>{dailyBrief.summary}</span>
              <strong>{dailyBrief.whyItMatters}</strong>
            </div>
          </div>

          <article className="daily-brief-action-card">
            <p>Do this first</p>
            {dailyBrief.firstMove ? (
              <>
                <strong>{dailyBrief.firstMove.title}</strong>
                <span>{dailyBrief.firstMove.copy}</span>
                {dailyBrief.firstMove.actionType === "nudge" ? (
                  <div className="review-queue-actions">
                    <button
                      className="inline-action"
                      onClick={() =>
                        onApplyPlanningNudge(
                          dailyBrief.firstMove.childId,
                          dailyBrief.firstMove.nudge,
                        )
                      }
                      type="button"
                    >
                      Apply all
                    </button>
                    <button
                      className="inline-action"
                      onClick={() =>
                        onDismissPlanningNudge(
                          dailyBrief.firstMove.childId,
                          dailyBrief.firstMove.nudge.id,
                        )
                      }
                      type="button"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <button
                    className="inline-action"
                    onClick={() => handleReportAction(dailyBrief.firstMove)}
                    type="button"
                  >
                    {dailyBrief.firstMove.ctaLabel}
                    <ChevronRight size={14} />
                  </button>
                )}
              </>
            ) : (
              <>
                <strong>Open the Family Hub</strong>
                <span>Use tonight's ritual to turn the week into one small shared moment.</span>
                <button
                  className="inline-action"
                  onClick={onOpenFamily}
                  type="button"
                >
                  Open family hub
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </article>
        </div>

        <div className="daily-brief-grid">
          <div className="daily-brief-spotlight">
            {dailyBrief.spotlightRows.map((row) => (
              <article key={row.label} className="daily-brief-row">
                <p>{row.label}</p>
                <strong>{row.value}</strong>
              </article>
            ))}
          </div>

          <article className="daily-brief-script">
            <p>Tonight's parent script</p>
            {dailyBrief.script.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </article>
        </div>
      </section>

      <section className="surface-panel progress-narrative-panel">
        <div className="progress-narrative-main">
          <div>
            <div className="panel-head">
              <NotebookPen size={18} />
              <h2>{progressNarrative.eyebrow}</h2>
            </div>
            <div className="progress-narrative-copy">
              <p>{weeklyReport.readinessLabel}</p>
              <h2>{progressNarrative.title}</h2>
              {progressNarrative.paragraphs.map((paragraph) => (
                <span key={paragraph}>{paragraph}</span>
              ))}
            </div>
          </div>

          <div className="progress-narrative-share">
            {progressNarrative.shareLines.map((line) => (
              <article key={line.label} className="progress-narrative-line">
                <p>{line.label}</p>
                <strong>{line.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-panel review-queue-panel">
        <div className="panel-head">
          <ClipboardList size={18} />
          <h2>Parent review queue</h2>
        </div>
        <p className="panel-copy">
          The highest-signal items from reflections, stories, family rituals, and
          planning nudges are gathered here so the parent knows what to handle next.
        </p>

        <div className="review-queue-grid">
          {reviewQueue.map((item) => (
            <article key={item.id} className="review-queue-card">
              <div>
                <p>{item.eyebrow}</p>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>

              {item.actionType === "nudge" ? (
                <div className="review-queue-actions">
                  <button
                    className="inline-action"
                    onClick={() => onApplyPlanningNudge(item.childId, item.nudge)}
                    type="button"
                  >
                    Apply all
                  </button>
                  <button
                    className="inline-action"
                    onClick={() =>
                      onDismissPlanningNudge(item.childId, item.nudge.id)
                    }
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <button
                  className="inline-action"
                  onClick={() => handleReportAction(item)}
                  type="button"
                >
                  {item.ctaLabel}
                  <ChevronRight size={14} />
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-report-grid">
        <article className="surface-panel dashboard-report-hero">
          <div className="panel-head">
            <Brain size={18} />
            <h2>Weekly report</h2>
          </div>

          <div className="dashboard-report-copy">
            <p>{weeklyReport.readinessLabel}</p>
            <h2>{weeklyReport.title}</h2>
            <span>{weeklyReport.summary}</span>
            <strong>{weeklyReport.focusCopy}</strong>
          </div>

          <div className="dashboard-report-stat-grid">
            {weeklyReport.stats.map((stat) => (
              <article key={stat.label} className="dashboard-report-stat">
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span>{stat.detail}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Sparkles size={18} />
            <h2>What changed this week</h2>
          </div>

          <div className="dashboard-report-list">
            {weeklyReport.highlights.map((highlight) => (
              <article key={highlight.title} className="dashboard-detail-row">
                <strong>{highlight.title}</strong>
                <span>{highlight.copy}</span>
              </article>
            ))}
          </div>
        </article>
      </div>

      <div className="dashboard-report-grid dashboard-report-grid-secondary">
        <section className="surface-panel">
          <div className="panel-head">
            <LayoutDashboard size={18} />
            <h2>Trend watch</h2>
          </div>

          <div className="dashboard-trend-overview">
            <div className="dashboard-trend-overview-copy">
              <p>Family readiness</p>
              <strong>{weeklyReport.readinessScore}%</strong>
              <span>{weeklyReport.readinessCopy}</span>
              <TrendDelta
                deltaLabel={weeklyReport.familyDeltaLabel}
                deltaTone={weeklyReport.familyDeltaTone}
              />
            </div>

            <div className="dashboard-trend-bar-grid">
              {weeklyReport.familyTrendSeries.map((point) => (
                <div key={point.weekLabel} className="dashboard-trend-bar-group">
                  <div className="dashboard-trend-bar-head">
                    <span>{point.weekLabel}</span>
                    <strong>{point.readinessScore}%</strong>
                  </div>
                  <div className="dashboard-trend-bar">
                    <div
                      className="dashboard-trend-bar-fill"
                      style={{ width: `${point.readinessScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Child trend watch</h2>
          </div>

          <div className="dashboard-report-list">
            {weeklyReport.childTrendRows.map((row) => (
              <article key={row.childId} className="dashboard-detail-row">
                <div className="dashboard-child-trend-head">
                  <div>
                    <p>{row.childName}</p>
                    <strong>{row.currentReadiness}% weekly readiness</strong>
                  </div>
                  <TrendDelta deltaLabel={row.deltaLabel} deltaTone={row.deltaTone} />
                </div>

                <div className="dashboard-mini-trend-row">
                  {row.trendSeries.map((point) => (
                    <div key={`${row.childId}-${point.weekLabel}`} className="dashboard-mini-trend-item">
                      <div className="dashboard-mini-trend-label">
                        <span>{point.weekLabel}</span>
                        <strong>{point.readinessScore}%</strong>
                      </div>
                      <div className="dashboard-mini-trend-bar">
                        <div
                          className="dashboard-mini-trend-fill"
                          style={{ width: `${point.readinessScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <span>{row.note}</span>
                <em>
                  Biggest movement: {row.strongestMetricLabel} ({row.strongestMetricDelta > 0 ? "+" : ""}
                  {row.strongestMetricDelta} pts).
                </em>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-report-grid dashboard-report-grid-secondary">
        <section className="surface-panel">
          <div className="panel-head">
            <Target size={18} />
            <h2>Parent action plan</h2>
          </div>

          <div className="dashboard-report-list">
            {weeklyReport.actionPlan.map((item) => (
              <article key={item.id} className="dashboard-detail-row dashboard-detail-row-action">
                <div>
                  <p>{item.eyebrow}</p>
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </div>
                <button
                  className="inline-action"
                  onClick={() => handleReportAction(item)}
                  type="button"
                >
                  {item.ctaLabel}
                  <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Family conversation starters</h2>
          </div>

          <div className="dashboard-report-list">
            {weeklyReport.conversationPrompts.map((item) => (
              <article key={item.id} className="dashboard-detail-row dashboard-detail-row-action">
                <div>
                  <p>{item.eyebrow}</p>
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </div>
                <button
                  className="inline-action"
                  onClick={() => handleReportAction(item)}
                  type="button"
                >
                  {item.ctaLabel}
                  <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>
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

            {summary.planningNudge ? (
              <div className="dashboard-planning-card">
                <p>Planning nudge</p>
                <strong>{summary.planningNudge.title}</strong>
                <span>{summary.planningNudge.copy}</span>
                <div className="dashboard-planning-actions">
                  <button
                    className="inline-action"
                    onClick={() =>
                      onApplyPlanningNudge(summary.child.id, summary.planningNudge)
                    }
                    type="button"
                  >
                    Apply all
                  </button>
                  {summary.planningNudge.actions.map((action) => (
                    <button
                      key={action.label}
                      className="inline-action"
                      onClick={() => handlePlanningNudge(summary, action)}
                      type="button"
                    >
                      {action.label}
                    </button>
                  ))}
                  <button
                    className="inline-action"
                    onClick={() =>
                      onDismissPlanningNudge(
                        summary.child.id,
                        summary.planningNudge.id,
                      )
                    }
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

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
