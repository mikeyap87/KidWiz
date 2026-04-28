import { Suspense, lazy, useEffect, useState } from "react";
import {
  BookOpen,
  Bot,
  NotebookPen,
  Users,
} from "lucide-react";
import {
  celebrationStyles,
  childProfiles,
  coachStyles,
  courseCatalog,
  dailyJourneys,
  familyGoals,
  storyEpisodes,
  weeklyRhythms,
} from "./data/kidwizData";
import { STORAGE_KEY, createDefaultState, loadSavedState } from "./lib/demoState";
import {
  addLearningStudioSubmissionToState,
  submitLearningStudioPrompt,
} from "./lib/learningStudioClient";
import {
  buildArchivedSnapshotsByChild,
  buildSelectedChildWorkspace,
  buildSuggestedPlaylists,
  findTrackByLessonId,
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
import { MobileShell } from "./components/MobileShell";

function lazyNamed(importer, exportName) {
  return lazy(() =>
    importer().then((module) => ({
      default: module[exportName],
    })),
  );
}

const CoachTab = lazyNamed(() => import("./components/CoachTab"), "CoachTab");
const CoursesTab = lazyNamed(
  () => import("./components/CoursesTab"),
  "CoursesTab",
);
const DashboardTab = lazyNamed(
  () => import("./components/DashboardTab"),
  "DashboardTab",
);
const FamilyTab = lazyNamed(() => import("./components/FamilyTab"), "FamilyTab");
const HelpTab = lazyNamed(() => import("./components/HelpTab"), "HelpTab");
const JournalTab = lazyNamed(
  () => import("./components/JournalTab"),
  "JournalTab",
);
const OnboardingFlow = lazyNamed(
  () => import("./components/OnboardingFlow"),
  "OnboardingFlow",
);
const OverviewTab = lazyNamed(
  () => import("./components/OverviewTab"),
  "OverviewTab",
);
const PublicSite = lazyNamed(
  () => import("./components/PublicSite"),
  "PublicSite",
);
const StoriesTab = lazyNamed(
  () => import("./components/StoriesTab"),
  "StoriesTab",
);
const KIDWIZ_AI_API_URL =
  import.meta.env.VITE_KIDWIZ_AI_API_URL ?? "http://127.0.0.1:5291";

function SiteLoading() {
  return (
    <div className="site-shell">
      <div className="page-width site-loading-shell">
        <div className="site-loading-card">
          <div className="brand-lockup">
            <img
              className="brand-logo-image"
              src="/brand/kidwiz-logo.svg"
              alt="KidWiz"
            />
            <div>
              <p className="site-loading-copy">
                Loading the family learning studio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceLoading({ activeTab, title, copy }) {
  const activeLabel =
    tabItems.find((item) => item.id === activeTab)?.label ?? "KidWiz";
  const resolvedTitle = title ?? `Loading ${activeLabel}`;
  const resolvedCopy = copy ?? "Getting this KidWiz space ready.";

  return (
    <section className="workspace-band workspace-loading-band">
      <div className="panel-head">
        <Bot size={18} />
        <h2>{resolvedTitle}</h2>
      </div>
      <p className="panel-copy">{resolvedCopy}</p>
    </section>
  );
}

function OnboardingLoading() {
  return (
    <div className="onboarding-shell">
      <div className="page-width">
        <WorkspaceLoading
          title="Loading family setup"
          copy="Getting your KidWiz rhythm, goals, and first week ready."
        />
      </div>
    </div>
  );
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function formatArchiveWeekLabel() {
  return `Saved ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date())}`;
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
    help: "help",
    support: "help",
  };

  return aliases[normalized] ?? "dashboard";
}

function getNextFocusTrackId(trackIds, currentFocusTrackId) {
  if (!trackIds.length) {
    return currentFocusTrackId;
  }

  const currentIndex = trackIds.indexOf(currentFocusTrackId);

  if (currentIndex === -1) {
    return trackIds[0];
  }

  return trackIds[(currentIndex + 1) % trackIds.length];
}

function getLearningStudioState(state, childId) {
  return {
    turns: [],
    notebookCards: [],
    questionBankItems: [],
    safetyEvents: [],
    ...(state.learningStudioByChild?.[childId] ?? {}),
  };
}

function buildScreenFocusContext({
  activeTab,
  activeLesson,
  activeTrack,
  currentTabLabel,
  recommendedLesson,
  selectedChild,
  selectedChildWorkspace,
  selectedCoachStyle,
  selectedGoals,
  selectedWeeklyTarget,
  todayLabel,
}) {
  const lessonProgress = `${selectedChildWorkspace.weeklyLessonCount}/${selectedWeeklyTarget.lessons}`;
  const storyProgress = `${selectedChildWorkspace.weeklyStoryCount}/${selectedWeeklyTarget.stories}`;
  const reflectionProgress = `${selectedChildWorkspace.weeklyReflectionCount}/${selectedWeeklyTarget.reflections}`;
  const recommendedTitle = recommendedLesson?.title ?? activeLesson.title;

  const contexts = {
    dashboard: {
      audience: "Parent cockpit",
      title: `${todayLabel} plan for ${selectedChild.name}`,
      copy: `Use the parent view to choose one action, review signals, and keep this week realistic across ${selectedGoals.length} family goals.`,
      nextMove: `Start with ${recommendedTitle}, then check the review queue before adjusting targets.`,
      metric: `${lessonProgress} lessons`,
    },
    overview: {
      audience: "Child quest",
      title: `${selectedChild.companionName}'s first clear win`,
      copy: `The Quest Hub turns the week into a visible route for lessons, stories, reflections, and family practice.`,
      nextMove: `Open the First Quest Launchpad, then move into ${recommendedTitle}.`,
      metric: `${Math.round(selectedChildWorkspace.overallTargetProgress)}% week`,
    },
    courses: {
      audience: "Learning studio",
      title: activeTrack.title,
      copy: `Course work stays focused on the current track, active lesson, guided practice, quiz checks, and parent follow-through.`,
      nextMove: `Continue ${activeLesson.title} and save one practice move before marking progress complete.`,
      metric: lessonProgress,
    },
    stories: {
      audience: "Practice stories",
      title: "Turn choices into skills",
      copy: `Stories let ${selectedChild.name} rehearse confidence, money, friendship, and family moments before real life asks for them.`,
      nextMove: "Pick a branch, read the skill debrief, then connect it to the next lesson.",
      metric: `${storyProgress} stories`,
    },
    coach: {
      audience: "AI guardrails",
      title: "Bounded coaching only",
      copy: `Spark Coach is framed around safe prompts, parent-visible summaries, and the ${selectedCoachStyle.title.toLowerCase()} family tone.`,
      nextMove: "Review the prompt lab before opening broader AI support.",
      metric: selectedCoachStyle.title,
    },
    journal: {
      audience: "Reflection loop",
      title: "Signals before advice",
      copy: `Journals help children name what happened while parents see patterns without exposing raw private writing everywhere.`,
      nextMove: `Save one ${selectedChild.name} reflection, then review the Insight Coach pattern.`,
      metric: `${reflectionProgress} reflections`,
    },
    family: {
      audience: "Parent controls",
      title: "Settings, trust, and family rhythm",
      copy: "Family Hub keeps sensitive unlocks, weekly targets, privacy previews, and launch readiness decisions in the parent zone.",
      nextMove: "Use the Family Meeting Builder before changing curriculum or privacy settings.",
      metric: "Parent zone",
    },
    help: {
      audience: "Help center",
      title: "Find the fastest path through KidWiz",
      copy: "Use Help when you want a plain-English map of setup, dashboard proof, Learning Studio, and parent controls.",
      nextMove: "Start with the parent path, then restart onboarding or the dashboard tour if the product feels too dense.",
      metric: "Guide",
    },
  };

  return contexts[activeTab] ?? {
    audience: "KidWiz",
    title: currentTabLabel,
    copy: "Use this space to keep learning clear, safe, and action-oriented.",
    nextMove: `Return to ${recommendedTitle} when you are ready for the next activity.`,
    metric: "Ready",
  };
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
  const isHelpPath = window.location.pathname === "/help";
  const demoMode = searchParams.get("demo");

  if (isHelpPath) {
    return {
      appState: {
        ...createDefaultState(),
        ...savedState,
        session: savedState.session ?? {
          type: "demo",
          role: "parent",
          email: "help@kidwiz.demo",
        },
        onboardingComplete: true,
        activeTab: "help",
      },
      authMessage: "KidWiz Help opened.",
      shouldClearQuery: false,
    };
  }

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
        ? "KidWiz opened with a ready family workspace."
        : "KidWiz opened in guided setup.",
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
  const [familyToolsMessage, setFamilyToolsMessage] = useState("");
  const [aiServerStatus, setAiServerStatus] = useState({
    state: "checking",
    configured: false,
    model: null,
    message: "Checking the Learning Studio connection.",
  });

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

  useEffect(() => {
    let cancelled = false;

    async function checkAiServer() {
      try {
        const response = await fetch(`${KIDWIZ_AI_API_URL}/api/kidwiz/health`);
        const data = await response.json();

        if (cancelled) return;

        setAiServerStatus({
          state: response.ok ? "online" : "offline",
          configured: Boolean(data.configured),
          model: data.model ?? null,
          message: data.configured
            ? `Live AI is connected with ${data.model ?? "the configured model"}.`
            : "Learning Studio is available, but live AI is not configured.",
        });
      } catch {
        if (cancelled) return;

        setAiServerStatus({
          state: "offline",
          configured: false,
          model: null,
          message: "Learning Studio is offline. The family workspace still works.",
        });
      }
    }

    checkAiServer();

    return () => {
      cancelled = true;
    };
  }, []);

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
    childLessonChallengeState[activeLesson.id] ?? {
      selectedOptionId: null,
      attempts: 0,
      solved: false,
      lastResult: null,
    };
  const answeredOption = activeLesson.quiz.options[activeLessonAnswer];
  const answeredCorrectly =
    activeLessonAnswer === activeLesson.quiz.correctIndex;
  const activeStoryChoice = activeStory.choices.find(
    (choice) => choice.id === childStoryChoices[activeStory.id],
  );

  const recommendedLesson = selectedChildWorkspace.recommendedLesson;
  const recommendedStory = selectedChildWorkspace.recommendedStory;
  const nextRitual = selectedChildWorkspace.nextRitual;
  const todayLabel = formatTodayLabel();
  const weeklyCompletion =
    (childCompletedJourneyIds.length / Math.max(1, 5)) * 100;
  const familyChatDone = selectedChildWorkspace.familyChatDone;
  const focusTrackTitle = selectedChildWorkspace.focusTrackTitle;
  const childReflectionStarter = selectedChildWorkspace.childReflectionStarter;
  const mobileQuickActions = [
    {
      id: "story",
      label: "Story branch",
      title: recommendedStory?.title ?? "Open a story choice",
      copy: recommendedStory
        ? `Practice ${recommendedStory.focus.toLowerCase()} and unlock a family debrief.`
        : "Open a story choice for today's practice moment.",
      meta: `${selectedChildWorkspace.weeklyStoryCount}/${selectedWeeklyTarget.stories} stories this week`,
      icon: BookOpen,
      onClick: () => handleOpenStory(recommendedStory?.id, selectedChild.id),
    },
    {
      id: "reflection",
      label: "Reflection",
      title: `${selectedChild.companionName} check-in`,
      copy:
        selectedChildWorkspace.weeklyReflectionCount > 0
          ? "Capture today's proud moment, wobble, or question before it slips away."
          : `Start ${selectedChild.name}'s first reflection for this week.`,
      meta: `${selectedChildWorkspace.weeklyReflectionCount}/${selectedWeeklyTarget.reflections} reflections`,
      icon: NotebookPen,
      onClick: () => handleOpenChildReflectionStarter(childReflectionStarter),
    },
    {
      id: "family",
      label: "Family prompt",
      title: familyChatDone ? "Family chat logged" : nextRitual.title,
      copy: familyChatDone
        ? "This week's family prompt is already done. Open Family Hub to plan the next ritual."
        : nextRitual.copy,
      meta: familyChatDone ? "1/1 family prompts this week" : "Open Family Hub",
      icon: Users,
      onClick: handleOpenFamily,
    },
  ];
  const mobileParentSnapshots = [
    `${selectedGoals.length} family goals`,
    selectedRhythm.title,
    selectedCoachStyle.title,
    selectedCelebrationStyle.title,
  ];

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
      copy: `This week's focus track is ${focusTrackTitle}, with ${selectedWeeklyTarget.lessons} lesson target(s).`,
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

  function patchLearningStudio(childId, updater) {
    updateAppState((current) => {
      const currentStudio = getLearningStudioState(current, childId);

      return {
        ...current,
        learningStudioByChild: {
          ...current.learningStudioByChild,
          [childId]: updater(currentStudio),
        },
      };
    });
  }

  async function handleSendLearningStudioPrompt({ mode, prompt }) {
    const submissionContext = {
      activeLesson,
      activeTrack,
      apiUrl: KIDWIZ_AI_API_URL,
      mode,
      prompt,
      selectedChild: {
        id: selectedChild.id,
        name: selectedChild.name,
        age: selectedChild.age,
        grade: selectedChild.grade,
        coachLens: selectedChild.coachLens,
      },
      selectedCoachStyle: {
        id: selectedCoachStyle.id,
        title: selectedCoachStyle.title,
        copy: selectedCoachStyle.copy,
      },
      selectedGoals,
    };

    const submission = await submitLearningStudioPrompt(submissionContext);

    if (!submission.ok) {
      return submission;
    }

    patchLearningStudio(submissionContext.selectedChild.id, (current) =>
      addLearningStudioSubmissionToState(current, submission),
    );

    return submission;
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
        "KidWiz opened the parent demo workspace.",
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
      dashboardTourCompleted: false,
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

  function handleToggleLessonMilestone(stageId) {
    patchChildCollection(
      "lessonMilestoneIdsByChild",
      selectedChild.id,
      (current = {}) => {
        const completedStageIds = current[activeLesson.id] ?? [];
        const nextStageIds = completedStageIds.includes(stageId)
          ? completedStageIds.filter((id) => id !== stageId)
          : [...completedStageIds, stageId];

        return {
          ...current,
          [activeLesson.id]: nextStageIds,
        };
      },
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

  function handleSelectLessonPracticeChoice(choiceId) {
    patchChildCollection(
      "lessonPracticeChoiceIdsByChild",
      selectedChild.id,
      (current = {}) => ({
        ...current,
        [activeLesson.id]: current[activeLesson.id] === choiceId ? null : choiceId,
      }),
    );
  }

  function handleSelectLessonChallengeChoice(choiceId) {
    patchChildCollection(
      "lessonChallengeStateByChild",
      selectedChild.id,
      (current = {}) => {
        const lessonState = current[activeLesson.id] ?? {
          attempts: 0,
          solved: false,
        };
        const nextSelectedOptionId =
          lessonState.selectedOptionId === choiceId ? null : choiceId;

        return {
          ...current,
          [activeLesson.id]: {
            ...lessonState,
            selectedOptionId: nextSelectedOptionId,
            lastResult: nextSelectedOptionId ? null : lessonState.lastResult,
          },
        };
      },
    );
  }

  function handleCheckLessonChallenge(correctOptionId, maxAttempts = 3) {
    const selectedOptionId = activeLessonChallengeState.selectedOptionId;

    if (!selectedOptionId) {
      return;
    }

    if (
      activeLessonChallengeState.solved ||
      activeLessonChallengeState.attempts >= maxAttempts
    ) {
      return;
    }

    patchChildCollection(
      "lessonChallengeStateByChild",
      selectedChild.id,
      (current = {}) => {
        const lessonState = current[activeLesson.id] ?? {
          attempts: 0,
          solved: false,
          lastResult: null,
          selectedOptionId: null,
        };

        if (lessonState.solved || lessonState.attempts >= maxAttempts) {
          return current;
        }

        const isCorrect = selectedOptionId === correctOptionId;

        return {
          ...current,
          [activeLesson.id]: {
            ...lessonState,
            selectedOptionId,
            attempts: lessonState.attempts + 1,
            solved: isCorrect,
            lastResult: isCorrect ? "correct" : "wrong",
          },
        };
      },
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

  function handleOpenParentNoteStarter(starter = "") {
    setParentJournalDraft(starter);
    updateAppState((current) => ({
      ...current,
      activeTab: "journal",
    }));
  }

  function handleOpenChildReflectionStarter(starter = "") {
    setChildJournalDraft(starter);
    updateAppState((current) => ({
      ...current,
      activeTab: "journal",
    }));
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
    updateAppState((current) => {
      const nextVisibleTracks = getVisibleTracks(current.bodyBoundariesUnlocked);
      const nextWeeklyTargetsByChild = Object.fromEntries(
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

      return {
        ...current,
        weeklyTargetsByChild: nextWeeklyTargetsByChild,
        playlistLessonIdsByChild: buildSuggestedPlaylists(
          current.selectedGoalIds,
          current.bodyBoundariesUnlocked,
          nextWeeklyTargetsByChild,
        ),
        completedJourneyIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, []]),
        ),
        lessonMilestoneIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonChallengeStateByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonPracticeChoiceIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonQuizAnswersByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
      };
    });
    setFamilyToolsMessage(
      "Fresh week generated. Focus tracks rotated, playlists refreshed, and daily rhythm reset.",
    );
  }

  function buildArchivedSnapshotsMap(weekLabel, sourceState = appState) {
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

  function appendArchivedSnapshots(currentHistory, snapshotsByChild) {
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

  function handleArchiveCurrentWeek() {
    const weekLabel = formatArchiveWeekLabel();
    const snapshotsByChild = buildArchivedSnapshotsMap(weekLabel);

    updateAppState((current) => ({
      ...current,
      weeklyHistoryByChild: appendArchivedSnapshots(
        current.weeklyHistoryByChild,
        snapshotsByChild,
      ),
    }));
    setFamilyToolsMessage("Current week saved into trend history.");
  }

  function handleArchiveAndStartFreshWeek() {
    const weekLabel = formatArchiveWeekLabel();
    const snapshotsByChild = buildArchivedSnapshotsMap(weekLabel);

    updateAppState((current) => {
      const nextVisibleTracks = getVisibleTracks(current.bodyBoundariesUnlocked);
      const nextWeeklyTargetsByChild = Object.fromEntries(
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

      return {
        ...current,
        weeklyHistoryByChild: appendArchivedSnapshots(
          current.weeklyHistoryByChild,
          snapshotsByChild,
        ),
        weeklyTargetsByChild: nextWeeklyTargetsByChild,
        playlistLessonIdsByChild: buildSuggestedPlaylists(
          current.selectedGoalIds,
          current.bodyBoundariesUnlocked,
          nextWeeklyTargetsByChild,
        ),
        completedJourneyIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, []]),
        ),
        lessonMilestoneIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonChallengeStateByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonPracticeChoiceIdsByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
        lessonQuizAnswersByChild: Object.fromEntries(
          childProfiles.map((child) => [child.id, {}]),
        ),
      };
    });
    setFamilyToolsMessage(
      "Week archived and a fresh week is ready with new focus tracks and reset rhythm.",
    );
  }

  function handleResetWeeklyHistory() {
    updateAppState((current) => ({
      ...current,
      weeklyHistoryByChild: createDefaultState().weeklyHistoryByChild,
    }));
    setFamilyToolsMessage("Saved weekly history reset to the KidWiz baseline.");
  }

  function handleResetDemo() {
    if (typeof window !== "undefined") {
      const shouldReset = window.confirm(
        "Reset the KidWiz family workspace and clear saved browser data?",
      );

      if (!shouldReset) {
        return;
      }

      window.localStorage.removeItem(STORAGE_KEY);
    }

    setAppState(createDefaultState());
    setAuthEmail("");
    setAuthMessage("KidWiz family workspace reset.");
    setChildJournalDraft("");
    setParentJournalDraft("");
    setFamilyToolsMessage("");
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

  function patchPlanningNudgeState(childId, updater) {
    updateAppState((current) => ({
      ...current,
      planningNudgeStateByChild: {
        ...current.planningNudgeStateByChild,
        [childId]: updater(current.planningNudgeStateByChild?.[childId]),
      },
    }));
  }

  function handleDismissPlanningNudge(childId, nudgeId) {
    patchPlanningNudgeState(childId, (current = {}) => ({
      acceptedIds: current.acceptedIds ?? [],
      dismissedIds: Array.from(
        new Set([...(current.dismissedIds ?? []), nudgeId]),
      ),
    }));
    setFamilyToolsMessage("Planning nudge dismissed for now.");
  }

  function handleApplyPlanningNudge(childId, planningNudge) {
    updateAppState((current) => {
      const currentTarget = current.weeklyTargetsByChild?.[childId] ?? {
        lessons: 3,
        stories: 2,
        reflections: 2,
        focusTrackId: getVisibleTracks(current.bodyBoundariesUnlocked)[0]?.id,
      };
      const nextTarget = planningNudge.actions.reduce((target, action) => {
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
      const nextPlanningNudgeState = current.planningNudgeStateByChild?.[childId] ?? {
        acceptedIds: [],
        dismissedIds: [],
      };

      return {
        ...current,
        weeklyTargetsByChild: {
          ...current.weeklyTargetsByChild,
          [childId]: nextTarget,
        },
        playlistLessonIdsByChild: buildSuggestedPlaylists(
          current.selectedGoalIds,
          current.bodyBoundariesUnlocked,
          {
            ...current.weeklyTargetsByChild,
            [childId]: nextTarget,
          },
        ),
        planningNudgeStateByChild: {
          ...current.planningNudgeStateByChild,
          [childId]: {
            acceptedIds: Array.from(
              new Set([...(nextPlanningNudgeState.acceptedIds ?? []), planningNudge.id]),
            ),
            dismissedIds: (nextPlanningNudgeState.dismissedIds ?? []).filter(
              (id) => id !== planningNudge.id,
            ),
          },
        },
      };
    });
    setFamilyToolsMessage("Planning nudge applied to this week's setup.");
  }

  function handleOpenStory(storyId, childId = selectedChild.id) {
    updateAppState((current) => ({
      ...current,
      activeTab: "stories",
      selectedChildId: childId,
      selectedStoryId: storyId ?? current.selectedStoryId,
    }));
  }

  function handleOpenJournal(childId = selectedChild.id) {
    updateAppState((current) => ({
      ...current,
      activeTab: "journal",
      selectedChildId: childId,
    }));
  }

  function handleOpenFamily() {
    updateAppState((current) => ({
      ...current,
      activeTab: "family",
    }));
  }

  function handleSelectChild(childId) {
    updateAppState((current) => ({
      ...current,
      selectedChildId: childId,
    }));
  }

  function handleSelectTab(tabId) {
    updateAppState((current) => ({
      ...current,
      activeTab: tabId,
    }));
  }

  function handleCompleteDashboardTour() {
    updateAppState((current) => ({
      ...current,
      dashboardTourCompleted: true,
    }));
  }

  function handleRestartDashboardTour() {
    updateAppState((current) => ({
      ...current,
      activeTab: "dashboard",
      dashboardTourCompleted: false,
    }));
    setFamilyToolsMessage("Dashboard tour restarted.");
  }

  const canAdvanceOnboarding =
    appState.onboardingStep === 0 ? appState.selectedGoalIds.length >= 2 : true;
  const currentTab =
    tabItems.find((tab) => tab.id === appState.activeTab) ?? tabItems[0];
  const CurrentTabIcon = currentTab.icon;
  const parentZoneTabs = ["dashboard", "coach", "family"];
  const childZoneTabs = ["overview", "courses", "stories"];
  const appZoneClass = parentZoneTabs.includes(appState.activeTab)
    ? "is-parent-zone"
    : childZoneTabs.includes(appState.activeTab)
      ? "is-child-zone"
      : "is-support-zone";
  const appZoneLabel = parentZoneTabs.includes(appState.activeTab)
    ? "Parent zone"
    : childZoneTabs.includes(appState.activeTab)
      ? "Child zone"
      : "Support zone";
  const screenFocusContext = buildScreenFocusContext({
    activeTab: appState.activeTab,
    activeLesson,
    activeTrack,
    currentTabLabel: currentTab.label,
    recommendedLesson,
    selectedChild,
    selectedChildWorkspace,
    selectedCoachStyle,
    selectedGoals,
    selectedWeeklyTarget,
    todayLabel,
  });

  return (
    <div className="page-shell">
      {!appState.session ? (
        <Suspense fallback={<SiteLoading />}>
          <PublicSite
            authBusy={authBusy}
            authEmail={authEmail}
            authMessage={authMessage}
            onAuthEmailChange={setAuthEmail}
            onDemoStart={handleDemoStart}
            onMagicLinkSubmit={handleMagicLinkSubmit}
            visibleTracks={visibleTracks}
          />
        </Suspense>
      ) : !appState.onboardingComplete ? (
        <Suspense fallback={<OnboardingLoading />}>
          <OnboardingFlow
            bodyBoundariesUnlocked={appState.bodyBoundariesUnlocked}
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
            selectedGoalIds={appState.selectedGoalIds}
            selectedGoals={selectedGoals}
            step={appState.onboardingStep}
            weeklyTargetsByChild={appState.weeklyTargetsByChild}
            weeklyRhythmId={appState.weeklyRhythmId}
          />
        </Suspense>
      ) : (
        <div className={`app-shell ${appZoneClass}`}>
          <header className="app-topbar">
            <div className="page-width app-topbar-inner">
              <div className="brand-lockup brand-lockup-dark">
                <img
                  className="brand-logo-image"
                  src="/brand/kidwiz-logo.svg"
                  alt="KidWiz"
                />
                <div>
                  <p className="brand-subtitle">
                    {appState.familyName} · {appState.session.email} · Family workspace
                  </p>
                </div>
              </div>

              <div className="app-topbar-actions">
                <div className="mode-pill">
                  <CurrentTabIcon size={16} />
                  <span>{currentTab.label}</span>
                </div>
                <div className="zone-pill">{appZoneLabel}</div>
                <button className="ghost-button ghost-button-dark" onClick={handleLogout}>
                  Back to site
                </button>
              </div>
            </div>
          </header>

          <MobileShell
            activeTab={appState.activeTab}
            bodyBoundariesUnlocked={appState.bodyBoundariesUnlocked}
            childProfiles={childProfiles}
            mobileParentSnapshots={mobileParentSnapshots}
            mobileQuickActions={mobileQuickActions}
            onOpenFamily={handleOpenFamily}
            onOpenLesson={handleOpenLesson}
            onSelectChild={handleSelectChild}
            onSelectTab={handleSelectTab}
            onToggleBodyBoundaries={handleToggleBodyBoundaries}
            recommendedLesson={recommendedLesson}
            selectedChild={selectedChild}
            selectedChildOverallTargetProgress={
              selectedChildWorkspace.overallTargetProgress
            }
            selectedChildWorkspace={selectedChildWorkspace}
            selectedCoachStyle={selectedCoachStyle}
            selectedWeeklyTarget={selectedWeeklyTarget}
          />

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
                      onClick={() => handleSelectChild(child.id)}
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
                      onClick={() => handleSelectTab(item.id)}
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
              <section
                className="app-context-strip"
                aria-label={`${screenFocusContext.audience} screen guide`}
              >
                <div className="app-context-copy">
                  <span>{screenFocusContext.audience}</span>
                  <h1>{screenFocusContext.title}</h1>
                  <p>{screenFocusContext.copy}</p>
                </div>
                <div className="app-context-next">
                  <span>Best next move</span>
                  <strong>{screenFocusContext.nextMove}</strong>
                  <em>{screenFocusContext.metric}</em>
                </div>
              </section>

              <Suspense
                fallback={<WorkspaceLoading activeTab={appState.activeTab} />}
              >
                {appState.activeTab === "dashboard" ? (
                  <DashboardTab
                    appState={appState}
                    dashboardTourActive={!appState.dashboardTourCompleted}
                    nextRitual={nextRitual}
                    onAdjustWeeklyTarget={handleAdjustWeeklyTarget}
                    onApplyPlanningNudge={handleApplyPlanningNudge}
                    onChangeFocusTrack={handleChangeFocusTrack}
                    onCompleteDashboardTour={handleCompleteDashboardTour}
                    onDismissPlanningNudge={handleDismissPlanningNudge}
                    onOpenFamily={handleOpenFamily}
                    onOpenJournal={handleOpenJournal}
                    onOpenLesson={handleOpenLessonForChild}
                    onOpenStory={handleOpenStory}
                    onSelectChild={handleSelectChild}
                    selectedCelebrationStyle={selectedCelebrationStyle}
                    selectedCoachStyle={selectedCoachStyle}
                    selectedGoals={selectedGoals}
                    selectedChildId={selectedChild.id}
                    selectedRhythm={selectedRhythm}
                    visibleTracks={visibleTracks}
                  />
                ) : null}

                {appState.activeTab === "overview" ? (
                  <OverviewTab
                    selectedChildWorkspace={selectedChildWorkspace}
                    appState={appState}
                    childCompletedJourneyIds={childCompletedJourneyIds}
                    childCompletedLessonIds={childCompletedLessonIds}
                    childJournalEntries={childJournalEntries}
                    childPlaylistLessonIds={childPlaylistLessonIds}
                    childStoryChoices={childStoryChoices}
                    dailyJourneys={dailyJourneys}
                    nextRitual={nextRitual}
                    onOpenFamily={handleOpenFamily}
                    onOpenJournal={handleOpenJournal}
                    onOpenLesson={handleOpenLesson}
                    onOpenStory={handleOpenStory}
                    onSelectTrack={handleSelectTrack}
                    onToggleJourney={handleToggleJourney}
                    recommendedLesson={recommendedLesson}
                    selectedSignal={selectedChildWorkspace.signal}
                    selectedChild={selectedChild}
                    selectedGoals={selectedGoals}
                    selectedWeeklyTarget={selectedWeeklyTarget}
                    todayLabel={todayLabel}
                    visibleTracks={visibleTracks}
                    weeklyCompletion={weeklyCompletion}
                  />
                ) : null}

                {appState.activeTab === "courses" ? (
                  <CoursesTab
                    activeLesson={activeLesson}
                    activeLessonAnswer={activeLessonAnswer}
                    activeLessonMilestoneIds={activeLessonMilestoneIds}
                    activeLessonPracticeChoiceId={activeLessonPracticeChoiceId}
                    activeLessonChallengeState={activeLessonChallengeState}
                    activeTrack={activeTrack}
                    answeredCorrectly={answeredCorrectly}
                    answeredOption={answeredOption}
                    childCompletedJourneyIds={childCompletedJourneyIds}
                    childCompletedLessonIds={childCompletedLessonIds}
                    childPlaylistLessonIds={childPlaylistLessonIds}
                    coachResponseMode={coachResponseMode}
                    nextRitual={nextRitual}
                    onAnswer={handleQuizAnswer}
                    onChangeCoachMode={setCoachResponseMode}
                    onOpenChildReflectionStarter={handleOpenChildReflectionStarter}
                    onOpenParentNoteStarter={handleOpenParentNoteStarter}
                    onCheckLessonChallenge={handleCheckLessonChallenge}
                    onSelectLesson={(lessonId) =>
                      updateAppState((current) => ({
                        ...current,
                        selectedLessonId: lessonId,
                      }))
                    }
                    onSelectPracticeChoice={handleSelectLessonPracticeChoice}
                    onSelectLessonChallengeChoice={handleSelectLessonChallengeChoice}
                    onSelectTrack={handleSelectTrack}
                    onToggleJourney={handleToggleJourney}
                    onToggleComplete={handleToggleLessonComplete}
                    onToggleLessonMilestone={handleToggleLessonMilestone}
                    onTogglePlaylist={handleTogglePlaylistLesson}
                    assignedTrackIds={assignedTrackIds}
                    selectedCelebrationStyle={selectedCelebrationStyle}
                    selectedChild={selectedChild}
                    visibleTracks={visibleTracks}
                  />
                ) : null}

                {appState.activeTab === "stories" ? (
                  <StoriesTab
                    activeStory={activeStory}
                    activeStoryChoice={activeStoryChoice}
                    childCompletedLessonIds={childCompletedLessonIds}
                    childStoryChoices={childStoryChoices}
                    onOpenLesson={handleOpenLesson}
                    onSelectChoice={handleSelectStoryChoice}
                    onSelectStory={(storyId) =>
                      updateAppState((current) => ({
                        ...current,
                        selectedStoryId: storyId,
                        activeTab: "stories",
                      }))
                    }
                    selectedChild={selectedChild}
                    storyEpisodes={storyEpisodes}
                    visibleTracks={visibleTracks}
                  />
                ) : null}

                {appState.activeTab === "coach" ? (
                  <CoachTab
                    aiServerStatus={aiServerStatus}
                    activeLesson={activeLesson}
                    activeTrack={activeTrack}
                    coachCards={coachCards}
                    coachResponseMode={coachResponseMode}
                    learningStudio={selectedLearningStudio}
                    onChangeCoachMode={setCoachResponseMode}
                    onSendLearningStudioPrompt={handleSendLearningStudioPrompt}
                    selectedChild={selectedChild}
                    selectedCoachStyle={selectedCoachStyle}
                    selectedGoals={selectedGoals}
                  />
                ) : null}

                {appState.activeTab === "journal" ? (
                  <JournalTab
                    childCompletedLessonIds={childCompletedLessonIds}
                    childJournalDraft={childJournalDraft}
                    childJournalEntries={childJournalEntries}
                    childJournalMood={childJournalMood}
                    moodOptions={moodOptions}
                    onOpenLesson={handleOpenLesson}
                    onChildDraftChange={setChildJournalDraft}
                    onChildMoodChange={setChildJournalMood}
                    onParentDraftChange={setParentJournalDraft}
                    onSaveChildJournal={handleSaveChildJournal}
                    onSaveParentJournal={handleSaveParentJournal}
                    parentJournalDraft={parentJournalDraft}
                    parentJournalEntries={appState.parentJournalEntries}
                    selectedChild={selectedChild}
                    visibleTracks={visibleTracks}
                  />
                ) : null}

                {appState.activeTab === "family" ? (
                  <FamilyTab
                    appState={appState}
                    assignedTrackIds={assignedTrackIds}
                    familyToolsMessage={familyToolsMessage}
                    onAdjustWeeklyTarget={handleAdjustWeeklyTarget}
                    onApplyPlanningNudge={handleApplyPlanningNudge}
                    onArchiveAndStartFreshWeek={handleArchiveAndStartFreshWeek}
                    onChangeCelebrationStyle={(styleId) =>
                      updateAppState((current) => ({
                        ...current,
                        celebrationStyleId: styleId,
                      }))
                    }
                    onChangeFocusTrack={handleChangeFocusTrack}
                    onChangeCoachStyle={(styleId) =>
                      updateAppState((current) => ({
                        ...current,
                        coachStyleId: styleId,
                      }))
                    }
                    onDismissPlanningNudge={handleDismissPlanningNudge}
                    onChangeRhythm={(rhythmId) =>
                      updateAppState((current) => ({
                        ...current,
                        weeklyRhythmId: rhythmId,
                      }))
                    }
                    onArchiveCurrentWeek={handleArchiveCurrentWeek}
                    onGenerateFreshWeek={handleGenerateFreshWeek}
                    onResetDemo={handleResetDemo}
                    onResetWeeklyHistory={handleResetWeeklyHistory}
                    onRestartOnboarding={() =>
                      updateAppState((current) => ({
                        ...current,
                        onboardingComplete: false,
                        onboardingStep: 0,
                        dashboardTourCompleted: false,
                      }))
                    }
                    onRestartDashboardTour={handleRestartDashboardTour}
                    onToggleBodyBoundaries={handleToggleBodyBoundaries}
                    onToggleGoal={handleToggleGoal}
                    onToggleJourney={handleToggleJourney}
                    onToggleTrackAssignment={handleToggleTrackAssignment}
                    selectedCelebrationStyle={selectedCelebrationStyle}
                    selectedChild={selectedChild}
                    selectedCoachStyle={selectedCoachStyle}
                    selectedGoals={selectedGoals}
                    selectedRhythm={selectedRhythm}
                    visibleTracks={visibleTracks}
                    weeklyHistoryByChild={appState.weeklyHistoryByChild}
                  />
                ) : null}

                {appState.activeTab === "help" ? (
                  <HelpTab
                    aiServerStatus={aiServerStatus}
                    onOpenCoach={() => handleSelectTab("coach")}
                    onOpenDashboard={() => handleSelectTab("dashboard")}
                    onOpenFamily={handleOpenFamily}
                    onRestartDashboardTour={handleRestartDashboardTour}
                    onRestartOnboarding={() =>
                      updateAppState((current) => ({
                        ...current,
                        activeTab: "dashboard",
                        onboardingComplete: false,
                        onboardingStep: 0,
                        dashboardTourCompleted: false,
                      }))
                    }
                    selectedChild={selectedChild}
                    selectedGoals={selectedGoals}
                    selectedRhythm={selectedRhythm}
                  />
                ) : null}
              </Suspense>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
