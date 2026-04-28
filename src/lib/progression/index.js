import {
  childProfiles,
  familyRituals,
} from "../../data/kidwizData";
import {
  deriveEarnedBadgeIds,
  findLessonById,
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

export {
  buildFamilyMeetingBuilder,
  buildParentDailyBrief,
  buildParentProgressNarrative,
  buildParentReviewQueue,
  buildParentWeeklyReport,
} from "./parentReports.js";

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
