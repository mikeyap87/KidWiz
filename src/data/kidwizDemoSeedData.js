export const starterFamilyGoalIds = ["confidence", "money", "friendships"];

export const starterAssignedTrackIdsByChild = {
  nova: ["brave-heart", "money-moves", "story-studio"],
  kai: ["wonder-lab", "digital-detectives", "focus-forge", "home-team"],
};

export const starterWeeklyTargetsByChild = {
  nova: {
    lessons: 3,
    stories: 2,
    reflections: 2,
    focusTrackId: "money-moves",
  },
  kai: {
    lessons: 4,
    stories: 2,
    reflections: 2,
    focusTrackId: "home-team",
  },
};

export const starterPlaylistLessonIdsByChild = {
  nova: ["brave-script", "save-spend-share", "voice-switch"],
  kai: ["repair-words", "moon-budget", "truth-check"],
};

export const starterCompletedLessonIdsByChild = {
  nova: ["calm-map", "repair-words"],
  kai: ["price-clues", "kind-online", "timer-power"],
};

export const starterCompletedJourneyIdsByChild = {
  nova: ["check-in", "playlist"],
  kai: ["check-in", "playlist", "story"],
};

export const starterStoryChoicesByChild = {
  nova: {
    "friendship-loop": "repair-now",
    "stage-lights": "tiny-brave-step",
  },
  kai: {
    "market-mission": "pause-plan",
    "group-chat-glitch": "trusted-adult",
  },
};

export const starterChildJournalEntriesByChild = {
  nova: [
    {
      id: "nova-child-1",
      title: "Morning check-in",
      mood: "curious",
      dateLabel: "Today",
      body:
        "I felt nervous before group time, but I did the first sentence anyway and then it got easier.",
    },
    {
      id: "nova-child-2",
      title: "Money mission",
      mood: "proud",
      dateLabel: "Yesterday",
      body:
        "I wanted the candy first, but I kept saving because I still want the sketch pens.",
    },
  ],
  kai: [
    {
      id: "kai-child-1",
      title: "Truth check",
      mood: "steady",
      dateLabel: "Today",
      body:
        "I liked checking if the post was real before believing it. That made me feel smart.",
    },
    {
      id: "kai-child-2",
      title: "Tiny plan win",
      mood: "relieved",
      dateLabel: "Yesterday",
      body:
        "Breaking homework into three steps made it feel smaller, so I actually started faster.",
    },
  ],
};

export const starterParentJournalEntries = [
  {
    id: "parent-1",
    title: "What helped this week",
    dateLabel: "Today",
    body:
      "Nova settles faster when I ask one small question instead of giving a whole speech. Kai responds well when the next step is visible.",
  },
  {
    id: "parent-2",
    title: "Next family experiment",
    dateLabel: "Yesterday",
    body:
      "Try the Sunday money circle and let each child explain one save-spend-share decision in their own words.",
  },
];

export const starterWeeklyHistoryByChild = {
  nova: [
    {
      weekLabel: "3 weeks ago",
      readinessScore: 46,
      lessonTargetProgress: 34,
      storyTargetProgress: 50,
      reflectionTargetProgress: 55,
      completedLessonsTotal: 0,
      completedStoriesTotal: 0,
      reflectionsTotal: 0,
      badgesTotal: 0,
      focusTrackId: "brave-heart",
      strongestTrackId: "story-studio",
      supportTrackId: "money-moves",
      note: "Confidence habits were starting to stick, but money follow-through was still wobbly.",
    },
    {
      weekLabel: "2 weeks ago",
      readinessScore: 58,
      lessonTargetProgress: 50,
      storyTargetProgress: 65,
      reflectionTargetProgress: 60,
      completedLessonsTotal: 1,
      completedStoriesTotal: 1,
      reflectionsTotal: 1,
      badgesTotal: 1,
      focusTrackId: "brave-heart",
      strongestTrackId: "brave-heart",
      supportTrackId: "money-moves",
      note: "Brave scripts landed better once Nova got shorter, story-shaped practice.",
    },
    {
      weekLabel: "Last week",
      readinessScore: 67,
      lessonTargetProgress: 67,
      storyTargetProgress: 75,
      reflectionTargetProgress: 60,
      completedLessonsTotal: 1,
      completedStoriesTotal: 2,
      reflectionsTotal: 1,
      badgesTotal: 1,
      focusTrackId: "money-moves",
      strongestTrackId: "brave-heart",
      supportTrackId: "money-moves",
      note: "Saving decisions improved, but the family still needed stronger money language at home.",
    },
  ],
  kai: [
    {
      weekLabel: "3 weeks ago",
      readinessScore: 51,
      lessonTargetProgress: 45,
      storyTargetProgress: 50,
      reflectionTargetProgress: 58,
      completedLessonsTotal: 1,
      completedStoriesTotal: 0,
      reflectionsTotal: 0,
      badgesTotal: 0,
      focusTrackId: "digital-detectives",
      strongestTrackId: "money-moves",
      supportTrackId: "home-team",
      note: "Kai had good reasoning, but relationship moments still needed more guided repair practice.",
    },
    {
      weekLabel: "2 weeks ago",
      readinessScore: 61,
      lessonTargetProgress: 55,
      storyTargetProgress: 60,
      reflectionTargetProgress: 68,
      completedLessonsTotal: 2,
      completedStoriesTotal: 1,
      reflectionsTotal: 1,
      badgesTotal: 1,
      focusTrackId: "digital-detectives",
      strongestTrackId: "money-moves",
      supportTrackId: "home-team",
      note: "Reflection quality improved once tasks were broken into clearer chunks.",
    },
    {
      weekLabel: "Last week",
      readinessScore: 69,
      lessonTargetProgress: 66,
      storyTargetProgress: 70,
      reflectionTargetProgress: 72,
      completedLessonsTotal: 3,
      completedStoriesTotal: 1,
      reflectionsTotal: 1,
      badgesTotal: 1,
      focusTrackId: "home-team",
      strongestTrackId: "money-moves",
      supportTrackId: "brave-heart",
      note: "Kai began repairing family friction faster, but still needed support with bold first steps.",
    },
  ],
};
