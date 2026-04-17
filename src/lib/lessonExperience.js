function buildLessonStage(id, label, title, copy) {
  return {
    id,
    label,
    title,
    copy,
  };
}

function buildCommonStarters({
  childName,
  track,
  lesson,
  celebrationStyle,
  nextRitual,
  parentPrompt,
  reflectionPrompt,
  celebrationLine,
}) {
  return {
    childReflectionStarter: `${childName} reflection: ${reflectionPrompt}`,
    parentNoteStarter: [
      `${childName} worked on ${track.title}: ${lesson.title}.`,
      `Parent follow-through: ${parentPrompt}`,
      `Celebrate with ${celebrationStyle.title.toLowerCase()}: ${celebrationLine}`,
      `Loop it into ${nextRitual.title}: ${nextRitual.copy}`,
    ].join(" "),
  };
}

function buildWonderLabExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "The clue that changed my idea today was...";
  const parentPrompt = "Ask what evidence changed the first guess.";
  const celebrationLine =
    "Celebrate the thinking shift and the evidence that supported it.";

  return {
    trackPlaybookLabel: "Experiment playbook",
    headerCopy:
      "Wonder Lab lessons should feel like mini experiments with a clue, a test, and a clear explanation.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Observe",
        "Spot the clue",
        `${lesson.coachModes[coachMode]} Start by noticing the strongest clue in ${lesson.activity}`,
      ),
      buildLessonStage(
        "activity",
        "Test",
        "Run the experiment",
        "Make a prediction, try the idea, and notice what changes after the test.",
      ),
      buildLessonStage(
        "parent-bridge",
        "Explain",
        "Show the evidence",
        `${lesson.parentCue} Then ask what proof made the answer stronger.`,
      ),
    ],
    proofTitle: "Experiment it in real life",
    proofCopy: `${childName} can make one prediction at home today before hearing the answer, then explain what evidence proved it right or wrong.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by naming the revision, not just the result.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildStoryStudioExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "The line that felt most alive today was...";
  const parentPrompt = "Ask which exact word or detail made the scene land better.";
  const celebrationLine =
    "Celebrate the sentence that got clearer, sharper, or more alive on the second pass.";

  return {
    trackPlaybookLabel: "Writing playbook",
    headerCopy:
      "Story Studio lessons should feel like drafting, tuning, and sharing a stronger line instead of just reading advice.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Draft",
        "Find the first line",
        `${lesson.coachModes[coachMode]} Start with one sentence that has a clear voice or feeling.`,
      ),
      buildLessonStage(
        "activity",
        "Tune",
        "Make it more alive",
        `${lesson.activity} Push for one stronger detail, verb, or feeling shift.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Share",
        "Explain the choice",
        `${lesson.parentCue} Then ask why that line or word worked better.`,
      ),
    ],
    proofTitle: "Share one stronger line",
    proofCopy: `${childName} can read one revised line out loud tonight and explain what changed between the first version and the better version.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by praising the revision, not only the final line.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildBraveHeartExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "One brave line I can really believe is...";
  const parentPrompt = "Ask which brave sentence feels believable enough to use for real.";
  const celebrationLine =
    "Celebrate the brave action and the recovery, not the absence of nerves.";

  return {
    trackPlaybookLabel: "Confidence playbook",
    headerCopy:
      "Brave Heart lessons should feel like naming the wobble, choosing a brave line, and trying one real move.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Notice",
        "Name the wobble",
        `${lesson.coachModes[coachMode]} Start by spotting the body clue or thought that shows up first.`,
      ),
      buildLessonStage(
        "activity",
        "Choose",
        "Pick the brave line",
        `${lesson.activity} Keep the line short enough to remember under pressure.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Act",
        "Take one real step",
        `${lesson.parentCue} Then pick the smallest brave move to try today.`,
      ),
    ],
    proofTitle: "Use the brave line for real",
    proofCopy: `${childName} can say the brave line once before school, sports, or a hard conversation today and then name what happened next.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by praising the small brave move that actually happened.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildMoneyMovesExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "One tradeoff I noticed today was...";
  const parentPrompt = "Ask what they kept, what they gave up, and why the tradeoff felt worth it.";
  const celebrationLine =
    "Celebrate the reasoning behind the choice, not just the cheapest answer.";

  return {
    trackPlaybookLabel: "Money playbook",
    headerCopy:
      "Money Moves lessons should feel like comparing options, choosing a tradeoff, and explaining the why behind the decision.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Compare",
        "Spot the options",
        `${lesson.coachModes[coachMode]} Look for the tradeoff hidden inside ${lesson.activity}`,
      ),
      buildLessonStage(
        "activity",
        "Decide",
        "Pick the best value",
        "Choose the option that makes the most sense and explain what you are giving up to keep something else.",
      ),
      buildLessonStage(
        "parent-bridge",
        "Explain",
        "Defend the tradeoff",
        `${lesson.parentCue} Then connect the choice to a real family decision.`,
      ),
    ],
    proofTitle: "Try one real money choice",
    proofCopy: `${childName} can compare two small real-world options at home today and explain which value mattered more than just grabbing the first thing.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by naming the thoughtful tradeoff they made.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildHomeTeamExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "A sentence I could use at home is...";
  const parentPrompt = "Ask which repair or listening line they could actually use with a real person at home.";
  const celebrationLine =
    "Celebrate the sentence they can really use, especially if it helps repair tension.";

  return {
    trackPlaybookLabel: "Family relationship playbook",
    headerCopy:
      "Home Team lessons should feel like pausing, choosing a repair line, and trying it with the people who matter most.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Pause",
        "Notice the moment",
        `${lesson.coachModes[coachMode]} Slow the moment down before choosing a line.`,
      ),
      buildLessonStage(
        "activity",
        "Repair",
        "Practice the sentence",
        `${lesson.activity} Try the line in a calm tone that still feels honest.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Use it",
        "Bring it home",
        `${lesson.parentCue} Then decide where that sentence could help this week.`,
      ),
    ],
    proofTitle: "Try one family sentence for real",
    proofCopy: `${childName} can use one repair, listening, or appreciation line at home this week and then talk about how the other person responded.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by naming the follow-through it took to say the line out loud.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildDigitalDetectivesExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "One clue I will watch for online is...";
  const parentPrompt = "Ask which clue would make them pause before clicking, sharing, or replying.";
  const celebrationLine =
    "Celebrate the pause and the safer choice before anything goes wrong.";

  return {
    trackPlaybookLabel: "Digital safety playbook",
    headerCopy:
      "Digital Detectives lessons should feel like spotting the clue, protecting the boundary, and choosing the safest next move.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Spot",
        "Notice the clue",
        `${lesson.coachModes[coachMode]} Start by naming the first sign that something feels off.`,
      ),
      buildLessonStage(
        "activity",
        "Protect",
        "Choose the boundary",
        `${lesson.activity} Focus on the move that protects privacy, kindness, or accuracy.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Decide",
        "Choose the safe next step",
        `${lesson.parentCue} Then decide what to pause, block, check, or ask an adult about.`,
      ),
    ],
    proofTitle: "Run a quick digital check",
    proofCopy: `${childName} can audit one message, video, or request today and explain the clue that helps them pause before acting.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by naming the safe pause before the click.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildFocusForgeExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "The tiny first step that helps me start is...";
  const parentPrompt = "Ask which first minute was small enough to begin even on a hard day.";
  const celebrationLine =
    "Celebrate the start that actually happened and the follow-through that came after it.";

  return {
    trackPlaybookLabel: "Momentum playbook",
    headerCopy:
      "Focus Forge lessons should feel like shrinking the start, beginning the first minute, and tracking the follow-through.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Shrink",
        "Make the start tiny",
        `${lesson.coachModes[coachMode]} Cut the job down until it feels possible to begin.`,
      ),
      buildLessonStage(
        "activity",
        "Begin",
        "Start the first minute",
        `${lesson.activity} Focus only on the first tiny move, not the whole task.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Track",
        "Notice the follow-through",
        `${lesson.parentCue} Then ask what helped the first minute become a few more.`,
      ),
    ],
    proofTitle: "Use the tiny-start plan today",
    proofCopy: `${childName} can use one tiny-start routine on a real task today and then name what made beginning easier than waiting to feel ready.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by calling out the first minute and the follow-through after it.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

function buildBodyBoundariesExperience(context) {
  const { childName, coachMode, lesson, track, celebrationStyle, nextRitual } = context;
  const reflectionPrompt = "A body boundary I can say clearly is...";
  const parentPrompt = "Ask which clear boundary line they could use and which trusted adult they would tell next.";
  const celebrationLine =
    "Celebrate the clear boundary sentence and the confidence to ask for support.";

  return {
    trackPlaybookLabel: "Body safety playbook",
    headerCopy:
      "Body and Boundaries lessons should feel like knowing the boundary, saying it clearly, and naming the trusted support move.",
    stages: [
      buildLessonStage(
        "coach-cue",
        "Know",
        "Name the boundary",
        `${lesson.coachModes[coachMode]} Start with the body fact or boundary that matters in this lesson.`,
      ),
      buildLessonStage(
        "activity",
        "Say",
        "Practice the line",
        `${lesson.activity} Keep the line clear, short, and easy to remember.`,
      ),
      buildLessonStage(
        "parent-bridge",
        "Support",
        "Pick the trusted adult move",
        `${lesson.parentCue} Then name who can help if the boundary is ignored.`,
      ),
    ],
    proofTitle: "Practice the clear boundary line",
    proofCopy: `${childName} can practice one calm boundary phrase in a safe moment and then name the adult they would go to if they still needed help.`,
    reflectionPrompt,
    familyMissionTitle: "Tonight's family mission",
    familyMissionCopy: `${nextRitual.title}: ${nextRitual.copy}`,
    parentPrompts: [
      { label: "Ask", text: lesson.parentCue },
      { label: "Push deeper", text: parentPrompt },
      {
        label: "Celebrate",
        text: `${celebrationStyle.title} by naming the clarity of the boundary line.`,
      },
    ],
    celebrationLine,
    ...buildCommonStarters({
      childName,
      track,
      lesson,
      celebrationStyle,
      nextRitual,
      parentPrompt,
      reflectionPrompt,
      celebrationLine,
    }),
  };
}

const lessonExperienceBuilders = {
  "wonder-lab": buildWonderLabExperience,
  "story-studio": buildStoryStudioExperience,
  "brave-heart": buildBraveHeartExperience,
  "money-moves": buildMoneyMovesExperience,
  "home-team": buildHomeTeamExperience,
  "digital-detectives": buildDigitalDetectivesExperience,
  "focus-forge": buildFocusForgeExperience,
  "body-boundaries": buildBodyBoundariesExperience,
};

export function buildLessonExperience(context) {
  const builder = lessonExperienceBuilders[context.track.id] ?? buildWonderLabExperience;
  return builder(context);
}
