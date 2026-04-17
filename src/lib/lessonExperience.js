function buildLessonStage(id, label, title, copy) {
  return {
    id,
    label,
    title,
    copy,
  };
}

function buildPracticePanel(variant, title, prompt, helper, options, unselectedNote) {
  return {
    variant,
    title,
    prompt,
    helper,
    options,
    unselectedNote,
  };
}

function getAgeLens(childAge) {
  if (childAge <= 8) {
    return {
      id: "younger",
      label: "Age 6-8 lens",
      summary:
        "Shorter steps, concrete examples, and a nearby grown-up to anchor the skill.",
    };
  }

  return {
    id: "older",
    label: "Age 9-12 lens",
    summary:
      "More ownership, clearer tradeoffs, and stronger self-explanation built into the practice.",
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

const youngerReflectionPrompts = {
  "wonder-lab": "The clue I noticed first was...",
  "story-studio": "The line I liked best was...",
  "brave-heart": "One brave thing I could try is...",
  "money-moves": "The money choice I would try is...",
  "home-team": "The sentence I could say at home is...",
  "digital-detectives": "The clue that would make me pause is...",
  "focus-forge": "The tiny first step I could start with is...",
  "body-boundaries": "The boundary line I can say clearly is...",
};

const olderReflectionPrompts = {
  "wonder-lab": "What evidence would make me change my mind next time?",
  "story-studio": "What exact word or detail made the writing stronger?",
  "brave-heart": "Which brave move would build the most confidence through action?",
  "money-moves": "Which tradeoff best matches what matters most right now?",
  "home-team": "Which line would improve trust fastest in a real conversation?",
  "digital-detectives": "Which clue should change my next move online, and why?",
  "focus-forge": "Which tiny-start move would lower friction the most, and why?",
  "body-boundaries": "Which boundary line feels strongest and what support move follows it?",
};

function getReflectionPromptForAge(trackId, basePrompt, ageLensId) {
  if (ageLensId === "younger") {
    return youngerReflectionPrompts[trackId] ?? basePrompt;
  }

  return olderReflectionPrompts[trackId] ?? basePrompt;
}

function adjustPracticePanelForAge(practicePanel, ageLensId) {
  const isYounger = ageLensId === "younger";

  return {
    ...practicePanel,
    prompt: `${practicePanel.prompt} ${
      isYounger
        ? "Pick the move that feels easiest to try first."
        : "Pick the move that best matches the strategy you want to test."
    }`,
    helper: `${practicePanel.helper} ${
      isYounger
        ? "Keep it concrete with one real example from today."
        : "Push for the reason behind the choice, not only the pick."
    }`,
    options: practicePanel.options.map((option) => ({
      ...option,
      copy: isYounger
        ? option.copy
        : `${option.copy} Then explain why this move fits best.`,
    })),
  };
}

function buildWonderLabPracticePanel({ lesson }) {
  return buildPracticePanel(
    "cards",
    "Experiment board",
    `Which test path fits ${lesson.title.toLowerCase()} best?`,
    "Pick the move that feels strongest so the lesson has one clear experiment path.",
    [
      {
        id: "clue-first",
        eyebrow: "Clue first",
        title: "Circle the strongest clue",
        copy: "Start by naming the clue that matters before making the guess.",
        outcome: "This choice builds better evidence language before the answer lands.",
      },
      {
        id: "predict-then-test",
        eyebrow: "Predict",
        title: "Say the guess out loud",
        copy: "Make the first prediction visible, then test whether it holds up.",
        outcome: "This choice turns the lesson into a real experiment instead of quiet guessing.",
      },
      {
        id: "revise-with-proof",
        eyebrow: "Revise",
        title: "Change the idea with proof",
        copy: "Use the result to improve the first idea without treating the first guess like failure.",
        outcome: "This choice trains revision and evidence over perfection.",
      },
    ],
    "No experiment path saved yet.",
  );
}

function buildStoryStudioPracticePanel({ lesson }) {
  return buildPracticePanel(
    "script",
    "Line workshop",
    `Which writing move sharpens ${lesson.title.toLowerCase()} most?`,
    "Choose the line move that feels strongest, then carry that language into the journal.",
    [
      {
        id: "strong-verb",
        eyebrow: "Verb swap",
        title: "\"Swap the flat verb for one that moves.\"",
        copy: "Push the sentence by changing the weakest verb first.",
        outcome: "This choice helps the writing feel more alive without adding clutter.",
      },
      {
        id: "specific-detail",
        eyebrow: "Detail",
        title: "\"Add one detail the reader can picture.\"",
        copy: "Pick a concrete image instead of another general sentence.",
        outcome: "This choice improves clarity and voice at the same time.",
      },
      {
        id: "emotion-shift",
        eyebrow: "Feeling shift",
        title: "\"Show the feeling change inside the action.\"",
        copy: "Let the sentence show what changed, not just what happened.",
        outcome: "This choice makes the scene land with more emotional range.",
      },
    ],
    "No writing move saved yet.",
  );
}

function buildBraveHeartPracticePanel() {
  return buildPracticePanel(
    "ladder",
    "Brave move ladder",
    "Which brave move feels possible today?",
    "Save one rung on the ladder so confidence feels actionable instead of abstract.",
    [
      {
        id: "tiny-line",
        step: "1",
        title: "Say the brave line once",
        copy: "Use the sentence in a low-stakes moment first.",
        outcome: "This choice builds belief through repetition before the bigger moment arrives.",
      },
      {
        id: "one-small-step",
        step: "2",
        title: "Take the smallest visible step",
        copy: "Raise your hand, walk over, ask one question, or start the first rep.",
        outcome: "This choice turns bravery into one doable action, not a giant leap.",
      },
      {
        id: "bounce-back-line",
        step: "3",
        title: "Use the recovery line after a wobble",
        copy: "Plan the sentence you will use if the first try feels rough.",
        outcome: "This choice teaches that confidence includes repair, not just bold starts.",
      },
    ],
    "No brave move saved yet.",
  );
}

function buildMoneyMovesPracticePanel() {
  return buildPracticePanel(
    "tradeoff",
    "Tradeoff board",
    "Which money choice teaches the clearest tradeoff?",
    "Choose the option that best shows how one yes usually means one no somewhere else.",
    [
      {
        id: "save-first",
        eyebrow: "Save",
        title: "Keep the fun extra for later",
        copy: "Protect the longer goal even if the shorter reward looks tempting.",
        outcome: "This choice makes delayed reward visible and intentional.",
      },
      {
        id: "value-now",
        eyebrow: "Value",
        title: "Spend on the stronger value",
        copy: "Choose the option that gives the best use, not only the lowest number.",
        outcome: "This choice teaches value, not just cheapness.",
      },
      {
        id: "split-choice",
        eyebrow: "Balance",
        title: "Split the choice into save and spend",
        copy: "Keep part for later and spend part with intention.",
        outcome: "This choice shows that tradeoffs can be balanced instead of all-or-nothing.",
      },
    ],
    "No money choice saved yet.",
  );
}

function buildHomeTeamPracticePanel() {
  return buildPracticePanel(
    "dialogue",
    "Conversation rehearsal",
    "Which home-team line would you try first?",
    "Save the sentence that feels honest enough to use with a real person at home.",
    [
      {
        id: "repair-line",
        speaker: "Repair",
        title: "\"I want to fix this. Can I try again?\"",
        copy: "Best when the moment needs repair before explanation.",
        outcome: "This choice lowers defensiveness and opens the door to repair.",
      },
      {
        id: "listening-line",
        speaker: "Listen",
        title: "\"Tell me your side first. I want to get it right.\"",
        copy: "Best when the other person needs to feel heard before the problem gets solved.",
        outcome: "This choice builds safety and perspective-taking.",
      },
      {
        id: "boundary-line",
        speaker: "Boundary",
        title: "\"I want to talk, but I need a calmer minute first.\"",
        copy: "Best when the conversation needs a pause without shutting down.",
        outcome: "This choice protects the relationship and the tone at the same time.",
      },
    ],
    "No family sentence saved yet.",
  );
}

function buildDigitalDetectivesPracticePanel() {
  return buildPracticePanel(
    "scan",
    "Safety scan board",
    "Which clue would make you pause first online?",
    "Pick the signal that should trigger the quickest stop-and-check response.",
    [
      {
        id: "privacy-clue",
        signal: "Privacy",
        title: "Someone asks for personal info fast",
        copy: "Name, school, address, or private photos should trigger an immediate pause.",
        outcome: "This choice strengthens boundary awareness before oversharing happens.",
      },
      {
        id: "truth-clue",
        signal: "Truth",
        title: "The story wants a fast emotional reaction",
        copy: "When the post pushes panic or outrage first, slow down before sharing it.",
        outcome: "This choice teaches verification before amplification.",
      },
      {
        id: "kindness-clue",
        signal: "Kindness",
        title: "The comment thread starts turning mean",
        copy: "Pause before joining, forwarding, or piling on.",
        outcome: "This choice keeps digital safety tied to character, not just privacy.",
      },
    ],
    "No digital safety clue saved yet.",
  );
}

function buildFocusForgePracticePanel() {
  return buildPracticePanel(
    "planner",
    "Momentum planner",
    "Which tiny-start plan would help most today?",
    "Save one tiny-start pattern so the next hard beginning has a ready-made plan.",
    [
      {
        id: "one-minute-start",
        step: "01",
        title: "Start with one minute only",
        copy: "Make the promise small enough that starting feels easier than avoiding.",
        outcome: "This choice lowers friction and gets motion started fast.",
      },
      {
        id: "materials-first",
        step: "02",
        title: "Lay out the materials first",
        copy: "Set up the desk, pencil, tab, or notebook before the work clock begins.",
        outcome: "This choice reduces activation energy before focus is even required.",
      },
      {
        id: "visible-finish",
        step: "03",
        title: "Choose a tiny visible finish",
        copy: "Define one clear stopping point you can actually reach today.",
        outcome: "This choice builds momentum through finishable wins.",
      },
    ],
    "No momentum plan saved yet.",
  );
}

function buildBodyBoundariesPracticePanel() {
  return buildPracticePanel(
    "script",
    "Boundary line rehearsal",
    "Which boundary line feels clearest to say out loud?",
    "Choose the line that feels calm, direct, and easiest to remember in a real moment.",
    [
      {
        id: "stop-line",
        eyebrow: "Stop",
        title: "\"No. I don't want that.\"",
        copy: "Use when the boundary needs to be short and unmistakable.",
        outcome: "This choice prioritizes clarity over politeness when safety matters.",
      },
      {
        id: "move-away",
        eyebrow: "Leave",
        title: "\"I'm leaving now and telling a grown-up.\"",
        copy: "Use when the safest next move is getting distance and support.",
        outcome: "This choice ties the boundary to an action, not only a sentence.",
      },
      {
        id: "trusted-help",
        eyebrow: "Help",
        title: "\"I need help with something that didn't feel okay.\"",
        copy: "Use when the child needs a ready-made support line for a trusted adult.",
        outcome: "This choice makes help-seeking feel concrete and sayable.",
      },
    ],
    "No boundary line saved yet.",
  );
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

const practicePanelBuilders = {
  "wonder-lab": buildWonderLabPracticePanel,
  "story-studio": buildStoryStudioPracticePanel,
  "brave-heart": buildBraveHeartPracticePanel,
  "money-moves": buildMoneyMovesPracticePanel,
  "home-team": buildHomeTeamPracticePanel,
  "digital-detectives": buildDigitalDetectivesPracticePanel,
  "focus-forge": buildFocusForgePracticePanel,
  "body-boundaries": buildBodyBoundariesPracticePanel,
};

export function buildLessonExperience(context) {
  const builder = lessonExperienceBuilders[context.track.id] ?? buildWonderLabExperience;
  const baseExperience = builder(context);
  const practiceBuilder =
    practicePanelBuilders[context.track.id] ?? buildWonderLabPracticePanel;
  const ageLens = getAgeLens(context.childAge);
  const practicePanel = adjustPracticePanelForAge(
    practiceBuilder(context),
    ageLens.id,
  );
  const selectedPracticeChoice =
    practicePanel.options.find((option) => option.id === context.practiceChoiceId) ?? null;
  const practiceChoiceNote = selectedPracticeChoice
    ? `${selectedPracticeChoice.title}. ${selectedPracticeChoice.outcome}`
    : practicePanel.unselectedNote;
  const reflectionPrompt = getReflectionPromptForAge(
    context.track.id,
    baseExperience.reflectionPrompt,
    ageLens.id,
  );
  const proofCopy = `${baseExperience.proofCopy} ${
    ageLens.id === "younger"
      ? "Keep the example close to today and let a grown-up stay nearby while the child practices it."
      : "Ask the child to explain why the move fits the situation, not only whether it worked."
  }`;
  const parentPrompts = baseExperience.parentPrompts.map((prompt, index) => {
    if (index !== 1) {
      return prompt;
    }

    return {
      ...prompt,
      text: `${prompt.text} ${
        ageLens.id === "younger"
          ? "Keep it concrete with one example from this week."
          : "Push for the reasoning behind the choice."
      }`,
    };
  });

  return {
    ...baseExperience,
    ageLens,
    proofCopy,
    reflectionPrompt,
    parentPrompts,
    practicePanel,
    practiceChoiceNote,
    selectedPracticeChoice,
    childReflectionStarter: selectedPracticeChoice
      ? `${context.childName} reflection: ${reflectionPrompt} Practice move: ${practiceChoiceNote}`
      : `${context.childName} reflection: ${reflectionPrompt}`,
    parentNoteStarter: [
      baseExperience.parentNoteStarter,
      `Age lens: ${ageLens.label}. ${ageLens.summary}`,
      `Practice move: ${practiceChoiceNote}`,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
