import {
  celebrationStyles,
  childProfiles,
  coachStyles,
  courseCatalog,
  storyEpisodes,
  weeklyRhythms,
} from "../data/kidwizData";
import {
  starterAssignedTrackIdsByChild,
  starterChildJournalEntriesByChild,
  starterCompletedJourneyIdsByChild,
  starterCompletedLessonIdsByChild,
  starterFamilyGoalIds,
  starterParentJournalEntries,
  starterPlaylistLessonIdsByChild,
  starterStoryChoicesByChild,
  starterWeeklyHistoryByChild,
  starterWeeklyTargetsByChild,
} from "../data/kidwizDemoSeedData";

export const STORAGE_KEY = "kidwiz-demo-state-v3";

export function createDefaultState() {
  return {
    session: null,
    activeTab: "dashboard",
    onboardingComplete: false,
    onboardingStep: 0,
    familyName: "Aster House",
    selectedChildId: childProfiles[0].id,
    selectedTrackId: courseCatalog[0].id,
    selectedLessonId: courseCatalog[0].lessons[0].id,
    selectedStoryId: storyEpisodes[0].id,
    selectedGoalIds: starterFamilyGoalIds,
    weeklyRhythmId: weeklyRhythms[0].id,
    coachStyleId: coachStyles[1].id,
    celebrationStyleId: celebrationStyles[0].id,
    bodyBoundariesUnlocked: false,
    playlistLessonIdsByChild: starterPlaylistLessonIdsByChild,
    completedLessonIdsByChild: starterCompletedLessonIdsByChild,
    completedJourneyIdsByChild: starterCompletedJourneyIdsByChild,
    storyChoicesByChild: starterStoryChoicesByChild,
    childJournalEntriesByChild: starterChildJournalEntriesByChild,
    parentJournalEntries: starterParentJournalEntries,
    assignedTrackIdsByChild: starterAssignedTrackIdsByChild,
    weeklyTargetsByChild: starterWeeklyTargetsByChild,
    weeklyHistoryByChild: starterWeeklyHistoryByChild,
    lessonMilestoneIdsByChild: Object.fromEntries(
      childProfiles.map((child) => [child.id, {}]),
    ),
    lessonPracticeChoiceIdsByChild: Object.fromEntries(
      childProfiles.map((child) => [child.id, {}]),
    ),
    lessonQuizAnswersByChild: Object.fromEntries(
      childProfiles.map((child) => [child.id, {}]),
    ),
  };
}

export function loadSavedState() {
  const defaults = createDefaultState();

  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      ...defaults,
      ...parsed,
      selectedGoalIds: parsed.selectedGoalIds ?? defaults.selectedGoalIds,
      playlistLessonIdsByChild: {
        ...defaults.playlistLessonIdsByChild,
        ...(parsed.playlistLessonIdsByChild ?? {}),
      },
      completedLessonIdsByChild: {
        ...defaults.completedLessonIdsByChild,
        ...(parsed.completedLessonIdsByChild ?? {}),
      },
      completedJourneyIdsByChild: {
        ...defaults.completedJourneyIdsByChild,
        ...(parsed.completedJourneyIdsByChild ?? {}),
      },
      storyChoicesByChild: {
        ...defaults.storyChoicesByChild,
        ...(parsed.storyChoicesByChild ?? {}),
      },
      childJournalEntriesByChild: {
        ...defaults.childJournalEntriesByChild,
        ...(parsed.childJournalEntriesByChild ?? {}),
      },
      assignedTrackIdsByChild: {
        ...defaults.assignedTrackIdsByChild,
        ...(parsed.assignedTrackIdsByChild ?? {}),
      },
      weeklyTargetsByChild: {
        ...defaults.weeklyTargetsByChild,
        ...(parsed.weeklyTargetsByChild ?? {}),
      },
      weeklyHistoryByChild: {
        ...defaults.weeklyHistoryByChild,
        ...(parsed.weeklyHistoryByChild ?? {}),
      },
      lessonMilestoneIdsByChild: {
        ...defaults.lessonMilestoneIdsByChild,
        ...(parsed.lessonMilestoneIdsByChild ?? {}),
      },
      lessonPracticeChoiceIdsByChild: {
        ...defaults.lessonPracticeChoiceIdsByChild,
        ...(parsed.lessonPracticeChoiceIdsByChild ?? {}),
      },
      lessonQuizAnswersByChild: {
        ...defaults.lessonQuizAnswersByChild,
        ...(parsed.lessonQuizAnswersByChild ?? {}),
      },
      parentJournalEntries:
        parsed.parentJournalEntries ?? defaults.parentJournalEntries,
    };
  } catch {
    return defaults;
  }
}
