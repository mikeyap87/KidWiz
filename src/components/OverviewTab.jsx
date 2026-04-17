import {
  ArrowRight,
  BookOpen,
  Compass,
  Gem,
  NotebookPen,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
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
  childCompletedJourneyIds,
  dailyJourneys,
  earnedBadgesCount,
  missionBoard,
  onOpenFamily,
  onOpenJournal,
  onOpenLesson,
  onOpenStory,
  onSelectTrack,
  onToggleJourney,
  overviewPlaylistPreview,
  questWorldRows,
  selectedChild,
  selectedGoals,
  todayLabel,
  weeklyCompletion,
}) {
  const questHandlers = {
    onOpenFamily,
    onOpenJournal,
    onOpenLesson,
    onOpenStory,
  };

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
                <strong>{earnedBadgesCount}</strong>
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
