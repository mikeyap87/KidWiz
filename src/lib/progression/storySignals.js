import { storyEpisodes } from "../../data/kidwizData";
import { findStoryById, getNextTrackLesson } from "./learningCore.js";

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

export function buildStorySkillDebrief({
  story,
  choice,
  visibleTracks,
  completedLessonIds,
}) {
  if (!story || !choice) {
    return null;
  }

  const matchingTrack =
    visibleTracks.find((track) =>
      track.goalIds?.some((goalId) => story.goalIds?.includes(goalId)),
    ) ?? visibleTracks[0];
  const nextLesson = matchingTrack
    ? getNextTrackLesson(matchingTrack, completedLessonIds)
    : null;

  return {
    skillLabel: story.focus,
    title: `Skill practiced: ${story.focus}`,
    meaning: `${choice.title} shows how a child might handle ${story.focus.toLowerCase()} when the moment feels real instead of theoretical.`,
    parentQuestion: choice.parentCue,
    childReflection: story.reflectionPrompt,
    recommendedLesson: nextLesson
      ? {
          lesson: nextLesson,
          track: matchingTrack,
          reason: `Keep practicing ${story.focus.toLowerCase()} in ${matchingTrack.title}.`,
        }
      : null,
    nextStepCopy: nextLesson
      ? `${nextLesson.title} is the closest lesson follow-through for this story signal.`
      : `${matchingTrack?.title ?? "This track"} looks complete in the current family workspace.`,
  };
}

export function buildJournalInsightCoach({
  child,
  childJournalEntries,
  visibleTracks,
  completedLessonIds,
}) {
  const latestEntry = childJournalEntries[0] ?? null;
  const moodCounts = childJournalEntries.reduce((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    return counts;
  }, {});
  const topMood =
    Object.entries(moodCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "ready";
  const goalIds = getJournalSignalGoalIds(latestEntry);
  const matchingTrack =
    visibleTracks.find((track) =>
      track.goalIds?.some((goalId) => goalIds.includes(goalId)),
    ) ?? visibleTracks.find((track) => track.goalIds?.includes("confidence")) ?? visibleTracks[0];
  const nextLesson = matchingTrack
    ? getNextTrackLesson(matchingTrack, completedLessonIds)
    : null;
  const needMap = {
    proud: "recognition and a next challenge that keeps pride moving",
    curious: "room to ask questions and turn interest into a small experiment",
    steady: "consistent rhythm and a calm next step",
    grateful: "connection, appreciation, and a chance to name what helped",
    wobbly: "reassurance, smaller steps, and proof that hard feelings can move",
    relieved: "a lighter plan and a reminder that starting can change the whole task",
  };
  const responseMap = {
    proud: "Name the effort before the outcome, then ask what felt different this time.",
    curious: "Invite one question, one guess, and one tiny test.",
    steady: "Keep the routine predictable and celebrate the quiet follow-through.",
    grateful: "Ask who or what helped, then help the child say it clearly.",
    wobbly: "Lower the size of the next step and remind them that wobble is data, not failure.",
    relieved: "Ask what made the task feel smaller, then reuse that move tomorrow.",
  };

  return {
    title: latestEntry
      ? `${child.name}'s journal is pointing toward ${topMood} energy.`
      : `${child.name}'s first journal pattern is waiting.`,
    moodTrend: latestEntry
      ? `${childJournalEntries.length} saved reflection${childJournalEntries.length === 1 ? "" : "s"}, with ${topMood} showing up most.`
      : "No saved child reflections yet.",
    likelyNeed: needMap[topMood] ?? "a clear next step and a parent who notices effort",
    parentResponse:
      responseMap[topMood] ??
      "Start with one sentence of noticing, then ask what would make tomorrow easier.",
    latestSignal: latestEntry?.body ?? "Save one short reflection to unlock a clearer pattern.",
    recommendedPractice: nextLesson
      ? {
          lesson: nextLesson,
          track: matchingTrack,
          copy: `${nextLesson.title} is the closest practice for this journal signal.`,
        }
      : null,
  };
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
      mood: latestJournalEntry.mood,
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
