import {
  countCompletedLessons,
  findQuestWorld,
  findTrackByLessonId,
  getNextTrackLesson,
} from "./learningCore.js";
import { getRecommendedStory } from "./storySignals.js";

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
      "Every current KidWiz badge is unlocked in this family workspace.",
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
        ? `${totalArtifacts} portfolio artifact${totalArtifacts === 1 ? "" : "s"} from this week.`
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
