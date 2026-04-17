import {
  badgeCatalog,
  childProfiles,
  courseCatalog,
  familyRituals,
  questWorldCatalog,
  storyEpisodes,
} from "../data/kidwizData";

export function getVisibleTracks(bodyBoundariesUnlocked) {
  return bodyBoundariesUnlocked
    ? courseCatalog
    : courseCatalog.filter((track) => !track.sensitive);
}

export function findTrackByLessonId(lessonId) {
  return courseCatalog.find((track) =>
    track.lessons.some((lesson) => lesson.id === lessonId),
  );
}

export function findLessonById(lessonId) {
  const track = findTrackByLessonId(lessonId);
  return track?.lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

export function findStoryById(storyId) {
  return storyEpisodes.find((story) => story.id === storyId) ?? null;
}

export function findQuestWorld(trackId) {
  return questWorldCatalog.find((world) => world.trackId === trackId) ?? null;
}

export function getLessonIndex(track, lessonId) {
  return track.lessons.findIndex((lesson) => lesson.id === lessonId);
}

export function isLessonUnlocked(track, lessonId, completedLessonIds) {
  const lessonIndex = getLessonIndex(track, lessonId);

  if (lessonIndex <= 0) {
    return true;
  }

  return completedLessonIds.includes(track.lessons[lessonIndex - 1].id);
}

export function getNextTrackLesson(track, completedLessonIds) {
  return (
    track.lessons.find(
      (lesson) =>
        !completedLessonIds.includes(lesson.id) &&
        isLessonUnlocked(track, lesson.id, completedLessonIds),
    ) ?? null
  );
}

export function getTrackProgress(child, track, completedLessonIds) {
  const base = child.baseTrackScores[track.id] ?? 0;
  const completedCount = track.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;

  return Math.min(100, base + completedCount * 7);
}

export function getTrackStatus(track, completedLessonIds) {
  const completedCount = track.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;
  const total = track.lessons.length;

  if (completedCount === 0) {
    return {
      id: "ready",
      label: "Ready to start",
      detail: `${total} lessons in this arc`,
    };
  }

  if (completedCount === total) {
    return {
      id: "complete",
      label: "Track complete",
      detail: "Capstone ready for review",
    };
  }

  if (completedCount >= Math.min(2, total - 1)) {
    return {
      id: "checkpoint",
      label: "Checkpoint ready",
      detail: `${completedCount} of ${total} lessons done`,
    };
  }

  return {
    id: "progress",
    label: "In progress",
    detail: `${completedCount} of ${total} lessons done`,
  };
}

function countCompletedLessons(track, completedLessonIds) {
  return track.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
}

function rotateTracksForChild(tracks, childId) {
  const childOffset = childProfiles.findIndex((child) => child.id === childId);
  if (childOffset <= 0) {
    return tracks;
  }

  return [...tracks.slice(childOffset), ...tracks.slice(0, childOffset)];
}

function pushLessonIdIfMissing(target, lessonId) {
  if (!lessonId || target.includes(lessonId)) {
    return;
  }

  target.push(lessonId);
}

export function buildSuggestedPlaylistForChild(
  goalIds,
  childId,
  bodyBoundariesUnlocked,
  weeklyTarget,
) {
  const visibleTracks = getVisibleTracks(bodyBoundariesUnlocked);
  const limit = Math.max(3, weeklyTarget?.lessons ?? 3);
  const orderedTracks = rotateTracksForChild(visibleTracks, childId);
  const matches = [];

  if (weeklyTarget?.focusTrackId) {
    const focusTrack = orderedTracks.find(
      (track) => track.id === weeklyTarget.focusTrackId,
    );
    pushLessonIdIfMissing(matches, focusTrack?.lessons[0]?.id);
  }

  orderedTracks.forEach((track) => {
    if (!track.goalIds.some((goalId) => goalIds.includes(goalId))) {
      return;
    }

    pushLessonIdIfMissing(matches, track.lessons[0]?.id);
  });

  orderedTracks.forEach((track, trackIndex) => {
    const lesson = track.lessons[trackIndex % track.lessons.length];
    pushLessonIdIfMissing(matches, lesson?.id);
  });

  return matches.slice(0, limit);
}

export function buildSuggestedPlaylists(
  goalIds,
  bodyBoundariesUnlocked,
  weeklyTargetsByChild,
) {
  return Object.fromEntries(
    childProfiles.map((child) => [
      child.id,
      buildSuggestedPlaylistForChild(
        goalIds,
        child.id,
        bodyBoundariesUnlocked,
        weeklyTargetsByChild?.[child.id],
      ),
    ]),
  );
}

export function deriveEarnedBadgeIds({
  completedLessonIds,
  playlistLessonIds,
  childJournalEntries,
  completedJourneyIds,
  storyChoices,
  bodyBoundariesUnlocked,
}) {
  const uniqueTrackCount = new Set(
    completedLessonIds
      .map((lessonId) => findTrackByLessonId(lessonId)?.id)
      .filter(Boolean),
  ).size;
  const storyCount = Object.keys(storyChoices).length;

  return badgeCatalog
    .filter((badge) => {
      const { criteria } = badge;

      if (criteria.type === "lessons") {
        return completedLessonIds.length >= criteria.count;
      }

      if (criteria.type === "playlist") {
        return playlistLessonIds.length >= criteria.count;
      }

      if (criteria.type === "stories") {
        return storyCount >= criteria.count;
      }

      if (criteria.type === "journals") {
        return childJournalEntries.length >= criteria.count;
      }

      if (criteria.type === "journeys") {
        return completedJourneyIds.length >= criteria.count;
      }

      if (criteria.type === "unique-tracks") {
        return uniqueTrackCount >= criteria.count;
      }

      if (criteria.type === "unlock") {
        return bodyBoundariesUnlocked;
      }

      return false;
    })
    .map((badge) => badge.id);
}

export function getRecommendedStory({ selectedGoalIds, storyChoices }) {
  const unansweredStories = storyEpisodes.filter((story) => !storyChoices[story.id]);

  if (unansweredStories.length === 0) {
    return storyEpisodes[0] ?? null;
  }

  return (
    unansweredStories.find((story) =>
      story.goalIds?.some((goalId) => selectedGoalIds.includes(goalId)),
    ) ?? unansweredStories[0]
  );
}

function getJournalSignalGoalIds(entry) {
  const moodGoalMap = {
    proud: ["confidence", "money", "reading"],
    curious: ["reading", "digital", "money"],
    steady: ["focus", "friendships"],
    grateful: ["friendships", "confidence"],
    wobbly: ["confidence", "friendships", "focus"],
  };

  return moodGoalMap[entry?.mood] ?? [];
}

export function deriveChildSignal({ storyChoices, childJournalEntries }) {
  const latestJournalEntry = childJournalEntries?.[0] ?? null;
  const latestStoryId = Object.keys(storyChoices ?? {}).at(-1) ?? null;
  const latestStory = latestStoryId ? findStoryById(latestStoryId) : null;
  const signalGoalIds = Array.from(
    new Set([
      ...getJournalSignalGoalIds(latestJournalEntry),
      ...(latestStory?.goalIds ?? []),
    ]),
  );

  if (latestJournalEntry) {
    return {
      goalIds: signalGoalIds,
      source: "journal",
      reason: "Reflection follow-through",
      title: `${latestJournalEntry.mood} reflection`,
      copy: latestJournalEntry.body,
      parentCopy:
        latestStory && latestStory.focus
          ? `Recent reflection and story practice both point toward ${latestStory.focus.toLowerCase()} support.`
          : "Recent reflection suggests the next lesson should stay close to the child's current emotional signal.",
    };
  }

  if (latestStory) {
    return {
      goalIds: signalGoalIds,
      source: "story",
      reason: "Story follow-through",
      title: latestStory.title,
      copy: latestStory.reflectionPrompt,
      parentCopy: `Recent story practice points toward ${latestStory.focus.toLowerCase()} and is ready for lesson follow-through.`,
    };
  }

  return null;
}

function getQuestPriority(row, focusTrackId) {
  if (row.id === focusTrackId) {
    return 0;
  }

  if (row.state === "active") {
    return 1;
  }

  if (row.state === "complete") {
    return 2;
  }

  return 3;
}

export function buildQuestWorldRows({
  visibleTracks,
  completedLessonIds,
  weeklyTarget,
  assignedTrackIds,
}) {
  return [...visibleTracks]
    .map((track) => {
      const world = findQuestWorld(track.id);
      const completedCount = countCompletedLessons(track, completedLessonIds);
      const completion = Math.round((completedCount / track.lessons.length) * 100);
      const nextLesson = getNextTrackLesson(track, completedLessonIds);
      const isAssigned = assignedTrackIds.includes(track.id);
      const isFocus = track.id === weeklyTarget?.focusTrackId;

      let state = "ready";

      if (isFocus) {
        state = "focus";
      } else if (completedCount === track.lessons.length) {
        state = "complete";
      } else if (isAssigned || completedCount > 0) {
        state = "active";
      }

      return {
        ...track,
        accent: world?.accent ?? "#ffd15a",
        surface: world?.surface ?? "rgba(255, 209, 90, 0.16)",
        worldTitle: world?.title ?? track.title,
        worldShortTitle: world?.shortTitle ?? track.title,
        worldSummary: world?.summary ?? track.summary,
        mapOrder: world?.mapOrder ?? 99,
        completedCount,
        completion,
        isAssigned,
        isFocus,
        state,
        nextLessonId: nextLesson?.id ?? track.lessons[0]?.id ?? null,
      };
    })
    .sort((left, right) => {
      const leftPriority = getQuestPriority(left, weeklyTarget?.focusTrackId);
      const rightPriority = getQuestPriority(right, weeklyTarget?.focusTrackId);

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.mapOrder - right.mapOrder;
    });
}

export function buildWeeklyMissionBoard({
  child,
  selectedGoalIds,
  visibleTracks,
  weeklyTarget,
  completedLessonIds,
  storyChoices,
  childJournalEntries,
  completedJourneyIds,
  recommendedLesson,
  nextBadge,
  nextRitual,
  signal,
}) {
  const focusTrack = visibleTracks.find(
    (track) => track.id === weeklyTarget?.focusTrackId,
  );
  const focusWorld = findQuestWorld(focusTrack?.id);
  const recommendedStory = getRecommendedStory({
    selectedGoalIds,
    storyChoices,
  });
  const completedStories = Object.keys(storyChoices).length;
  const lessonProgress = Math.min(weeklyTarget?.lessons ?? 0, completedLessonIds.length);
  const storyProgress = Math.min(weeklyTarget?.stories ?? 0, completedStories);
  const reflectionProgress = Math.min(
    weeklyTarget?.reflections ?? 0,
    childJournalEntries.length,
  );
  const familyProgress = completedJourneyIds.includes("family-chat") ? 1 : 0;

  const missions = [
    {
      id: "lesson-sprint",
      eyebrow: focusTrack ? `${focusTrack.title} sprint` : "Course mission",
      title: recommendedLesson?.lesson.title ?? "Choose the next lesson",
      copy: recommendedLesson
        ? `${recommendedLesson.reason} mission in ${
            recommendedLesson.track.title
          }. ${recommendedLesson.lesson.summary}`
        : `Finish ${weeklyTarget.lessons} lesson missions to keep the quest moving.`,
      progress: lessonProgress,
      target: weeklyTarget.lessons,
      ctaLabel: recommendedLesson ? "Open lesson" : "See courses",
      destination: "lesson",
      lessonId: recommendedLesson?.lesson.id ?? null,
      accent: focusWorld?.accent ?? "#ff6b4a",
      reward: focusWorld
        ? `Light up ${focusWorld.title}.`
        : "Unlock the next quest step.",
    },
    {
      id: "story-loop",
      eyebrow: "Story mission",
      title: recommendedStory?.title ?? "Open a story branch",
      copy: recommendedStory
        ? `Practice ${recommendedStory.focus.toLowerCase()} through a branching choice and family debrief.`
        : `Finish ${weeklyTarget.stories} story choices this week.`,
      progress: storyProgress,
      target: weeklyTarget.stories,
      ctaLabel: "Open story",
      destination: "story",
      storyId: recommendedStory?.id ?? null,
      accent: "#3fd0c9",
      reward: "Unlock a new conversation prompt for home.",
    },
    {
      id: "reflection-spark",
      eyebrow: `${child.companionName} reflection`,
      title: "Save one clear reflection",
      copy: signal?.source === "story"
        ? `Use the journal to turn ${signal.title.toLowerCase()} into language the family can remember.`
        : `${child.companionName} helps ${child.name} turn a proud moment, wobble, or question into memory.`,
      progress: reflectionProgress,
      target: weeklyTarget.reflections,
      ctaLabel: "Open journal",
      destination: "journal",
      accent: "#f28dc0",
      reward: "Grow the badge wall with another reflection win.",
    },
    {
      id: "family-ritual",
      eyebrow: "Family ritual",
      title: nextRitual.title,
      copy: nextRitual.copy,
      progress: familyProgress,
      target: 1,
      ctaLabel: "Open family hub",
      destination: "family",
      accent: "#78d46a",
      reward: "Complete one family prompt to lock in the lesson.",
    },
  ];

  const completedMissions = missions.filter(
    (mission) => mission.progress >= mission.target,
  ).length;
  const questPoints =
    completedLessonIds.length * 24 +
    completedStories * 18 +
    childJournalEntries.length * 14 +
    completedJourneyIds.length * 8;

  return {
    focusTrack,
    focusWorld,
    completedMissions,
    totalMissions: missions.length,
    missions,
    nextRewardTitle: nextBadge?.title ?? "Badge wall complete",
    nextRewardCopy:
      nextBadge?.copy ??
      "Every current KidWiz badge is unlocked in this local demo state.",
    questPoints,
    recommendedStory,
  };
}

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

  return {
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
      : `${child.supportSpot} Current visible tracks look complete in the demo state.`,
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
