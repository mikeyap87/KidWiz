import { buildSuggestedPlaylists, getVisibleTracks } from "./progression";
import { clampTargetValue } from "./appWorkspaceHelpers";

export function dismissPlanningNudgeState(currentState = {}, nudgeId) {
  return {
    acceptedIds: currentState.acceptedIds ?? [],
    dismissedIds: Array.from(
      new Set([...(currentState.dismissedIds ?? []), nudgeId]),
    ),
  };
}

function getFallbackWeeklyTarget(current) {
  return {
    lessons: 3,
    stories: 2,
    reflections: 2,
    focusTrackId: getVisibleTracks(current.bodyBoundariesUnlocked)[0]?.id,
  };
}

function applyPlanningNudgeActions(currentTarget, actions) {
  return actions.reduce((target, action) => {
    if (action.type === "focus" && action.trackId) {
      return {
        ...target,
        focusTrackId: action.trackId,
      };
    }

    if (action.type === "target" && action.key && action.delta) {
      return {
        ...target,
        [action.key]: clampTargetValue(
          action.key,
          (target[action.key] ?? 1) + action.delta,
        ),
      };
    }

    return target;
  }, currentTarget);
}

export function applyPlanningNudgeToState(current, childId, planningNudge) {
  const currentTarget =
    current.weeklyTargetsByChild?.[childId] ?? getFallbackWeeklyTarget(current);
  const nextTarget = applyPlanningNudgeActions(
    currentTarget,
    planningNudge.actions,
  );
  const currentNudgeState = current.planningNudgeStateByChild?.[childId] ?? {
    acceptedIds: [],
    dismissedIds: [],
  };
  const weeklyTargetsByChild = {
    ...current.weeklyTargetsByChild,
    [childId]: nextTarget,
  };

  return {
    ...current,
    weeklyTargetsByChild,
    playlistLessonIdsByChild: buildSuggestedPlaylists(
      current.selectedGoalIds,
      current.bodyBoundariesUnlocked,
      weeklyTargetsByChild,
    ),
    planningNudgeStateByChild: {
      ...current.planningNudgeStateByChild,
      [childId]: {
        acceptedIds: Array.from(
          new Set([
            ...(currentNudgeState.acceptedIds ?? []),
            planningNudge.id,
          ]),
        ),
        dismissedIds: (currentNudgeState.dismissedIds ?? []).filter(
          (id) => id !== planningNudge.id,
        ),
      },
    },
  };
}
