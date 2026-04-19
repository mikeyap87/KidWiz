import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Gem,
  Mail,
  NotebookPen,
  Printer,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { badgeCatalog } from "../data/kidwizData";
import {
  buildChildCelebrationReel,
  buildChildAchievementPortfolio,
  buildChildFirstSessionLaunchpad,
  buildKidDailyQuestBrief,
  buildParentSharePreview,
  buildQuestWorldRows,
  buildWeeklyMissionBoard,
  deriveEarnedBadgeIds,
  findLessonById,
  findTrackByLessonId,
} from "../lib/progression";
import { GoalGlyph, TrackGlyph } from "../lib/uiConfig";

function renderMissionAction(mission, handlers) {
  if (mission.destination === "lesson") {
    if (mission.lessonId) {
      handlers.onOpenLesson(mission.lessonId);
    }
    return;
  }

  if (mission.destination === "story") {
    if (mission.storyId) {
      handlers.onOpenStory(mission.storyId);
    }
    return;
  }

  if (mission.destination === "journal") {
    handlers.onOpenJournal();
    return;
  }

  handlers.onOpenFamily();
}

export function OverviewTab({
  appState,
  childCompletedJourneyIds,
  childCompletedLessonIds,
  childJournalEntries,
  childPlaylistLessonIds,
  childStoryChoices,
  selectedChildWorkspace,
  onOpenFamily,
  onOpenJournal,
  onOpenLesson,
  onOpenStory,
  onSelectTrack,
  onToggleJourney,
  recommendedLesson,
  selectedSignal,
  selectedWeeklyTarget,
  selectedChild,
  selectedGoals,
  todayLabel,
  visibleTracks,
  nextRitual,
  dailyJourneys,
  weeklyCompletion,
}) {
  const overviewPlaylistPreview = useMemo(
    () =>
      childPlaylistLessonIds
        .map((lessonId) => {
          const lesson = findLessonById(lessonId);
          const track = findTrackByLessonId(lessonId);
          return lesson
            ? {
                ...lesson,
                trackTitle: track?.title ?? "",
              }
            : null;
        })
        .filter(Boolean)
        .slice(0, 4),
    [childPlaylistLessonIds],
  );
  const earnedBadgesSummary = useMemo(
    () => {
      const earnedBadgeIds = deriveEarnedBadgeIds({
        completedLessonIds: childCompletedLessonIds,
        playlistLessonIds: childPlaylistLessonIds,
        childJournalEntries,
        completedJourneyIds: childCompletedJourneyIds,
        storyChoices: childStoryChoices,
        bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
      });
      const earnedBadges = badgeCatalog.filter((badge) =>
        earnedBadgeIds.includes(badge.id),
      );

      return {
        count: earnedBadgeIds.length,
        earnedBadges,
        nextBadge:
          badgeCatalog.find((badge) => !earnedBadgeIds.includes(badge.id)) ?? null,
      };
    },
    [
      appState.bodyBoundariesUnlocked,
      childCompletedJourneyIds,
      childCompletedLessonIds,
      childJournalEntries,
      childPlaylistLessonIds,
      childStoryChoices,
    ],
  );
  const questWorldRows = useMemo(
    () =>
      buildQuestWorldRows({
        visibleTracks,
        completedLessonIds: childCompletedLessonIds,
        weeklyTarget: selectedWeeklyTarget,
        assignedTrackIds: appState.assignedTrackIdsByChild[selectedChild.id] ?? [],
      }),
    [
      appState.assignedTrackIdsByChild,
      childCompletedLessonIds,
      selectedChild.id,
      selectedWeeklyTarget,
      visibleTracks,
    ],
  );
  const missionBoard = useMemo(
    () =>
      buildWeeklyMissionBoard({
        child: selectedChild,
        selectedGoalIds: appState.selectedGoalIds,
        visibleTracks,
        weeklyTarget: selectedWeeklyTarget,
        completedLessonIds: childCompletedLessonIds,
        storyChoices: childStoryChoices,
        childJournalEntries,
        completedJourneyIds: childCompletedJourneyIds,
        recommendedLesson,
        nextBadge: earnedBadgesSummary.nextBadge,
        nextRitual,
        signal: selectedSignal,
      }),
    [
      appState.selectedGoalIds,
      childCompletedJourneyIds,
      childCompletedLessonIds,
      childJournalEntries,
      childStoryChoices,
      earnedBadgesSummary,
      nextRitual,
      recommendedLesson,
      selectedSignal,
      selectedChild,
      selectedWeeklyTarget,
      visibleTracks,
    ],
  );
  const questHandlers = {
    onOpenFamily,
    onOpenJournal,
    onOpenLesson,
    onOpenStory,
  };
  const kidDailyBrief = useMemo(
    () =>
      buildKidDailyQuestBrief({
        child: selectedChild,
        missionBoard,
        recommendedLesson,
        signal: selectedSignal,
        weeklyCompletion,
      }),
    [
      missionBoard,
      recommendedLesson,
      selectedChild,
      selectedSignal,
      weeklyCompletion,
    ],
  );
  const firstSessionLaunchpad = useMemo(
    () =>
      buildChildFirstSessionLaunchpad({
        child: selectedChild,
        missionBoard,
        recommendedLesson,
        weeklyCompletion,
      }),
    [missionBoard, recommendedLesson, selectedChild, weeklyCompletion],
  );
  const isFirstSession =
    selectedChildWorkspace.weeklyLessonCount === 0 &&
    selectedChildWorkspace.weeklyStoryCount === 0 &&
    selectedChildWorkspace.weeklyReflectionCount === 0 &&
    !selectedChildWorkspace.familyChatDone;
  const recommendedStory = selectedChildWorkspace.recommendedStory;
  const firstSessionLabel = isFirstSession
    ? firstSessionLaunchpad.title
    : kidDailyBrief.title;
  const firstSessionIntro = isFirstSession
    ? firstSessionLaunchpad.copy
    : `${selectedChild.companionName} is still here. ${kidDailyBrief.copy}`;
  const firstSessionReasonRows = isFirstSession
    ? firstSessionLaunchpad.orientationRows
    : kidDailyBrief.reasonRows;
  const primaryMission =
    firstSessionLaunchpad.firstMission ?? kidDailyBrief.nextMission ?? null;
  const primaryMissionLabel = isFirstSession
    ? firstSessionLaunchpad.ctaLabel
    : primaryMission?.ctaLabel ?? "Open next quest";
  const primaryMissionAction = isFirstSession
    ? primaryMission
      ? () => renderMissionAction(primaryMission, questHandlers)
      : () => onSelectTrack(missionBoard.focusTrack?.id)
    : primaryMission
      ? () => renderMissionAction(primaryMission, questHandlers)
      : () => onSelectTrack(missionBoard.focusTrack?.id);
  const secondaryMission =
    isFirstSession && recommendedStory
      ? {
          label: `Try ${recommendedStory.title}`,
          onClick: () => onOpenStory(recommendedStory.id, selectedChild.id),
        }
      : {
          label: `Open ${missionBoard.focusTrack?.title ?? "focus track"}`,
          onClick: () => onSelectTrack(missionBoard.focusTrack?.id),
        };
  const celebrationReel = useMemo(
    () =>
      buildChildCelebrationReel({
        child: selectedChild,
        completedLessonIds: childCompletedLessonIds,
        completedJourneyIds: childCompletedJourneyIds,
        childJournalEntries,
        storyChoices: childStoryChoices,
        earnedBadgeCount: earnedBadgesSummary.count,
        nextBadge: earnedBadgesSummary.nextBadge,
      }),
    [
      childCompletedJourneyIds,
      childCompletedLessonIds,
      childJournalEntries,
      childStoryChoices,
      earnedBadgesSummary,
      selectedChild,
    ],
  );
  const achievementPortfolio = useMemo(
    () =>
      buildChildAchievementPortfolio({
        child: selectedChild,
        completedLessonIds: childCompletedLessonIds,
        completedJourneyIds: childCompletedJourneyIds,
        childJournalEntries,
        storyChoices: childStoryChoices,
        earnedBadges: earnedBadgesSummary.earnedBadges,
        selectedGoals,
        nextBadge: earnedBadgesSummary.nextBadge,
      }),
    [
      childCompletedJourneyIds,
      childCompletedLessonIds,
      childJournalEntries,
      childStoryChoices,
      earnedBadgesSummary,
      selectedChild,
      selectedGoals,
    ],
  );
  const parentSharePreview = useMemo(
    () =>
      buildParentSharePreview({
        child: selectedChild,
        achievementPortfolio,
        todayLabel,
      }),
    [achievementPortfolio, selectedChild, todayLabel],
  );

  return (
    <section className="workspace-band quest-hub-shell">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">{todayLabel} · Quest Hub</p>
        <h1>{selectedChild.name}&apos;s world is open and the next move is clear.</h1>
        <p>
          {selectedChild.companionName}, the {selectedChild.companionTitle.toLowerCase()},
          is guiding this week&apos;s mission loop around{" "}
          {missionBoard.focusTrack?.title ?? "today's priorities"}.
        </p>
      </div>

      <section className="first-session-panel">
        <div className="first-session-main">
          <div>
            <div className="panel-head">
              <Compass size={18} />
              <h2>{isFirstSession ? "First Quest Launchpad" : "Resume this quest"}</h2>
            </div>
            <div className="first-session-copy">
              <p>{firstSessionLaunchpad.title}</p>
              <p>{firstSessionLabel}</p>
              <h3>{firstSessionIntro}</h3>
            </div>
          </div>

          <div className="first-session-action">
            <p>First move</p>
            <strong>
              {primaryMission?.eyebrow ?? (isFirstSession ? "Open today's quest" : "Continue from here")}
            </strong>
            <div className="first-session-action-row">
              <button
                className="inline-action"
                onClick={primaryMissionAction}
                type="button"
              >
                {primaryMissionLabel}
                <ArrowRight size={14} />
              </button>
              <button
                className="inline-action"
                onClick={secondaryMission.onClick}
                type="button"
              >
                {secondaryMission.label}
              </button>
            </div>
          </div>
        </div>

        <div className="first-session-steps">
          {firstSessionReasonRows.map((row) => (
            <article key={row.label} className="first-session-step">
              <p>{row.label}</p>
              <strong>{row.value}</strong>
              <span>{row.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="quest-hero-band">
        <div className="quest-hero-copy">
          <div className="quest-pill-row">
            <span className="quest-rank-pill">
              <Star size={14} />
              {selectedChild.levelTitle}
            </span>
            <span className="quest-rank-pill">
              <Sparkles size={14} />
              {selectedChild.streak}-day streak
            </span>
          </div>

          <h2>{selectedChild.todayTheme}</h2>
          <p>{selectedChild.heroLine}</p>

          <div className="goal-chip-row quest-goal-row">
            {selectedGoals.map((goal) => (
              <span key={goal.id} className="summary-chip quest-goal-chip">
                <GoalGlyph goalId={goal.id} size={14} />
                {goal.title}
              </span>
            ))}
            {selectedSignal?.title ? (
              <span className="summary-chip quest-goal-chip">
                <Sparkles size={14} />
                {selectedSignal.title}
              </span>
            ) : null}
          </div>

          <div className="quest-stat-grid">
            <article className="quest-stat">
              <p>Quest energy</p>
              <strong>{missionBoard.questPoints}</strong>
              <span>Points built from lessons, stories, reflections, and rituals.</span>
            </article>
            <article className="quest-stat">
              <p>Missions complete</p>
              <strong>
                {missionBoard.completedMissions}/{missionBoard.totalMissions}
              </strong>
              <span>Visible weekly wins that parents and kids can both follow.</span>
            </article>
            <article className="quest-stat">
              <p>Next reward</p>
              <strong>{missionBoard.nextRewardTitle}</strong>
              <span>{missionBoard.nextRewardCopy}</span>
            </article>
          </div>
        </div>

        <div className="quest-map-panel">
          <div className="panel-head quest-map-head">
            <div>
              <p>World map</p>
              <h2>{missionBoard.focusWorld?.title ?? "KidWiz worlds"}</h2>
            </div>
            <span className="quest-map-caption">
              {missionBoard.focusWorld?.summary ??
                "Each world turns one real-life skill into an explorable learning arc."}
            </span>
          </div>

          <div className="quest-map-grid">
            {questWorldRows.map((world) => (
              <button
                key={world.id}
                className={`quest-node is-${world.state}`}
                onClick={() => onSelectTrack(world.id)}
                style={{
                  "--quest-accent": world.accent,
                  "--quest-surface": world.surface,
                }}
                type="button"
              >
                <div className="quest-node-icon">
                  <TrackGlyph category={world.category} size={18} />
                </div>
                <div className="quest-node-copy">
                  <p>{world.worldTitle}</p>
                  <strong>{world.title}</strong>
                  <span>{world.completedCount} lessons complete</span>
                </div>
                <div className="quest-node-meter">
                  <em>{world.completion}%</em>
                  <div className="quest-node-bar">
                    <div
                      className="quest-node-fill"
                      style={{ width: `${world.completion}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="quest-daily-brief">
        <div className="quest-daily-copy">
          <div className="panel-head">
            <Sparkles size={18} />
            <h2>Today&apos;s quest brief</h2>
          </div>
          <h3>{kidDailyBrief.title}</h3>
          <p>{kidDailyBrief.copy}</p>
          <span>{kidDailyBrief.progressLabel}</span>
        </div>

        <div className="quest-daily-action">
          {kidDailyBrief.nextMission ? (
            <>
              <p>Start here</p>
              <strong>{kidDailyBrief.nextMission.eyebrow}</strong>
              <button
                className="inline-action"
                onClick={() =>
                  renderMissionAction(kidDailyBrief.nextMission, questHandlers)
                }
                type="button"
              >
                {kidDailyBrief.nextMission.ctaLabel}
                <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <p>Start here</p>
              <strong>Open your course map</strong>
              <button
                className="inline-action"
                onClick={() => onSelectTrack(missionBoard.focusTrack?.id)}
                type="button"
              >
                Open map
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>

        <div className="quest-daily-reasons">
          {kidDailyBrief.reasonRows.map((row) => (
            <article key={row.label} className="quest-daily-reason">
              <p>{row.label}</p>
              <strong>{row.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="quest-celebration-reel">
        <div className="quest-celebration-copy">
          <div className="panel-head">
            <Gem size={18} />
            <h2>Celebration reel</h2>
          </div>
          <h3>{celebrationReel.title}</h3>
          <p>{celebrationReel.copy}</p>
          <span>{celebrationReel.familyLine}</span>
        </div>

        <div className="quest-celebration-score">
          <p>Total wins</p>
          <strong>{celebrationReel.totalWins}</strong>
          <span>{selectedChild.companionName} is saving these wins for the week.</span>
        </div>

        <div className="quest-celebration-frames">
          {celebrationReel.frames.map((frame) => (
            <article key={frame.label} className="quest-celebration-frame">
              <p>{frame.label}</p>
              <strong>{frame.value}</strong>
              <span>{frame.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="achievement-portfolio-panel">
        <div className="achievement-portfolio-main">
          <div>
            <div className="panel-head">
              <Star size={18} />
              <h2>{achievementPortfolio.title}</h2>
            </div>
            <div className="achievement-portfolio-copy">
              <p>{achievementPortfolio.subtitle}</p>
              <h3>{achievementPortfolio.identityLine}</h3>
              <span>{achievementPortfolio.sharePrompt}</span>
            </div>
          </div>

          <div className="achievement-artifact-score">
            <p>Portfolio artifacts</p>
            <strong>{achievementPortfolio.totalArtifacts}</strong>
            <span>Proof from lessons, stories, reflections, badges, and family practice.</span>
          </div>
        </div>

        <div className="achievement-proof-grid">
          {achievementPortfolio.proofCards.map((card) => (
            <article key={card.label} className={`achievement-proof-card is-${card.tone}`}>
              <p>{card.label}</p>
              <strong>{card.title}</strong>
              <span>{card.copy}</span>
            </article>
          ))}
        </div>

        <div className="achievement-keepsake-grid">
          {achievementPortfolio.keepsakes.map((keepsake) => (
            <article key={keepsake.label} className="achievement-keepsake-card">
              <p>{keepsake.label}</p>
              <strong>{keepsake.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="parent-share-preview-panel">
        <div className="parent-share-preview-head">
          <div>
            <div className="panel-head">
              <Printer size={18} />
              <h2>{parentSharePreview.title}</h2>
            </div>
            <p>{parentSharePreview.copy}</p>
          </div>
          <span>{parentSharePreview.artifactLabel}</span>
        </div>

        <div className="parent-share-card">
          <div className="parent-share-card-top">
            <p>{parentSharePreview.eyebrow}</p>
            <strong>{parentSharePreview.heroLine}</strong>
          </div>

          <div className="parent-share-highlight-grid">
            {parentSharePreview.highlightRows.map((row) => (
              <article key={row.label} className="parent-share-highlight">
                <p>{row.label}</p>
                <strong>{row.value}</strong>
                <span>{row.copy}</span>
              </article>
            ))}
          </div>

          <div className="parent-share-footer">
            <div>
              <p>Privacy note</p>
              <span>{parentSharePreview.privacyNote}</span>
            </div>
            <div className="parent-share-options">
              {parentSharePreview.deliveryOptions.map((option) => (
                <span key={option}>
                  <Mail size={14} />
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="quest-main-grid">
        <section className="surface-panel quest-mission-panel">
          <div className="panel-head">
            <Target size={18} />
            <h2>Weekly mission board</h2>
          </div>

          <div className="quest-mission-list">
            {missionBoard.missions.map((mission) => {
              const isComplete = mission.progress >= mission.target;

              return (
                <article
                  key={mission.id}
                  className={`quest-mission ${isComplete ? "is-complete" : ""}`}
                  style={{ "--mission-accent": mission.accent }}
                >
                  <div className="quest-mission-copy">
                    <p>{mission.eyebrow}</p>
                    <h3>{mission.title}</h3>
                    <span>{mission.copy}</span>
                  </div>

                  <div className="quest-mission-meta">
                    <div className="quest-mission-progress">
                      <strong>
                        {mission.progress}/{mission.target}
                      </strong>
                      <span>{isComplete ? "Mission complete" : mission.reward}</span>
                    </div>
                    <div className="quest-mission-bar">
                      <div
                        className="quest-mission-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((mission.progress / mission.target) * 100),
                          )}%`,
                        }}
                      />
                    </div>
                    <button
                      className="inline-action"
                      onClick={() => renderMissionAction(mission, questHandlers)}
                      type="button"
                    >
                      {mission.ctaLabel}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="quest-side-stack">
          <article className="surface-panel quest-reward-panel">
            <div className="panel-head">
              <Gem size={18} />
              <h2>Reward shelf</h2>
            </div>

            <div className="quest-reward-grid">
              <div className="signal-card quest-side-card">
                <p>Badges earned</p>
                <strong>{earnedBadgesSummary.count}</strong>
                <span>Current local badge wall progress for {selectedChild.name}.</span>
              </div>
              <div className="signal-card quest-side-card">
                <p>World in focus</p>
                <strong>{missionBoard.focusWorld?.title ?? "Open track"}</strong>
                <span>
                  {missionBoard.focusTrack?.project ??
                    "Pick a focus track to unlock the next capstone."}
                </span>
              </div>
            </div>
          </article>

          <article className="surface-panel quest-rhythm-panel">
            <div className="panel-head">
              <Compass size={18} />
              <h2>Today&apos;s rhythm</h2>
            </div>

            <div className="signal-card quest-rhythm-summary">
              <p>Week completion</p>
              <strong>{Math.round(weeklyCompletion)}%</strong>
              <span>Complete small steps to keep the routine feeling light and repeatable.</span>
            </div>

            <div className="journey-list quest-journey-list">
              {dailyJourneys.map((journey) => {
                const complete = childCompletedJourneyIds.includes(journey.id);

                return (
                  <button
                    key={journey.id}
                    className={`journey-row ${complete ? "is-complete" : ""}`}
                    onClick={() => onToggleJourney(journey.id)}
                    type="button"
                  >
                    <div>
                      <p>{journey.length}</p>
                      <h3>{journey.title}</h3>
                      <span>{journey.focus}</span>
                    </div>
                    <span className="journey-check">
                      {complete ? <Sparkles size={16} /> : journey.order}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>
        </section>
      </div>

      <div className="quest-lower-grid">
        <section className="surface-panel">
          <div className="panel-head">
            <BookOpen size={18} />
            <h2>Playlist runway</h2>
          </div>

          <div className="list-grid">
            {overviewPlaylistPreview.map((lesson) => (
              <button
                key={lesson.id}
                className="list-row"
                onClick={() => onOpenLesson(lesson.id)}
                type="button"
              >
                <div>
                  <strong>{lesson.title}</strong>
                  <span>{lesson.trackTitle}</span>
                </div>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <NotebookPen size={18} />
            <h2>Parent-ready moments</h2>
          </div>

          <div className="quest-conversation-list">
            <article className="quest-conversation-row">
              <strong>{missionBoard.recommendedStory?.title ?? "Story prompt ready"}</strong>
              <span>
                {missionBoard.recommendedStory?.reflectionPrompt ??
                  "Use one branching story this week to open a calmer family conversation."}
              </span>
            </article>
            <article className="quest-conversation-row">
              <strong>{selectedChild.companionName} says to notice the small win</strong>
              <span>
                Ask what felt easier after the first brave step instead of asking whether
                it was perfect.
              </span>
            </article>
            <article className="quest-conversation-row">
              <strong>Family repair cue</strong>
              <span>
                Keep one sentence ready: &quot;What happened, what did it feel like, and
                what should we try next time?&quot;
              </span>
            </article>
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Why this week matters</h2>
          </div>

          <div className="quest-reason-list">
            <div className="signal-card quest-side-card">
              <p>Focus track</p>
              <strong>{missionBoard.focusTrack?.title ?? "Not set yet"}</strong>
              <span>
                {missionBoard.focusTrack?.summary ??
                  "Choose a focus track from the dashboard to shape the week."}
              </span>
            </div>
            <div className="signal-card quest-side-card">
              <p>Family goals</p>
              <strong>{selectedGoals.map((goal) => goal.title).join(", ")}</strong>
              <span>KidWiz is aiming beyond school content and into real-life growth.</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
