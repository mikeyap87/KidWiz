import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Brain,
  ChevronRight,
  ClipboardList,
  CircleHelp,
  Compass,
  Home,
  Map,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  buildChildSummaries,
  buildParentReviewQueue,
  buildParentWeeklyReport,
} from "../lib/progression";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

const nodePositions = [
  { left: "18%", top: "58%" },
  { left: "43%", top: "35%" },
  { left: "68%", top: "54%" },
  { left: "78%", top: "24%" },
];

function GameStat({ label, value }) {
  return (
    <span className="game-stat">
      <strong>{value}</strong>
      {label}
    </span>
  );
}

function GameDrawer({ children, onClose, title }) {
  return (
    <div className="game-drawer-backdrop" role="presentation">
      <aside
        aria-label={title}
        aria-modal="true"
        className="game-drawer"
        role="dialog"
      >
        <div className="game-drawer-head">
          <div>
            <p className="eyebrow eyebrow-dark">KidWiz detail</p>
            <h2>{title}</h2>
          </div>
          <button className="inline-action" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function DashboardTab({
  aiServerStatus,
  appState,
  nextRitual,
  onApplyPlanningNudge,
  onDismissPlanningNudge,
  onOpenFamily,
  onOpenJournal,
  onOpenLesson,
  onOpenStory,
  onSelectChild,
  onSelectTab,
  selectedCelebrationStyle,
  selectedCoachStyle,
  selectedGoals,
  selectedChildId,
  selectedRhythm,
  visibleTracks,
}) {
  const [activeConsole, setActiveConsole] = useState("mission");
  const [openDrawer, setOpenDrawer] = useState(null);
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
  const selectedChildSummary =
    childSummaries.find((summary) => summary.child.id === selectedChildId) ??
    childSummaries[0];
  const missionLesson = selectedChildSummary?.recommendedLesson;
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
  const goalLabel =
    selectedGoals.length > 0
      ? selectedGoals.map((goal) => goal.title).join(", ")
      : "family growth";
  const aiLabel =
    aiServerStatus?.state === "online" && aiServerStatus.configured
      ? "Live AI ready"
      : aiServerStatus?.state === "online"
        ? "AI fallback"
        : "Local AI check";
  const consoleTabs = [
    { id: "mission", label: "Mission" },
    { id: "signals", label: "Signals" },
    { id: "parent", label: "Parent" },
  ];
  const topSignals = reviewQueue.slice(0, 2);

  function handleMissionStart() {
    if (missionLesson?.lesson?.id && selectedChildSummary?.child?.id) {
      onOpenLesson(selectedChildSummary.child.id, missionLesson.lesson.id);
      return;
    }

    onSelectTab("courses");
  }

  function handleSignalAction(item) {
    if (item.actionType === "lesson" && item.lessonId) {
      onOpenLesson(item.childId, item.lessonId);
      return;
    }

    if (item.actionType === "story" && item.storyId) {
      onOpenStory(item.storyId, item.childId);
      return;
    }

    if (item.actionType === "journal") {
      onOpenJournal(item.childId);
      return;
    }

    if (item.actionType === "family") {
      onOpenFamily();
      return;
    }

    if (item.childId) {
      onSelectChild(item.childId);
    }
  }

  return (
    <section className="kidwiz-game-shell" aria-label="KidWiz learning console">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Family mission deck</p>
            <h1>{appState.familyName}</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Today status">
          <GameStat
            label="week plan"
            value={`${selectedChildSummary?.overallTargetProgress ?? 0}%`}
          />
          <GameStat label="safety" value={appState.bodyBoundariesUnlocked ? "Open" : "Locked"} />
          <GameStat label="AI" value={aiLabel} />
        </div>
      </header>

      <div className="game-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "dashboard" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-stage" aria-label="Today mission map">
          <div className="game-stage-map">
            <div className="game-companion-card">
              <img alt="" src="/brand/kidwiz-bot.png" />
              <div>
                <span>Wiz Spark</span>
                <strong>Pick one mission. I will keep it safe and simple.</strong>
              </div>
            </div>

            {childSummaries.map((summary, index) => {
              const position = nodePositions[index % nodePositions.length];
              const isSelected = summary.child.id === selectedChildSummary?.child.id;

              return (
                <button
                  key={summary.child.id}
                  className={`game-map-node ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectChild(summary.child.id)}
                  style={position}
                  type="button"
                >
                  <span>{summary.child.name}</span>
                  <strong>{summary.overallTargetProgress}%</strong>
                </button>
              );
            })}
          </div>

          <article className="game-mission-card">
            <p>Today&apos;s mission for {selectedChildSummary?.child.name}</p>
            <h2>
              {missionLesson?.lesson?.title ??
                selectedChildSummary?.supportTrack?.title ??
                "Choose the next lesson"}
            </h2>
            <span>
              {missionLesson?.reason ??
                selectedChildSummary?.supportMessage ??
                "Choose one focused learning move for today."}
            </span>
            <div className="game-mission-actions">
              <button className="solid-button" onClick={handleMissionStart} type="button">
                Start mission
                <ArrowRight size={16} />
              </button>
              <button
                className="ghost-button ghost-button-dark"
                onClick={() => onSelectTab("overview")}
                type="button"
              >
                Open quest map
              </button>
            </div>
          </article>
        </main>

        <aside className="game-console" aria-label="Parent console">
          <div className="game-console-tabs" role="tablist">
            {consoleTabs.map((tab) => (
              <button
                key={tab.id}
                className={activeConsole === tab.id ? "is-active" : ""}
                onClick={() => setActiveConsole(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeConsole === "mission" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <Compass size={22} />
                <div>
                  <p>Focus track</p>
                  <h2>{selectedChildSummary?.supportTrack?.title ?? "Learning path"}</h2>
                </div>
              </div>
              <div className="game-meter">
                <span style={{ width: `${selectedChildSummary?.overallTargetProgress ?? 0}%` }} />
              </div>
              <p>
                {selectedChildSummary?.child.name} has{" "}
                {selectedChildSummary?.weeklyLessonCount ?? 0}/
                {selectedChildSummary?.weeklyTarget?.lessons ?? 0} lessons,{" "}
                {selectedChildSummary?.weeklyStoryCount ?? 0}/
                {selectedChildSummary?.weeklyTarget?.stories ?? 0} stories, and{" "}
                {selectedChildSummary?.weeklyReflectionCount ?? 0}/
                {selectedChildSummary?.weeklyTarget?.reflections ?? 0} reflections this week.
              </p>
              <button className="inline-action" onClick={() => setOpenDrawer("report")} type="button">
                Weekly proof
                <ChevronRight size={14} />
              </button>
            </div>
          ) : null}

          {activeConsole === "signals" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <ClipboardList size={22} />
                <div>
                  <p>Parent attention</p>
                  <h2>{reviewQueue.length} signal(s)</h2>
                </div>
              </div>
              {topSignals.length > 0 ? (
                topSignals.map((item) => (
                  <article key={item.id} className="game-signal-card">
                    <p>{item.eyebrow}</p>
                    <strong>{item.title}</strong>
                    {item.actionType === "nudge" ? (
                      <div className="game-card-actions">
                        <button
                          className="inline-action"
                          onClick={() => onApplyPlanningNudge(item.childId, item.nudge)}
                          type="button"
                        >
                          Apply
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
                        onClick={() => handleSignalAction(item)}
                        type="button"
                      >
                        {item.ctaLabel}
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <article className="game-signal-card">
                  <p>All clear</p>
                  <strong>No urgent parent item right now.</strong>
                </article>
              )}
              <button className="inline-action" onClick={() => setOpenDrawer("signals")} type="button">
                View signal board
                <ChevronRight size={14} />
              </button>
            </div>
          ) : null}

          {activeConsole === "parent" ? (
            <div className="game-console-panel">
              <div className="game-console-hero">
                <ShieldCheck size={22} />
                <div>
                  <p>Parent guardrails</p>
                  <h2>{appState.bodyBoundariesUnlocked ? "Sensitive track open" : "Sensitive track locked"}</h2>
                </div>
              </div>
              <p>
                Coach tone: {selectedCoachStyle.title}. Rhythm: {selectedRhythm.title}.
                Goals: {goalLabel}.
              </p>
              <div className="game-card-actions">
                <button className="inline-action" onClick={onOpenFamily} type="button">
                  Family controls
                </button>
                <button className="inline-action" onClick={() => onSelectTab("coach")} type="button">
                  Tutor
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Quick actions">
        <button onClick={() => onSelectTab("courses")} type="button">
          <BookOpen size={16} />
          Learn subject
        </button>
        <button onClick={() => handleSignalAction(reviewQueue[0] ?? {})} type="button">
          <Sparkles size={16} />
          Handle first signal
        </button>
        <button onClick={() => onSelectTab("stories")} type="button">
          <MessagesSquare size={16} />
          Story practice
        </button>
        <button onClick={onOpenFamily} type="button">
          <Home size={16} />
          Family hub
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <CircleHelp size={16} />
          Help
        </button>
      </footer>

      {openDrawer === "report" ? (
        <GameDrawer onClose={() => setOpenDrawer(null)} title="Weekly proof">
          <div className="game-drawer-grid">
            <article>
              <Trophy size={18} />
              <strong>{weeklyReport.title}</strong>
              <span>{weeklyReport.summary}</span>
            </article>
            {(weeklyReport.stats ?? []).map((stat) => (
              <article key={stat.label}>
                <Star size={18} />
                <strong>{stat.value}</strong>
                <span>{stat.label}: {stat.detail}</span>
              </article>
            ))}
          </div>
        </GameDrawer>
      ) : null}

      {openDrawer === "signals" ? (
        <GameDrawer onClose={() => setOpenDrawer(null)} title="Signal board">
          <div className="game-drawer-list">
            {reviewQueue.map((item) => (
              <article key={item.id}>
                <p>{item.eyebrow}</p>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
                <button
                  className="inline-action"
                  onClick={() =>
                    item.actionType === "nudge"
                      ? onApplyPlanningNudge(item.childId, item.nudge)
                      : handleSignalAction(item)
                  }
                  type="button"
                >
                  {item.actionType === "nudge" ? "Apply" : item.ctaLabel}
                </button>
              </article>
            ))}
          </div>
        </GameDrawer>
      ) : null}
    </section>
  );
}
