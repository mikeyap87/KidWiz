import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
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

function buildParentOutcomeDashboard({
  childSummaries,
  familyMetrics,
  reviewQueue,
  selectedGoals,
  selectedRhythm,
  weeklyReport,
}) {
  const familyPracticeSignals =
    familyMetrics.storiesDone + familyMetrics.reflectionsSaved;
  const childrenOnTrack = childSummaries.filter(
    (summary) => summary.overallTargetProgress >= 50,
  ).length;
  const openPlanningItems = reviewQueue.filter(
    (item) => item.actionType === "nudge",
  ).length;
  const priorityRiskChildren = childSummaries
    .filter((summary) => summary.overallTargetProgress < 50)
    .slice()
    .sort((left, right) => left.overallTargetProgress - right.overallTargetProgress)
    .map((summary) => ({
      childId: summary.child.id,
      name: summary.child.name,
      progress: summary.overallTargetProgress,
      reason:
        summary.overallTargetProgress < 35
          ? `Priority signal: ${summary.supportTrack.title} needs a clearer weekly prompt before momentum can hold.`
          : `${summary.supportTrack.title} has the clearest support gap right now.`,
      suggestedLesson: summary.recommendedLesson
        ? summary.recommendedLesson.lesson.title
        : null,
    }));
  const goalLabel =
    selectedGoals.length > 0
      ? selectedGoals.map((goal) => goal.title).join(", ")
      : "family growth";

  return {
    headline:
      weeklyReport.readinessScore >= 70
        ? "The family learning loop is turning activity into visible growth."
        : "The family has enough signal to choose a smaller, better next step.",
    summary: `KidWiz is tracking outcomes across ${goalLabel.toLowerCase()} instead of only counting screen time.`,
    outcomeCards: [
      {
        label: "Learning readiness",
        value: `${weeklyReport.readinessScore}%`,
        copy: weeklyReport.readinessCopy,
      },
      {
        label: "Children needing support",
        value: `${priorityRiskChildren.length}/${childSummaries.length}`,
        copy: "These children are under the weekly target and should be prioritized for this week.",
      },
      {
        label: "Life-skill practice",
        value: `${familyPracticeSignals}`,
        copy: "Story choices and reflections give parents proof of confidence, relationship, and money-sense practice.",
      },
      {
        label: "Children on track",
        value: `${childrenOnTrack}/${childSummaries.length}`,
        copy: "Weekly targets show which children are building momentum and which need a smaller path.",
      },
      {
        label: "Parent clarity",
        value: `${reviewQueue.length}`,
        copy:
          openPlanningItems > 0
            ? `${openPlanningItems} planning item(s) can adjust the week without guesswork.`
            : `The ${selectedRhythm.title.toLowerCase()} rhythm has clear next actions.`,
      },
    ],
    riskChildren: priorityRiskChildren,
    childOutcomes: childSummaries.map((summary) => ({
      id: summary.child.id,
      name: summary.child.name,
      title: `${summary.strongestTrack.title} is becoming visible`,
      proof: `${summary.weeklyLessonCount}/${summary.weeklyTarget.lessons} lessons, ${summary.weeklyStoryCount}/${summary.weeklyTarget.stories} stories, ${summary.weeklyReflectionCount}/${summary.weeklyTarget.reflections} reflections this week`,
      progress: summary.overallTargetProgress,
      risk:
        summary.overallTargetProgress < 50
          ? `Watch ${summary.supportTrack.title.toLowerCase()} next.`
          : `Keep reinforcing ${summary.strongestTrack.title.toLowerCase()}.`,
      riskTone:
        summary.overallTargetProgress < 35
          ? "high"
          : summary.overallTargetProgress < 65
            ? "medium"
            : "low",
      nextProof: summary.recommendedLesson
        ? `Next proof point: ${summary.recommendedLesson.lesson.title}.`
        : "Next proof point: celebrate completion and choose a new stretch track.",
      ctaLabel: summary.recommendedLesson ? "Open lesson" : "Open child",
      ctaType: summary.recommendedLesson ? "lesson" : "child",
      ctaLessonId: summary.recommendedLesson?.lesson?.id ?? null,
      sessionCtaLabel: "Start session",
    })),
  };
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
  const outcomeDashboard = useMemo(
    () =>
      buildParentOutcomeDashboard({
        childSummaries,
        familyMetrics,
        reviewQueue,
        selectedGoals,
        selectedRhythm,
        weeklyReport,
      }),
    [
      childSummaries,
      familyMetrics,
      reviewQueue,
      selectedGoals,
      selectedRhythm,
      weeklyReport,
    ],
  );
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const filteredChildOutcomes = useMemo(() => {
    const list = [...outcomeDashboard.childOutcomes];

    if (outcomeFilter === "risk") {
      return list
        .filter((outcome) => outcome.progress < 50)
        .sort((left, right) => left.progress - right.progress);
    }

    if (outcomeFilter === "top") {
      return list
        .slice()
        .sort((left, right) => right.progress - left.progress)
        .slice(0, Math.min(2, list.length));
    }

    return list;
  }, [outcomeDashboard.childOutcomes, outcomeFilter]);
  const outcomeFilterLabel = {
    all: "all children",
    risk: "children needing support",
    top: "top momentum children",
  };

  const filteredOutcomeSummary =
    outcomeFilter === "all"
      ? `${outcomeDashboard.childOutcomes.length} ${outcomeFilterLabel[outcomeFilter]}`
      : `${filteredChildOutcomes.length} ${outcomeFilterLabel[outcomeFilter]} now`;

  function handleOutcomeFilterReset() {
    setOutcomeFilter("all");
  }

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

  function handleOutcomeChildAction(outcome) {
    if (outcome.ctaType === "lesson" && outcome.ctaLessonId) {
      onOpenLesson(outcome.id, outcome.ctaLessonId);
      return;
    }

    onSelectChild(outcome.id);
  }

  function handleOutcomeSessionStart(outcome) {
    if (outcome.ctaType === "lesson" && outcome.ctaLessonId) {
      onOpenLesson(outcome.id, outcome.ctaLessonId);
      return;
    }

    onSelectChild(outcome.id);
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

      <section className="surface-panel parent-outcome-panel">
        <div className="parent-outcome-head">
          <div>
            <div className="panel-head">
              <Award size={18} />
              <h2>Parent outcome dashboard</h2>
            </div>
            <div className="parent-outcome-copy">
              <p>What this week is actually building</p>
              <h2>{outcomeDashboard.headline}</h2>
              <span>{outcomeDashboard.summary}</span>
            </div>
          </div>

          <article className="parent-outcome-rhythm">
            <p>Home rhythm</p>
            <strong>{selectedRhythm.title}</strong>
            <span>{selectedRhythm.copy}</span>
          </article>
        </div>

        {outcomeDashboard.riskChildren.length > 0 ? (
          <div className="parent-outcome-risks">
            <p>Priority support this week</p>
            <div className="parent-outcome-risk-list">
              {outcomeDashboard.riskChildren.map((riskItem) => (
                <article
                  key={riskItem.childId}
                  className="parent-outcome-risk-card"
                >
                  <p>{riskItem.name}</p>
                  <strong>{riskItem.progress}% on weekly targets</strong>
                  <span>{riskItem.reason}</span>
                  <div className="parent-outcome-risk-actions">
                    <button
                      className="inline-action"
                      onClick={() => onSelectChild(riskItem.childId)}
                      type="button"
                    >
                      View child
                      <ChevronRight size={14} />
                    </button>
                    <button
                      className="inline-action"
                      onClick={() =>
                        handleOutcomeSessionStart({
                          id: riskItem.childId,
                          ctaType: "child",
                          ctaLessonId: null,
                        })
                      }
                      type="button"
                    >
                      Start session
                    </button>
                  </div>
                  {riskItem.suggestedLesson ? (
                    <em>Suggested next lesson: {riskItem.suggestedLesson}</em>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="parent-outcome-grid">
          {outcomeDashboard.outcomeCards.map((card) => (
            <article key={card.label} className="parent-outcome-card">
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <span>{card.copy}</span>
            </article>
          ))}
        </div>

        <div className="parent-outcome-filter-row">
          <p>Show outcomes</p>
          <div className="parent-outcome-filter-list">
            <button
              className={`summary-chip-button ${
                outcomeFilter === "all" ? "is-selected" : ""
              }`}
              onClick={() => setOutcomeFilter("all")}
              type="button"
            >
              All children
            </button>
            <button
              className={`summary-chip-button ${
                outcomeFilter === "risk" ? "is-selected" : ""
              }`}
              onClick={() => setOutcomeFilter("risk")}
              type="button"
            >
              Needs support
            </button>
            <button
              className={`summary-chip-button ${
                outcomeFilter === "top" ? "is-selected" : ""
              }`}
              onClick={() => setOutcomeFilter("top")}
              type="button"
            >
              Top momentum
            </button>
          </div>
        </div>

        <div className="child-outcome-grid">
          {filteredChildOutcomes.length > 0 ? (
            filteredChildOutcomes.map((outcome) => (
              <article key={outcome.id} className="child-outcome-card">
                <div className="child-outcome-main">
                  <p>{outcome.name}</p>
                  <strong>{outcome.title}</strong>
                  <span>{outcome.proof}</span>
                </div>
                <div className="child-outcome-next">
                  <span className={`child-outcome-risk is-${outcome.riskTone}`}>
                    {outcome.risk}
                  </span>
                  <em>{outcome.nextProof}</em>
                </div>
                <div className="child-outcome-actions">
                  <button
                    className="inline-action child-outcome-cta"
                    onClick={() => handleOutcomeChildAction(outcome)}
                    type="button"
                  >
                    {outcome.ctaLabel}
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="inline-action child-outcome-cta child-outcome-cta-secondary"
                    onClick={() => handleOutcomeSessionStart(outcome)}
                    type="button"
                  >
                    {outcome.sessionCtaLabel}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="parent-outcome-empty child-outcome-card">
              <p>No children match this view</p>
              <strong>{filteredOutcomeSummary}</strong>
              <span>
                Adjust the filter above, or switch back to all children and start the
                next step for a child that is ready.
              </span>
              <button
                className="inline-action child-outcome-cta"
                onClick={handleOutcomeFilterReset}
                type="button"
              >
                Show all children
                <ArrowRight size={14} />
              </button>
            </article>
          )}
        </div>
      </section>

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
