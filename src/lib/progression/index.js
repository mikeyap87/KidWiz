import {
  childProfiles,
  familyRituals,
} from "../../data/kidwizData";
import {
  deriveEarnedBadgeIds,
  findLessonById,
  findStoryById,
  findTrackByLessonId,
  getNextTrackLesson,
  getTrackProgress,
  getTrackStatus,
  getVisibleTracks,
  isLessonUnlocked,
} from "./learningCore.js";

export {
  buildLearningPathMap,
  buildSuggestedPlaylistForChild,
  buildSuggestedPlaylists,
  deriveEarnedBadgeIds,
  findLessonById,
  findQuestWorld,
  findStoryById,
  findTrackByLessonId,
  getLessonIndex,
  getNextTrackLesson,
  getTrackProgress,
  getTrackStatus,
  getVisibleTracks,
  isLessonUnlocked,
} from "./learningCore.js";

import {
  deriveChildSignal,
  getRecommendedStory,
} from "./storySignals.js";

export {
  buildJournalInsightCoach,
  buildStorySkillDebrief,
  deriveChildSignal,
  getRecommendedStory,
} from "./storySignals.js";

function truncateReviewCopy(copy, limit = 145) {
  if (!copy || copy.length <= limit) {
    return copy;
  }

  return `${copy.slice(0, limit).trim()}...`;
}

export function buildParentReviewQueue({ childSummaries, appState, nextRitual }) {
  const items = [];

  childSummaries.forEach((summary) => {
    if (summary.planningNudge) {
      items.push({
        id: `nudge-${summary.planningNudge.id}`,
        childId: summary.child.id,
        eyebrow: `${summary.child.name} planning`,
        title: summary.planningNudge.title,
        copy: summary.planningNudge.copy,
        ctaLabel: "Apply nudge",
        actionType: "nudge",
        priority: 1,
        nudge: summary.planningNudge,
      });
    }

    const latestJournalEntry =
      appState.childJournalEntriesByChild?.[summary.child.id]?.[0] ?? null;

    const latestStoryId = Object.keys(
      appState.storyChoicesByChild?.[summary.child.id] ?? {},
    ).at(-1);
    const latestStory = latestStoryId ? findStoryById(latestStoryId) : null;

    if (latestStory) {
      items.push({
        id: `story-${summary.child.id}-${latestStory.id}`,
        childId: summary.child.id,
        eyebrow: `${summary.child.name} story signal`,
        title: latestStory.title,
        copy:
          summary.signal?.source === "story"
            ? summary.signal.parentCopy
            : latestStory.reflectionPrompt,
        ctaLabel: "Open story",
        actionType: "story",
        storyId: latestStory.id,
        priority: 2,
      });
    }

    if (latestJournalEntry) {
      items.push({
        id: `journal-${summary.child.id}-${latestJournalEntry.id}`,
        childId: summary.child.id,
        eyebrow: `${summary.child.name} reflection`,
        title: `${latestJournalEntry.mood} note: ${latestJournalEntry.title}`,
        copy: truncateReviewCopy(latestJournalEntry.body),
        ctaLabel: "Open journal",
        actionType: "journal",
        priority: 3,
      });
    }
  });

  if (nextRitual) {
    items.push({
      id: "family-ritual-review",
      eyebrow: "Family rhythm",
      title: nextRitual.title,
      copy: nextRitual.copy,
      ctaLabel: "Open family hub",
      actionType: "family",
      priority: 4,
    });
  }

  return items
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 5);
}

export function buildParentDailyBrief({
  childSummaries,
  nextRitual,
  reviewQueue,
  selectedRhythm,
  weeklyReport,
}) {
  const strongestSummary =
    [...childSummaries].sort(
      (left, right) => right.overallTargetProgress - left.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const supportSummary =
    [...childSummaries].sort(
      (left, right) => left.overallTargetProgress - right.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const firstMove =
    reviewQueue.find((item) => item.actionType === "nudge") ??
    reviewQueue[0] ??
    null;
  const signalSummary = childSummaries.find((summary) => summary.signal)?.signal;

  return {
    eyebrow: "Daily brief",
    title:
      weeklyReport.readinessScore >= 70
        ? "Keep the family rhythm warm tonight."
        : "Make tonight smaller, clearer, and easier to start.",
    summary:
      signalSummary?.parentCopy ??
      `${supportSummary.child.name} needs the clearest support in ${supportSummary.supportTrack.title}, while ${strongestSummary.child.name} has the strongest momentum in ${strongestSummary.strongestTrack.title}.`,
    whyItMatters: `${selectedRhythm.title} works best when parents can see one next step, one child signal, and one family conversation without digging across the app.`,
    firstMove,
    spotlightRows: [
      {
        label: "What happened",
        value: `${strongestSummary.child.name} is ${strongestSummary.overallTargetProgress}% through this week's targets.`,
      },
      {
        label: "What needs care",
        value: `${supportSummary.child.name}'s lowest signal is ${supportSummary.supportTrack.title}.`,
      },
      {
        label: "Tonight's family anchor",
        value: nextRitual.copy,
      },
    ],
    script: [
      `Start with: "I noticed one thing that looked a little easier for you today."`,
      `Ask ${supportSummary.child.name}: "What part should we make smaller tomorrow?"`,
      `Close with: "${nextRitual.title} is our tiny family practice tonight."`,
    ],
  };
}

export function buildParentProgressNarrative({
  childSummaries,
  familyMetrics,
  selectedGoals,
  selectedRhythm,
  weeklyReport,
}) {
  const strongestSummary =
    [...childSummaries].sort(
      (left, right) => right.overallTargetProgress - left.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const tenderSummary =
    [...childSummaries].sort(
      (left, right) => left.overallTargetProgress - right.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const goalPhrase = formatJoinedList(
    selectedGoals.map((goal) => goal.title.toLowerCase()),
  );

  return {
    eyebrow: "Parent progress narrative",
    title: `This week, ${strongestSummary.child.name} showed growth and ${tenderSummary.child.name} showed where support can get more specific.`,
    paragraphs: [
      `KidWiz is seeing real practice take shape around ${goalPhrase || "your family goals"}. Across the family, there are ${familyMetrics.lessonsDone} completed lessons, ${familyMetrics.storiesDone} story choices, ${familyMetrics.reflectionsSaved} reflections, and ${familyMetrics.badgesEarned} badges.`,
      `${strongestSummary.child.name} looks strongest in ${strongestSummary.strongestTrack.title}, which means the current rhythm is giving at least one child a reliable place to build confidence.`,
      `${tenderSummary.child.name} may need the next move to be smaller and more concrete in ${tenderSummary.supportTrack.title}. ${tenderSummary.signal?.parentCopy ?? tenderSummary.supportMessage}`,
      `${selectedRhythm.title} is still the right frame: keep the next step visible, celebrate effort quickly, and use one family conversation to turn screen practice into home language.`,
    ],
    shareLines: [
      {
        label: "What grew",
        value: `${strongestSummary.child.name}'s strongest momentum is ${strongestSummary.strongestTrack.title}.`,
      },
      {
        label: "What is tender",
        value: `${tenderSummary.child.name} needs support in ${tenderSummary.supportTrack.title}.`,
      },
      {
        label: "What to try next",
        value: weeklyReport.actionPlan[0]?.title ?? weeklyReport.focusCopy,
      },
    ],
  };
}

export function buildFamilyMeetingBuilder({
  child,
  familyChatDone,
  journalInsight,
  nextRitual,
  selectedRhythm,
  storyDebrief,
  summary,
}) {
  const anchor =
    storyDebrief?.parentQuestion ??
    journalInsight?.parentResponse ??
    nextRitual.copy;
  const childQuestion =
    storyDebrief?.childReflection ??
    `What felt easier or harder for ${child.name} today?`;

  return {
    title: familyChatDone
      ? "Tonight's family meeting is already logged."
      : "Run a 10-minute family meeting tonight.",
    copy: `${selectedRhythm.title} becomes easier when the family has one calm check-in, one child signal, and one next practice.`,
    statusLabel: familyChatDone ? "Logged this week" : "Ready to run",
    agenda: [
      {
        time: "2 min",
        title: "Start with a tiny win",
        copy: `Name one visible effort from ${child.name}, especially around ${summary.strongestTrack.title}.`,
      },
      {
        time: "4 min",
        title: "Ask the signal question",
        copy: childQuestion,
      },
      {
        time: "3 min",
        title: "Choose one next practice",
        copy:
          storyDebrief?.nextStepCopy ??
          journalInsight?.recommendedPractice?.copy ??
          summary.supportMessage,
      },
      {
        time: "1 min",
        title: "Close with the ritual",
        copy: nextRitual.copy,
      },
    ],
    parentScript: [
      `Open with: "This is not a lecture. We are just noticing what helps."`,
      `Ask: "${anchor}"`,
      `Close with: "One small repeatable move is enough for tonight."`,
    ],
  };
}

export {
  buildParentPrivacyCenter,
  buildParentTrustReview,
} from "./familyTrust.js";

export {
  buildCurriculumDepthConsole,
  buildLaunchReadinessConsole,
  buildProductionDataModelConsole,
  buildSparkTutorSafetyStudio,
} from "./readinessConsoles.js";

export {
  buildChildAchievementPortfolio,
  buildChildCelebrationReel,
  buildChildFirstSessionLaunchpad,
  buildKidDailyQuestBrief,
  buildParentSharePreview,
  buildQuestWorldRows,
  buildWeeklyMissionBoard,
} from "./questExperience.js";

function formatJoinedList(items) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatDelta(value) {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `${value}`;
  }

  return "0";
}

function getDeltaTone(value) {
  if (value > 3) {
    return "up";
  }

  if (value < -3) {
    return "down";
  }

  return "steady";
}

function getMetricDisplayName(metricKey) {
  const labels = {
    lessonTargetProgress: "lesson follow-through",
    storyTargetProgress: "story practice",
    reflectionTargetProgress: "reflection rhythm",
  };

  return labels[metricKey] ?? "weekly rhythm";
}

function getMomentumState(score) {
  if (score >= 80) {
    return {
      label: "Strong momentum",
      detail:
        "The weekly rhythm is sticking, and the children are moving through targets with real follow-through.",
    };
  }

  if (score >= 60) {
    return {
      label: "Steady momentum",
      detail:
        "The learning loop is working, but one or two focused nudges could make the week feel much more settled.",
    };
  }

  return {
    label: "Needs a rhythm reset",
    detail:
      "The family still has good raw material, but this week would benefit from a simpler next step and a cleaner routine.",
  };
}

function buildChildTrendSeries(summary, weeklyHistoryByChild) {
  const history = weeklyHistoryByChild?.[summary.child.id] ?? [];
  const currentSnapshot = {
    weekLabel: "This week",
    readinessScore: summary.overallTargetProgress,
    lessonTargetProgress: summary.lessonTargetProgress,
    storyTargetProgress: summary.storyTargetProgress,
    reflectionTargetProgress: summary.reflectionTargetProgress,
    completedLessonsTotal: summary.completedLessons,
    completedStoriesTotal: summary.completedStories,
    reflectionsTotal: summary.journalCount,
    badgesTotal: summary.badgesEarned,
    focusTrackId: summary.weeklyTarget.focusTrackId,
    strongestTrackId: summary.strongestTrack.id,
    supportTrackId: summary.supportTrack.id,
    note: summary.supportMessage,
  };

  return [...history, currentSnapshot];
}

function buildFamilyTrendSeries(childTrendRows) {
  const maxLength = Math.max(...childTrendRows.map((row) => row.trendSeries.length));

  return Array.from({ length: maxLength }, (_, index) => {
    const items = childTrendRows
      .map((row) => row.trendSeries[index])
      .filter(Boolean);

    return {
      weekLabel: items[0]?.weekLabel ?? `Week ${index + 1}`,
      readinessScore: Math.round(
        items.reduce((total, item) => total + item.readinessScore, 0) /
          Math.max(1, items.length),
      ),
    };
  });
}

function getStrongestMetricDelta(current, previous) {
  const metrics = [
    "lessonTargetProgress",
    "storyTargetProgress",
    "reflectionTargetProgress",
  ].map((metricKey) => ({
    metricKey,
    delta: (current?.[metricKey] ?? 0) - (previous?.[metricKey] ?? 0),
  }));

  return metrics.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];
}

export function buildParentWeeklyReport({
  childSummaries,
  familyMetrics,
  nextRitual,
  selectedCelebrationStyle,
  selectedCoachStyle,
  selectedGoals,
  selectedRhythm,
  weeklyHistoryByChild,
}) {
  const averageTargetProgress = Math.round(
    childSummaries.reduce(
      (total, summary) => total + summary.overallTargetProgress,
      0,
    ) / Math.max(1, childSummaries.length),
  );
  const momentumState = getMomentumState(averageTargetProgress);
  const strongestSummary =
    [...childSummaries].sort(
      (left, right) => right.overallTargetProgress - left.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const supportSummary =
    [...childSummaries].sort(
      (left, right) => left.overallTargetProgress - right.overallTargetProgress,
    )[0] ?? childSummaries[0];
  const childTrendRows = childSummaries.map((summary) => {
    const trendSeries = buildChildTrendSeries(summary, weeklyHistoryByChild);
    const previousSnapshot = trendSeries.at(-2) ?? null;
    const currentSnapshot = trendSeries.at(-1) ?? null;
    const delta = (currentSnapshot?.readinessScore ?? 0) - (previousSnapshot?.readinessScore ?? 0);
    const strongestMetric = getStrongestMetricDelta(currentSnapshot, previousSnapshot);

    return {
      childId: summary.child.id,
      childName: summary.child.name,
      trendSeries,
      currentReadiness: currentSnapshot?.readinessScore ?? 0,
      delta,
      deltaLabel: formatDelta(delta),
      deltaTone: getDeltaTone(delta),
      strongestMetricLabel: getMetricDisplayName(strongestMetric.metricKey),
      strongestMetricDelta: strongestMetric.delta,
      note: currentSnapshot?.note ?? summary.supportMessage,
    };
  });
  const familyTrendSeries = buildFamilyTrendSeries(childTrendRows);
  const previousFamilyPoint = familyTrendSeries.at(-2) ?? null;
  const currentFamilyPoint = familyTrendSeries.at(-1) ?? null;
  const familyDelta =
    (currentFamilyPoint?.readinessScore ?? averageTargetProgress) -
    (previousFamilyPoint?.readinessScore ?? averageTargetProgress);
  const goalPhrase = formatJoinedList(
    selectedGoals.map((goal) => goal.title.toLowerCase()),
  );

  const stats = [
    {
      label: "Weekly readiness",
      value: `${averageTargetProgress}%`,
      detail: momentumState.label,
    },
    {
      label: "Top momentum",
      value: strongestSummary.child.name,
      detail: `${strongestSummary.strongestTrack.title} is landing best right now.`,
    },
    {
      label: "Needs coaching",
      value: supportSummary.child.name,
      detail: `${supportSummary.supportTrack.title} is the clearest support opportunity this week.`,
    },
  ];

  const highlights = [
    {
      title: `${strongestSummary.child.name} is carrying the strongest rhythm`,
      copy: `${strongestSummary.child.name} is ${strongestSummary.overallTargetProgress}% through this week's targets and looks strongest in ${strongestSummary.strongestTrack.title}.`,
    },
    ...(supportSummary.signal
      ? [
          {
            title: `${supportSummary.child.name}'s recent signal is shaping the next move`,
            copy: supportSummary.signal.parentCopy,
          },
        ]
      : []),
    {
      title: "The family learning system is defined",
      copy: `${selectedRhythm.title} plus ${selectedCoachStyle.title.toLowerCase()} coaching and ${selectedCelebrationStyle.title.toLowerCase()} reinforcement is giving the week a clear shape.`,
    },
    {
      title: "KidWiz already has real review material",
      copy: `The current demo family has generated ${familyMetrics.lessonsDone} completed lessons, ${familyMetrics.storiesDone} story choices, ${familyMetrics.reflectionsSaved} reflections, and ${familyMetrics.badgesEarned} badges.`,
    },
  ];

  const actionPlan = childSummaries.map((summary) => ({
    id: `action-${summary.child.id}`,
    childId: summary.child.id,
    eyebrow: summary.child.name,
    title: summary.recommendedLesson
      ? `${summary.recommendedLesson.track.title}: ${summary.recommendedLesson.lesson.title}`
      : `${summary.child.name} has cleared the visible lesson queue`,
    copy: summary.recommendedLesson
      ? summary.signal
        ? `${summary.signal.parentCopy} ${summary.recommendedLesson.lesson.parentCue}`
        : `${summary.recommendedLesson.reason}. ${summary.recommendedLesson.lesson.parentCue}`
      : summary.supportMessage,
    ctaLabel: summary.recommendedLesson ? "Open lesson" : "View child",
    actionType: summary.recommendedLesson ? "lesson" : "child",
    lessonId: summary.recommendedLesson?.lesson.id ?? null,
  }));

  const conversationPrompts = [
    ...childSummaries.map((summary) => ({
      id: `prompt-${summary.child.id}`,
      childId: summary.child.id,
      eyebrow: `${summary.child.name} conversation`,
      title: summary.recommendedStory?.title ?? "Story reflection",
      copy: summary.recommendedStory
        ? summary.recommendedStory.reflectionPrompt
        : summary.supportMessage,
      ctaLabel: summary.recommendedStory ? "Open story" : "View child",
      actionType: summary.recommendedStory ? "story" : "child",
      storyId: summary.recommendedStory?.id ?? null,
    })),
    {
      id: "prompt-family",
      eyebrow: "Family ritual",
      title: nextRitual.title,
      copy: nextRitual.copy,
      ctaLabel: "Open family hub",
      actionType: "family",
    },
  ];

  return {
    title: goalPhrase
      ? `${momentumState.label} around ${goalPhrase}`
      : momentumState.label,
    summary: goalPhrase
      ? `KidWiz is currently turning ${goalPhrase} into repeatable practice through lessons, story choices, and family follow-up.`
      : "KidWiz is currently turning family goals into repeatable practice through lessons, story choices, and family follow-up.",
    readinessScore: averageTargetProgress,
    readinessLabel: momentumState.label,
    readinessCopy: momentumState.detail,
    familyDelta,
    familyDeltaLabel: formatDelta(familyDelta),
    familyDeltaTone: getDeltaTone(familyDelta),
    focusCopy: `${supportSummary.child.name} may need extra help in ${supportSummary.supportTrack.title}, while ${strongestSummary.child.name} is carrying visible momentum in ${strongestSummary.strongestTrack.title}.`,
    stats,
    highlights,
    actionPlan,
    conversationPrompts,
    familyTrendSeries,
    childTrendRows,
  };
}

export function getWeeklyTargetForChild({
  childId,
  visibleTracks,
  weeklyTargetsByChild,
}) {
  return weeklyTargetsByChild?.[childId] ?? {
    lessons: 3,
    stories: 2,
    reflections: 2,
    focusTrackId: visibleTracks[0]?.id,
  };
}

export function buildPlanningNudge(summary, visibleTracks) {
  if (!summary?.signal) {
    return null;
  }

  const currentFocusTrack = visibleTracks.find(
    (track) => track.id === summary.weeklyTarget.focusTrackId,
  );
  const currentFocusMatchesSignal = currentFocusTrack?.goalIds?.some((goalId) =>
    summary.signal.goalIds?.includes(goalId),
  );
  const suggestedFocusTrack = visibleTracks.find(
    (track) =>
      track.id !== summary.weeklyTarget.focusTrackId &&
      track.goalIds?.some((goalId) => summary.signal.goalIds?.includes(goalId)),
  );

  const actions = [];

  if (!currentFocusMatchesSignal && suggestedFocusTrack) {
    actions.push({
      type: "focus",
      label: `Shift focus to ${suggestedFocusTrack.title}`,
      trackId: suggestedFocusTrack.id,
    });
  }

  if (
    summary.signal.source === "journal" &&
    summary.signal.mood === "wobbly" &&
    summary.weeklyTarget.reflections < 3
  ) {
    actions.push({
      type: "target",
      key: "reflections",
      delta: 1,
      label: "Add 1 reflection",
    });
  }

  if (
    summary.signal.source === "story" &&
    summary.weeklyTarget.reflections < 3 &&
    summary.weeklyReflectionCount < summary.weeklyTarget.reflections
  ) {
    actions.push({
      type: "target",
      key: "reflections",
      delta: 1,
      label: "Raise reflection target",
    });
  }

  if (
    summary.signal.source === "journal" &&
    summary.signal.mood === "curious" &&
    summary.weeklyTarget.stories < 3
  ) {
    actions.push({
      type: "target",
      key: "stories",
      delta: 1,
      label: "Add 1 story practice",
    });
  }

  if (!actions.length) {
    return null;
  }

  return {
    id: [
      summary.child.id,
      summary.signal.source,
      summary.signal.title,
      ...actions.map((action) => action.label),
    ].join("::"),
    title: `${summary.child.name}'s recent signal is worth planning around`,
    copy: summary.signal.parentCopy,
    actions: actions.slice(0, 2),
  };
}

export function buildChildSummary({
  bodyBoundariesUnlocked,
  selectedGoalIds,
  child,
  visibleTracks = getVisibleTracks(bodyBoundariesUnlocked),
  weeklyHistoryByChild,
  assignedTrackIdsByChild,
  completedJourneyIdsByChild,
  completedLessonIdsByChild,
  childJournalEntriesByChild,
  playlistLessonIdsByChild,
  storyChoicesByChild,
  weeklyTargetsByChild,
  planningNudgeStateByChild,
}) {
  const completedLessons = completedLessonIdsByChild?.[child.id] ?? [];
  const playlistLessonIds = playlistLessonIdsByChild?.[child.id] ?? [];
  const completedJourneys = completedJourneyIdsByChild?.[child.id] ?? [];
  const storyChoices = storyChoicesByChild?.[child.id] ?? {};
  const journalEntries = childJournalEntriesByChild?.[child.id] ?? [];
  const assignedIds = assignedTrackIdsByChild?.[child.id] ?? [];
  const weeklyTarget = getWeeklyTargetForChild({
    childId: child.id,
    visibleTracks,
    weeklyTargetsByChild,
  });
  const rows = visibleTracks.map((track) => ({
    ...track,
    progress: getTrackProgress(child, track, completedLessons),
    status: getTrackStatus(track, completedLessons),
  }));
  const strongest = [...rows].sort((left, right) => right.progress - left.progress)[0];
  const support = [...rows].sort((left, right) => left.progress - right.progress)[0];
  const signal = deriveChildSignal({
    storyChoices,
    childJournalEntries: journalEntries,
  });
  const recommendedLesson = getRecommendedLesson({
    visibleTracks,
    assignedTrackIds: assignedIds,
    playlistLessonIds,
    completedLessonIds: completedLessons,
    weeklyTarget,
    signal,
  });
  const recommendedStory = getRecommendedStory({
    selectedGoalIds,
    storyChoices,
  });
  const childBadgeIds = deriveEarnedBadgeIds({
    completedLessonIds: completedLessons,
    playlistLessonIds,
    childJournalEntries: journalEntries,
    completedJourneyIds: completedJourneys,
    storyChoices,
    bodyBoundariesUnlocked,
  });
  const latestWeeklySnapshot =
    (weeklyHistoryByChild?.[child.id] ?? []).at(-1) ?? null;
  const weeklyLessonCount = Math.max(
    0,
    completedLessons.length - (latestWeeklySnapshot?.completedLessonsTotal ?? 0),
  );
  const weeklyStoryCount = Math.max(
    0,
    Object.keys(storyChoices).length -
      (latestWeeklySnapshot?.completedStoriesTotal ?? 0),
  );
  const weeklyReflectionCount = Math.max(
    0,
    journalEntries.length - (latestWeeklySnapshot?.reflectionsTotal ?? 0),
  );
  const lessonTargetProgress = Math.min(
    100,
    Math.round((weeklyLessonCount / Math.max(1, weeklyTarget.lessons)) * 100),
  );
  const storyTargetProgress = Math.min(
    100,
    Math.round((weeklyStoryCount / Math.max(1, weeklyTarget.stories)) * 100),
  );
  const reflectionTargetProgress = Math.min(
    100,
    Math.round(
      (weeklyReflectionCount / Math.max(1, weeklyTarget.reflections)) * 100,
    ),
  );

  const summary = {
    child,
    strongestTrack: strongest,
    supportTrack: support,
    recommendedLesson,
    recommendedStory,
    signal,
    completedLessons: completedLessons.length,
    completedStories: Object.keys(storyChoices).length,
    journalCount: journalEntries.length,
    badgesEarned: childBadgeIds.length,
    weeklyLessonCount,
    weeklyStoryCount,
    weeklyReflectionCount,
    weeklyTarget,
    lessonTargetProgress,
    storyTargetProgress,
    reflectionTargetProgress,
    overallTargetProgress: Math.round(
      (lessonTargetProgress + storyTargetProgress + reflectionTargetProgress) / 3,
    ),
    supportMessage: recommendedLesson
      ? signal
        ? `${child.supportSpot} ${signal.reason} points toward ${recommendedLesson.lesson.title}.`
        : `${child.supportSpot} Next best move: ${recommendedLesson.lesson.title}.`
      : `${child.supportSpot} Current visible tracks look complete in this family workspace.`,
  };

  const planningNudge = buildPlanningNudge(summary, visibleTracks);
  const planningNudgeState = planningNudgeStateByChild?.[child.id] ?? {
    acceptedIds: [],
    dismissedIds: [],
  };
  const isPlanningNudgeHidden =
    planningNudge &&
    (planningNudgeState.acceptedIds?.includes(planningNudge.id) ||
      planningNudgeState.dismissedIds?.includes(planningNudge.id));

  return {
    ...summary,
    planningNudge: isPlanningNudgeHidden ? null : planningNudge,
  };
}

export function buildChildSummaries({
  bodyBoundariesUnlocked,
  selectedGoalIds,
  visibleTracks = getVisibleTracks(bodyBoundariesUnlocked),
  weeklyHistoryByChild,
  assignedTrackIdsByChild,
  completedJourneyIdsByChild,
  completedLessonIdsByChild,
  childJournalEntriesByChild,
  playlistLessonIdsByChild,
  storyChoicesByChild,
  weeklyTargetsByChild,
  planningNudgeStateByChild,
}) {
  return childProfiles.map((child) =>
    buildChildSummary({
      bodyBoundariesUnlocked,
      selectedGoalIds,
      child,
      visibleTracks,
      weeklyHistoryByChild,
      assignedTrackIdsByChild,
      completedJourneyIdsByChild,
      completedLessonIdsByChild,
      childJournalEntriesByChild,
      playlistLessonIdsByChild,
      storyChoicesByChild,
      weeklyTargetsByChild,
      planningNudgeStateByChild,
    }),
  );
}

export function buildSelectedChildWorkspace({
  appState,
  child,
  visibleTracks = getVisibleTracks(appState.bodyBoundariesUnlocked),
}) {
  const summary = buildChildSummary({
    bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
    selectedGoalIds: appState.selectedGoalIds,
    child,
    visibleTracks,
    weeklyHistoryByChild: appState.weeklyHistoryByChild,
    assignedTrackIdsByChild: appState.assignedTrackIdsByChild,
    completedJourneyIdsByChild: appState.completedJourneyIdsByChild,
    completedLessonIdsByChild: appState.completedLessonIdsByChild,
    childJournalEntriesByChild: appState.childJournalEntriesByChild,
    playlistLessonIdsByChild: appState.playlistLessonIdsByChild,
    storyChoicesByChild: appState.storyChoicesByChild,
    weeklyTargetsByChild: appState.weeklyTargetsByChild,
    planningNudgeStateByChild: appState.planningNudgeStateByChild,
  });
  const completedLessonIds =
    appState.completedLessonIdsByChild?.[child.id] ?? [];
  const completedJourneyIds =
    appState.completedJourneyIdsByChild?.[child.id] ?? [];
  const nextRitual =
    familyRituals[completedLessonIds.length % familyRituals.length];
  const familyChatDone = completedJourneyIds.includes("family-chat");
  const focusTrackTitle =
    visibleTracks.find((track) => track.id === summary.weeklyTarget.focusTrackId)
      ?.title ??
    summary.recommendedLesson?.track.title ??
    visibleTracks[0]?.title ??
    "Focus track";
  const childReflectionStarter =
    summary.recommendedStory?.reflectionPrompt ??
    `What is one small move ${child.name} feels proud of today?`;

  return {
    ...summary,
    nextRitual,
    familyChatDone,
    focusTrackTitle,
    childReflectionStarter,
    signalTitle: summary.signal?.title ?? null,
    signalParentCopy: summary.signal?.parentCopy ?? null,
    pulseRows: [
      {
        id: "lessons",
        label: "Lessons",
        value: `${summary.weeklyLessonCount}/${summary.weeklyTarget.lessons}`,
        progress: summary.lessonTargetProgress,
      },
      {
        id: "stories",
        label: "Stories",
        value: `${summary.weeklyStoryCount}/${summary.weeklyTarget.stories}`,
        progress: summary.storyTargetProgress,
      },
      {
        id: "reflections",
        label: "Reflections",
        value: `${summary.weeklyReflectionCount}/${summary.weeklyTarget.reflections}`,
        progress: summary.reflectionTargetProgress,
      },
    ],
  };
}

export function buildArchivedSnapshotsByChild(appState) {
  const visibleTracks = getVisibleTracks(appState.bodyBoundariesUnlocked);
  const childSummaries = buildChildSummaries({
    bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
    selectedGoalIds: appState.selectedGoalIds,
    visibleTracks,
    weeklyHistoryByChild: appState.weeklyHistoryByChild,
    assignedTrackIdsByChild: appState.assignedTrackIdsByChild,
    completedJourneyIdsByChild: appState.completedJourneyIdsByChild,
    completedLessonIdsByChild: appState.completedLessonIdsByChild,
    childJournalEntriesByChild: appState.childJournalEntriesByChild,
    playlistLessonIdsByChild: appState.playlistLessonIdsByChild,
    storyChoicesByChild: appState.storyChoicesByChild,
    weeklyTargetsByChild: appState.weeklyTargetsByChild,
    planningNudgeStateByChild: appState.planningNudgeStateByChild,
  });

  return Object.fromEntries(
    childSummaries.map((summary) => [
      summary.child.id,
      {
        readinessScore: summary.overallTargetProgress,
        lessonTargetProgress: summary.lessonTargetProgress,
        storyTargetProgress: summary.storyTargetProgress,
        reflectionTargetProgress: summary.reflectionTargetProgress,
        completedLessonsTotal: summary.completedLessons,
        completedStoriesTotal: summary.completedStories,
        reflectionsTotal: summary.journalCount,
        badgesTotal: summary.badgesEarned,
        focusTrackId: summary.weeklyTarget.focusTrackId,
        strongestTrackId: summary.strongestTrack.id,
        supportTrackId: summary.supportTrack.id,
        note: summary.supportMessage,
      },
    ]),
  );
}

function pickAvailableLessonFromTracks(tracks, completedLessonIds) {
  for (const track of tracks) {
    const lesson = getNextTrackLesson(track, completedLessonIds);
    if (lesson) {
      return { lesson, track };
    }
  }

  return null;
}

export function getRecommendedLesson({
  visibleTracks,
  assignedTrackIds,
  playlistLessonIds,
  completedLessonIds,
  weeklyTarget,
  signal,
}) {
  const focusTrack = visibleTracks.find(
    (track) => track.id === weeklyTarget?.focusTrackId,
  );

  if (
    signal?.goalIds?.length &&
    (!focusTrack ||
      !focusTrack.goalIds?.some((goalId) => signal.goalIds.includes(goalId)))
  ) {
    const signalTracks = visibleTracks.filter((track) =>
      track.goalIds?.some((goalId) => signal.goalIds.includes(goalId)),
    );
    const signalResult = pickAvailableLessonFromTracks(
      signalTracks,
      completedLessonIds,
    );

    if (signalResult) {
      return {
        ...signalResult,
        reason: signal.reason,
      };
    }
  }

  if (focusTrack) {
    const lesson = getNextTrackLesson(focusTrack, completedLessonIds);
    if (lesson) {
      return {
        lesson,
        track: focusTrack,
        reason: "Focus track",
      };
    }
  }

  for (const lessonId of playlistLessonIds) {
    const track = findTrackByLessonId(lessonId);
    const lesson = findLessonById(lessonId);

    if (!track || !lesson) {
      continue;
    }

    if (
      completedLessonIds.includes(lessonId) ||
      !isLessonUnlocked(track, lessonId, completedLessonIds)
    ) {
      continue;
    }

    return {
      lesson,
      track,
      reason: "Weekly playlist",
    };
  }

  const assignedTracks = visibleTracks.filter((track) =>
    assignedTrackIds.includes(track.id),
  );
  const assignedResult = pickAvailableLessonFromTracks(
    assignedTracks,
    completedLessonIds,
  );

  if (assignedResult) {
    return {
      ...assignedResult,
      reason: "Assigned track",
    };
  }

  const generalResult = pickAvailableLessonFromTracks(
    visibleTracks,
    completedLessonIds,
  );

  if (generalResult) {
    return {
      ...generalResult,
      reason: "Next open lesson",
    };
  }

  return null;
}
