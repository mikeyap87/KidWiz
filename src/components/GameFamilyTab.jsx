import { useState } from "react";
import {
  Archive,
  Bot,
  Brain,
  CalendarDays,
  Download,
  Map,
  MessagesSquare,
  NotebookPen,
  RefreshCw,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import {
  celebrationStyles,
  familyGoals,
  familyRituals,
  weeklyRhythms,
  coachStyles,
} from "../data/kidwizData";
import {
  parentPrivacyPromise,
  retentionPolicyDraft,
} from "../data/releaseReadinessData";
import {
  buildChildSummary,
  buildFamilyMeetingBuilder,
  buildJournalInsightCoach,
  buildParentTrustReview,
  buildStorySkillDebrief,
  findStoryById,
} from "../lib/progression";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "stories", label: "Story", icon: MessagesSquare },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

function compactControlLabel(label) {
  return label
    .replace("Reading and writing", "Reading")
    .replace("Focus and habits", "Focus")
    .replace("Digital safety", "Digital")
    .replace("Weekday burst", "Weekday")
    .replace("Weekend reset", "Weekend")
    .replace("Balanced coach", "Balanced")
    .replace("Gentle guide", "Gentle")
    .replace("Stretch mode", "Stretch")
    .replace("Celebrate ", "");
}

function ChoiceDock({ items, selectedId, onSelect, limit = 4 }) {
  return (
    <div className="game-choice-dock">
      {items.slice(0, limit).map((item) => (
        <button
          key={item.id}
          aria-label={`Choose ${item.label ?? item.title}`}
          className={selectedId === item.id ? "is-selected" : ""}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          {compactControlLabel(item.label ?? item.title)}
        </button>
      ))}
    </div>
  );
}

export function FamilyTab({
  appState,
  assignedTrackIds,
  cloudSyncStatus,
  familyToolsMessage,
  onArchiveAndStartFreshWeek,
  onArchiveCurrentWeek,
  onChangeCelebrationStyle,
  onChangeCoachStyle,
  onChangeRhythm,
  onDeleteCloudWorkspace,
  onExitDemo,
  onExportFamilyData,
  onGenerateFreshWeek,
  onResetDemo,
  onResetWeeklyHistory,
  onRestartDashboardTour,
  onRestartOnboarding,
  onSelectTab,
  onToggleBodyBoundaries,
  onToggleGoal,
  onToggleJourney,
  onToggleTrackAssignment,
  selectedCelebrationStyle,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
  selectedRhythm,
  visibleTracks,
  weeklyHistoryByChild,
}) {
  const [showMoreControls, setShowMoreControls] = useState(false);
  const selectedChildSummary = buildChildSummary({
    bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
    selectedGoalIds: appState.selectedGoalIds,
    child: selectedChild,
    visibleTracks,
    weeklyHistoryByChild,
    assignedTrackIdsByChild: appState.assignedTrackIdsByChild,
    completedJourneyIdsByChild: appState.completedJourneyIdsByChild,
    completedLessonIdsByChild: appState.completedLessonIdsByChild,
    childJournalEntriesByChild: appState.childJournalEntriesByChild,
    playlistLessonIdsByChild: appState.playlistLessonIdsByChild,
    storyChoicesByChild: appState.storyChoicesByChild,
    weeklyTargetsByChild: appState.weeklyTargetsByChild,
    planningNudgeStateByChild: appState.planningNudgeStateByChild,
  });
  const childCompletedLessonIds =
    appState.completedLessonIdsByChild[selectedChild.id] ?? [];
  const childJournalEntries =
    appState.childJournalEntriesByChild[selectedChild.id] ?? [];
  const childStoryChoices = appState.storyChoicesByChild[selectedChild.id] ?? {};
  const latestStoryId = Object.keys(childStoryChoices).at(-1);
  const latestStory = latestStoryId ? findStoryById(latestStoryId) : null;
  const latestStoryChoice = latestStory?.choices.find(
    (choice) => choice.id === childStoryChoices[latestStory.id],
  );
  const familyChatDone = (
    appState.completedJourneyIdsByChild[selectedChild.id] ?? []
  ).includes("family-chat");
  const nextRitual =
    familyRituals[childCompletedLessonIds.length % familyRituals.length];
  const journalInsight = buildJournalInsightCoach({
    child: selectedChild,
    childJournalEntries,
    visibleTracks,
    completedLessonIds: childCompletedLessonIds,
  });
  const storyDebrief = buildStorySkillDebrief({
    story: latestStory,
    choice: latestStoryChoice,
    visibleTracks,
    completedLessonIds: childCompletedLessonIds,
  });
  const familyMeeting = buildFamilyMeetingBuilder({
    child: selectedChild,
    familyChatDone,
    journalInsight,
    nextRitual,
    selectedRhythm,
    storyDebrief,
    summary: selectedChildSummary,
  });
  const parentTrustReview = buildParentTrustReview({
    appState,
    assignedTrackIds,
    selectedChild,
    selectedCoachStyle,
    visibleTracks,
  });

  function runWithConfirmation(message, action) {
    if (!action) {
      return;
    }

    if (typeof window === "undefined" || window.confirm(message)) {
      action();
      setShowMoreControls(false);
    }
  }

  return (
    <section className="kidwiz-game-shell game-family-room" aria-label="KidWiz parent control room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Parent control room</p>
            <h1>{selectedChild.name}&apos;s learning controls</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Family control status">
          <span className="game-stat">
            <strong>{parentTrustReview.score}%</strong>
            trust
          </span>
          <span className="game-stat">
            <strong>{appState.bodyBoundariesUnlocked ? "Open" : "Locked"}</strong>
            safety
          </span>
          <span className="game-stat">
            <strong>{selectedRhythm.title}</strong>
            rhythm
          </span>
          <span className="game-stat">
            <strong>{cloudSyncStatus?.label ?? "Local demo"}</strong>
            data
          </span>
        </div>
      </header>

      <div className="game-board game-family-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "family" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-family-stage" aria-label="Parent controls">
          <section className="game-family-mission">
            <div>
              <p>{familyMeeting.statusLabel}</p>
              <h2>{familyMeeting.title}</h2>
              <span>{familyMeeting.copy}</span>
            </div>
            <div className="game-family-mission-actions">
              <button
                className={`solid-button game-save-button ${familyChatDone ? "is-selected" : ""}`}
                onClick={() => onToggleJourney("family-chat")}
                type="button"
              >
                {familyChatDone ? "Meeting logged" : "Mark meeting done"}
              </button>
              <button
                className="ghost-button ghost-button-dark"
                onClick={() => setShowMoreControls(true)}
                type="button"
              >
                More controls
              </button>
            </div>
          </section>

          <section className="game-family-control-grid" aria-label="Control panels">
            <article className="game-family-card">
              <div className="game-journal-card-head">
                <Target size={18} />
                <div>
                  <p>Family goals</p>
                  <strong>{selectedGoals.length} active goals</strong>
                </div>
              </div>
              <div className="game-choice-dock">
                {familyGoals.slice(0, 4).map((goal) => (
                  <button
                    key={goal.id}
                    aria-label={`Toggle family goal: ${goal.title}`}
                    className={appState.selectedGoalIds.includes(goal.id) ? "is-selected" : ""}
                    onClick={() => onToggleGoal(goal.id)}
                    type="button"
                  >
                    {compactControlLabel(goal.title)}
                  </button>
                ))}
              </div>
            </article>

            <article className="game-family-card">
              <div className="game-journal-card-head">
                <CalendarDays size={18} />
                <div>
                  <p>Weekly rhythm</p>
                  <strong>{selectedRhythm.title}</strong>
                </div>
              </div>
              <ChoiceDock
                items={weeklyRhythms}
                selectedId={appState.weeklyRhythmId}
                onSelect={onChangeRhythm}
              />
            </article>

            <article className="game-family-card">
              <div className="game-journal-card-head">
                <Bot size={18} />
                <div>
                  <p>Coach tone</p>
                  <strong>{selectedCoachStyle.title}</strong>
                </div>
              </div>
              <ChoiceDock
                items={coachStyles}
                selectedId={appState.coachStyleId}
                onSelect={onChangeCoachStyle}
              />
            </article>

            <article className="game-family-card">
              <div className="game-journal-card-head">
                <Trophy size={18} />
                <div>
                  <p>Celebration</p>
                  <strong>{selectedCelebrationStyle.title}</strong>
                </div>
              </div>
              <ChoiceDock
                items={celebrationStyles}
                selectedId={appState.celebrationStyleId}
                onSelect={onChangeCelebrationStyle}
              />
            </article>

            <article className="game-family-card game-family-card-wide">
              <div className="game-journal-card-head">
                <Brain size={18} />
                <div>
                  <p>Assigned learning zones</p>
                  <strong>{assignedTrackIds.length} zones active</strong>
                </div>
              </div>
              <div className="game-choice-dock game-choice-dock-wide">
                {visibleTracks.slice(0, 6).map((track) => (
                  <button
                    key={track.id}
                    aria-label={`Toggle ${track.title} learning zone`}
                    className={assignedTrackIds.includes(track.id) ? "is-selected" : ""}
                    onClick={() => onToggleTrackAssignment(track.id)}
                    type="button"
                  >
                    {track.shortTitle ?? track.title}
                  </button>
                ))}
              </div>
            </article>

            <article className="game-family-card">
              <div className="game-journal-card-head">
                <ShieldCheck size={18} />
                <div>
                  <p>Sensitive access</p>
                  <strong>{appState.bodyBoundariesUnlocked ? "Parent opened" : "Locked"}</strong>
                </div>
              </div>
              <button className="inline-action" onClick={onToggleBodyBoundaries} type="button">
                {appState.bodyBoundariesUnlocked ? "Lock again" : "Unlock with parent"}
              </button>
            </article>
          </section>
        </main>

        <aside className="game-console" aria-label="Parent safety console">
          <div className="game-console-tabs game-console-actions" aria-label="Parent quick actions">
            <button className="is-active" type="button">Safety</button>
            <button
              onClick={() =>
                runWithConfirmation(
                  "Generate a fresh weekly plan for this demo?",
                  onGenerateFreshWeek,
                )
              }
              type="button"
            >
              New plan
            </button>
            <button
              onClick={() =>
                runWithConfirmation(
                  "Save this week to the local demo archive?",
                  onArchiveCurrentWeek,
                )
              }
              type="button"
            >
              Save week
            </button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <ShieldCheck size={22} />
              <div>
                <p>Trust posture</p>
                <h2>{parentTrustReview.score}% ready</h2>
              </div>
            </div>
            <article className="game-signal-card">
              <p>Safety cue</p>
              <strong>{parentTrustReview.title}</strong>
              <span>{parentTrustReview.copy}</span>
            </article>
            <article className="game-signal-card">
              <p>Family script</p>
              <strong>{familyMeeting.parentScript[0]}</strong>
              <span>{familyMeeting.parentScript[1]}</span>
            </article>
            {familyToolsMessage ? (
              <article className="game-signal-card">
                <p>Latest update</p>
                <strong>{familyToolsMessage}</strong>
              </article>
            ) : null}
            <div className="game-family-toolbox">
              <button
                onClick={() =>
                  runWithConfirmation(
                    "Archive the current week and start a fresh local demo week?",
                    onArchiveAndStartFreshWeek,
                  )
                }
                type="button"
              >
                <Archive size={14} />
                Archive + refresh
              </button>
              <button
                onClick={() =>
                  runWithConfirmation(
                    "Reset weekly history for this local demo?",
                    onResetWeeklyHistory,
                  )
                }
                type="button"
              >
                <RefreshCw size={14} />
                Reset history
              </button>
              <button onClick={onRestartDashboardTour} type="button">
                Tour
              </button>
              <button onClick={onRestartOnboarding} type="button">
                Setup
              </button>
              <button
                onClick={onResetDemo}
                type="button"
              >
                Reset demo
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showMoreControls ? (
        <div className="game-drawer-backdrop" role="presentation">
          <section
            aria-label="More parent controls"
            className="game-drawer game-family-more-drawer"
            role="dialog"
          >
            <div className="game-drawer-head">
              <div>
                <p className="eyebrow eyebrow-dark">More controls</p>
                <h2>Parent-only tools for {selectedChild.name}</h2>
              </div>
              <button
                className="ghost-button ghost-button-dark"
                onClick={() => setShowMoreControls(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="game-drawer-grid">
              <article>
                <strong>Assigned learning zones</strong>
                <span>Choose which zones appear in the child&apos;s learning path.</span>
                <div className="game-choice-dock game-choice-dock-wide">
                  {visibleTracks.slice(0, 6).map((track) => (
                    <button
                      key={track.id}
                      aria-label={`Toggle ${track.title} learning zone`}
                      className={assignedTrackIds.includes(track.id) ? "is-selected" : ""}
                      onClick={() => onToggleTrackAssignment(track.id)}
                      type="button"
                    >
                      {track.shortTitle ?? track.title}
                    </button>
                  ))}
                </div>
              </article>

              <article>
                <strong>Sensitive access</strong>
                <span>
                  {appState.bodyBoundariesUnlocked
                    ? "Sensitive learning topics are currently parent-opened."
                    : "Sensitive learning topics are locked behind parent review."}
                </span>
                <button className="inline-action" onClick={onToggleBodyBoundaries} type="button">
                  {appState.bodyBoundariesUnlocked ? "Lock sensitive topics" : "Unlock with parent"}
                </button>
              </article>

              <article>
                <strong>Privacy export</strong>
                <span>
                  Download the current family workspace as a readable JSON file
                  before testing real accounts or destructive changes.
                </span>
                <div className="game-family-toolbox">
                  <button onClick={onExportFamilyData} type="button">
                    <Download size={14} />
                    Export data
                  </button>
                  <button
                    onClick={() =>
                      runWithConfirmation(
                        "Delete the signed-in cloud copy? This keeps the local browser preview until you reset it.",
                        onDeleteCloudWorkspace,
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={14} />
                    Delete cloud
                  </button>
                </div>
                <div className="game-family-policy-list" aria-label="Parent privacy promise">
                  {parentPrivacyPromise.slice(0, 2).map((item) => (
                    <span key={item.label}>
                      <ShieldCheck size={13} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </article>

              <article>
                <strong>Retention draft</strong>
                <span>
                  Use parent-controlled storage until the final legal policy is approved.
                </span>
                <div className="game-family-policy-list" aria-label="KidWiz retention policy draft">
                  {retentionPolicyDraft.slice(0, 3).map((item) => (
                    <span key={item.label}>
                      <strong>{item.label}</strong>
                      {item.window}
                    </span>
                  ))}
                </div>
              </article>

              <article>
                <strong>Week tools</strong>
                <span>Use these only when you want to refresh local demo progress.</span>
                <div className="game-family-toolbox">
                  <button
                    onClick={() =>
                      runWithConfirmation(
                        "Archive the current week and start a fresh local demo week?",
                        onArchiveAndStartFreshWeek,
                      )
                    }
                    type="button"
                  >
                    <Archive size={14} />
                    Archive + refresh
                  </button>
                  <button
                    onClick={() =>
                      runWithConfirmation(
                        "Reset weekly history for this local demo?",
                        onResetWeeklyHistory,
                      )
                    }
                    type="button"
                  >
                    <RefreshCw size={14} />
                    Reset history
                  </button>
                </div>
              </article>

              <article>
                <strong>Demo recovery</strong>
                <span>Restart guidance, reset demo data, or leave the app preview.</span>
                <div className="game-family-toolbox">
                  <button onClick={onRestartDashboardTour} type="button">
                    Tour
                  </button>
                  <button onClick={onRestartOnboarding} type="button">
                    Setup
                  </button>
                  <button
                    onClick={onResetDemo}
                    type="button"
                  >
                    Reset demo
                  </button>
                  {onExitDemo ? (
                    <button onClick={onExitDemo} type="button">
                      Public site
                    </button>
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        </div>
      ) : null}

      <footer className="game-action-bar" aria-label="Parent control actions">
        <button onClick={() => onSelectTab("dashboard")} type="button">
          <Target size={16} />
          Today
        </button>
        <button onClick={() => setShowMoreControls(true)} type="button">
          <ShieldCheck size={16} />
          More controls
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <ShieldCheck size={16} />
          Help
        </button>
        <button onClick={() => onSelectTab("journal")} type="button">
          <NotebookPen size={16} />
          Journal
        </button>
        <button onClick={() => onSelectTab("coach")} type="button">
          <Bot size={16} />
          Tutor
        </button>
        {onExitDemo ? (
          <button onClick={onExitDemo} type="button">
            <Archive size={16} />
            Public site
          </button>
        ) : null}
      </footer>
    </section>
  );
}
