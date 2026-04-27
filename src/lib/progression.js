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

export function buildLearningPathMap({
  activeLessonId,
  completedLessonIds,
  playlistLessonIds,
  track,
}) {
  const nextOpenLesson = getNextTrackLesson(track, completedLessonIds);

  return {
    nextOpenLesson,
    checkpointLabel: nextOpenLesson
      ? `Next checkpoint: ${nextOpenLesson.title}`
      : `Capstone ready: ${track.project}`,
    rows: track.lessons.map((lesson, index) => {
      const complete = completedLessonIds.includes(lesson.id);
      const unlocked = complete || isLessonUnlocked(track, lesson.id, completedLessonIds);
      const queued = playlistLessonIds.includes(lesson.id);
      const isNext = nextOpenLesson?.id === lesson.id;

      return {
        lesson,
        index,
        complete,
        unlocked,
        queued,
        isActive: activeLessonId === lesson.id,
        isNext,
        stateLabel: complete
          ? "Complete"
          : isNext
            ? "Next"
            : unlocked
              ? "Unlocked"
              : "Locked",
      };
    }),
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
      : `${matchingTrack?.title ?? "This track"} looks complete in the current local state.`,
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

export function buildParentTrustReview({
  appState,
  assignedTrackIds,
  selectedChild,
  selectedCoachStyle,
  visibleTracks,
}) {
  const sensitiveTrackVisible = visibleTracks.some((track) => track.sensitive);
  const assignedSensitiveTrack = visibleTracks.some(
    (track) => track.sensitive && assignedTrackIds.includes(track.id),
  );
  const childJournalCount =
    appState.childJournalEntriesByChild?.[selectedChild.id]?.length ?? 0;
  const parentNoteCount = appState.parentJournalEntries?.length ?? 0;

  const rows = [
    {
      label: "Sensitive topics",
      status: sensitiveTrackVisible ? "Parent unlocked" : "Locked",
      copy: sensitiveTrackVisible
        ? assignedSensitiveTrack
          ? "The sensitive track is visible and assigned, so parent review should stay active."
          : "The sensitive track is visible but not assigned to this child."
        : "Body and Boundaries stays hidden until a parent unlocks it.",
    },
    {
      label: "Spark Coach boundaries",
      status: selectedCoachStyle.title,
      copy: "Coach mode changes tone and support style, while KidWiz keeps AI positioned as bounded learning guidance.",
    },
    {
      label: "Journal privacy",
      status: `${childJournalCount} child note${childJournalCount === 1 ? "" : "s"}`,
      copy:
        parentNoteCount > 0
          ? "Child reflections and parent notes are separate in this local demo state."
          : "Parent notes are empty, so the parent memory layer has room to grow.",
    },
    {
      label: "Parent controls",
      status: "Active",
      copy: "Goals, rhythm, celebration, assigned tracks, weekly history, and sensitive access are parent-controlled here.",
    },
  ];

  const readyCount = rows.filter((row) =>
    ["Parent unlocked", "Locked", "Active"].includes(row.status) ||
    row.status === selectedCoachStyle.title ||
    row.status.includes("note"),
  ).length;

  return {
    score: Math.round((readyCount / rows.length) * 100),
    title: "Parent Safety & Trust Review",
    copy:
      "A quick parent-facing check of what is protected, what is visible, and what adults can control before real accounts and backend storage are added.",
    rows,
  };
}

export function buildParentPrivacyCenter({
  appState,
  assignedTrackIds,
  selectedChild,
  visibleTracks,
}) {
  const childJournalCount =
    appState.childJournalEntriesByChild?.[selectedChild.id]?.length ?? 0;
  const parentNoteCount = appState.parentJournalEntries?.length ?? 0;
  const lessonCount =
    appState.completedLessonIdsByChild?.[selectedChild.id]?.length ?? 0;
  const storyChoiceCount = Object.keys(
    appState.storyChoicesByChild?.[selectedChild.id] ?? {},
  ).length;
  const weeklySnapshotCount =
    appState.weeklyHistoryByChild?.[selectedChild.id]?.length ?? 0;
  const playlistCount =
    appState.playlistLessonIdsByChild?.[selectedChild.id]?.length ?? 0;
  const sensitiveTrackVisible = visibleTracks.some((track) => track.sensitive);
  const assignedSensitiveTrack = visibleTracks.some(
    (track) => track.sensitive && assignedTrackIds.includes(track.id),
  );
  const exportItemCount =
    childJournalCount +
    parentNoteCount +
    lessonCount +
    storyChoiceCount +
    weeklySnapshotCount +
    playlistCount;

  const dataRows = [
    {
      label: "Child reflections",
      count: childJournalCount,
      policy: "Exportable, deletable, privacy-reviewed",
      copy: "Child journal entries need a production visibility setting before launch.",
      tone: childJournalCount > 0 ? "warn" : "neutral",
    },
    {
      label: "Parent notes",
      count: parentNoteCount,
      policy: "Parent-owned",
      copy: "Parent notes should stay separate from child-authored reflections.",
      tone: parentNoteCount > 0 ? "good" : "neutral",
    },
    {
      label: "Learning progress",
      count: lessonCount,
      policy: "Exportable progress history",
      copy: "Completed lessons, playlist state, and badges should remain portable.",
      tone: "good",
    },
    {
      label: "Story practice",
      count: storyChoiceCount,
      policy: "Skill signal, not diagnosis",
      copy: "Story choices should be stored as learning signals, never labels on the child.",
      tone: "good",
    },
    {
      label: "Weekly snapshots",
      count: weeklySnapshotCount,
      policy: "Retention decision needed",
      copy: "Archived weekly reports need a clear retention window and delete path.",
      tone: weeklySnapshotCount > 0 ? "warn" : "neutral",
    },
    {
      label: "Playlists",
      count: playlistCount,
      policy: "Parent-adjustable",
      copy: "Recommended lessons should be explainable and editable by adults.",
      tone: "good",
    },
  ];

  const consentRows = [
    {
      label: "Sensitive-topic access",
      status: sensitiveTrackVisible ? "Parent unlocked" : "Locked",
      copy: assignedSensitiveTrack
        ? "Body and Boundaries is visible and assigned, so consent should be logged with timestamp and parent identity."
        : sensitiveTrackVisible
          ? "Body and Boundaries is visible but not assigned to this child."
          : "Body and Boundaries stays hidden until a parent opens it.",
      tone: sensitiveTrackVisible ? "warn" : "good",
    },
    {
      label: "AI tutoring",
      status: "Mock only",
      copy: "Real AI should require moderation, parent-readable summaries, and retention settings before child use.",
      tone: "warn",
    },
    {
      label: "Exports",
      status: `${exportItemCount} local item${exportItemCount === 1 ? "" : "s"}`,
      copy: "The production product should let parents export child data in a readable family archive.",
      tone: exportItemCount > 0 ? "good" : "neutral",
    },
    {
      label: "Deletion",
      status: "Preview only",
      copy: "Local reset tools exist, but production needs scoped delete requests, confirmation, and recovery windows.",
      tone: "warn",
    },
  ];

  return {
    title: "Parent Consent & Privacy Center",
    copy:
      "A parent-readable privacy preview for what KidWiz stores locally today, what consent decisions matter, and what export or deletion controls a production build should provide.",
    exportItemCount,
    dataRows,
    consentRows,
    parentActions: [
      "Preview a family export that separates child reflections, parent notes, learning progress, stories, and safety events.",
      "Request deletion for one child profile, one journal category, or the full family account with confirmation windows.",
      "Review sensitive-topic and AI tutoring consent before unlocking age-banded experiences.",
    ],
  };
}

export function buildLaunchReadinessConsole() {
  const rows = [
    {
      label: "Auth",
      status: "Demo-ready",
      readiness: "Production needed",
      copy: "The local login path is useful for testing, but real parent accounts, child profiles, and roles still need persisted auth.",
      tone: "warn",
    },
    {
      label: "Database",
      status: "Demo-only",
      readiness: "Production needed",
      copy: "Progress, journals, reports, unlocks, and weekly history currently live in browser storage for fast local iteration.",
      tone: "warn",
    },
    {
      label: "AI safety",
      status: "Bounded design",
      readiness: "Production needed",
      copy: "Spark is framed as guided learning support, but server-side moderation, prompt review, and audit logs are not wired yet.",
      tone: "warn",
    },
    {
      label: "Privacy",
      status: "Parent-visible",
      readiness: "Needs policy",
      copy: "Child journals and family notes need export, deletion, retention, consent, and privacy policy decisions before launch.",
      tone: "warn",
    },
    {
      label: "Billing",
      status: "Not started",
      readiness: "Future",
      copy: "Subscription plans, checkout, trials, invoices, and cancellation flows are intentionally outside this local review build.",
      tone: "neutral",
    },
    {
      label: "QA",
      status: "Local checks",
      readiness: "Growing",
      copy: "Lint, build, and browser checks are run locally after feature passes; automated regression coverage should come next.",
      tone: "good",
    },
    {
      label: "Analytics",
      status: "Not started",
      readiness: "Future",
      copy: "Learning engagement, feature usage, and parent outcome dashboards still need an event model and privacy-safe tracking.",
      tone: "neutral",
    },
  ];
  const readyCount = rows.filter((row) => row.tone === "good").length;

  return {
    score: Math.round((readyCount / rows.length) * 100),
    title: "Launch Readiness Console",
    copy:
      "A plain-English view of what KidWiz can prove locally today and what still needs backend, privacy, safety, billing, analytics, and automated QA work before families depend on it.",
    rows,
    nextSteps: [
      "Create the production data model for families, children, courses, journals, progress, unlocks, and audit events.",
      "Add server-side AI safety rails for moderation, age-aware routing, prompt logs, and parent-reviewable coach activity.",
      "Define child privacy controls for consent, retention, exports, deletion, sensitive-topic access, and parent visibility.",
    ],
  };
}

export function buildProductionDataModelConsole() {
  const domains = [
    {
      label: "Family account",
      table: "families",
      records: ["family_id", "plan_id", "timezone", "created_at"],
      source: "Onboarding, rhythm, family goals",
      priority: "MVP",
      tone: "good",
    },
    {
      label: "Parent access",
      table: "parent_profiles",
      records: ["user_id", "family_id", "role", "notification_prefs"],
      source: "Login, parent controls, review queues",
      priority: "MVP",
      tone: "good",
    },
    {
      label: "Child profile",
      table: "child_profiles",
      records: ["child_id", "family_id", "age_band", "coach_style"],
      source: "Learner switcher, age-aware lessons",
      priority: "MVP",
      tone: "good",
    },
    {
      label: "Learning progress",
      table: "lesson_progress",
      records: ["child_id", "lesson_id", "status", "completed_at"],
      source: "Courses, playlists, path maps, badges",
      priority: "MVP",
      tone: "good",
    },
    {
      label: "Reflections",
      table: "journal_entries",
      records: ["entry_id", "child_id", "mood", "visibility"],
      source: "Child journal and parent notes",
      priority: "Privacy",
      tone: "warn",
    },
    {
      label: "Story choices",
      table: "story_choice_events",
      records: ["child_id", "story_id", "choice_id", "skill_signal"],
      source: "Stories and skill debriefs",
      priority: "MVP",
      tone: "good",
    },
    {
      label: "AI safety",
      table: "ai_safety_events",
      records: ["event_id", "child_id", "decision", "parent_review"],
      source: "Spark Tutor Safety Studio",
      priority: "Safety",
      tone: "warn",
    },
    {
      label: "Consent",
      table: "consent_records",
      records: ["family_id", "scope", "granted_by", "expires_at"],
      source: "Sensitive-topic unlocks and privacy controls",
      priority: "Safety",
      tone: "warn",
    },
    {
      label: "Billing",
      table: "subscriptions",
      records: ["family_id", "stripe_customer_id", "status", "renewal_at"],
      source: "Future plan and payment flows",
      priority: "Later",
      tone: "neutral",
    },
  ];

  return {
    title: "Production Data Model Console",
    copy:
      "A founder-and-engineering map from the local KidWiz experience to the records a real SaaS backend will need before launch.",
    domains,
    flow: [
      "Parent creates family account",
      "Children and consent settings attach to the family",
      "Lessons, stories, journals, and AI safety events write child-scoped records",
      "Reports, nudges, badges, and weekly snapshots read from the same trusted source",
    ],
    openQuestions: [
      "Which journal entries should be private to the child, parent-visible, or parent-requested?",
      "How long should AI safety event summaries and prompt metadata be retained?",
      "Should billing ownership live at the family level only, or support schools and group buyers later?",
    ],
  };
}

export function buildCurriculumDepthConsole() {
  const rows = courseCatalog.map((track) => {
    const lessonCount = track.lessons.length;
    const quizCount = track.lessons.filter((lesson) => lesson.quiz).length;
    const parentCueCount = track.lessons.filter((lesson) => lesson.parentCue).length;
    const storyCount = storyEpisodes.filter((story) =>
      story.goalIds.some((goalId) => track.goalIds.includes(goalId)),
    ).length;
    const lessonDepth =
      lessonCount >= 5 ? "Deep" : lessonCount >= 3 ? "Solid" : "Thin";
    const tone =
      lessonCount >= 5 && storyCount >= 2
        ? "good"
        : lessonCount >= 3
          ? "warn"
          : "neutral";
    const score = Math.min(
      100,
      Math.round(
        lessonCount * 10 +
          quizCount * 4 +
          parentCueCount * 3 +
          Math.min(storyCount, 3) * 6,
      ),
    );

    return {
      id: track.id,
      title: track.title,
      ageBand: track.ageBand,
      lessonCount,
      quizCount,
      parentCueCount,
      storyCount,
      lessonDepth,
      score,
      tone,
      sensitive: Boolean(track.sensitive),
      copy:
        storyCount > 0
          ? `${track.title} connects to ${storyCount} branching story signal${storyCount === 1 ? "" : "s"} and ${parentCueCount} parent cue${parentCueCount === 1 ? "" : "s"}.`
          : `${track.title} needs story support so practice does not stay isolated inside lessons.`,
    };
  });
  const lessonTotal = rows.reduce((total, row) => total + row.lessonCount, 0);
  const quizTotal = rows.reduce((total, row) => total + row.quizCount, 0);
  const averageScore = Math.round(
    rows.reduce((total, row) => total + row.score, 0) / rows.length,
  );
  const thinTracks = rows.filter((row) => row.lessonDepth !== "Deep");

  return {
    title: "Curriculum Depth Console",
    score: averageScore,
    copy:
      "A product-quality view of which KidWiz tracks have enough lessons, quiz checkpoints, story support, age-banding, and parent follow-through to feel launch-worthy.",
    summaryRows: [
      {
        label: "Tracks",
        value: rows.length,
        copy: "Including one parent-unlocked sensitive track.",
      },
      {
        label: "Lessons",
        value: lessonTotal,
        copy: "Authored local lessons across academics and life skills.",
      },
      {
        label: "Quiz checks",
        value: quizTotal,
        copy: "Every launch track should keep a lightweight proof point.",
      },
      {
        label: "Depth score",
        value: `${averageScore}%`,
        copy: "Simple coverage score for prioritizing content expansion.",
      },
    ],
    rows,
    nextMoves: [
      thinTracks.length > 0
        ? `Expand ${thinTracks.map((track) => track.title).slice(0, 3).join(", ")} before calling the curriculum broad enough for launch.`
        : "Keep adding richer interaction formats now that lesson coverage is broad.",
      "Add at least one branching story or roleplay for each major life-skill track.",
      "Create a content QA checklist for age fit, parent cue quality, quiz clarity, and sensitive-topic review.",
    ],
  };
}

export function buildSparkTutorSafetyStudio({
  activeLesson,
  activeTrack,
  selectedChild,
  selectedCoachStyle,
  coachResponseMode,
}) {
  const sensitiveTrack = Boolean(activeTrack?.sensitive);
  const ageBand = activeTrack?.ageBand ?? `${selectedChild.age}-12`;
  const modeLabels = {
    gentle: "soft reassurance",
    playful: "imaginative practice",
    stretch: "bigger ownership",
  };
  const guardrails = [
    {
      label: "Age fit",
      status: `Age ${selectedChild.age} inside ${ageBand}`,
      copy: "The tutor keeps vocabulary, examples, and challenge level aligned to the active track and child profile.",
      tone: "good",
    },
    {
      label: "Learning scope",
      status: activeLesson.title,
      copy: "Spark answers inside the current lesson goal instead of becoming an open-ended chatbot.",
      tone: "good",
    },
    {
      label: "Sensitive routing",
      status: sensitiveTrack ? "Parent-opened track" : "General track",
      copy: sensitiveTrack
        ? "Sensitive questions stay age-banded, parent-visible, and grounded in trusted-adult support."
        : "Sensitive or medical questions would be redirected to a trusted adult and parent review.",
      tone: sensitiveTrack ? "warn" : "good",
    },
    {
      label: "Parent visibility",
      status: "Reviewable",
      copy: "The production version should save prompt summaries, safety decisions, and coach actions for parent review.",
      tone: "warn",
    },
  ];

  const samplePrompts = [
    {
      label: "Allowed learning prompt",
      childPrompt: `Can you help me practice ${activeLesson.title.toLowerCase()}?`,
      decision: "Answer with lesson support",
      response: `${selectedChild.name}, let's use ${selectedCoachStyle.title.toLowerCase()} energy and try one small step. ${activeLesson.coachModes[coachResponseMode]} Then choose one sentence you could actually use today.`,
      parentLog: `${selectedChild.name} practiced ${activeTrack.title} with ${modeLabels[coachResponseMode]} support and the ${selectedCoachStyle.title.toLowerCase()} family setting.`,
      tone: "good",
    },
    {
      label: "Confidence wobble",
      childPrompt: "What if I mess up and everyone notices?",
      decision: "Coach with reassurance",
      response: "Messing up is information, not proof that you cannot do it. Name the smallest next move, try it once, and then check what changed.",
      parentLog: `${selectedChild.name} asked for confidence support during ${activeLesson.title}.`,
      tone: "good",
    },
    {
      label: "Needs adult help",
      childPrompt: "I have a private safety question and I do not want to tell anyone.",
      decision: "Pause and involve a trusted adult",
      response: "You do not have to handle safety questions alone. Choose a trusted grown-up now, and KidWiz can help you write the first sentence.",
      parentLog: "Spark should flag this as a parent-review moment and avoid giving private safety advice alone.",
      tone: "warn",
    },
  ];

  return {
    title: "Spark Tutor Safety Studio",
    posture: sensitiveTrack
      ? "Sensitive track support is parent-opened and review-first."
      : "General learning support stays bounded to the active lesson.",
    copy:
      "A local mock of how KidWiz can make AI tutoring useful without making it unsupervised: every response has a lesson scope, safety decision, and parent-readable summary.",
    guardrails,
    samplePrompts,
    moderationChecklist: [
      "Keep the answer inside the active lesson and selected family coaching style.",
      "Use age-aware language and avoid adult topics unless the parent unlocked the track.",
      "Redirect medical, sexual, self-harm, abuse, or secrecy-heavy questions to a trusted adult and parent review.",
      "Save a parent-readable summary instead of exposing a raw private transcript by default.",
    ],
  };
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

export function buildKidDailyQuestBrief({
  child,
  missionBoard,
  recommendedLesson,
  signal,
  weeklyCompletion,
}) {
  const nextMission =
    missionBoard.missions.find((mission) => mission.progress < mission.target) ??
    missionBoard.missions[0] ??
    null;
  const focusTitle =
    missionBoard.focusWorld?.title ??
    missionBoard.focusTrack?.title ??
    "today's quest";
  const progressLabel =
    weeklyCompletion >= 75
      ? "You are close to lighting up the week."
      : weeklyCompletion >= 45
        ? "You have enough momentum for one brave next step."
        : "Start small and let the first win make the next one easier.";

  return {
    title: nextMission
      ? `${child.name}, your next quest is ${nextMission.title}.`
      : `${child.name}, choose one small quest to begin.`,
    copy: signal
      ? `${child.companionName} noticed ${signal.title.toLowerCase()}. This mission helps turn that clue into a real-life skill.`
      : `${child.companionName} picked a mission that keeps ${focusTitle} moving without making the day feel too big.`,
    progressLabel,
    nextMission,
    reasonRows: [
      {
        label: "Why it matters",
        value:
          recommendedLesson?.lesson.parentCue ??
          nextMission?.copy ??
          "Small practice now makes the next family conversation easier.",
      },
      {
        label: "What you unlock",
        value:
          nextMission?.reward ??
          missionBoard.nextRewardCopy ??
          "More quest energy for the reward shelf.",
      },
      {
        label: "Tiny confidence prompt",
        value: `Say: "I can try the first part before I know the whole answer."`,
      },
    ],
  };
}

export function buildChildFirstSessionLaunchpad({
  child,
  missionBoard,
  recommendedLesson,
  weeklyCompletion,
}) {
  const firstMission =
    missionBoard.missions.find((mission) => mission.progress < mission.target) ??
    missionBoard.missions[0] ??
    null;
  const lessonTitle = recommendedLesson?.lesson.title ?? firstMission?.title ?? "one small quest";
  const firstWinLabel =
    weeklyCompletion > 0
      ? `${Math.round(weeklyCompletion)}% of this week is already moving.`
      : "One tiny win starts the whole map.";

  return {
    title: `Start here, ${child.name}.`,
    copy: `${child.companionName} is your ${child.companionTitle.toLowerCase()}. The first session is simple: meet the map, try one mission, then save one win.`,
    firstMission,
    ctaLabel: firstMission?.ctaLabel ?? "Start first quest",
    orientationRows: [
      {
        label: "1. Meet your guide",
        value: child.companionName,
        copy: `${child.companionName} watches for effort, brave starts, and honest reflection.`,
      },
      {
        label: "2. Try one mission",
        value: lessonTitle,
        copy: "The goal is not to finish everything. The goal is to get the first useful rep.",
      },
      {
        label: "3. Save one win",
        value: firstWinLabel,
        copy: "A lesson, story, reflection, or family prompt can become today's first proof.",
      },
    ],
  };
}

export function buildChildCelebrationReel({
  child,
  completedLessonIds,
  completedJourneyIds,
  childJournalEntries,
  storyChoices,
  earnedBadgeCount,
  nextBadge,
}) {
  const storyCount = Object.keys(storyChoices ?? {}).length;
  const familyChatDone = completedJourneyIds.includes("family-chat");
  const totalWins =
    completedLessonIds.length +
    storyCount +
    childJournalEntries.length +
    earnedBadgeCount +
    (familyChatDone ? 1 : 0);
  const frames = [
    {
      label: "Lessons built",
      value: completedLessonIds.length,
      copy:
        completedLessonIds.length > 0
          ? `${child.name} turned practice into real lesson progress.`
          : "Start one lesson to add the first build moment.",
    },
    {
      label: "Stories chosen",
      value: storyCount,
      copy:
        storyCount > 0
          ? "Story choices became real-life rehearsal."
          : "Choose one story branch to unlock a practice win.",
    },
    {
      label: "Reflections saved",
      value: childJournalEntries.length,
      copy:
        childJournalEntries.length > 0
          ? "Journal notes turned feelings into language."
          : "Save one reflection to grow the memory trail.",
    },
    {
      label: "Badges earned",
      value: earnedBadgeCount,
      copy:
        earnedBadgeCount > 0
          ? `${child.name}'s badge wall is growing.`
          : nextBadge
            ? `${nextBadge.title} is the next badge to chase.`
            : "The current badge wall is ready for review.",
    },
  ];

  return {
    title:
      totalWins > 0
        ? `${child.name}, look what you built this week.`
        : `${child.name}, your first weekly win is waiting.`,
    copy:
      totalWins > 0
        ? `${child.companionName} counted ${totalWins} win${totalWins === 1 ? "" : "s"} across lessons, stories, reflections, badges, and family practice.`
        : `${child.companionName} is ready to celebrate the first small step.`,
    totalWins,
    familyLine: familyChatDone
      ? "Family chat is logged, so one lesson made it all the way home."
      : "Finish one family chat to make the week feel complete.",
    frames,
  };
}

export function buildChildAchievementPortfolio({
  child,
  completedLessonIds,
  completedJourneyIds,
  childJournalEntries,
  storyChoices,
  earnedBadges,
  selectedGoals,
  nextBadge,
}) {
  const storyCount = Object.keys(storyChoices ?? {}).length;
  const familyChatDone = completedJourneyIds.includes("family-chat");
  const trackCounts = completedLessonIds.reduce((counts, lessonId) => {
    const track = findTrackByLessonId(lessonId);

    if (!track) {
      return counts;
    }

    return {
      ...counts,
      [track.id]: {
        track,
        count: (counts[track.id]?.count ?? 0) + 1,
      },
    };
  }, {});
  const strongestTrack =
    Object.values(trackCounts).sort((a, b) => b.count - a.count)[0]?.track ?? null;
  const latestReflection = childJournalEntries.at(-1);
  const reflectionSnippet = latestReflection?.text
    ? latestReflection.text.length > 96
      ? `${latestReflection.text.slice(0, 96)}...`
      : latestReflection.text
    : "";
  const topGoal = selectedGoals[0];
  const totalArtifacts =
    completedLessonIds.length +
    storyCount +
    childJournalEntries.length +
    earnedBadges.length +
    (familyChatDone ? 1 : 0);
  const identityLine =
    totalArtifacts > 0
      ? `${child.name} is becoming a ${child.levelTitle.toLowerCase()} who practices ${topGoal?.title.toLowerCase() ?? "real-life skills"} with courage and reflection.`
      : `${child.name}'s portfolio is ready for the first proof of growth.`;

  const proofCards = [
    {
      label: "Skill proof",
      title: strongestTrack?.title ?? "First skill proof",
      copy: strongestTrack
        ? `${completedLessonIds.length} lesson win${completedLessonIds.length === 1 ? "" : "s"} point toward ${strongestTrack.project.toLowerCase()}`
        : "Complete one lesson to add the first portfolio artifact.",
      tone: strongestTrack ? "good" : "neutral",
    },
    {
      label: "Voice proof",
      title: latestReflection?.mood ?? "Reflection waiting",
      copy: latestReflection
        ? `${child.name} turned a ${latestReflection.mood} moment into words: "${reflectionSnippet}"`
        : "Save a reflection to capture what the week felt like from the inside.",
      tone: latestReflection ? "warn" : "neutral",
    },
    {
      label: "Choice proof",
      title: `${storyCount} story choice${storyCount === 1 ? "" : "s"}`,
      copy:
        storyCount > 0
          ? "Branching story practice is becoming a record of decisions before real life asks for them."
          : "Choose a story branch to add a decision-making artifact.",
      tone: storyCount > 0 ? "good" : "neutral",
    },
    {
      label: "Home proof",
      title: familyChatDone ? "Family chat logged" : "Family ritual open",
      copy: familyChatDone
        ? "One learning moment made it into a family conversation."
        : "Complete a family prompt to connect practice back to home life.",
      tone: familyChatDone ? "good" : "warn",
    },
  ];

  const keepsakes = [
    {
      label: "Badge shelf",
      value:
        earnedBadges.length > 0
          ? earnedBadges.map((badge) => badge.title).slice(0, 3).join(", ")
          : nextBadge
            ? `Next keepsake: ${nextBadge.title}`
            : "Badge wall ready",
    },
    {
      label: "Best parent share line",
      value:
        totalArtifacts > 0
          ? `I noticed you kept practicing even when the skill was still new.`
          : `I am excited to see what you try first.`,
    },
    {
      label: "Companion note",
      value: `${child.companionName} is watching for effort, repair, reflection, and brave starts.`,
    },
  ];

  return {
    title: `${child.name}'s Achievement Portfolio`,
    identityLine,
    totalArtifacts,
    subtitle:
      totalArtifacts > 0
        ? `${totalArtifacts} portfolio artifact${totalArtifacts === 1 ? "" : "s"} from this local week.`
        : "No artifacts yet, but the portfolio is ready.",
    proofCards,
    keepsakes,
    sharePrompt:
      "Save one sentence tonight: what grew, what felt hard, and what small move is worth repeating.",
  };
}

export function buildParentSharePreview({ child, achievementPortfolio, todayLabel }) {
  const strongestProof =
    achievementPortfolio.proofCards.find((card) => card.tone === "good") ??
    achievementPortfolio.proofCards[0];
  const familyProof =
    achievementPortfolio.proofCards.find((card) => card.label === "Home proof") ??
    achievementPortfolio.proofCards.at(-1);
  const parentShareLine =
    achievementPortfolio.keepsakes.find(
      (keepsake) => keepsake.label === "Best parent share line",
    )?.value ?? "I noticed the effort you put into this week.";

  return {
    title: `${child.name}'s Weekly Growth Card`,
    eyebrow: `${todayLabel} family share preview`,
    copy:
      "A print-and-send style preview for turning KidWiz progress into a warm family recap without exposing private raw journal data.",
    heroLine: achievementPortfolio.identityLine,
    artifactLabel: `${achievementPortfolio.totalArtifacts} growth artifact${achievementPortfolio.totalArtifacts === 1 ? "" : "s"}`,
    highlightRows: [
      {
        label: strongestProof.label,
        value: strongestProof.title,
        copy: strongestProof.copy,
      },
      {
        label: familyProof.label,
        value: familyProof.title,
        copy: familyProof.copy,
      },
      {
        label: "Parent note",
        value: parentShareLine,
        copy: "A ready-to-say line parents can use at dinner, bedtime, or after school.",
      },
    ],
    deliveryOptions: [
      "Print weekly card",
      "Email parent recap",
      "Save to portfolio history",
    ],
    privacyNote:
      "Share cards should summarize growth, not reveal private child journal text unless a parent and child choose it together.",
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
      : `${child.supportSpot} Current visible tracks look complete in the demo state.`,
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
