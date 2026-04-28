import {
  celebrationStyles,
  childProfiles,
  coachStyles,
  familyGoals,
  storyEpisodes,
  weeklyRhythms,
} from "../data/kidwizData";
import {
  buildSelectedChildWorkspace,
  getVisibleTracks,
} from "./progression";
import {
  formatTodayLabel,
  getLearningStudioState,
} from "./appWorkspaceHelpers";

const emptyLessonChallengeState = {
  selectedOptionId: null,
  attempts: 0,
  solved: false,
  lastResult: null,
};

export function deriveAppWorkspace(appState) {
  const visibleTracks = getVisibleTracks(appState.bodyBoundariesUnlocked);
  const selectedChild =
    childProfiles.find((child) => child.id === appState.selectedChildId) ??
    childProfiles[0];
  const selectedGoals = familyGoals.filter((goal) =>
    appState.selectedGoalIds.includes(goal.id),
  );
  const activeTrack =
    visibleTracks.find((track) => track.id === appState.selectedTrackId) ??
    visibleTracks[0];
  const activeLesson =
    activeTrack.lessons.find((lesson) => lesson.id === appState.selectedLessonId) ??
    activeTrack.lessons[0];
  const activeStory =
    storyEpisodes.find((story) => story.id === appState.selectedStoryId) ??
    storyEpisodes[0];
  const selectedRhythm =
    weeklyRhythms.find((item) => item.id === appState.weeklyRhythmId) ??
    weeklyRhythms[0];
  const selectedCoachStyle =
    coachStyles.find((item) => item.id === appState.coachStyleId) ??
    coachStyles[1];
  const selectedCelebrationStyle =
    celebrationStyles.find((item) => item.id === appState.celebrationStyleId) ??
    celebrationStyles[0];

  const childPlaylistLessonIds =
    appState.playlistLessonIdsByChild[selectedChild.id] ?? [];
  const childCompletedLessonIds =
    appState.completedLessonIdsByChild[selectedChild.id] ?? [];
  const childCompletedJourneyIds =
    appState.completedJourneyIdsByChild[selectedChild.id] ?? [];
  const childStoryChoices =
    appState.storyChoicesByChild[selectedChild.id] ?? {};
  const childJournalEntries =
    appState.childJournalEntriesByChild[selectedChild.id] ?? [];
  const childQuizAnswers =
    appState.lessonQuizAnswersByChild[selectedChild.id] ?? {};
  const childLessonMilestones =
    appState.lessonMilestoneIdsByChild[selectedChild.id] ?? {};
  const childLessonPracticeChoices =
    appState.lessonPracticeChoiceIdsByChild[selectedChild.id] ?? {};
  const childLessonChallengeState =
    appState.lessonChallengeStateByChild[selectedChild.id] ?? {};
  const selectedLearningStudio = getLearningStudioState(appState, selectedChild.id);
  const assignedTrackIds =
    appState.assignedTrackIdsByChild[selectedChild.id] ?? [];
  const selectedChildWorkspace = buildSelectedChildWorkspace({
    appState,
    child: selectedChild,
    visibleTracks,
  });
  const selectedWeeklyTarget = selectedChildWorkspace.weeklyTarget;
  const activeLessonAnswer = childQuizAnswers[activeLesson.id];
  const activeLessonMilestoneIds = childLessonMilestones[activeLesson.id] ?? [];
  const activeLessonPracticeChoiceId = childLessonPracticeChoices[activeLesson.id];
  const activeLessonChallengeState =
    childLessonChallengeState[activeLesson.id] ?? emptyLessonChallengeState;
  const answeredOption = activeLesson.quiz.options[activeLessonAnswer];
  const answeredCorrectly =
    activeLessonAnswer === activeLesson.quiz.correctIndex;
  const activeStoryChoice = activeStory.choices.find(
    (choice) => choice.id === childStoryChoices[activeStory.id],
  );

  return {
    activeLesson,
    activeLessonAnswer,
    activeLessonChallengeState,
    activeLessonMilestoneIds,
    activeLessonPracticeChoiceId,
    activeStory,
    activeStoryChoice,
    activeTrack,
    answeredCorrectly,
    answeredOption,
    assignedTrackIds,
    childCompletedJourneyIds,
    childCompletedLessonIds,
    childJournalEntries,
    childPlaylistLessonIds,
    childQuizAnswers,
    childReflectionStarter: selectedChildWorkspace.childReflectionStarter,
    childStoryChoices,
    familyChatDone: selectedChildWorkspace.familyChatDone,
    focusTrackTitle: selectedChildWorkspace.focusTrackTitle,
    nextRitual: selectedChildWorkspace.nextRitual,
    recommendedLesson: selectedChildWorkspace.recommendedLesson,
    recommendedStory: selectedChildWorkspace.recommendedStory,
    selectedCelebrationStyle,
    selectedChild,
    selectedChildWorkspace,
    selectedCoachStyle,
    selectedGoals,
    selectedLearningStudio,
    selectedRhythm,
    selectedWeeklyTarget,
    todayLabel: formatTodayLabel(),
    visibleTracks,
    weeklyCompletion: (childCompletedJourneyIds.length / Math.max(1, 5)) * 100,
  };
}
