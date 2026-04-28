import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CircleHelp,
  Map,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { TrackGlyph } from "../lib/uiConfig";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

const trackPositions = [
  { left: "18%", top: "64%" },
  { left: "35%", top: "34%" },
  { left: "54%", top: "58%" },
  { left: "72%", top: "34%" },
  { left: "82%", top: "66%" },
  { left: "45%", top: "76%" },
];

export function OverviewTab({
  selectedChildWorkspace,
  appState,
  onOpenFamily,
  onOpenJournal,
  onOpenLesson,
  onOpenStory,
  onSelectTab,
  onSelectTrack,
  recommendedLesson,
  selectedSignal,
  selectedWeeklyTarget,
  selectedChild,
  visibleTracks,
  weeklyCompletion,
}) {
  const recommendedStory = selectedChildWorkspace.recommendedStory;
  const focusTrack =
    visibleTracks.find((track) => track.id === selectedWeeklyTarget.focusTrackId) ??
    visibleTracks[0];
  const weeklyProgress = selectedChildWorkspace.overallTargetProgress ?? weeklyCompletion;

  return (
    <section className="kidwiz-game-shell game-map-room" aria-label="KidWiz quest map room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Quest map room</p>
            <h1>{selectedChild.name}'s world map</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Quest map status">
          <span className="game-stat">
            <strong>{weeklyProgress}%</strong>
            week plan
          </span>
          <span className="game-stat">
            <strong>{visibleTracks.length}</strong>
            zones
          </span>
          <span className="game-stat">
            <strong>{appState.bodyBoundariesUnlocked ? "Open" : "Locked"}</strong>
            safety
          </span>
        </div>
      </header>

      <div className="game-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "overview" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-stage" aria-label="Quest world map">
          <div className="game-stage-map game-world-map">
            <div className="game-companion-card">
              <img alt="" src="/brand/kidwiz-bot.png" />
              <div>
                <span>Map guide</span>
                <strong>Choose a zone or follow the glowing mission path.</strong>
              </div>
            </div>

            {visibleTracks.slice(0, 6).map((track, index) => {
              const position = trackPositions[index % trackPositions.length];
              const isFocus = track.id === focusTrack?.id;
              const trackLabel = track.shortTitle ?? track.title;

              return (
                <button
                  key={track.id}
                  aria-label={`Open ${track.title} zone`}
                  className={`game-zone-node ${isFocus ? "is-selected" : ""}`}
                  onClick={() => onSelectTrack(track.id)}
                  style={position}
                  type="button"
                >
                  <TrackGlyph category={track.category} size={18} />
                  <span>{trackLabel}</span>
                </button>
              );
            })}
          </div>

          <article className="game-mission-card game-map-mission">
            <p>Recommended path</p>
            <h2>{recommendedLesson?.lesson.title ?? focusTrack?.title ?? "Pick a zone"}</h2>
            <span>
              {recommendedLesson
                ? `${recommendedLesson.reason} in ${recommendedLesson.track.title}.`
                : "Choose a learning zone to open the next mission."}
            </span>
            <div className="game-mission-actions">
              <button
                className="solid-button"
                onClick={() =>
                  recommendedLesson
                    ? onOpenLesson(recommendedLesson.lesson.id)
                    : onSelectTrack(focusTrack.id)
                }
                type="button"
              >
                Start path
                <ArrowRight size={16} />
              </button>
              <button
                className="ghost-button ghost-button-dark"
                onClick={() =>
                  recommendedStory
                    ? onOpenStory(recommendedStory.id, selectedChild.id)
                    : onOpenJournal()
                }
                type="button"
              >
                Side quest
              </button>
            </div>
          </article>
        </main>

        <aside className="game-console" aria-label="Quest map console">
          <div className="game-console-tabs" role="tablist">
            <button className="is-active" type="button">Map</button>
            <button onClick={() => onSelectTab("courses")} type="button">Learn</button>
            <button onClick={onOpenFamily} type="button">Parent</button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <Trophy size={22} />
              <div>
                <p>Mission targets</p>
                <h2>{focusTrack?.title ?? "Focus zone"}</h2>
              </div>
            </div>
            <div className="game-meter">
              <span style={{ width: `${weeklyProgress}%` }} />
            </div>
            <p>
              {selectedChild.name} is aiming for {selectedWeeklyTarget.lessons} lessons,
              {` ${selectedWeeklyTarget.stories}`} stories, and
              {` ${selectedWeeklyTarget.reflections}`} reflections this week.
            </p>
            {selectedSignal ? (
              <article className="game-signal-card">
                <p>Live signal</p>
                <strong>{selectedSignal.title}</strong>
                <span>{selectedSignal.parentCopy}</span>
              </article>
            ) : null}
          </div>
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Quest map actions">
        <button onClick={() => onSelectTab("courses")} type="button">
          <BookOpen size={16} />
          Learn subject
        </button>
        <button onClick={() => onSelectTab("coach")} type="button">
          <Bot size={16} />
          Ask tutor
        </button>
        <button
          onClick={() =>
            recommendedStory
              ? onOpenStory(recommendedStory.id, selectedChild.id)
              : onSelectTab("stories")
          }
          type="button"
        >
          <MessagesSquare size={16} />
          Story
        </button>
        <button onClick={onOpenJournal} type="button">
          <NotebookPen size={16} />
          Reflect
        </button>
        <button onClick={onOpenFamily} type="button">
          <ShieldCheck size={16} />
          Parent controls
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <CircleHelp size={16} />
          Help
        </button>
      </footer>
    </section>
  );
}
