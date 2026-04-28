export function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function formatArchiveWeekLabel() {
  return `Saved ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date())}`;
}

export function clampTargetValue(key, value) {
  const ranges = {
    lessons: { min: 1, max: 7 },
    stories: { min: 1, max: 5 },
    reflections: { min: 1, max: 5 },
  };

  const range = ranges[key] ?? { min: 1, max: 7 };
  return Math.min(range.max, Math.max(range.min, value));
}

export function getRequestedTab(tabValue) {
  const normalized = tabValue?.toLowerCase();

  if (!normalized) {
    return "dashboard";
  }

  const aliases = {
    dashboard: "dashboard",
    home: "overview",
    overview: "overview",
    quest: "overview",
    "quest-hub": "overview",
    courses: "courses",
    stories: "stories",
    coach: "coach",
    journal: "journal",
    family: "family",
    help: "help",
    support: "help",
  };

  return aliases[normalized] ?? "dashboard";
}

export function getNextFocusTrackId(trackIds, currentFocusTrackId) {
  if (!trackIds.length) {
    return currentFocusTrackId;
  }

  const currentIndex = trackIds.indexOf(currentFocusTrackId);

  if (currentIndex === -1) {
    return trackIds[0];
  }

  return trackIds[(currentIndex + 1) % trackIds.length];
}

export function getLearningStudioState(state, childId) {
  return {
    turns: [],
    notebookCards: [],
    questionBankItems: [],
    safetyEvents: [],
    ...(state.learningStudioByChild?.[childId] ?? {}),
  };
}

export function buildScreenFocusContext({
  activeTab,
  activeLesson,
  activeTrack,
  currentTabLabel,
  recommendedLesson,
  selectedChild,
  selectedChildWorkspace,
  selectedCoachStyle,
  selectedGoals,
  selectedWeeklyTarget,
  todayLabel,
}) {
  const lessonProgress = `${selectedChildWorkspace.weeklyLessonCount}/${selectedWeeklyTarget.lessons}`;
  const storyProgress = `${selectedChildWorkspace.weeklyStoryCount}/${selectedWeeklyTarget.stories}`;
  const reflectionProgress = `${selectedChildWorkspace.weeklyReflectionCount}/${selectedWeeklyTarget.reflections}`;
  const recommendedTitle = recommendedLesson?.title ?? activeLesson.title;

  const contexts = {
    dashboard: {
      audience: "Parent cockpit",
      title: `${todayLabel} plan for ${selectedChild.name}`,
      copy: `Use the parent view to choose one action, review signals, and keep this week realistic across ${selectedGoals.length} family goals.`,
      nextMove: `Start with ${recommendedTitle}, then check the review queue before adjusting targets.`,
      metric: `${lessonProgress} lessons`,
    },
    overview: {
      audience: "Child quest",
      title: `${selectedChild.companionName}'s first clear win`,
      copy: `The Quest Hub turns the week into a visible route for lessons, stories, reflections, and family practice.`,
      nextMove: `Open the First Quest Launchpad, then move into ${recommendedTitle}.`,
      metric: `${Math.round(selectedChildWorkspace.overallTargetProgress)}% week`,
    },
    courses: {
      audience: "Learning studio",
      title: activeTrack.title,
      copy: `Course work stays focused on the current track, active lesson, guided practice, quiz checks, and parent follow-through.`,
      nextMove: `Continue ${activeLesson.title} and save one practice move before marking progress complete.`,
      metric: lessonProgress,
    },
    stories: {
      audience: "Practice stories",
      title: "Turn choices into skills",
      copy: `Stories let ${selectedChild.name} rehearse confidence, money, friendship, and family moments before real life asks for them.`,
      nextMove: "Pick a branch, read the skill debrief, then connect it to the next lesson.",
      metric: `${storyProgress} stories`,
    },
    coach: {
      audience: "AI guardrails",
      title: "Bounded coaching only",
      copy: `Spark Coach is framed around safe prompts, parent-visible summaries, and the ${selectedCoachStyle.title.toLowerCase()} family tone.`,
      nextMove: "Review the prompt lab before opening broader AI support.",
      metric: selectedCoachStyle.title,
    },
    journal: {
      audience: "Reflection loop",
      title: "Signals before advice",
      copy: `Journals help children name what happened while parents see patterns without exposing raw private writing everywhere.`,
      nextMove: `Save one ${selectedChild.name} reflection, then review the Insight Coach pattern.`,
      metric: `${reflectionProgress} reflections`,
    },
    family: {
      audience: "Parent controls",
      title: "Settings, trust, and family rhythm",
      copy: "Family Hub keeps sensitive unlocks, weekly targets, privacy previews, and launch readiness decisions in the parent zone.",
      nextMove: "Use the Family Meeting Builder before changing curriculum or privacy settings.",
      metric: "Parent zone",
    },
    help: {
      audience: "Help center",
      title: "Find the fastest path through KidWiz",
      copy: "Use Help when you want a plain-English map of setup, dashboard proof, Learning Studio, and parent controls.",
      nextMove: "Start with the parent path, then restart onboarding or the dashboard tour if the product feels too dense.",
      metric: "Guide",
    },
  };

  return contexts[activeTab] ?? {
    audience: "KidWiz",
    title: currentTabLabel,
    copy: "Use this space to keep learning clear, safe, and action-oriented.",
    nextMove: `Return to ${recommendedTitle} when you are ready for the next activity.`,
    metric: "Ready",
  };
}
