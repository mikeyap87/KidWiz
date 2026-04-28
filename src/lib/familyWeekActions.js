import { childProfiles } from "../data/kidwizData";
import {
  buildArchivedSnapshotsByChild,
  buildSuggestedPlaylists,
  getVisibleTracks,
} from "./progression";
import { getNextFocusTrackId } from "./appWorkspaceHelpers";

function emptyArrayByChild() {
  return Object.fromEntries(childProfiles.map((child) => [child.id, []]));
}

function emptyObjectByChild() {
  return Object.fromEntries(childProfiles.map((child) => [child.id, {}]));
}

function buildNextWeeklyTargetsByChild(current) {
  const nextVisibleTracks = getVisibleTracks(current.bodyBoundariesUnlocked);

  return Object.fromEntries(
    childProfiles.map((child) => {
      const currentTarget = current.weeklyTargetsByChild?.[child.id] ?? {
        lessons: 3,
        stories: 2,
        reflections: 2,
        focusTrackId: nextVisibleTracks[0]?.id,
      };
      const assignedVisibleTrackIds = (
        current.assignedTrackIdsByChild?.[child.id] ?? []
      ).filter((trackId) =>
        nextVisibleTracks.some((track) => track.id === trackId),
      );
      const focusPool = assignedVisibleTrackIds.length
        ? assignedVisibleTrackIds
        : nextVisibleTracks.map((track) => track.id);

      return [
        child.id,
        {
          ...currentTarget,
          focusTrackId: getNextFocusTrackId(
            focusPool,
            currentTarget.focusTrackId,
          ),
        },
      ];
    }),
  );
}

export function buildFreshWeekState(current) {
  const nextWeeklyTargetsByChild = buildNextWeeklyTargetsByChild(current);

  return {
    ...current,
    weeklyTargetsByChild: nextWeeklyTargetsByChild,
    playlistLessonIdsByChild: buildSuggestedPlaylists(
      current.selectedGoalIds,
      current.bodyBoundariesUnlocked,
      nextWeeklyTargetsByChild,
    ),
    completedJourneyIdsByChild: emptyArrayByChild(),
    lessonMilestoneIdsByChild: emptyObjectByChild(),
    lessonChallengeStateByChild: emptyObjectByChild(),
    lessonPracticeChoiceIdsByChild: emptyObjectByChild(),
    lessonQuizAnswersByChild: emptyObjectByChild(),
  };
}

export function buildArchivedSnapshotsMap(weekLabel, sourceState) {
  const snapshots = buildArchivedSnapshotsByChild(sourceState);

  return Object.fromEntries(
    Object.entries(snapshots).map(([childId, snapshot]) => [
      childId,
      {
        ...snapshot,
        weekLabel,
      },
    ]),
  );
}

export function appendArchivedSnapshots(currentHistory, snapshotsByChild) {
  return Object.fromEntries(
    childProfiles.map((child) => [
      child.id,
      [
        ...((currentHistory?.[child.id] ?? []).slice(-7)),
        snapshotsByChild[child.id],
      ],
    ]),
  );
}

export function archiveCurrentWeekState(current, snapshotsByChild) {
  return {
    ...current,
    weeklyHistoryByChild: appendArchivedSnapshots(
      current.weeklyHistoryByChild,
      snapshotsByChild,
    ),
  };
}

export function archiveAndStartFreshWeekState(current, snapshotsByChild) {
  return {
    ...buildFreshWeekState(current),
    weeklyHistoryByChild: appendArchivedSnapshots(
      current.weeklyHistoryByChild,
      snapshotsByChild,
    ),
  };
}
