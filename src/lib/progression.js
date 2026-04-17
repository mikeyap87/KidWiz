import { badgeCatalog, childProfiles, courseCatalog } from "../data/kidwizData";

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
