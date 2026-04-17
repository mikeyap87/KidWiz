import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Compass,
  Flame,
  Heart,
  House,
  Lock,
  MessagesSquare,
  NotebookPen,
  PiggyBank,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TimerReset,
  Users,
  Wallet,
} from "lucide-react";
import {
  appHighlights,
  badgeCatalog,
  celebrationStyles,
  childProfiles,
  coachStyles,
  courseCatalog,
  dailyJourneys,
  familyGoals,
  familyRituals,
  heroStats,
  siteImages,
  starterAssignedTrackIdsByChild,
  starterChildJournalEntriesByChild,
  starterCompletedJourneyIdsByChild,
  starterCompletedLessonIdsByChild,
  starterFamilyGoalIds,
  starterParentJournalEntries,
  starterPlaylistLessonIdsByChild,
  starterStoryChoicesByChild,
  storyEpisodes,
  trustSignals,
  weeklyRhythms,
} from "./data/kidwizData";
import {
  isSupabaseConfigured,
  sendMagicLink,
  signOut,
  supabase,
} from "./lib/supabaseClient";
import "./App.css";

const STORAGE_KEY = "kidwiz-demo-state-v2";

const tabItems = [
  { id: "overview", label: "Home", icon: House },
  { id: "courses", label: "Courses", icon: Brain },
  { id: "stories", label: "Stories", icon: BookOpen },
  { id: "coach", label: "Coach", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Family Hub", icon: Users },
];

const trackIcons = {
  academics: Brain,
  literacy: BookOpen,
  confidence: Heart,
  money: Wallet,
  relationships: MessagesSquare,
  digital: ShieldCheck,
  habits: TimerReset,
  body: ShieldCheck,
};

const goalIcons = {
  confidence: Heart,
  friendships: Users,
  money: PiggyBank,
  reading: BookOpen,
  focus: Target,
  digital: ShieldCheck,
};

const badgeIcons = {
  spark: Sparkles,
  rocket: Rocket,
  story: BookOpen,
  heart: Heart,
  flame: Flame,
  award: Award,
  shield: ShieldCheck,
};

const moodOptions = ["proud", "curious", "steady", "grateful", "wobbly"];

function buildSuggestedPlaylistForChild(goalIds, childId, bodyBoundariesUnlocked) {
  const visibleTracks = bodyBoundariesUnlocked
    ? courseCatalog
    : courseCatalog.filter((track) => !track.sensitive);
  const matches = [];
  const seedOffset = childProfiles.findIndex((child) => child.id === childId);

  visibleTracks.forEach((track, trackIndex) => {
    if (!track.goalIds.some((goalId) => goalIds.includes(goalId))) {
      return;
    }

    const lesson = track.lessons[(trackIndex + seedOffset) % track.lessons.length];
    if (!matches.includes(lesson.id)) {
      matches.push(lesson.id);
    }
  });

  if (matches.length < 3) {
    visibleTracks.forEach((track, trackIndex) => {
      const lesson = track.lessons[(trackIndex + seedOffset) % track.lessons.length];
      if (!matches.includes(lesson.id)) {
        matches.push(lesson.id);
      }
    });
  }

  return matches.slice(0, 3);
}

function buildSuggestedPlaylists(goalIds, bodyBoundariesUnlocked) {
  return Object.fromEntries(
    childProfiles.map((child) => [
      child.id,
      buildSuggestedPlaylistForChild(goalIds, child.id, bodyBoundariesUnlocked),
    ]),
  );
}

function createDefaultState() {
  return {
    session: null,
    activeTab: "overview",
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
    lessonQuizAnswersByChild: Object.fromEntries(
      childProfiles.map((child) => [child.id, {}]),
    ),
  };
}

function loadSavedState() {
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

function findTrackByLessonId(lessonId) {
  return courseCatalog.find((track) =>
    track.lessons.some((lesson) => lesson.id === lessonId),
  );
}

function findLessonById(lessonId) {
  const track = findTrackByLessonId(lessonId);
  return track?.lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

function getTrackProgress(child, track, completedLessonIds) {
  const base = child.baseTrackScores[track.id] ?? 0;
  const completedCount = track.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;

  return Math.min(100, base + completedCount * 7);
}

function deriveEarnedBadgeIds({
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

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function BadgeGlyph({ iconKey }) {
  const Icon = badgeIcons[iconKey] ?? Star;
  return <Icon size={18} />;
}

function GoalGlyph({ goalId }) {
  const Icon = goalIcons[goalId] ?? Sparkles;
  return <Icon size={18} />;
}

function App() {
  const [appState, setAppState] = useState(() => loadSavedState());
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
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

  const selectedChild =
    childProfiles.find((child) => child.id === appState.selectedChildId) ??
    childProfiles[0];
  const selectedGoals = familyGoals.filter((goal) =>
    appState.selectedGoalIds.includes(goal.id),
  );
  const visibleTracks = appState.bodyBoundariesUnlocked
    ? courseCatalog
    : courseCatalog.filter((track) => !track.sensitive);
  const activeTrack =
    visibleTracks.find((track) => track.id === appState.selectedTrackId) ??
    visibleTracks[0];
  const activeLesson =
    activeTrack.lessons.find((lesson) => lesson.id === appState.selectedLessonId) ??
    activeTrack.lessons[0];
  const activeStory =
    storyEpisodes.find((story) => story.id === appState.selectedStoryId) ??
    storyEpisodes[0];
  const childPlaylistLessonIds =
    appState.playlistLessonIdsByChild[selectedChild.id] ?? [];
  const childPlaylistLessons = childPlaylistLessonIds
    .map((lessonId) => findLessonById(lessonId))
    .filter(Boolean);
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
  const activeLessonAnswer = childQuizAnswers[activeLesson.id];
  const answeredOption = activeLesson.quiz.options[activeLessonAnswer];
  const answeredCorrectly =
    activeLessonAnswer === activeLesson.quiz.correctIndex;
  const activeStoryChoice = activeStory.choices.find(
    (choice) => choice.id === childStoryChoices[activeStory.id],
  );
  const selectedRhythm =
    weeklyRhythms.find((item) => item.id === appState.weeklyRhythmId) ??
    weeklyRhythms[0];
  const selectedCoachStyle =
    coachStyles.find((item) => item.id === appState.coachStyleId) ??
    coachStyles[1];
  const selectedCelebrationStyle =
    celebrationStyles.find((item) => item.id === appState.celebrationStyleId) ??
    celebrationStyles[0];
  const assignedTrackIds =
    appState.assignedTrackIdsByChild[selectedChild.id] ?? [];
  const trackProgressRows = visibleTracks.map((track) => ({
    ...track,
    progress: getTrackProgress(selectedChild, track, childCompletedLessonIds),
    completedLessons: track.lessons.filter((lesson) =>
      childCompletedLessonIds.includes(lesson.id),
    ).length,
    assigned: assignedTrackIds.includes(track.id),
  }));
  const strongestTrack = [...trackProgressRows].sort(
    (left, right) => right.progress - left.progress,
  )[0];
  const nextRitual =
    familyRituals[childCompletedLessonIds.length % familyRituals.length];
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
  const suggestedPreviewPlaylists = useMemo(
    () =>
      childProfiles.map((child) => ({
        child,
        lessons: buildSuggestedPlaylistForChild(
          appState.selectedGoalIds,
          child.id,
          appState.bodyBoundariesUnlocked,
        )
          .map((lessonId) => findLessonById(lessonId))
          .filter(Boolean),
      })),
    [appState.bodyBoundariesUnlocked, appState.selectedGoalIds],
  );
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
      title: "Celebration prompt",
      copy: `Tonight, celebrate ${selectedCelebrationStyle.title.toLowerCase()} by naming one specific move ${selectedChild.name} made well.`,
    },
  ];
  const todayLabel = formatTodayLabel();
  const overviewPlaylistPreview = childPlaylistLessons.slice(0, 3);
  const weeklyCompletion =
    (childCompletedJourneyIds.length / dailyJourneys.length) * 100;

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

  async function handleMagicLinkSubmit(event) {
    event.preventDefault();

    if (!authEmail.trim()) {
      setAuthMessage("Add a parent email first.");
      return;
    }

    if (!isSupabaseConfigured) {
      updateAppState((current) => ({
        ...current,
        session: {
          type: "demo",
          role: "parent",
          email: authEmail.trim().toLowerCase(),
        },
        onboardingComplete: false,
      }));
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
    const defaults = createDefaultState();
    updateAppState({
      ...defaults,
      session: {
        type: "demo",
        role: "parent",
        email:
          mode === "instant"
            ? "hello@family.kidwiz.demo"
            : "planner@kidwiz.demo",
      },
      onboardingComplete: mode === "instant",
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

  function handleSelectStory(storyId) {
    updateAppState((current) => ({
      ...current,
      selectedStoryId: storyId,
      activeTab: "stories",
    }));
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
      playlistLessonIdsByChild: buildSuggestedPlaylists(
        current.selectedGoalIds,
        current.bodyBoundariesUnlocked,
      ),
    }));
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

  const canAdvanceOnboarding =
    appState.onboardingStep === 0
      ? appState.selectedGoalIds.length >= 2
      : true;

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
          selectedGoals={selectedGoals}
          selectedGoalIds={appState.selectedGoalIds}
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
                  <Sparkles size={16} />
                  <span>{selectedRhythm.title}</span>
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
                      <ChevronRight size={14} />
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
              {appState.activeTab === "overview" ? (
                <OverviewTab
                  childCompletedJourneyIds={childCompletedJourneyIds}
                  dailyJourneys={dailyJourneys}
                  earnedBadges={earnedBadges}
                  nextBadge={nextBadge}
                  nextRitual={nextRitual}
                  onOpenLesson={handleOpenLesson}
                  onToggleJourney={handleToggleJourney}
                  overviewPlaylistPreview={overviewPlaylistPreview}
                  selectedChild={selectedChild}
                  selectedGoals={selectedGoals}
                  strongestTrack={strongestTrack}
                  todayLabel={todayLabel}
                  trackProgressRows={trackProgressRows}
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
                  selectedChild={selectedChild}
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
                  onSelectStory={handleSelectStory}
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
                  onToggleBodyBoundaries={() =>
                    updateAppState((current) => ({
                      ...current,
                      bodyBoundariesUnlocked: !current.bodyBoundariesUnlocked,
                    }))
                  }
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

function PublicSite({
  authBusy,
  authEmail,
  authMessage,
  onAuthEmailChange,
  onDemoStart,
  onMagicLinkSubmit,
  visibleTracks,
}) {
  return (
    <div className="site-shell">
      <section
        className="hero-band"
        style={{
          backgroundImage: `linear-gradient(125deg, rgba(9, 11, 17, 0.86), rgba(9, 11, 17, 0.34)), url(${siteImages.hero})`,
        }}
      >
        <div className="topbar page-width">
          <div className="brand-lockup">
            <div className="brand-badge">KW</div>
            <div>
              <p className="brand-name">KidWiz</p>
              <p className="brand-subtitle">
                Learning, confidence, money sense, and family wisdom
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Plan the family setup
            </button>
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Open full demo week
            </button>
          </div>
        </div>

        <div className="hero-content page-width">
          <p className="eyebrow">A children's learning universe for real life</p>
          <h1>
            School skills, life skills, and family wisdom in one beautiful
            product.
          </h1>
          <p className="hero-copy">
            KidWiz now includes guided family onboarding, deeper course arcs,
            weekly playlists, badges, journals, parent controls, branching
            stories, and a bounded AI-style coach experience for local review.
          </p>

          <div className="hero-actions">
            <button className="solid-button" onClick={() => onDemoStart("instant")}>
              Enter KidWiz
              <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => onDemoStart("guided")}>
              Start with onboarding
            </button>
          </div>

          <form className="hero-login" onSubmit={onMagicLinkSubmit}>
            <label htmlFor="parent-email">Parent email</label>
            <div className="hero-login-row">
              <input
                id="parent-email"
                type="email"
                placeholder="parent@kidwiz.com"
                value={authEmail}
                onChange={(event) => onAuthEmailChange(event.target.value)}
              />
              <button className="solid-button" type="submit" disabled={authBusy}>
                {authBusy ? "Sending..." : "Send magic link"}
              </button>
            </div>
            <p className="login-note">
              {authMessage ||
                "Supabase is optional right now. Local demo mode keeps everything testable while we shape the product."}
            </p>
          </form>

          <div className="hero-stat-row">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-band">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">What makes this stronger now</p>
          <h2>KidWiz is moving from pretty concept to real local product.</h2>
          <p>
            The demo is now built around repeat-use family loops: onboarding,
            tracks, playlists, stories, badges, journaling, and parent control
            over the learning rhythm.
          </p>
        </div>

        <div className="page-width feature-grid">
          {appHighlights.map((highlight) => (
            <article key={highlight.title} className="feature-tile">
              <h3>{highlight.title}</h3>
              <p>{highlight.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="course-band">
        <div className="page-width section-heading">
          <p className="eyebrow eyebrow-dark">Course library</p>
          <h2>Eight tracks built for modern family growth.</h2>
          <p>
            Traditional education still matters, but KidWiz pairs it with money
            habits, digital safety, focus, confidence, and stronger relationships.
          </p>
        </div>

        <div className="page-width course-showcase">
          {visibleTracks.map((track) => {
            const Icon = trackIcons[track.category] ?? Sparkles;

            return (
              <article key={track.id} className="course-showcase-item">
                <div className="course-showcase-icon">
                  <Icon size={18} />
                </div>
                <h3>{track.title}</h3>
                <p>{track.summary}</p>
                <span>{track.lessons.length} lessons</span>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="story-band"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(12, 16, 24, 0.84), rgba(12, 16, 24, 0.3)), url(${siteImages.story})`,
        }}
      >
        <div className="page-width story-band-content">
          <div className="section-heading on-dark">
            <p className="eyebrow">Branching stories</p>
            <h2>Lessons become choices, not lectures.</h2>
            <p>
              Story choices now cover friendship repair, money decisions,
              confidence, and digital safety so children can rehearse before real
              life gets messy.
            </p>
          </div>

          <div className="story-strip">
            {storyEpisodes.map((story) => (
              <article key={story.id} className="story-card">
                <p>{story.focus}</p>
                <h3>{story.title}</h3>
                <span>{story.ageBand}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="trust-band"
        style={{
          backgroundImage: `linear-gradient(140deg, rgba(10, 13, 18, 0.9), rgba(10, 13, 18, 0.46)), url(${siteImages.family})`,
        }}
      >
        <div className="page-width trust-layout">
          <div className="section-heading on-dark">
            <p className="eyebrow">Family trust by design</p>
            <h2>Parents stay in the loop without turning learning into a chore.</h2>
            <p>
              Sensitive tracks stay parent-unlocked. AI help stays bounded.
              Journals stay private. The product can now be tested locally as a
              fuller family SaaS before any production setup.
            </p>
          </div>

          <div className="trust-grid">
            {trustSignals.map((signal) => (
              <article key={signal.title} className="trust-card">
                <h3>{signal.title}</h3>
                <p>{signal.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function OnboardingFlow({
  canAdvance,
  celebrationStyleId,
  coachStyleId,
  onBack,
  onFinish,
  onNext,
  onSelectCelebrationStyle,
  onSelectCoachStyle,
  onSelectRhythm,
  onToggleGoal,
  previewPlaylists,
  selectedGoalIds,
  selectedGoals,
  step,
  weeklyRhythmId,
}) {
  return (
    <div className="onboarding-shell">
      <div className="page-width onboarding-layout">
        <section className="onboarding-main">
          <div className="section-heading section-heading-tight">
            <p className="eyebrow eyebrow-dark">KidWiz family setup</p>
            <h1>Shape the learning rhythm before the app opens.</h1>
            <p>
              This local setup flow helps us test how KidWiz can adapt to a real
              family instead of dropping everyone into the same generic product.
            </p>
          </div>

          <div className="step-row" aria-label="Setup steps">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`step-pill ${step === item ? "is-active" : ""}`}
              >
                <span>{item + 1}</span>
                <strong>
                  {item === 0
                    ? "Goals"
                    : item === 1
                      ? "Rhythm"
                      : "Preview"}
                </strong>
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div className="choice-grid">
              {familyGoals.map((goal) => (
                <button
                  key={goal.id}
                  className={`choice-tile ${
                    selectedGoalIds.includes(goal.id) ? "is-selected" : ""
                  }`}
                  onClick={() => onToggleGoal(goal.id)}
                  type="button"
                >
                  <div className="choice-tile-icon">
                    <GoalGlyph goalId={goal.id} />
                  </div>
                  <h3>{goal.title}</h3>
                  <p>{goal.copy}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="onboarding-choice-columns">
              <div>
                <h2>Weekly rhythm</h2>
                <div className="stack-list">
                  {weeklyRhythms.map((rhythm) => (
                    <button
                      key={rhythm.id}
                      className={`stack-row ${
                        weeklyRhythmId === rhythm.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectRhythm(rhythm.id)}
                      type="button"
                    >
                      <strong>{rhythm.title}</strong>
                      <span>{rhythm.copy}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2>Coach style</h2>
                <div className="stack-list">
                  {coachStyles.map((style) => (
                    <button
                      key={style.id}
                      className={`stack-row ${
                        coachStyleId === style.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectCoachStyle(style.id)}
                      type="button"
                    >
                      <strong>{style.title}</strong>
                      <span>{style.copy}</span>
                    </button>
                  ))}
                </div>

                <h2 className="section-subhead">What gets celebrated</h2>
                <div className="stack-list">
                  {celebrationStyles.map((style) => (
                    <button
                      key={style.id}
                      className={`stack-row ${
                        celebrationStyleId === style.id ? "is-selected" : ""
                      }`}
                      onClick={() => onSelectCelebrationStyle(style.id)}
                      type="button"
                    >
                      <strong>{style.title}</strong>
                      <span>{style.copy}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="preview-grid">
              {previewPlaylists.map(({ child, lessons }) => (
                <article key={child.id} className="preview-panel">
                  <p>{child.name}</p>
                  <h3>{child.todayTheme}</h3>
                  <span>{child.supportSpot}</span>
                  <div className="preview-lesson-list">
                    {lessons.map((lesson) => {
                      const track = findTrackByLessonId(lesson.id);

                      return (
                        <div key={lesson.id} className="preview-lesson-row">
                          <strong>{lesson.title}</strong>
                          <span>{track?.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="onboarding-actions">
            <button
              className="ghost-button ghost-button-dark"
              disabled={step === 0}
              onClick={onBack}
              type="button"
            >
              Back
            </button>

            {step < 2 ? (
              <button
                className="solid-button"
                disabled={!canAdvance}
                onClick={onNext}
                type="button"
              >
                Continue
              </button>
            ) : (
              <button className="solid-button" onClick={onFinish} type="button">
                Launch KidWiz
              </button>
            )}
          </div>
        </section>

        <aside className="onboarding-side">
          <div className="sidebar-block onboarding-summary">
            <p className="eyebrow eyebrow-dark">Selected priorities</p>
            <div className="summary-chip-row">
              {selectedGoals.map((goal) => (
                <span key={goal.id} className="summary-chip">
                  {goal.title}
                </span>
              ))}
            </div>
            <p>
              Pick at least two goals. KidWiz uses these to build the first weekly
              playlist and coach prompts for each child.
            </p>
          </div>

          <div className="sidebar-block onboarding-summary">
            <p className="eyebrow eyebrow-dark">Safety promises</p>
            <ul className="promise-list">
              {trustSignals.map((signal) => (
                <li key={signal.title}>
                  <strong>{signal.title}</strong>
                  <span>{signal.copy}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OverviewTab({
  childCompletedJourneyIds,
  dailyJourneys,
  earnedBadges,
  nextBadge,
  nextRitual,
  onOpenLesson,
  onToggleJourney,
  overviewPlaylistPreview,
  selectedChild,
  selectedGoals,
  strongestTrack,
  todayLabel,
  trackProgressRows,
  weeklyCompletion,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">{todayLabel}</p>
        <h1>
          {selectedChild.name}&apos;s week is built around real progress, not just
          screen time.
        </h1>
        <p>
          Strongest track: {strongestTrack.title}. Family priorities:{" "}
          {selectedGoals.map((goal) => goal.title).join(", ")}.
        </p>
      </div>

      <div className="overview-hero-grid">
        <article className="hero-surface">
          <div className="hero-surface-head">
            <div>
              <p>{selectedChild.levelTitle}</p>
              <h2>{selectedChild.todayTheme}</h2>
            </div>
            <div className="mission-chip">
              <Star size={16} />
              <span>{selectedChild.streak}-day streak</span>
            </div>
          </div>

          <p className="hero-surface-copy">{selectedChild.heroLine}</p>

          <div className="journey-list">
            {dailyJourneys.map((journey) => {
              const complete = childCompletedJourneyIds.includes(journey.id);

              return (
                <button
                  key={journey.id}
                  className={`journey-row ${complete ? "is-complete" : ""}`}
                  onClick={() => onToggleJourney(journey.id)}
                  type="button"
                >
                  <div>
                    <p>{journey.length}</p>
                    <h3>{journey.title}</h3>
                    <span>{journey.focus}</span>
                  </div>
                  <span className="journey-check">
                    {complete ? <Check size={16} /> : journey.order}
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="hero-surface compact-surface">
          <div className="signal-stack">
            <div className="signal-card">
              <p>Week completion</p>
              <strong>{Math.round(weeklyCompletion)}%</strong>
              <span>Daily learning rhythm completed so far.</span>
            </div>
            <div className="signal-card">
              <p>Next ritual</p>
              <strong>{nextRitual.title}</strong>
              <span>{nextRitual.copy}</span>
            </div>
            <div className="signal-card">
              <p>Next badge</p>
              <strong>{nextBadge ? nextBadge.title : "Badge wall complete"}</strong>
              <span>
                {nextBadge
                  ? nextBadge.copy
                  : "You have unlocked every badge in the current local demo."}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div className="overview-grid">
        <section className="surface-panel">
          <div className="panel-head">
            <Brain size={18} />
            <h2>Weekly playlist</h2>
          </div>
          <div className="list-grid">
            {overviewPlaylistPreview.map((lesson) => {
              const track = findTrackByLessonId(lesson.id);

              return (
                <button
                  key={lesson.id}
                  className="list-row"
                  onClick={() => onOpenLesson(lesson.id)}
                  type="button"
                >
                  <div>
                    <strong>{lesson.title}</strong>
                    <span>{track?.title}</span>
                  </div>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <BadgeCheck size={18} />
            <h2>Track progress</h2>
          </div>
          <div className="progress-list">
            {trackProgressRows.map((track) => (
              <div key={track.id} className="progress-row">
                <div className="progress-row-head">
                  <strong>{track.title}</strong>
                  <span>{track.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${track.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Award size={18} />
            <h2>Badge wall</h2>
          </div>
          <div className="badge-grid">
            {earnedBadges.map((badge) => (
              <article key={badge.id} className="badge-tile">
                <div className="badge-icon">
                  <BadgeGlyph iconKey={badge.iconKey} />
                </div>
                <strong>{badge.title}</strong>
                <span>{badge.copy}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function CoursesTab({
  activeLesson,
  activeLessonAnswer,
  activeTrack,
  answeredCorrectly,
  answeredOption,
  childCompletedLessonIds,
  childPlaylistLessonIds,
  coachResponseMode,
  onAnswer,
  onChangeCoachMode,
  onSelectLesson,
  onSelectTrack,
  onToggleComplete,
  onTogglePlaylist,
  selectedChild,
  trackProgressRows,
  visibleTracks,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Course library</p>
        <h1>Each track now has a real lesson arc, not just a placeholder card.</h1>
        <p>
          Choose a track, move through the lesson sequence, add it to the weekly
          playlist, or mark progress complete for {selectedChild.name}.
        </p>
      </div>

      <div className="track-grid">
        {visibleTracks.map((track) => {
          const Icon = trackIcons[track.category] ?? Sparkles;
          const trackRow = trackProgressRows.find((item) => item.id === track.id);

          return (
            <button
              key={track.id}
              className={`track-tile ${
                activeTrack.id === track.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectTrack(track.id)}
              type="button"
            >
              <div className="track-tile-top">
                <Icon size={18} />
                {track.assigned ? <BadgeCheck size={16} /> : null}
              </div>
              <h3>{track.title}</h3>
              <p>{track.summary}</p>
              <span>{trackRow?.progress ?? 0}% progress</span>
            </button>
          );
        })}
      </div>

      <div className="learning-layout">
        <section className="surface-panel">
          <div className="panel-head">
            <Compass size={18} />
            <h2>{activeTrack.title}</h2>
          </div>

          <p className="panel-copy">{activeTrack.parentPromise}</p>

          <div className="track-detail-grid">
            <div>
              <p>Child promise</p>
              <strong>{activeTrack.childPromise}</strong>
            </div>
            <div>
              <p>Capstone</p>
              <strong>{activeTrack.project}</strong>
            </div>
          </div>

          <div className="lesson-list">
            {activeTrack.lessons.map((lesson, lessonIndex) => {
              const complete = childCompletedLessonIds.includes(lesson.id);
              const queued = childPlaylistLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  className={`lesson-row ${
                    activeLesson.id === lesson.id ? "is-selected" : ""
                  }`}
                  onClick={() => onSelectLesson(lesson.id)}
                  type="button"
                >
                  <div>
                    <p>
                      Lesson {lessonIndex + 1} · {lesson.duration}
                    </p>
                    <h3>{lesson.title}</h3>
                    <span>{lesson.summary}</span>
                  </div>
                  <div className="lesson-status">
                    {queued ? <em>playlist</em> : null}
                    {complete ? <Check size={16} /> : <ChevronRight size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-panel">
          <div className="panel-head">
            <Rocket size={18} />
            <h2>{activeLesson.title}</h2>
          </div>

          <p className="lesson-copy">{activeLesson.summary}</p>

          <div className="detail-pills">
            <span>{activeLesson.activity}</span>
            <span>{activeLesson.parentCue}</span>
          </div>

          <div className="mode-toggle-row">
            {["gentle", "playful", "stretch"].map((mode) => (
              <button
                key={mode}
                className={`mode-toggle ${
                  coachResponseMode === mode ? "is-selected" : ""
                }`}
                onClick={() => onChangeCoachMode(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>

          <p className="coach-callout">{activeLesson.coachModes[coachResponseMode]}</p>

          <div className="action-row">
            <button
              className={`inline-action ${
                childPlaylistLessonIds.includes(activeLesson.id) ? "is-selected" : ""
              }`}
              onClick={() => onTogglePlaylist(activeLesson.id)}
              type="button"
            >
              {childPlaylistLessonIds.includes(activeLesson.id)
                ? "Remove from playlist"
                : "Add to playlist"}
            </button>
            <button
              className={`inline-action ${
                childCompletedLessonIds.includes(activeLesson.id) ? "is-selected" : ""
              }`}
              onClick={() => onToggleComplete(activeLesson.id)}
              type="button"
            >
              {childCompletedLessonIds.includes(activeLesson.id)
                ? "Mark incomplete"
                : "Mark complete"}
            </button>
          </div>

          <div className="quiz-panel">
            <div className="panel-head">
              <Target size={18} />
              <h2>{activeLesson.quiz.question}</h2>
            </div>

            <div className="quiz-options">
              {activeLesson.quiz.options.map((option, optionIndex) => (
                <button
                  key={option}
                  className={`quiz-option ${
                    activeLessonAnswer === optionIndex ? "is-selected" : ""
                  }`}
                  onClick={() => onAnswer(optionIndex)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            {answeredOption ? (
              <p className={`quiz-feedback ${answeredCorrectly ? "is-right" : "is-wrong"}`}>
                {answeredCorrectly
                  ? activeLesson.quiz.success
                  : `${answeredOption} is close, but ${activeLesson.quiz.success.toLowerCase()}`}
              </p>
            ) : (
              <p className="quiz-feedback">
                Pick one answer to test the lesson before moving on.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function StoriesTab({
  activeStory,
  activeStoryChoice,
  childStoryChoices,
  onSelectChoice,
  onSelectStory,
  storyEpisodes,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Story practice</p>
        <h1>Children can rehearse hard moments before they happen in real life.</h1>
        <p>
          Each story now includes richer branches and a parent follow-up cue after
          the choice is made.
        </p>
      </div>

      <div className="story-layout">
        <aside className="story-menu">
          {storyEpisodes.map((story) => (
            <button
              key={story.id}
              className={`story-menu-item ${
                activeStory.id === story.id ? "is-selected" : ""
              }`}
              onClick={() => onSelectStory(story.id)}
              type="button"
            >
              <strong>{story.title}</strong>
              <span>
                {story.focus} · {childStoryChoices[story.id] ? "completed" : "open"}
              </span>
            </button>
          ))}
        </aside>

        <section className="surface-panel story-stage">
          <div className="story-stage-head">
            <div>
              <p>{activeStory.focus}</p>
              <h2>{activeStory.title}</h2>
            </div>
            <span>{activeStory.ageBand}</span>
          </div>

          <p className="story-body">{activeStory.setup}</p>

          <div className="choice-list">
            {activeStory.choices.map((choice) => (
              <button
                key={choice.id}
                className={`choice-row ${
                  activeStoryChoice?.id === choice.id ? "is-selected" : ""
                }`}
                onClick={() => onSelectChoice(choice.id)}
                type="button"
              >
                <strong>{choice.title}</strong>
                <span>{choice.result}</span>
              </button>
            ))}
          </div>

          <div className="reflection-block">
            <p>Reflection prompt</p>
            <strong>{activeStory.reflectionPrompt}</strong>
            <span>
              {activeStoryChoice
                ? activeStoryChoice.parentCue
                : "Choose a path to reveal the family follow-up cue."}
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}

function CoachTab({
  activeLesson,
  activeTrack,
  coachCards,
  coachResponseMode,
  onChangeCoachMode,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Spark Coach studio</p>
        <h1>Bounded AI-style guidance, still safe enough for family review.</h1>
        <p>
          This local version does not call a model yet, but it now behaves like a
          coach layer: it adapts tone, learning prompts, and family follow-ups.
        </p>
      </div>

      <div className="coach-hero">
        <div>
          <p>{selectedCoachStyle.title}</p>
          <h2>
            {selectedChild.name} is currently working through {activeTrack.title}.
          </h2>
          <span>
            Priority goals: {selectedGoals.map((goal) => goal.title).join(", ")}.
          </span>
        </div>
        <div className="mode-toggle-row">
          {["gentle", "playful", "stretch"].map((mode) => (
            <button
              key={mode}
              className={`mode-toggle ${
                coachResponseMode === mode ? "is-selected" : ""
              }`}
              onClick={() => onChangeCoachMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="coach-grid">
        {coachCards.map((card) => (
          <article key={card.title} className="coach-card">
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
          </article>
        ))}
      </div>

      <section className="surface-panel">
        <div className="panel-head">
          <Sparkles size={18} />
          <h2>{activeLesson.title}</h2>
        </div>
        <p className="coach-callout">{activeLesson.coachModes[coachResponseMode]}</p>
      </section>
    </section>
  );
}

function JournalTab({
  childJournalDraft,
  childJournalEntries,
  childJournalMood,
  moodOptions,
  onChildDraftChange,
  onChildMoodChange,
  onParentDraftChange,
  onSaveChildJournal,
  onSaveParentJournal,
  parentJournalDraft,
  parentJournalEntries,
  selectedChild,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Private reflection</p>
        <h1>Two journals, one clearer picture of what helps.</h1>
        <p>
          Children can reflect with a mood cue. Parents can keep notes about what
          is working, what needs support, and what family rituals to try next.
        </p>
      </div>

      <div className="journal-layout">
        <article className="surface-panel">
          <div className="panel-head">
            <NotebookPen size={18} />
            <h2>{selectedChild.name}&apos;s journal</h2>
          </div>

          <form className="journal-form" onSubmit={onSaveChildJournal}>
            <div className="mood-row">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  className={`mood-pill ${
                    childJournalMood === mood ? "is-selected" : ""
                  }`}
                  onClick={() => onChildMoodChange(mood)}
                  type="button"
                >
                  {mood}
                </button>
              ))}
            </div>

            <textarea
              value={childJournalDraft}
              onChange={(event) => onChildDraftChange(event.target.value)}
              placeholder="Today I felt proud when..."
            />
            <button className="solid-button" type="submit">
              Save reflection
            </button>
          </form>

          <div className="entry-list">
            {childJournalEntries.map((entry) => (
              <article key={entry.id} className="entry-row">
                <p>
                  {entry.title} · {entry.dateLabel}
                </p>
                <h3>{entry.mood}</h3>
                <span>{entry.body}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Parent notes</h2>
          </div>

          <form className="journal-form" onSubmit={onSaveParentJournal}>
            <textarea
              value={parentJournalDraft}
              onChange={(event) => onParentDraftChange(event.target.value)}
              placeholder="What support seems to help the most right now?"
            />
            <button className="solid-button" type="submit">
              Save parent note
            </button>
          </form>

          <div className="entry-list">
            {parentJournalEntries.map((entry) => (
              <article key={entry.id} className="entry-row">
                <p>
                  {entry.title} · {entry.dateLabel}
                </p>
                <span>{entry.body}</span>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function FamilyTab({
  appState,
  assignedTrackIds,
  onChangeCelebrationStyle,
  onChangeCoachStyle,
  onChangeRhythm,
  onGenerateFreshWeek,
  onResetDemo,
  onRestartOnboarding,
  onToggleBodyBoundaries,
  onToggleGoal,
  onToggleTrackAssignment,
  selectedCelebrationStyle,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
  selectedRhythm,
  trackProgressRows,
  visibleTracks,
}) {
  return (
    <section className="workspace-band">
      <div className="section-heading section-heading-tight">
        <p className="eyebrow eyebrow-dark">Family controls</p>
        <h1>Parents can now shape the product instead of just observing it.</h1>
        <p>
          This local test build includes goal selection, weekly rhythm, coach
          style, celebration style, track assignment, and a fresh-week generator.
        </p>
      </div>

      <div className="family-grid">
        <article className="surface-panel">
          <div className="panel-head">
            <Users size={18} />
            <h2>Family priorities</h2>
          </div>
          <div className="goal-chip-row">
            {familyGoals.map((goal) => (
              <button
                key={goal.id}
                className={`summary-chip-button ${
                  selectedGoals.some((item) => item.id === goal.id)
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => onToggleGoal(goal.id)}
                type="button"
              >
                {goal.title}
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Compass size={18} />
            <h2>Weekly rhythm</h2>
          </div>
          <div className="stack-list">
            {weeklyRhythms.map((rhythm) => (
              <button
                key={rhythm.id}
                className={`stack-row ${
                  selectedRhythm.id === rhythm.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeRhythm(rhythm.id)}
                type="button"
              >
                <strong>{rhythm.title}</strong>
                <span>{rhythm.copy}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Bot size={18} />
            <h2>Coach and celebration</h2>
          </div>
          <div className="stack-list">
            {coachStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCoachStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCoachStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
          <div className="stack-list stack-list-tight">
            {celebrationStyles.map((style) => (
              <button
                key={style.id}
                className={`stack-row ${
                  selectedCelebrationStyle.id === style.id ? "is-selected" : ""
                }`}
                onClick={() => onChangeCelebrationStyle(style.id)}
                type="button"
              >
                <strong>{style.title}</strong>
                <span>{style.copy}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="family-grid family-grid-secondary">
        <article className="surface-panel">
          <div className="panel-head">
            <ShieldCheck size={18} />
            <h2>Trust center</h2>
          </div>
          <button
            className={`toggle-button ${
              appState.bodyBoundariesUnlocked ? "is-selected" : ""
            }`}
            onClick={onToggleBodyBoundaries}
            type="button"
          >
            <div>
              <span>Sensitive topic track</span>
              <strong>
                {appState.bodyBoundariesUnlocked ? "Unlocked" : "Locked"}
              </strong>
            </div>
            <Lock size={16} />
          </button>
          <div className="trust-list">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="trust-row">
                <strong>{signal.title}</strong>
                <span>{signal.copy}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <Brain size={18} />
            <h2>{selectedChild.name}&apos;s assigned tracks</h2>
          </div>
          <div className="assign-grid">
            {visibleTracks.map((track) => {
              const assigned = assignedTrackIds.includes(track.id);
              const progress = trackProgressRows.find((item) => item.id === track.id);

              return (
                <button
                  key={track.id}
                  className={`assign-tile ${assigned ? "is-selected" : ""}`}
                  onClick={() => onToggleTrackAssignment(track.id)}
                  type="button"
                >
                  <strong>{track.title}</strong>
                  <span>{progress?.progress ?? 0}% progress</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="surface-panel">
          <div className="panel-head">
            <RefreshCw size={18} />
            <h2>Local testing tools</h2>
          </div>
          <div className="tool-list">
            <button className="inline-action" onClick={onGenerateFreshWeek} type="button">
              Generate fresh week
            </button>
            <button className="inline-action" onClick={onRestartOnboarding} type="button">
              Restart onboarding
            </button>
            <button className="inline-action" onClick={onResetDemo} type="button">
              Reset local demo
            </button>
          </div>

          <div className="ritual-list">
            {familyRituals.map((ritual) => (
              <div key={ritual.title} className="ritual-row">
                <strong>{ritual.title}</strong>
                <span>{ritual.copy}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default App;
