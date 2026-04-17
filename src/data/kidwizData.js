export const siteImages = {
  hero:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80",
  story:
    "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80",
  family:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1600&q=80",
};

export const heroStats = [
  { label: "Age bands", value: "6-8 and 9-12" },
  { label: "Learning worlds", value: "6 guided tracks" },
  { label: "Family rituals", value: "40+ parent cues" },
];

export const appHighlights = [
  {
    title: "Academic lessons that feel alive",
    copy:
      "Math, reading, and science live inside practical choices, fast wins, and story-based missions.",
  },
  {
    title: "Confidence and relationships",
    copy:
      "Children rehearse brave starts, emotional regulation, conflict repair, and healthy family habits.",
  },
  {
    title: "Money sense early",
    copy:
      "Saving, spending, generosity, and tradeoffs become everyday decisions children can understand.",
  },
  {
    title: "Bounded AI help",
    copy:
      "Spark Coach explains, personalizes, and nudges without turning into an unmoderated open chat buddy.",
  },
];

export const worldCatalog = [
  {
    id: "wonder-lab",
    title: "Wonder Lab",
    category: "academics",
    ageBand: "6-10",
    summary: "Math and science become experiments, estimation games, and mini-builds.",
    lesson: {
      title: "Budget a moon garden",
      summary:
        "Estimate what a tiny moon garden costs, compare materials, then test which plan leaves room for one fun extra.",
      challenge: "Challenge: compare, round, then defend your choice.",
      aiAssist: "AI assist: hint ladders instead of answer dumps.",
      parentCue: "Ask which choice gave the most value for the cost.",
    },
    quiz: {
      question: "Nova has 12 star tokens and saves 5. How many can she spend today?",
      options: ["5", "7", "12", "17"],
      correctIndex: 1,
      success: "Correct. Saving 5 leaves 7 tokens to spend.",
    },
  },
  {
    id: "story-studio",
    title: "Story Studio",
    category: "literacy",
    ageBand: "6-12",
    summary: "Reading and writing grow through character arcs, voice, and choice.",
    lesson: {
      title: "Write a scene with a feeling shift",
      summary:
        "A strong scene starts with one emotion and ends with another. Children learn how language changes the whole moment.",
      challenge: "Challenge: swap one flat sentence for a vivid one.",
      aiAssist: "AI assist: rewrite one sentence in three tones.",
      parentCue: "Ask what changed between the first feeling and the last.",
    },
    quiz: {
      question: "Which sentence shows the strongest feeling?",
      options: [
        "Mila was there.",
        "Mila walked to the room.",
        "Mila hovered at the door and took a brave breath.",
        "Mila did a thing.",
      ],
      correctIndex: 2,
      success: "Exactly. Specific action makes the feeling easier to imagine.",
    },
  },
  {
    id: "brave-heart",
    title: "Brave Heart",
    category: "confidence",
    ageBand: "6-12",
    summary: "Kids practice self-talk, calm resets, and speaking up kindly.",
    lesson: {
      title: "Turn nerves into a plan",
      summary:
        "Children learn to name the body signal, choose a calming move, and take one small brave action anyway.",
      challenge: "Challenge: build your own three-step calm reset.",
      aiAssist: "AI assist: adapt the reset to sports, school, or home.",
      parentCue: "Say, 'What is one brave thing that still felt manageable?'",
    },
    quiz: {
      question: "Which thought sounds most like brave self-talk?",
      options: [
        "I can never do this.",
        "If I feel nervous, I should stop.",
        "I can take one small step even when I feel nervous.",
        "Only perfect people are confident.",
      ],
      correctIndex: 2,
      success: "Yes. Confidence grows from action, not from feeling perfect.",
    },
  },
  {
    id: "money-moves",
    title: "Money Moves",
    category: "money",
    ageBand: "7-12",
    summary: "Spending, saving, generosity, and tradeoffs become real decisions.",
    lesson: {
      title: "Spend now or save for later",
      summary:
        "KidWiz helps children compare short-term excitement with longer-term goals so money starts to feel like a tool.",
      challenge: "Challenge: sort wants, needs, and future goals.",
      aiAssist: "AI assist: turn choices into a mini story with outcomes.",
      parentCue: "Ask which goal felt worth waiting for.",
    },
    quiz: {
      question: "A toy costs 18 coins. You have 11. What is the smartest first step?",
      options: [
        "Pretend 11 is enough",
        "Check how many more coins are needed and make a saving plan",
        "Spend the 11 on candy instead",
        "Give up forever",
      ],
      correctIndex: 1,
      success: "Right. Good money habits start with knowing the gap and making a plan.",
    },
  },
  {
    id: "home-team",
    title: "Home Team",
    category: "relationships",
    ageBand: "6-12",
    summary: "Friendships, family repair, gratitude, and clear communication.",
    lesson: {
      title: "Repair after a rough moment",
      summary:
        "Children practice naming impact, apologizing clearly, and choosing one next action that rebuilds trust.",
      challenge: "Challenge: finish the sentence 'Next time I can...'",
      aiAssist: "AI assist: roleplay two possible responses and outcomes.",
      parentCue: "Ask what would help the other person feel seen again.",
    },
    quiz: {
      question: "Which apology sounds most thoughtful?",
      options: [
        "Sorry you felt that way.",
        "Whatever, sorry.",
        "I interrupted you and that was frustrating. Next time I will wait.",
        "It was mostly your fault.",
      ],
      correctIndex: 2,
      success: "Exactly. A strong apology names the action and the repair.",
    },
  },
  {
    id: "body-boundaries",
    title: "Body and Boundaries",
    category: "body",
    ageBand: "9-12",
    summary: "Puberty, consent, privacy, and body literacy in age-banded lessons.",
    sensitive: true,
    lesson: {
      title: "Private, public, and trusted support",
      summary:
        "Children learn which questions belong with a trusted adult, what privacy means, and how to ask for help without shame.",
      challenge: "Challenge: sort safe adults and private questions.",
      aiAssist: "AI assist: only curated prompts and parent-approved explainers.",
      parentCue: "Ask which grown-ups feel safe for body questions and why.",
    },
    quiz: {
      question: "What is the healthiest first step when a body question feels confusing?",
      options: [
        "Hide it forever",
        "Ask a trusted adult or use a parent-approved lesson",
        "Believe the first rumor you hear",
        "Make fun of the topic",
      ],
      correctIndex: 1,
      success: "Yes. Trusted adults and curated lessons keep this topic grounded and safe.",
    },
  },
];

export const dailyJourneys = [
  {
    id: "check-in",
    order: "1",
    title: "Confidence check-in",
    length: "5 min",
    focus: "Name one feeling and one brave move.",
  },
  {
    id: "lesson",
    order: "2",
    title: "Learning world sprint",
    length: "12 min",
    focus: "One lesson, one challenge, one quiz.",
  },
  {
    id: "story",
    order: "3",
    title: "Branching story",
    length: "8 min",
    focus: "Practice a family, money, or friendship decision.",
  },
  {
    id: "journal",
    order: "4",
    title: "Reflection minute",
    length: "3 min",
    focus: "Capture what felt hard, helpful, or exciting.",
  },
];

export const storyEpisodes = [
  {
    id: "friendship-loop",
    title: "The Friendship Loop",
    focus: "Friendship repair",
    ageBand: "7-10",
    setup:
      "Your teammate thinks you ignored her idea during a game plan. She goes quiet and stops helping. You still want the project to feel fun.",
    reflectionPrompt:
      "What helps a repair feel real instead of rushed?",
    choices: [
      {
        id: "repair-now",
        title: "Pause and ask what she felt",
        result:
          "The project slows down for a minute, but trust starts coming back.",
        parentCue:
          "Dinner cue: ask how listening first changed the whole moment.",
      },
      {
        id: "push-through",
        title: "Keep going and hope it fades",
        result:
          "The game plan finishes faster, but the distance between both kids grows.",
        parentCue:
          "Family cue: ask what speed sometimes costs in relationships.",
      },
    ],
  },
  {
    id: "market-mission",
    title: "Market Mission",
    focus: "Money choices",
    ageBand: "8-12",
    setup:
      "You brought enough coins for one snack and maybe one extra item. Then your friend spots matching bracelets and wants you both to buy them.",
    reflectionPrompt:
      "How do you tell the difference between a fun impulse and a real goal?",
    choices: [
      {
        id: "pause-plan",
        title: "Check your goal before buying",
        result:
          "You still get to choose, but the choice now matches the plan you made earlier.",
        parentCue:
          "Ask which part felt strongest: waiting, deciding, or saying no.",
      },
      {
        id: "buy-fast",
        title: "Spend fast so it feels exciting",
        result:
          "The moment feels fun, but the long-term goal disappears immediately.",
        parentCue:
          "Ask how temporary excitement can cloud a money decision.",
      },
    ],
  },
  {
    id: "stage-lights",
    title: "Stage Lights",
    focus: "Confidence under pressure",
    ageBand: "6-10",
    setup:
      "Your group is about to present. Your heart is thumping, and you suddenly wish someone else would go first.",
    reflectionPrompt:
      "What kind of support helps confidence grow without pretending the nerves are gone?",
    choices: [
      {
        id: "tiny-brave-step",
        title: "Take one line first",
        result:
          "Your body is still buzzing, but one small success makes the next step easier.",
        parentCue:
          "Ask why a small brave step can be more powerful than waiting to feel fearless.",
      },
      {
        id: "disappear",
        title: "Stay silent and hope not to be noticed",
        result:
          "The discomfort ends for a moment, but the fear gets bigger next time.",
        parentCue:
          "Ask what avoiding a moment teaches the brain for tomorrow.",
      },
    ],
  },
];

export const childProfiles = [
  {
    id: "nova",
    name: "Nova",
    age: 8,
    grade: 3,
    streak: 12,
    todayTheme: "Brave starts and smart spending",
    heroLine:
      "Nova lights up when a lesson turns into a mission. She is especially ready for confidence reps and money choices today.",
    coachLens: "story prompts, short wins, and gentle repetition",
    trackScores: {
      "wonder-lab": 73,
      "story-studio": 81,
      "brave-heart": 86,
      "money-moves": 67,
      "home-team": 79,
      "body-boundaries": 0,
    },
  },
  {
    id: "kai",
    name: "Kai",
    age: 10,
    grade: 5,
    streak: 9,
    todayTheme: "Clear communication and big-picture planning",
    heroLine:
      "Kai responds best when KidWiz turns choices into consequences and gives him room to explain his thinking.",
    coachLens: "tradeoff stories, roleplay, and visible progress bars",
    trackScores: {
      "wonder-lab": 79,
      "story-studio": 74,
      "brave-heart": 71,
      "money-moves": 82,
      "home-team": 77,
      "body-boundaries": 0,
    },
  },
];

export const starterChildJournalEntries = [
  {
    id: "child-1",
    title: "Morning check-in",
    mood: "curious",
    dateLabel: "Today",
    body:
      "I felt nervous before group time, but I did the first sentence anyway and then it got easier.",
  },
  {
    id: "child-2",
    title: "Money mission",
    mood: "proud",
    dateLabel: "Yesterday",
    body:
      "I wanted the candy first, but I kept saving because I still want the sketch pens.",
  },
];

export const starterParentJournalEntries = [
  {
    id: "parent-1",
    title: "What helped this week",
    dateLabel: "Today",
    body:
      "Nova settles faster when I ask one small question instead of giving a whole speech. The quick reflection after stories is working.",
  },
  {
    id: "parent-2",
    title: "Next experiment",
    dateLabel: "Yesterday",
    body:
      "Try the family money ritual on Saturday and let Nova decide between saving, spending, and giving for one real budget.",
  },
];

export const trustSignals = [
  {
    title: "Parent-led onboarding",
    copy:
      "Parents create child profiles, choose age bands, and decide which sensitive tracks stay locked.",
  },
  {
    title: "Bounded AI",
    copy:
      "AI supports explanation, practice, and summaries. It does not run as an unmoderated social companion.",
  },
  {
    title: "Private journals",
    copy:
      "Reflection is designed for calm review, not public sharing, likes, or social comparison.",
  },
];

export const familyRituals = [
  {
    title: "Sunday money circle",
    copy:
      "Look at one small family budget, then ask what feels worth saving for this week.",
  },
  {
    title: "Two-minute repair",
    copy:
      "When tension shows up, name impact, ask one question, and agree on one next step.",
  },
  {
    title: "Brave start ritual",
    copy:
      "Before school or a new activity, name the body feeling and choose one tiny brave action.",
  },
];
