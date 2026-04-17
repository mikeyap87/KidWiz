import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import {
  badgeCatalog,
  celebrationStyles,
  childProfiles,
  coachStyles,
  courseCatalog,
  dailyJourneys,
  familyGoals,
  familyRituals,
  storyEpisodes,
  weeklyRhythms,
} from "./data/kidwizData";
import { CoachTab } from "./components/CoachTab";
import { CoursesTab } from "./components/CoursesTab";
import { DashboardTab } from "./components/DashboardTab";
import { FamilyTab } from "./components/FamilyTab";
import { JournalTab } from "./components/JournalTab";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { OverviewTab } from "./components/OverviewTab";
import { PublicSite } from "./components/PublicSite";
import { StoriesTab } from "./components/StoriesTab";
import { STORAGE_KEY, createDefaultState, loadSavedState } from "./lib/demoState";
import {
  buildQuestWorldRows,
  buildParentWeeklyReport,
  buildSuggestedPlaylistForChild,
  buildSuggestedPlaylists,
  buildWeeklyMissionBoard,
  deriveEarnedBadgeIds,
  findLessonById,
  findTrackByLessonId,
  getRecommendedLesson,
  getRecommendedStory,
  getTrackProgress,
  getTrackStatus,
  getVisibleTracks,
} from "./lib/progression";
import { moodOptions, tabItems } from "./lib/uiConfig";
import {
  isSupabaseConfigured,
  sendMagicLink,
  signOut,
  supabase,
} from "./lib/supabaseClient";
import "./App.css";

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function clampTargetValue(key, value) {
  const ranges = {
    lessons: { min: 1, max: 7 },
    stories: { min: 1, max: 5 },
    reflections: { min: 1, max: 5 },
  };

  const range = ranges[key] ?? { min: 1, max: 7 };
  return Math.min(range.max, Math.max(range.min, value));
}

function getRequestedTab(tabValue) {
  const normalized = tabValue?.toLowerCase();

  if (!normalized) {
    return "dashboard";
  }

  const aliases = {
    dashboard: "dashboard",
    home: "overview",
    overview: "overview",
    quest: "overview",
    "quest-hub": "overview",
    courses: "courses",
    stories: "stories",
    coach: "coach",
    journal: "journal",
    family: "family",
  };

  return aliases[normalized] ?? "dashboard";
}

function getInitialBootstrap() {
  const savedState = loadSavedState();

  if (typeof window === "undefined") {
    return {
      appState: savedState,
      authMessage: "",
      shouldClearQuery: false,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get("demo");

  if (demoMode !== "instant" && demoMode !== "guided") {
    return {
      appState: savedState,
      authMessage: "",
      shouldClearQuery: false,
    };
  }

  const requestedChildId = searchParams.get("child");
  const validChildId = childProfiles.some((child) => child.id === requestedChildId)
    ? requestedChildId
    : childProfiles[0].id;
  const requestedTab = getRequestedTab(searchParams.get("tab"));

  return {
    appState: {
      ...createDefaultState(),
      session: {
        type: "demo",
        role: "parent",
        email:
          demoMode === "instant"
            ? "hello@family.kidwiz.demo"
            : "planner@kidwiz.demo",
      },
      onboardingComplete: demoMode === "instant",
      activeTab: demoMode === "instant" ? requestedTab : "dashboard",
      selectedChildId: validChildId,
    },
    authMessage:
      demoMode === "instant"
        ? "KidWiz opened from a direct local demo link."
        : "KidWiz opened in guided setup from a direct local demo link.",
    shouldClearQuery: true,
  };
}

function App() {
  const [bootstrap] = useState(() => getInitialBootstrap());
  const [appState, setAppState] = useState(bootstrap.appState);
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState(bootstrap.authMessage);
  const [authBusy, setAuthBusy] = useState(false);
  const [childJournalDraft, setChildJournalDraft] = useState("");
  const [childJournalMood, setChildJournalMood] = useState("proud");
  const [parentJournalDraft, setParentJournalDraft] = useState("");
  const [coachResponseMode, setCoachResponseMode] = useState("gentle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      const currentEmail = data.session?.user?.email;
      if (!currentEmail) return;

      setAppState((current) => ({
        ...current,
        session: {
          type: "supabase",
          role: "parent",
          email: currentEmail,
        },
      }));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextEmail = nextSession?.user?.email;

      if (nextEmail) {
        setAppState((current) => ({
          ...current,
          session: {
            type: "supabase",
            role: "parent",
            email: nextEmail,
          },
        }));
        setAuthMessage("Signed in. Welcome back to KidWiz.");
        return;
      }

      setAppState((current) => ({
        ...current,
        session:
          current.session?.type === "supabase" ? null : current.session,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !bootstrap.shouldClearQuery) return;
    window.history.replaceState({}, "", window.location.pathname);
  }, [bootstrap.shouldClearQuery]);

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
  const assignedTrackIds =
    appState.assignedTrackIdsByChild[selectedChild.id] ?? [];
  const selectedWeeklyTarget =
    appState.weeklyTargetsByChild[selectedChild.id] ?? {
      lessons: 3,
      stories: 2,
      reflections: 2,
      focusTrackId: visibleTracks[0].id,
    };
  const activeLessonAnswer = childQuizAnswers[activeLesson.id];
  const answeredOption = activeLesson.quiz.options[activeLessonAnswer];
  const answeredCorrectly =
    activeLessonAnswer === activeLesson.quiz.correctIndex;
  const activeStoryChoice = activeStory.choices.find(
    (choice) => choice.id === childStoryChoices[activeStory.id],
  );

  const trackProgressRows = visibleTracks.map((track) => {
    const progress = getTrackProgress(selectedChild, track, childCompletedLessonIds);
    const completedLessons = track.lessons.filter((lesson) =>
      childCompletedLessonIds.includes(lesson.id),
    ).length;

    return {
      ...track,
      progress,
      completedLessons,
      assigned: assignedTrackIds.includes(track.id),
      status: getTrackStatus(track, childCompletedLessonIds),
    };
  });

  const recommendedLesson = getRecommendedLesson({
    visibleTracks,
    assignedTrackIds,
    playlistLessonIds: childPlaylistLessonIds,
    completedLessonIds: childCompletedLessonIds,
    weeklyTarget: selectedWeeklyTarget,
  });
  const nextRitual =
    familyRituals[childCompletedLessonIds.length % familyRituals.length];
  const todayLabel = formatTodayLabel();
  const weeklyCompletion =
    (childCompletedJourneyIds.length / Math.max(1, 5)) * 100;
  const overviewPlaylistPreview = childPlaylistLessonIds
    .map((lessonId) => {
      const lesson = findLessonById(lessonId);
      const track = findTrackByLessonId(lessonId);
      return lesson
        ? {
            ...lesson,
            trackTitle: track?.title ?? "",
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 4);

  const earnedBadgeIds = deriveEarnedBadgeIds({
    completedLessonIds: childCompletedLessonIds,
    playlistLessonIds: childPlaylistLessonIds,
    childJournalEntries,
    completedJourneyIds: childCompletedJourneyIds,
    storyChoices: childStoryChoices,
    bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
  });
  const earnedBadges = badgeCatalog.filter((badge) =>
    earnedBadgeIds.includes(badge.id),
  );
  const nextBadge =
    badgeCatalog.find((badge) => !earnedBadgeIds.includes(badge.id)) ?? null;
  const questWorldRows = buildQuestWorldRows({
    visibleTracks,
    completedLessonIds: childCompletedLessonIds,
    weeklyTarget: selectedWeeklyTarget,
    assignedTrackIds,
  });
  const missionBoard = buildWeeklyMissionBoard({
    child: selectedChild,
    selectedGoalIds: appState.selectedGoalIds,
    visibleTracks,
    weeklyTarget: selectedWeeklyTarget,
    completedLessonIds: childCompletedLessonIds,
    storyChoices: childStoryChoices,
    childJournalEntries,
    completedJourneyIds: childCompletedJourneyIds,
    recommendedLesson,
    nextBadge,
    nextRitual,
  });

  const suggestedPreviewPlaylists = childProfiles.map((child) => ({
    child,
    lessons: buildSuggestedPlaylistForChild(
      appState.selectedGoalIds,
      child.id,
      appState.bodyBoundariesUnlocked,
      appState.weeklyTargetsByChild?.[child.id],
    )
      .map((lessonId) => {
        const lesson = findLessonById(lessonId);
        const track = findTrackByLessonId(lessonId);
        return lesson
          ? {
              ...lesson,
              trackTitle: track?.title ?? "",
            }
          : null;
      })
      .filter(Boolean),
  }));

  const childSummaries = childProfiles.map((child) => {
    const completedLessons = appState.completedLessonIdsByChild[child.id] ?? [];
    const playlistLessonIds = appState.playlistLessonIdsByChild[child.id] ?? [];
    const completedJourneys =
      appState.completedJourneyIdsByChild[child.id] ?? [];
    const storyChoices = appState.storyChoicesByChild[child.id] ?? {};
    const journalEntries = appState.childJournalEntriesByChild[child.id] ?? [];
    const assignedIds = appState.assignedTrackIdsByChild[child.id] ?? [];
    const weeklyTarget = appState.weeklyTargetsByChild[child.id] ?? {
      lessons: 3,
      stories: 2,
      reflections: 2,
      focusTrackId: visibleTracks[0].id,
    };
    const rows = visibleTracks.map((track) => ({
      ...track,
      progress: getTrackProgress(child, track, completedLessons),
      status: getTrackStatus(track, completedLessons),
    }));
    const strongest = [...rows].sort((left, right) => right.progress - left.progress)[0];
    const support = [...rows].sort((left, right) => left.progress - right.progress)[0];
    const recommendedLesson = getRecommendedLesson({
      visibleTracks,
      assignedTrackIds: assignedIds,
      playlistLessonIds,
      completedLessonIds: completedLessons,
      weeklyTarget,
    });
    const recommendedStory = getRecommendedStory({
      selectedGoalIds: appState.selectedGoalIds,
      storyChoices,
    });
    const childBadgeIds = deriveEarnedBadgeIds({
      completedLessonIds: completedLessons,
      playlistLessonIds,
      childJournalEntries: journalEntries,
      completedJourneyIds: completedJourneys,
      storyChoices,
      bodyBoundariesUnlocked: appState.bodyBoundariesUnlocked,
    });
    const lessonTargetProgress = Math.min(
      100,
      Math.round((completedLessons.length / weeklyTarget.lessons) * 100),
    );
    const storyTargetProgress = Math.min(
      100,
      Math.round((Object.keys(storyChoices).length / weeklyTarget.stories) * 100),
    );
    const reflectionTargetProgress = Math.min(
      100,
      Math.round((journalEntries.length / weeklyTarget.reflections) * 100),
    );

    return {
      child,
      strongestTrack: strongest,
      supportTrack: support,
      recommendedLesson,
      recommendedStory,
      completedLessons: completedLessons.length,
      completedStories: Object.keys(storyChoices).length,
      journalCount: journalEntries.length,
      badgesEarned: childBadgeIds.length,
      weeklyTarget,
      lessonTargetProgress,
      storyTargetProgress,
      reflectionTargetProgress,
      overallTargetProgress: Math.round(
        (lessonTargetProgress + storyTargetProgress + reflectionTargetProgress) / 3,
      ),
      supportMessage: recommendedLesson
        ? `${child.supportSpot} Next best move: ${recommendedLesson.lesson.title}.`
        : `${child.supportSpot} Current visible tracks look complete in the demo state.`,
    };
  });

  const familyMetrics = {
    lessonsDone: childSummaries.reduce(
      (total, summary) => total + summary.completedLessons,
      0,
    ),
    storiesDone: childSummaries.reduce(
      (total, summary) => total + summary.completedStories,
      0,
    ),
    reflectionsSaved: childSummaries.reduce(
      (total, summary) => total + summary.journalCount,
      0,
    ),
    badgesEarned: childSummaries.reduce(
      (total, summary) => total + summary.badgesEarned,
      0,
    ),
  };
  const weeklyReport = buildParentWeeklyReport({
    childSummaries,
    familyMetrics,
    nextRitual,
    selectedCelebrationStyle,
    selectedCoachStyle,
    selectedGoals,
    selectedRhythm,
  });

  const coachCards = [
    {
      title: "Coach move for today",
      copy: `${selectedChild.name} responds best to ${selectedChild.coachLens}. Use ${selectedCoachStyle.title.toLowerCase()} as the default tone.`,
    },
    {
      title: "Lesson adaptation",
      copy: activeLesson.coachModes[coachResponseMode],
    },
    {
      title: "Family follow-up",
      copy: activeLesson.parentCue,
    },
    {
      title: "Playlist anchor",
      copy: `This week's focus track is ${
        visibleTracks.find((track) => track.id === selectedWeeklyTarget.focusTrackId)
          ?.title ?? activeTrack.title
      }, with ${selectedWeeklyTarget.lessons} lesson target(s).`,
    },
  ];

  function updateAppState(updater) {
    setAppState((current) =>
      typeof updater === "function" ? updater(current) : { ...current, ...updater },
    );
  }

  function patchChildCollection(key, childId, updater) {
    updateAppState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [childId]: updater(current[key]?.[childId]),
      },
    }));
  }

  function patchWeeklyTarget(childId, updater) {
    updateAppState((current) => ({
      ...current,
      weeklyTargetsByChild: {
        ...current.weeklyTargetsByChild,
        [childId]: updater(current.weeklyTargetsByChild?.[childId]),
      },
    }));
  }

  async function handleMagicLinkSubmit(event) {
    event.preventDefault();

    if (!authEmail.trim()) {
      setAuthMessage("Add a parent email first.");
      return;
    }

    if (!isSupabaseConfigured) {
      updateAppState({
        ...createDefaultState(),
        session: {
          type: "demo",
          role: "parent",
          email: authEmail.trim().toLowerCase(),
        },
        onboardingComplete: false,
      });
      setAuthMessage(
        "Supabase is not connected yet, so KidWiz opened in local demo mode.",
      );
      return;
    }

    try {
      setAuthBusy(true);
      setAuthMessage("Sending your KidWiz magic link...");
      await sendMagicLink(authEmail.trim().toLowerCase());
      setAuthMessage("Magic link sent. Check your inbox to sign in.");
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function handleDemoStart(mode) {
    updateAppState({
      ...createDefaultState(),
      session: {
        type: "demo",
        role: "parent",
        email:
          mode === "instant"
            ? "hello@family.kidwiz.demo"
            : "planner@kidwiz.demo",
      },
      onboardingComplete: mode === "instant",
      activeTab: mode === "instant" ? "dashboard" : "dashboard",
    });
    setAuthMessage(
      mode === "instant"
        ? "KidWiz opened with a full test family and weekly plan."
        : "KidWiz opened in setup mode so you can shape the family experience first.",
    );
  }

  async function handleLogout() {
    if (appState.session?.type === "supabase") {
      await signOut();
    }

    updateAppState((current) => ({
      ...current,
      session: null,
    }));
  }

  function handleSelectTrack(trackId) {
    const track = courseCatalog.find((item) => item.id === trackId);
    if (!track) return;

    updateAppState((current) => ({
      ...current,
      selectedTrackId: trackId,
      selectedLessonId: track.lessons[0].id,
      activeTab: "courses",
    }));
  }

  function handleOpenLesson(lessonId) {
    const track = findTrackByLessonId(lessonId);
    if (!track) return;

    updateAppState((current) => ({
      ...current,
      activeTab: "courses",
      selectedTrackId: track.id,
      selectedLessonId: lessonId,
    }));
  }

  function handleOpenLessonForChild(childId, lessonId) {
    const track = findTrackByLessonId(lessonId);
    if (!track) return;

    updateAppState((current) => ({
      ...current,
      selectedChildId: childId,
      activeTab: "courses",
      selectedTrackId: track.id,
      selectedLessonId: lessonId,
    }));
  }

  function handleToggleGoal(goalId) {
    updateAppState((current) => {
      if (current.selectedGoalIds.includes(goalId)) {
        return {
          ...current,
          selectedGoalIds: current.selectedGoalIds.filter((id) => id !== goalId),
        };
      }

      if (current.selectedGoalIds.length >= 3) {
        return current;
      }

      return {
        ...current,
        selectedGoalIds: [...current.selectedGoalIds, goalId],
      };
    });
  }

  function handleAdvanceOnboarding() {
    updateAppState((current) => ({
      ...current,
      onboardingStep: Math.min(2, current.onboardingStep + 1),
    }));
  }

  function handleBackOnboarding() {
    updateAppState((current) => ({
      ...current,
      onboardingStep: Math.max(0, current.onboardingStep - 1),
    }));
  }

  function handleFinishOnboarding() {
    updateAppState((current) => ({
      ...current,
      onboardingComplete: true,
      onboardingStep: 2,
      activeTab: "dashboard",
      playlistLessonIdsByChild: buildSuggestedPlaylists(
        current.selectedGoalIds,
        current.bodyBoundariesUnlocked,
        current.weeklyTargetsByChild,
      ),
    }));
  }

  function handleToggleJourney(journeyId) {
    patchChildCollection(
      "completedJourneyIdsByChild",
      selectedChild.id,
      (current = []) =>
        current.includes(journeyId)
          ? current.filter((item) => item !== journeyId)
          : [...current, journeyId],
    );
  }

  function handleToggleLessonComplete(lessonId) {
    patchChildCollection(
      "completedLessonIdsByChild",
      selectedChild.id,
      (current = []) =>
        current.includes(lessonId)
          ? current.filter((item) => item !== lessonId)
          : [...current, lessonId],
    );
  }

  function handleTogglePlaylistLesson(lessonId) {
    patchChildCollection(
      "playlistLessonIdsByChild",
      selectedChild.id,
      (current = []) =>
        current.includes(lessonId)
          ? current.filter((item) => item !== lessonId)
          : [...current, lessonId],
    );
  }

  function handleQuizAnswer(answerIndex) {
    patchChildCollection(
      "lessonQuizAnswersByChild",
      selectedChild.id,
      (current = {}) => ({
        ...current,
        [activeLesson.id]: answerIndex,
      }),
    );
  }

  function handleSelectStoryChoice(choiceId) {
    patchChildCollection(
      "storyChoicesByChild",
      selectedChild.id,
      (current = {}) => ({
        ...current,
        [activeStory.id]: choiceId,
      }),
    );
  }

  function handleSaveChildJournal(event) {
    event.preventDefault();
    if (!childJournalDraft.trim()) return;

    patchChildCollection(
      "childJournalEntriesByChild",
      selectedChild.id,
      (current = []) => [
        {
          id: `child-${Date.now()}`,
          title: "Fresh reflection",
          mood: childJournalMood,
          dateLabel: "Just now",
          body: childJournalDraft.trim(),
        },
        ...current,
      ],
    );
    setChildJournalDraft("");
    setChildJournalMood("proud");
  }

  function handleSaveParentJournal(event) {
    event.preventDefault();
    if (!parentJournalDraft.trim()) return;

    updateAppState((current) => ({
      ...current,
      parentJournalEntries: [
        {
          id: `parent-${Date.now()}`,
          title: "Parent note",
          dateLabel: "Just now",
          body: parentJournalDraft.trim(),
        },
        ...current.parentJournalEntries,
      ],
    }));
    setParentJournalDraft("");
  }

  function handleToggleTrackAssignment(trackId) {
    patchChildCollection(
      "assignedTrackIdsByChild",
      selectedChild.id,
      (current = []) =>
        current.includes(trackId)
          ? current.filter((item) => item !== trackId)
          : [...current, trackId],
    );
  }

  function handleGenerateFreshWeek() {
    updateAppState((current) => ({
      ...current,
      playlistLessonIdsByChild: buildSuggestedPlaylists(
        current.selectedGoalIds,
        current.bodyBoundariesUnlocked,
        current.weeklyTargetsByChild,
      ),
    }));
  }

  function handleResetDemo() {
    if (typeof window !== "undefined") {
      const shouldReset = window.confirm(
        "Reset the local KidWiz demo and clear saved browser data?",
      );

      if (!shouldReset) {
        return;
      }

      window.localStorage.removeItem(STORAGE_KEY);
    }

    setAppState(createDefaultState());
    setAuthEmail("");
    setAuthMessage("Local KidWiz demo reset.");
    setChildJournalDraft("");
    setParentJournalDraft("");
  }

  function handleToggleBodyBoundaries() {
    updateAppState((current) => {
      const nextUnlocked = !current.bodyBoundariesUnlocked;
      return {
        ...current,
        bodyBoundariesUnlocked: nextUnlocked,
        playlistLessonIdsByChild: buildSuggestedPlaylists(
          current.selectedGoalIds,
          nextUnlocked,
          current.weeklyTargetsByChild,
        ),
      };
    });
  }

  function handleAdjustWeeklyTarget(childId, key, delta) {
    patchWeeklyTarget(childId, (current) => ({
      ...current,
      [key]: clampTargetValue(key, (current?.[key] ?? 1) + delta),
    }));
  }

  function handleChangeFocusTrack(childId, trackId) {
    patchWeeklyTarget(childId, (current) => ({
      ...current,
      focusTrackId: trackId,
    }));
  }

  function handleOpenStory(storyId, childId = selectedChild.id) {
    updateAppState((current) => ({
      ...current,
      activeTab: "stories",
      selectedChildId: childId,
      selectedStoryId: storyId ?? current.selectedStoryId,
    }));
  }

  function handleOpenJournal() {
    updateAppState((current) => ({
      ...current,
      activeTab: "journal",
    }));
  }

  function handleOpenFamily() {
    updateAppState((current) => ({
      ...current,
      activeTab: "family",
    }));
  }

  const canAdvanceOnboarding =
    appState.onboardingStep === 0 ? appState.selectedGoalIds.length >= 2 : true;
  const currentTab =
    tabItems.find((tab) => tab.id === appState.activeTab) ?? tabItems[0];
  const CurrentTabIcon = currentTab.icon;

  return (
    <div className="page-shell">
      {!appState.session ? (
        <PublicSite
          authBusy={authBusy}
          authEmail={authEmail}
          authMessage={authMessage}
          onAuthEmailChange={setAuthEmail}
          onDemoStart={handleDemoStart}
          onMagicLinkSubmit={handleMagicLinkSubmit}
          visibleTracks={visibleTracks}
        />
      ) : !appState.onboardingComplete ? (
        <OnboardingFlow
          canAdvance={canAdvanceOnboarding}
          celebrationStyleId={appState.celebrationStyleId}
          coachStyleId={appState.coachStyleId}
          onBack={handleBackOnboarding}
          onFinish={handleFinishOnboarding}
          onNext={handleAdvanceOnboarding}
          onSelectCelebrationStyle={(styleId) =>
            updateAppState((current) => ({
              ...current,
              celebrationStyleId: styleId,
            }))
          }
          onSelectCoachStyle={(styleId) =>
            updateAppState((current) => ({
              ...current,
              coachStyleId: styleId,
            }))
          }
          onSelectRhythm={(rhythmId) =>
            updateAppState((current) => ({
              ...current,
              weeklyRhythmId: rhythmId,
            }))
          }
          onToggleGoal={handleToggleGoal}
          previewPlaylists={suggestedPreviewPlaylists}
          selectedGoalIds={appState.selectedGoalIds}
          selectedGoals={selectedGoals}
          step={appState.onboardingStep}
          weeklyRhythmId={appState.weeklyRhythmId}
        />
      ) : (
        <div className="app-shell">
          <header className="app-topbar">
            <div className="page-width app-topbar-inner">
              <div className="brand-lockup brand-lockup-dark">
                <div className="brand-badge">KW</div>
                <div>
                  <p className="brand-name">KidWiz</p>
                  <p className="brand-subtitle">
                    {appState.familyName} · {appState.session.email} ·{" "}
                    {appState.session.type === "supabase" ? "live auth" : "local demo"}
                  </p>
                </div>
              </div>

              <div className="app-topbar-actions">
                <div className="mode-pill">
                  <CurrentTabIcon size={16} />
                  <span>{currentTab.label}</span>
                </div>
                <button className="ghost-button ghost-button-dark" onClick={handleLogout}>
                  Back to site
                </button>
              </div>
            </div>
          </header>

          <div className="page-width app-layout">
            <aside className="app-sidebar">
              <div className="sidebar-block">
                <p className="eyebrow eyebrow-dark">Active learner</p>
                <div className="profile-grid">
                  {childProfiles.map((child) => (
                    <button
                      key={child.id}
                      className={`profile-chip ${
                        child.id === selectedChild.id ? "is-selected" : ""
                      }`}
                      onClick={() =>
                        updateAppState((current) => ({
                          ...current,
                          selectedChildId: child.id,
                        }))
                      }
                      type="button"
                    >
                      <div>
                        <strong>{child.name}</strong>
                        <span>
                          Age {child.age} · Grade {child.grade}
                        </span>
                      </div>
                      <em>{child.levelTitle}</em>
                    </button>
                  ))}
                </div>
              </div>

              <nav className="sidebar-block tab-list" aria-label="KidWiz sections">
                {tabItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`tab-button ${
                        appState.activeTab === item.id ? "is-active" : ""
                      }`}
                      onClick={() =>
                        updateAppState((current) => ({
                          ...current,
                          activeTab: item.id,
                        }))
                      }
                      type="button"
                    >
                      <span>
                        <Icon size={16} />
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="sidebar-block coach-block">
                <div className="coach-heading">
                  <Bot size={18} />
                  <h2>Spark Coach</h2>
                </div>
                <p>
                  {selectedChild.name} does best with {selectedChild.coachLens}. The
                  current family setting is {selectedCoachStyle.title.toLowerCase()}.
                </p>
              </div>
            </aside>

            <main className="app-main">
              {appState.activeTab === "dashboard" ? (
                <DashboardTab
                  childSummaries={childSummaries}
                  familyMetrics={familyMetrics}
                  onAdjustWeeklyTarget={handleAdjustWeeklyTarget}
                  onChangeFocusTrack={handleChangeFocusTrack}
                  onOpenFamily={handleOpenFamily}
                  onOpenLesson={handleOpenLessonForChild}
                  onOpenStory={handleOpenStory}
                  onSelectChild={(childId) =>
                    updateAppState((current) => ({
                      ...current,
                      selectedChildId: childId,
                    }))
                  }
                  selectedChildId={selectedChild.id}
                  visibleTracks={visibleTracks}
                  weeklyReport={weeklyReport}
                />
              ) : null}

              {appState.activeTab === "overview" ? (
                <OverviewTab
                  childCompletedJourneyIds={childCompletedJourneyIds}
                  dailyJourneys={dailyJourneys}
                  earnedBadgesCount={earnedBadges.length}
                  missionBoard={missionBoard}
                  onOpenFamily={handleOpenFamily}
                  onOpenJournal={handleOpenJournal}
                  onOpenLesson={handleOpenLesson}
                  onOpenStory={handleOpenStory}
                  onSelectTrack={handleSelectTrack}
                  onToggleJourney={handleToggleJourney}
                  overviewPlaylistPreview={overviewPlaylistPreview}
                  questWorldRows={questWorldRows}
                  selectedChild={selectedChild}
                  selectedGoals={selectedGoals}
                  todayLabel={todayLabel}
                  weeklyCompletion={weeklyCompletion}
                />
              ) : null}

              {appState.activeTab === "courses" ? (
                <CoursesTab
                  activeLesson={activeLesson}
                  activeLessonAnswer={activeLessonAnswer}
                  activeTrack={activeTrack}
                  answeredCorrectly={answeredCorrectly}
                  answeredOption={answeredOption}
                  childCompletedLessonIds={childCompletedLessonIds}
                  childPlaylistLessonIds={childPlaylistLessonIds}
                  coachResponseMode={coachResponseMode}
                  onAnswer={handleQuizAnswer}
                  onChangeCoachMode={setCoachResponseMode}
                  onSelectLesson={(lessonId) =>
                    updateAppState((current) => ({
                      ...current,
                      selectedLessonId: lessonId,
                    }))
                  }
                  onSelectTrack={handleSelectTrack}
                  onToggleComplete={handleToggleLessonComplete}
                  onTogglePlaylist={handleTogglePlaylistLesson}
                  trackProgressRows={trackProgressRows}
                  visibleTracks={visibleTracks}
                />
              ) : null}

              {appState.activeTab === "stories" ? (
                <StoriesTab
                  activeStory={activeStory}
                  activeStoryChoice={activeStoryChoice}
                  childStoryChoices={childStoryChoices}
                  onSelectChoice={handleSelectStoryChoice}
                  onSelectStory={(storyId) =>
                    updateAppState((current) => ({
                      ...current,
                      selectedStoryId: storyId,
                      activeTab: "stories",
                    }))
                  }
                  storyEpisodes={storyEpisodes}
                />
              ) : null}

              {appState.activeTab === "coach" ? (
                <CoachTab
                  activeLesson={activeLesson}
                  activeTrack={activeTrack}
                  coachCards={coachCards}
                  coachResponseMode={coachResponseMode}
                  onChangeCoachMode={setCoachResponseMode}
                  selectedChild={selectedChild}
                  selectedCoachStyle={selectedCoachStyle}
                  selectedGoals={selectedGoals}
                />
              ) : null}

              {appState.activeTab === "journal" ? (
                <JournalTab
                  childJournalDraft={childJournalDraft}
                  childJournalEntries={childJournalEntries}
                  childJournalMood={childJournalMood}
                  moodOptions={moodOptions}
                  onChildDraftChange={setChildJournalDraft}
                  onChildMoodChange={setChildJournalMood}
                  onParentDraftChange={setParentJournalDraft}
                  onSaveChildJournal={handleSaveChildJournal}
                  onSaveParentJournal={handleSaveParentJournal}
                  parentJournalDraft={parentJournalDraft}
                  parentJournalEntries={appState.parentJournalEntries}
                  selectedChild={selectedChild}
                />
              ) : null}

              {appState.activeTab === "family" ? (
                <FamilyTab
                  appState={appState}
                  assignedTrackIds={assignedTrackIds}
                  onChangeCelebrationStyle={(styleId) =>
                    updateAppState((current) => ({
                      ...current,
                      celebrationStyleId: styleId,
                    }))
                  }
                  onChangeCoachStyle={(styleId) =>
                    updateAppState((current) => ({
                      ...current,
                      coachStyleId: styleId,
                    }))
                  }
                  onChangeRhythm={(rhythmId) =>
                    updateAppState((current) => ({
                      ...current,
                      weeklyRhythmId: rhythmId,
                    }))
                  }
                  onGenerateFreshWeek={handleGenerateFreshWeek}
                  onResetDemo={handleResetDemo}
                  onRestartOnboarding={() =>
                    updateAppState((current) => ({
                      ...current,
                      onboardingComplete: false,
                      onboardingStep: 0,
                    }))
                  }
                  onToggleBodyBoundaries={handleToggleBodyBoundaries}
                  onToggleGoal={handleToggleGoal}
                  onToggleTrackAssignment={handleToggleTrackAssignment}
                  selectedCelebrationStyle={selectedCelebrationStyle}
                  selectedChild={selectedChild}
                  selectedCoachStyle={selectedCoachStyle}
                  selectedGoals={selectedGoals}
                  selectedRhythm={selectedRhythm}
                  trackProgressRows={trackProgressRows}
                  visibleTracks={visibleTracks}
                />
              ) : null}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
