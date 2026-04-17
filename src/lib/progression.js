import {
  badgeCatalog,
  childProfiles,
  courseCatalog,
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
      copy: `${child.companionName} helps ${child.name} turn a proud moment, wobble, or question into memory.`,
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
}) {
  const focusTrack = visibleTracks.find(
    (track) => track.id === weeklyTarget?.focusTrackId,
  );

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
