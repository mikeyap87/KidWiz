import {
  Archive,
  Bot,
  Brain,
  Compass,
  History,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  celebrationStyles,
  childProfiles,
  familyGoals,
  familyRituals,
  weeklyRhythms,
  coachStyles,
} from "../data/kidwizData";
import { trustSignals } from "../data/kidwizMarketingData";
import { buildChildSummary, getTrackProgress } from "../lib/progression";

export function FamilyTab({
  appState,
  assignedTrackIds,
  familyToolsMessage,
  onArchiveAndStartFreshWeek,
  onArchiveCurrentWeek,
  onChangeCelebrationStyle,
  onChangeCoachStyle,
  onChangeRhythm,
  onAdjustWeeklyTarget,
  onChangeFocusTrack,
  onGenerateFreshWeek,
  onResetDemo,
  onResetWeeklyHistory,
  onRestartOnboarding,
  onToggleBodyBoundaries,
  onToggleGoal,
  onToggleTrackAssignment,
  selectedCelebrationStyle,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
  selectedRhythm,
  visibleTracks,
  weeklyHistoryByChild,
}) {
  const selectedChildSummary = buildChildSummary({
    bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
    selectedGoalIds: appState.selectedGoalIds,
    child: selectedChild,
    visibleTracks,
    weeklyHistoryByChild: appState.weeklyHistoryByChild,
    assignedTrackIdsByChild: appState.assignedTrackIdsByChild,
    completedJourneyIdsByChild: appState.completedJourneyIdsByChild,
    completedLessonIdsByChild: appState.completedLessonIdsByChild,
    childJournalEntriesByChild: appState.childJournalEntriesByChild,
    playlistLessonIdsByChild: appState.playlistLessonIdsByChild,
    storyChoicesByChild: appState.storyChoicesByChild,
    weeklyTargetsByChild: appState.weeklyTargetsByChild,
  });

  function handlePlanningAction(action) {
    if (action.type === "focus" && action.trackId) {
      onChangeFocusTrack(selectedChild.id, action.trackId);
      return;
    }

    if (action.type === "target" && action.key && action.delta) {
      onAdjustWeeklyTarget(selectedChild.id, action.key, action.delta);
    }
  }

  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Family controls</p>
        <h1>Parents can shape the product instead of just observing it.</h1>
        <p>
          This local test build includes goal selection, weekly rhythm, coach
          style, celebration style, track assignment, and a fresh-week generator.
        </p>
      </div>

      <div className="family-grid">
        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Family priorities</h2>
          </div>
          <div className="goal-chip-row">
            {familyGoals.map((goal) => (
              <button
                key={goal.id}
                className={`summary-chip-button ${
                  selectedGoals.some((item) => item.id === goal.id)
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => onToggleGoal(goal.id)}
                type="button"
              >
                {goal.title}
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Compass size={18} />
            <h2>Weekly rhythm</h2>
          </div>
          <div className="stack-list">
            {weeklyRhythms.map((rhythm) => (
              <button
                key={rhythm.id}
                className={`stack-row ${
                  selectedRhythm.id === rhythm.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeRhythm(rhythm.id)}
                type="button"
              >
                <strong>{rhythm.title}</strong>
                <span>{rhythm.copy}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Bot size={18} />
            <h2>Coach and celebration</h2>
          </div>
          <div className="stack-list">
            {coachStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCoachStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCoachStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
          <div className="stack-list stack-list-tight">
            {celebrationStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCelebrationStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCelebrationStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="family-grid family-grid-secondary">
        <article className="surface-panel">
          <div className="panel-head">
            <ShieldCheck size={18} />
            <h2>Trust center</h2>
          </div>
          <button
            className={`toggle-button ${
              appState.bodyBoundariesUnlocked ? "is-selected" : ""
            }`}
            onClick={onToggleBodyBoundaries}
            type="button"
          >
            <div>
              <span>Sensitive topic track</span>
              <strong>
                {appState.bodyBoundariesUnlocked ? "Unlocked" : "Locked"}
              </strong>
            </div>
          </button>
          <div className="trust-list">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="trust-row">
                <strong>{signal.title}</strong>
                <span>{signal.copy}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Brain size={18} />
            <h2>{selectedChild.name}&apos;s assigned tracks</h2>
          </div>
          <div className="assign-grid">
            {visibleTracks.map((track) => {
              const assigned = assignedTrackIds.includes(track.id);
              const progress = getTrackProgress(
                selectedChild,
                track,
                appState.completedLessonIdsByChild[selectedChild.id] ?? [],
              );

              return (
                <button
                  key={track.id}
                  className={`assign-tile ${assigned ? "is-selected" : ""}`}
                  onClick={() => onToggleTrackAssignment(track.id)}
                  type="button"
                >
                  <strong>{track.title}</strong>
                  <span>{progress}% progress</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Bot size={18} />
            <h2>{selectedChild.name}&apos;s planning nudges</h2>
          </div>

          {selectedChildSummary.planningNudge ? (
            <div className="planning-nudge-card">
              <p>{selectedChildSummary.planningNudge.title}</p>
              <strong>{selectedChildSummary.signal?.title ?? "Recent child signal"}</strong>
              <span>{selectedChildSummary.planningNudge.copy}</span>
              <div className="tool-list planning-nudge-actions">
                {selectedChildSummary.planningNudge.actions.map((action) => (
                  <button
                    key={action.label}
                    className="inline-action"
                    onClick={() => handlePlanningAction(action)}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="panel-copy">
              No planning nudge is active right now. Keep watching recent stories
              and reflections to see when KidWiz suggests a target or focus-track shift.
            </p>
          )}
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <RefreshCw size={18} />
            <h2>Local testing tools</h2>
          </div>
          <div className="tool-list">
            <button className="inline-action" onClick={onArchiveCurrentWeek} type="button">
              Save current week to history
            </button>
            <button
              className="inline-action"
              onClick={onArchiveAndStartFreshWeek}
              type="button"
            >
              Archive and start fresh week
            </button>
            <button className="inline-action" onClick={onGenerateFreshWeek} type="button">
              Generate fresh week
            </button>
            <button className="inline-action" onClick={onResetWeeklyHistory} type="button">
              Reset saved history
            </button>
            <button className="inline-action" onClick={onRestartOnboarding} type="button">
              Restart onboarding
            </button>
            <button className="inline-action" onClick={onResetDemo} type="button">
              Reset local demo
            </button>
          </div>

          {familyToolsMessage ? <p className="panel-copy">{familyToolsMessage}</p> : null}

          <div className="ritual-list">
            {familyRituals.map((ritual) => (
              <div key={ritual.title} className="ritual-row">
                <strong>{ritual.title}</strong>
                <span>{ritual.copy}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="family-grid family-grid-secondary">
        <article className="surface-panel">
          <div className="panel-head">
            <History size={18} />
            <h2>Saved trend history</h2>
          </div>

          <div className="ritual-list">
            {Object.entries(weeklyHistoryByChild).map(([childId, history]) => {
              const childName =
                childProfiles.find((child) => child.id === childId)?.name ?? childId;
              const latestSnapshot = history.at(-1);

              return (
                <div key={childId} className="ritual-row">
                  <strong>
                    {childName}: {history.length} saved week{history.length === 1 ? "" : "s"}
                  </strong>
                  <span>
                    {latestSnapshot
                      ? `${latestSnapshot.weekLabel} · ${latestSnapshot.readinessScore}% readiness · focus ${
                          visibleTracks.find(
                            (track) => track.id === latestSnapshot.focusTrackId,
                          )?.title ?? "track"
                        }`
                      : "No weekly snapshots saved yet."}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Archive size={18} />
            <h2>How local snapshots work</h2>
          </div>

          <div className="trust-list">
            <div className="trust-row">
              <strong>Save current week</strong>
              <span>
                Archives the current totals so the dashboard can compare the next week
                against a real baseline.
              </span>
            </div>
            <div className="trust-row">
              <strong>Archive and start fresh week</strong>
              <span>
                Saves the current week, rotates focus tracks, refreshes playlists, and
                clears the daily rhythm checklist for the next local cycle.
              </span>
            </div>
            <div className="trust-row">
              <strong>Reset saved history</strong>
              <span>
                Returns the trend view to the KidWiz demo baseline without wiping the
                rest of the product state.
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
