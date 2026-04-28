import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  Check,
  CircleHelp,
  Map,
  MessagesSquare,
  NotebookPen,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { buildStorySkillDebrief } from "../lib/progression";

const gameNavItems = [
  { id: "dashboard", label: "Today", icon: Target },
  { id: "overview", label: "Map", icon: Map },
  { id: "courses", label: "Learn", icon: Brain },
  { id: "coach", label: "Tutor", icon: Bot },
  { id: "stories", label: "Story", icon: MessagesSquare },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Parent", icon: Users },
];

export function StoriesTab({
  activeStory,
  activeStoryChoice,
  childCompletedLessonIds,
  childStoryChoices,
  onOpenLesson,
  onSelectChoice,
  onSelectStory,
  onSelectTab,
  selectedChild,
  storyEpisodes,
  visibleTracks,
}) {
  const completedStoryCount = Object.keys(childStoryChoices).length;
  const skillDebrief = buildStorySkillDebrief({
    story: activeStory,
    choice: activeStoryChoice,
    visibleTracks,
    completedLessonIds: childCompletedLessonIds,
  });

  return (
    <section className="kidwiz-game-shell game-story-room" aria-label="KidWiz story room">
      <header className="game-hud">
        <div className="game-brand">
          <img alt="KidWiz" src="/brand/kidwiz-logo.svg" />
          <div>
            <p>Story room for {selectedChild.name}</p>
            <h1>{activeStory.title}</h1>
          </div>
        </div>

        <div className="game-hud-stats" aria-label="Story status">
          <span className="game-stat">
            <strong>{completedStoryCount}</strong>
            stories
          </span>
          <span className="game-stat">
            <strong>{activeStory.ageBand}</strong>
            age band
          </span>
          <span className="game-stat">
            <strong>{activeStoryChoice ? "Saved" : "Open"}</strong>
            choice
          </span>
        </div>
      </header>

      <div className="game-board game-story-board">
        <nav className="game-rail" aria-label="KidWiz game areas">
          {gameNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={item.id === "stories" ? "is-active" : ""}
                onClick={() => onSelectTab(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="game-story-stage" aria-label="Story branch stage">
          <aside className="game-story-list" aria-label="Story branches">
            {storyEpisodes.slice(0, 7).map((story) => (
              <button
                key={story.id}
                className={activeStory.id === story.id ? "is-selected" : ""}
                onClick={() => onSelectStory(story.id)}
                type="button"
              >
                {childStoryChoices[story.id] ? <Check size={14} /> : <BookOpen size={14} />}
                <span>{story.title}</span>
              </button>
            ))}
          </aside>

          <section className="game-story-play">
            <div className="game-story-scene">
              <div>
                <p>{activeStory.focus}</p>
                <h2>{activeStory.title}</h2>
                <span>{activeStory.setup}</span>
              </div>
              <img
                alt=""
                src="/assets/generated/kidwiz-story-journal.jpg"
              />
            </div>

            <div className="game-story-choice-grid">
              {activeStory.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={activeStoryChoice?.id === choice.id ? "is-selected" : ""}
                  onClick={() => onSelectChoice(choice.id)}
                  type="button"
                >
                  <p>{activeStoryChoice?.id === choice.id ? "Saved move" : "Path"}</p>
                  <strong>{choice.title}</strong>
                  <span>{choice.result}</span>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="game-console" aria-label="Story console">
          <div className="game-console-tabs" role="tablist">
            <button className="is-active" type="button">Debrief</button>
            <button onClick={() => onSelectTab("journal")} type="button">Reflect</button>
            <button onClick={() => onSelectTab("family")} type="button">Parent</button>
          </div>

          <div className="game-console-panel">
            <div className="game-console-hero">
              <Trophy size={22} />
              <div>
                <p>{activeStoryChoice ? "Story move saved" : "Choose a path"}</p>
                <h2>{activeStoryChoice?.title ?? activeStory.focus}</h2>
              </div>
            </div>
            <article className="game-signal-card">
              <p>Reflection prompt</p>
              <strong>{activeStory.reflectionPrompt}</strong>
              <span>
                {activeStoryChoice
                  ? activeStoryChoice.parentCue
                  : "Choose a path to reveal the family follow-up cue."}
              </span>
            </article>
            {skillDebrief ? (
              <article className="game-signal-card">
                <p>Skill debrief</p>
                <strong>{skillDebrief.title}</strong>
                <span>{skillDebrief.meaning}</span>
              </article>
            ) : null}
          </div>
        </aside>
      </div>

      <footer className="game-action-bar" aria-label="Story actions">
        <button onClick={() => onSelectTab("overview")} type="button">
          <Map size={16} />
          Map
        </button>
        <button onClick={() => onSelectTab("journal")} type="button">
          <NotebookPen size={16} />
          Reflect
        </button>
        <button onClick={() => onSelectTab("coach")} type="button">
          <Bot size={16} />
          Tutor
        </button>
        {skillDebrief?.recommendedLesson ? (
          <button
            onClick={() => onOpenLesson(skillDebrief.recommendedLesson.lesson.id)}
            type="button"
          >
            <ArrowRight size={16} />
            Lesson
          </button>
        ) : (
          <button onClick={() => onSelectTab("courses")} type="button">
            <Brain size={16} />
            Learn
          </button>
        )}
        <button onClick={() => onSelectTab("family")} type="button">
          <Users size={16} />
          Parent
        </button>
        <button onClick={() => onSelectTab("help")} type="button">
          <CircleHelp size={16} />
          Help
        </button>
      </footer>
    </section>
  );
}
