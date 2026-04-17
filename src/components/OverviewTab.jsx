import { Award, BadgeCheck, Brain, Check, ChevronRight, Star } from "lucide-react";
import { BadgeGlyph } from "../lib/uiConfig";

export function OverviewTab({
  childCompletedJourneyIds,
  dailyJourneys,
  earnedBadges,
  nextBadge,
  nextRitual,
  onOpenLesson,
  onToggleJourney,
  overviewPlaylistPreview,
  selectedChild,
  selectedGoals,
  strongestTrack,
  todayLabel,
  trackProgressRows,
  weeklyCompletion,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">{todayLabel}</p>
        <h1>
          {selectedChild.name}&apos;s week is built around real progress, not just
          screen time.
        </h1>
        <p>
          Strongest track: {strongestTrack.title}. Family priorities:{" "}
          {selectedGoals.map((goal) => goal.title).join(", ")}.
        </p>
      </div>

      <div className="overview-hero-grid">
        <article className="hero-surface">
          <div className="hero-surface-head">
            <div>
              <p>{selectedChild.levelTitle}</p>
              <h2>{selectedChild.todayTheme}</h2>
            </div>
            <div className="mission-chip">
              <Star size={16} />
              <span>{selectedChild.streak}-day streak</span>
            </div>
          </div>

          <p className="hero-surface-copy">{selectedChild.heroLine}</p>

          <div className="journey-list">
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
                    {complete ? <Check size={16} /> : journey.order}
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="hero-surface compact-surface">
          <div className="signal-stack">
            <div className="signal-card">
              <p>Week completion</p>
              <strong>{Math.round(weeklyCompletion)}%</strong>
              <span>Daily learning rhythm completed so far.</span>
            </div>
            <div className="signal-card">
              <p>Next ritual</p>
              <strong>{nextRitual.title}</strong>
              <span>{nextRitual.copy}</span>
            </div>
            <div className="signal-card">
              <p>Next badge</p>
              <strong>{nextBadge ? nextBadge.title : "Badge wall complete"}</strong>
              <span>
                {nextBadge
                  ? nextBadge.copy
                  : "You have unlocked every badge in the current local demo."}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div className="overview-grid">
        <section className="surface-panel">
          <div className="panel-head">
            <Brain size={18} />
            <h2>Weekly playlist</h2>
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
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <BadgeCheck size={18} />
            <h2>Track progress</h2>
          </div>
          <div className="progress-list">
            {trackProgressRows.map((track) => (
              <div key={track.id} className="progress-row">
                <div className="progress-row-head">
                  <strong>{track.title}</strong>
                  <span>{track.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${track.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Award size={18} />
            <h2>Badge wall</h2>
          </div>
          <div className="badge-grid">
            {earnedBadges.map((badge) => (
              <article key={badge.id} className="badge-tile">
                <div className="badge-icon">
                  <BadgeGlyph iconKey={badge.iconKey} />
                </div>
                <strong>{badge.title}</strong>
                <span>{badge.copy}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
