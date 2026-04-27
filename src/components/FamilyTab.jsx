import {
  Archive,
  BookOpen,
  Bot,
  Brain,
  Compass,
  Database,
  FileText,
  History,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  Rocket,
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
import {
  buildChildSummary,
  buildCurriculumDepthConsole,
  buildFamilyMeetingBuilder,
  buildJournalInsightCoach,
  buildLaunchReadinessConsole,
  buildParentPrivacyCenter,
  buildParentTrustReview,
  buildProductionDataModelConsole,
  buildStorySkillDebrief,
  findStoryById,
  getTrackProgress,
} from "../lib/progression";

export function FamilyTab({
  appState,
  assignedTrackIds,
  familyToolsMessage,
  onApplyPlanningNudge,
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
  onRestartDashboardTour,
  onDismissPlanningNudge,
  onToggleJourney,
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
  const familyChatDone = (
    appState.completedJourneyIdsByChild[selectedChild.id] ?? []
  ).includes("family-chat");
  const nextRitual =
    familyRituals[childCompletedLessonIds.length % familyRituals.length];
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
  const parentPrivacyCenter = buildParentPrivacyCenter({
    appState,
    assignedTrackIds,
    selectedChild,
    visibleTracks,
  });
  const curriculumDepth = buildCurriculumDepthConsole();
  const launchReadiness = buildLaunchReadinessConsole();
  const productionDataModel = buildProductionDataModelConsole();

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

      <section className="family-meeting-panel">
        <div className="family-meeting-main">
          <div>
            <div className="panel-head">
              <MessageCircle size={18} />
              <h2>Family Meeting Builder</h2>
            </div>
            <div className="family-meeting-copy">
              <p>{familyMeeting.statusLabel}</p>
              <h3>{familyMeeting.title}</h3>
              <span>{familyMeeting.copy}</span>
            </div>
          </div>

          <article className="family-meeting-script">
            <p>Ready-to-say script</p>
            {familyMeeting.parentScript.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <button
              className={`inline-action ${familyChatDone ? "is-selected" : ""}`}
              onClick={() => onToggleJourney("family-chat")}
              type="button"
            >
              {familyChatDone ? "Family chat logged" : "Mark meeting done"}
            </button>
          </article>
        </div>

        <div className="family-meeting-agenda">
          {familyMeeting.agenda.map((item) => (
            <article key={item.title} className="family-meeting-step">
              <p>{item.time}</p>
              <strong>{item.title}</strong>
              <span>{item.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="parent-trust-review-panel">
        <div className="parent-trust-review-main">
          <div>
            <div className="panel-head">
              <ShieldCheck size={18} />
              <h2>{parentTrustReview.title}</h2>
            </div>
            <div className="parent-trust-review-copy">
              <p>{parentTrustReview.score}% review readiness</p>
              <h3>Parents can see what is protected before the product becomes production-backed.</h3>
              <span>{parentTrustReview.copy}</span>
            </div>
          </div>

          <div className="parent-trust-score">
            <p>Trust posture</p>
            <strong>{parentTrustReview.score}%</strong>
            <span>{appState.bodyBoundariesUnlocked ? "Sensitive access is parent-opened." : "Sensitive access is locked."}</span>
          </div>
        </div>

        <div className="parent-trust-grid">
          {parentTrustReview.rows.map((row) => (
            <article key={row.label} className="parent-trust-card">
              <p>{row.label}</p>
              <strong>{row.status}</strong>
              <span>{row.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-center-panel">
        <div className="privacy-center-main">
          <div>
            <div className="panel-head">
              <LockKeyhole size={18} />
              <h2>{parentPrivacyCenter.title}</h2>
            </div>
            <div className="privacy-center-copy">
              <p>{parentPrivacyCenter.exportItemCount} local export item previews</p>
              <h3>Parents should understand the family data story before KidWiz stores anything in production.</h3>
              <span>{parentPrivacyCenter.copy}</span>
            </div>
          </div>

          <div className="privacy-export-card">
            <FileText size={20} />
            <p>Export preview</p>
            <strong>{parentPrivacyCenter.exportItemCount}</strong>
            <span>Child-scoped local records ready to map into a future family archive.</span>
          </div>
        </div>

        <div className="privacy-data-grid">
          {parentPrivacyCenter.dataRows.map((row) => (
            <article key={row.label} className={`privacy-data-card is-${row.tone}`}>
              <div>
                <p>{row.label}</p>
                <strong>{row.count}</strong>
              </div>
              <span>{row.policy}</span>
              <small>{row.copy}</small>
            </article>
          ))}
        </div>

        <div className="privacy-consent-grid">
          {parentPrivacyCenter.consentRows.map((row) => (
            <article key={row.label} className={`privacy-consent-card is-${row.tone}`}>
              <p>{row.label}</p>
              <strong>{row.status}</strong>
              <span>{row.copy}</span>
            </article>
          ))}
        </div>

        <div className="privacy-action-list">
          <p>Production privacy actions</p>
          {parentPrivacyCenter.parentActions.map((action) => (
            <span key={action}>{action}</span>
          ))}
        </div>
      </section>

      <section className="curriculum-depth-panel">
        <div className="curriculum-depth-main">
          <div>
            <div className="panel-head">
              <BookOpen size={18} />
              <h2>{curriculumDepth.title}</h2>
            </div>
            <div className="curriculum-depth-copy">
              <p>{curriculumDepth.score}% average coverage score</p>
              <h3>Curriculum expansion should be measured by depth, not just feature count.</h3>
              <span>{curriculumDepth.copy}</span>
            </div>
          </div>

          <div className="curriculum-depth-score">
            <p>Coverage score</p>
            <strong>{curriculumDepth.score}%</strong>
            <span>Lessons, quizzes, story support, and parent cues combined.</span>
          </div>
        </div>

        <div className="curriculum-summary-grid">
          {curriculumDepth.summaryRows.map((row) => (
            <article key={row.label} className="curriculum-summary-card">
              <p>{row.label}</p>
              <strong>{row.value}</strong>
              <span>{row.copy}</span>
            </article>
          ))}
        </div>

        <div className="curriculum-track-grid">
          {curriculumDepth.rows.map((row) => (
            <article key={row.id} className={`curriculum-track-card is-${row.tone}`}>
              <div className="curriculum-track-head">
                <div>
                  <p>{row.ageBand}{row.sensitive ? " · parent unlocked" : ""}</p>
                  <strong>{row.title}</strong>
                </div>
                <span>{row.score}%</span>
              </div>
              <div className="curriculum-track-metrics">
                <span>{row.lessonCount} lessons</span>
                <span>{row.quizCount} quizzes</span>
                <span>{row.storyCount} stories</span>
                <span>{row.parentCueCount} parent cues</span>
              </div>
              <small>{row.copy}</small>
            </article>
          ))}
        </div>

        <div className="curriculum-next-list">
          <p>Next curriculum moves</p>
          {curriculumDepth.nextMoves.map((move) => (
            <span key={move}>{move}</span>
          ))}
        </div>
      </section>

      <section className="launch-readiness-panel">
        <div className="launch-readiness-main">
          <div>
            <div className="panel-head">
              <Rocket size={18} />
              <h2>{launchReadiness.title}</h2>
            </div>
            <div className="launch-readiness-copy">
              <p>{launchReadiness.score}% infrastructure readiness</p>
              <h3>The product experience is rich; the production foundation is the next mountain.</h3>
              <span>{launchReadiness.copy}</span>
            </div>
          </div>

          <div className="launch-readiness-score">
            <p>Local review</p>
            <strong>{launchReadiness.score}%</strong>
            <span>Honest launch posture before backend work begins.</span>
          </div>
        </div>

        <div className="launch-readiness-grid">
          {launchReadiness.rows.map((row) => (
            <article
              key={row.label}
              className={`launch-readiness-card is-${row.tone}`}
            >
              <p>{row.label}</p>
              <strong>{row.status}</strong>
              <span>{row.readiness}</span>
              <small>{row.copy}</small>
            </article>
          ))}
        </div>

        <div className="launch-readiness-next">
          <p>Best next production moves</p>
          <div>
            {launchReadiness.nextSteps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="data-model-panel">
        <div className="data-model-head">
          <div>
            <div className="panel-head">
              <Database size={18} />
              <h2>{productionDataModel.title}</h2>
            </div>
            <p>{productionDataModel.copy}</p>
          </div>
          <div className="data-model-flow">
            <p>Source-of-truth flow</p>
            {productionDataModel.flow.map((step, index) => (
              <span key={step}>{index + 1}. {step}</span>
            ))}
          </div>
        </div>

        <div className="data-model-grid">
          {productionDataModel.domains.map((domain) => (
            <article
              key={domain.table}
              className={`data-model-card is-${domain.tone}`}
            >
              <div>
                <p>{domain.label}</p>
                <strong>{domain.table}</strong>
              </div>
              <span>{domain.priority}</span>
              <small>{domain.source}</small>
              <ul>
                {domain.records.map((record) => (
                  <li key={record}>{record}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="data-model-questions">
          <p>Open architecture questions</p>
          {productionDataModel.openQuestions.map((question) => (
            <span key={question}>{question}</span>
          ))}
        </div>
      </section>

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
                <button
                  className="inline-action"
                  onClick={() =>
                    onApplyPlanningNudge(
                      selectedChild.id,
                      selectedChildSummary.planningNudge,
                    )
                  }
                  type="button"
                >
                  Apply all
                </button>
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
                <button
                  className="inline-action"
                  onClick={() =>
                    onDismissPlanningNudge(
                      selectedChild.id,
                      selectedChildSummary.planningNudge.id,
                    )
                  }
                  type="button"
                >
                  Dismiss
                </button>
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
            <button
              className="inline-action"
              onClick={onRestartDashboardTour}
              type="button"
            >
              Restart dashboard tour
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
