export function StoriesTab({
  activeStory,
  activeStoryChoice,
  childStoryChoices,
  onSelectChoice,
  onSelectStory,
  storyEpisodes,
}) {
  const completedStoryCount = Object.keys(childStoryChoices).length;

  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Story practice</p>
        <h1>Children can rehearse hard moments before they happen in real life.</h1>
        <p>
          Each story now includes richer branches and a parent follow-up cue after
          the choice is made.
        </p>
      </div>

      <div className="story-progress-strip">
        <article className="story-progress-card">
          <p>Stories explored</p>
          <strong>{completedStoryCount}</strong>
          <span>Choices already saved across the current story library.</span>
        </article>
        <article className="story-progress-card">
          <p>Current state</p>
          <strong>{activeStoryChoice ? "Path saved" : "Choice open"}</strong>
          <span>
            {activeStoryChoice
              ? "The child choice is locked in and the family cue is ready below."
              : "Pick the option that feels strongest and reveal the follow-up cue."}
          </span>
        </article>
      </div>

      <div className="story-layout">
        <aside className="story-menu">
          {storyEpisodes.map((story) => (
            <button
              key={story.id}
              className={`story-menu-item ${
                activeStory.id === story.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectStory(story.id)}
              type="button"
            >
              <strong>{story.title}</strong>
              <span>
                {story.focus} · {childStoryChoices[story.id] ? "completed" : "open"}
              </span>
            </button>
          ))}
        </aside>

        <section className="surface-panel story-stage">
          <div className="story-stage-head">
            <div>
              <p>{activeStory.focus}</p>
              <h2>{activeStory.title}</h2>
            </div>
            <span>{activeStory.ageBand}</span>
          </div>

          <p className="story-body">{activeStory.setup}</p>

          <div className={`story-outcome-card ${activeStoryChoice ? "is-complete" : ""}`}>
            <p>{activeStoryChoice ? "Saved story move" : "Choose a path"}</p>
            <strong>
              {activeStoryChoice
                ? activeStoryChoice.title
                : "Pick the response that feels most true for this moment."}
            </strong>
            <span>
              {activeStoryChoice
                ? activeStoryChoice.result
                : "There is no perfect answer here. The point is to rehearse a real move before life asks for it."}
            </span>
          </div>

          <div className="choice-list">
            {activeStory.choices.map((choice) => (
              <button
                key={choice.id}
                className={`choice-row ${
                  activeStoryChoice?.id === choice.id ? "is-selected" : ""
                }`}
                onClick={() => onSelectChoice(choice.id)}
                type="button"
              >
                <strong>{choice.title}</strong>
                <span>{choice.result}</span>
              </button>
            ))}
          </div>

          <div className="reflection-block">
            <p>Reflection prompt</p>
            <strong>{activeStory.reflectionPrompt}</strong>
            <span>
              {activeStoryChoice
                ? `Parent cue: ${activeStoryChoice.parentCue}`
                : "Choose a path to reveal the family follow-up cue."}
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}
