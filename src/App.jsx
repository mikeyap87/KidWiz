import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Compass,
  Heart,
  House,
  Lock,
  NotebookPen,
  PiggyBank,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import {
  appHighlights,
  childProfiles,
  dailyJourneys,
  familyRituals,
  heroStats,
  siteImages,
  starterChildJournalEntries,
  starterParentJournalEntries,
  storyEpisodes,
  trustSignals,
  worldCatalog,
} from "./data/kidwizData";
import {
  isSupabaseConfigured,
  sendMagicLink,
  signOut,
  supabase,
} from "./lib/supabaseClient";
import "./App.css";

const STORAGE_KEY = "kidwiz-demo-state-v1";

const tabItems = [
  { id: "overview", label: "Home", icon: House },
  { id: "learn", label: "Learn", icon: Brain },
  { id: "stories", label: "Stories", icon: BookOpen },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Family Hub", icon: Users },
];

const worldIcons = {
  academics: Brain,
  literacy: BookOpen,
  confidence: Heart,
  money: Wallet,
  relationships: Users,
  body: ShieldCheck,
};

function loadSavedState() {
  if (typeof window === "undefined") {
    return {
      session: null,
      selectedChildId: childProfiles[0].id,
      activeTab: "overview",
      selectedWorldId: worldCatalog[0].id,
      selectedStoryId: storyEpisodes[0].id,
      completedJourneyIds: [],
      quizAnswers: {},
      storyChoices: {},
      childJournalEntries: starterChildJournalEntries,
      parentJournalEntries: starterParentJournalEntries,
      bodyBoundariesUnlocked: false,
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      session: null,
      selectedChildId: childProfiles[0].id,
      activeTab: "overview",
      selectedWorldId: worldCatalog[0].id,
      selectedStoryId: storyEpisodes[0].id,
      completedJourneyIds: [],
      quizAnswers: {},
      storyChoices: {},
      childJournalEntries: starterChildJournalEntries,
      parentJournalEntries: starterParentJournalEntries,
      bodyBoundariesUnlocked: false,
    };
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      session: parsed.session ?? null,
      selectedChildId: parsed.selectedChildId ?? childProfiles[0].id,
      activeTab: parsed.activeTab ?? "overview",
      selectedWorldId: parsed.selectedWorldId ?? worldCatalog[0].id,
      selectedStoryId: parsed.selectedStoryId ?? storyEpisodes[0].id,
      completedJourneyIds: parsed.completedJourneyIds ?? [],
      quizAnswers: parsed.quizAnswers ?? {},
      storyChoices: parsed.storyChoices ?? {},
      childJournalEntries:
        parsed.childJournalEntries ?? starterChildJournalEntries,
      parentJournalEntries:
        parsed.parentJournalEntries ?? starterParentJournalEntries,
      bodyBoundariesUnlocked: parsed.bodyBoundariesUnlocked ?? false,
    };
  } catch {
    return {
      session: null,
      selectedChildId: childProfiles[0].id,
      activeTab: "overview",
      selectedWorldId: worldCatalog[0].id,
      selectedStoryId: storyEpisodes[0].id,
      completedJourneyIds: [],
      quizAnswers: {},
      storyChoices: {},
      childJournalEntries: starterChildJournalEntries,
      parentJournalEntries: starterParentJournalEntries,
      bodyBoundariesUnlocked: false,
    };
  }
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function App() {
  const savedState = useMemo(() => loadSavedState(), []);
  const [session, setSession] = useState(savedState.session);
  const [selectedChildId, setSelectedChildId] = useState(
    savedState.selectedChildId,
  );
  const [activeTab, setActiveTab] = useState(savedState.activeTab);
  const [selectedWorldId, setSelectedWorldId] = useState(
    savedState.selectedWorldId,
  );
  const [selectedStoryId, setSelectedStoryId] = useState(
    savedState.selectedStoryId,
  );
  const [completedJourneyIds, setCompletedJourneyIds] = useState(
    savedState.completedJourneyIds,
  );
  const [quizAnswers, setQuizAnswers] = useState(savedState.quizAnswers);
  const [storyChoices, setStoryChoices] = useState(savedState.storyChoices);
  const [childJournalEntries, setChildJournalEntries] = useState(
    savedState.childJournalEntries,
  );
  const [parentJournalEntries, setParentJournalEntries] = useState(
    savedState.parentJournalEntries,
  );
  const [bodyBoundariesUnlocked, setBodyBoundariesUnlocked] = useState(
    savedState.bodyBoundariesUnlocked,
  );
  const [authEmail, setAuthEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [childJournalDraft, setChildJournalDraft] = useState("");
  const [parentJournalDraft, setParentJournalDraft] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        session,
        selectedChildId,
        activeTab,
        selectedWorldId,
        selectedStoryId,
        completedJourneyIds,
        quizAnswers,
        storyChoices,
        childJournalEntries,
        parentJournalEntries,
        bodyBoundariesUnlocked,
      }),
    );
  }, [
    activeTab,
    bodyBoundariesUnlocked,
    childJournalEntries,
    completedJourneyIds,
    parentJournalEntries,
    quizAnswers,
    selectedChildId,
    selectedStoryId,
    selectedWorldId,
    session,
    storyChoices,
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      const currentEmail = data.session?.user?.email;
      if (currentEmail) {
        setSession({
          type: "supabase",
          role: "parent",
          email: currentEmail,
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextEmail = nextSession?.user?.email;

      if (nextEmail) {
        setSession({
          type: "supabase",
          role: "parent",
          email: nextEmail,
        });
        setAuthMessage("Signed in. Welcome back to KidWiz.");
        return;
      }

      setSession((currentSession) =>
        currentSession?.type === "supabase" ? null : currentSession,
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  const selectedChild =
    childProfiles.find(({ id }) => id === selectedChildId) ?? childProfiles[0];

  const availableWorlds = bodyBoundariesUnlocked
    ? worldCatalog
    : worldCatalog.filter((world) => !world.sensitive);

  const activeWorld =
    availableWorlds.find(({ id }) => id === selectedWorldId) ??
    availableWorlds[0];
  const activeStory =
    storyEpisodes.find(({ id }) => id === selectedStoryId) ?? storyEpisodes[0];
  const activeStoryChoiceId = storyChoices[selectedStoryId];
  const activeStoryChoice = activeStory.choices.find(
    ({ id }) => id === activeStoryChoiceId,
  );
  const activeWorldAnswer = quizAnswers[activeWorld.id];
  const answeredOption = activeWorld.quiz.options[activeWorldAnswer];
  const answeredCorrectly = activeWorldAnswer === activeWorld.quiz.correctIndex;
  const completedJourneyCount = completedJourneyIds.length;
  const todayLabel = formatTodayLabel();
  const strongestSkill = [...Object.entries(selectedChild.trackScores)].sort(
    (left, right) => right[1] - left[1],
  )[0];
  const strongestWorld = worldCatalog.find(
    ({ id }) => id === strongestSkill?.[0],
  );
  const latestJournalMood = childJournalEntries[0]?.mood ?? "steady";
  const coachInsight = `${selectedChild.name} is most energized by ${activeWorld.title.toLowerCase()} right now. Spark Coach would keep today's momentum by mixing ${selectedChild.coachLens.toLowerCase()} with one short win before dinner.`;

  async function handleMagicLinkSubmit(event) {
    event.preventDefault();

    if (!authEmail.trim()) {
      setAuthMessage("Add a parent email first.");
      return;
    }

    if (!isSupabaseConfigured) {
      setSession({
        type: "demo",
        role: "parent",
        email: authEmail.trim().toLowerCase(),
      });
      setAuthMessage(
        "Supabase is not connected yet, so KidWiz opened in demo mode.",
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
    setSession({
      type: "demo",
      role: "parent",
      email:
        mode === "family"
          ? "hello@family.kidwiz.demo"
          : "preview@kidwiz.demo",
    });
    setActiveTab("overview");
    setAuthMessage(
      mode === "family"
        ? "Family demo is open. Explore the full KidWiz experience."
        : "Parent preview is open. You can switch between kids inside the app.",
    );
  }

  async function handleLogout() {
    if (session?.type === "supabase") {
      await signOut();
    }

    setSession(null);
  }

  function toggleJourney(id) {
    setCompletedJourneyIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id],
    );
  }

  function submitChildJournal(event) {
    event.preventDefault();

    if (!childJournalDraft.trim()) return;

    setChildJournalEntries((currentEntries) => [
      {
        id: `child-${Date.now()}`,
        title: "Fresh reflection",
        mood: latestJournalMood,
        dateLabel: "Just now",
        body: childJournalDraft.trim(),
      },
      ...currentEntries,
    ]);
    setChildJournalDraft("");
  }

  function submitParentJournal(event) {
    event.preventDefault();

    if (!parentJournalDraft.trim()) return;

    setParentJournalEntries((currentEntries) => [
      {
        id: `parent-${Date.now()}`,
        title: "Parent note",
        dateLabel: "Just now",
        body: parentJournalDraft.trim(),
      },
      ...currentEntries,
    ]);
    setParentJournalDraft("");
  }

  return (
    <div className="page-shell">
      {!session ? (
        <PublicSite
          authBusy={authBusy}
          authEmail={authEmail}
          authMessage={authMessage}
          onAuthEmailChange={setAuthEmail}
          onDemoStart={handleDemoStart}
          onMagicLinkSubmit={handleMagicLinkSubmit}
        />
      ) : (
        <AppExperience
          activeStory={activeStory}
          activeStoryChoice={activeStoryChoice}
          activeTab={activeTab}
          activeWorld={activeWorld}
          answeredCorrectly={answeredCorrectly}
          answeredOption={answeredOption}
          bodyBoundariesUnlocked={bodyBoundariesUnlocked}
          childJournalDraft={childJournalDraft}
          childJournalEntries={childJournalEntries}
          completedJourneyCount={completedJourneyCount}
          completedJourneyIds={completedJourneyIds}
          latestJournalMood={latestJournalMood}
          onChangeTab={setActiveTab}
          onChildDraftChange={setChildJournalDraft}
          onJournalSubmit={submitChildJournal}
          onLogout={handleLogout}
          onParentDraftChange={setParentJournalDraft}
          onParentJournalSubmit={submitParentJournal}
          onSelectChild={setSelectedChildId}
          onSelectStory={setSelectedStoryId}
          onSelectStoryChoice={(choiceId) =>
            setStoryChoices((current) => ({
              ...current,
              [selectedStoryId]: choiceId,
            }))
          }
          onSelectWorld={setSelectedWorldId}
          onToggleBodyBoundaries={() =>
            setBodyBoundariesUnlocked((current) => !current)
          }
          onToggleJourney={toggleJourney}
          onUpdateQuizAnswer={(nextAnswer) =>
            setQuizAnswers((current) => ({
              ...current,
              [activeWorld.id]: nextAnswer,
            }))
          }
          parentJournalDraft={parentJournalDraft}
          parentJournalEntries={parentJournalEntries}
          quizAnswerIndex={activeWorldAnswer}
          selectedChild={selectedChild}
          selectedChildId={selectedChildId}
          selectedStoryId={selectedStoryId}
          session={session}
          strongestWorld={strongestWorld}
          todayLabel={todayLabel}
          coachInsight={coachInsight}
        />
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
            <button className="ghost-button" onClick={() => onDemoStart("preview")}>
              Parent preview
            </button>
            <button className="solid-button" onClick={() => onDemoStart("family")}>
              Try family demo
            </button>
          </div>
        </div>

        <div className="hero-content page-width">
          <p className="eyebrow">A children&apos;s learning universe for real life</p>
          <h1>
            School skills, life skills, and family wisdom in one calm, powerful
            product.
          </h1>
          <p className="hero-copy">
            KidWiz blends playful lessons, branching stories, private journals,
            parent guidance, and a bounded AI coach so children can grow in math,
            reading, money, confidence, friendships, and family communication.
          </p>

          <div className="hero-actions">
            <button className="solid-button" onClick={() => onDemoStart("family")}>
              Enter the app
              <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => onDemoStart("preview")}>
              Explore parent flow
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
                "KidWiz can use Supabase magic-link sign-in. Until that is connected, demo mode stays fully available."}
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
          <p className="eyebrow eyebrow-dark">Why families would stay</p>
          <h2>KidWiz teaches what school often misses.</h2>
          <p>
            Traditional topics still matter. KidWiz just wraps them in confidence,
            relationships, habits, money, and reflection so learning actually
            sticks at home.
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
              Every story episode helps a child practice tricky moments like
              borrowing money, calming a friendship wobble, or speaking up with
              confidence in front of a class.
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
            <h2>Parents stay in the loop without turning learning into homework.</h2>
            <p>
              Sensitive topics stay parent-unlocked. Journals stay private. AI stays
              bounded and explainable. The product is built to feel safe, modern,
              and worth opening every day.
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

function AppExperience({
  activeStory,
  activeStoryChoice,
  activeTab,
  activeWorld,
  answeredCorrectly,
  answeredOption,
  bodyBoundariesUnlocked,
  childJournalDraft,
  childJournalEntries,
  completedJourneyCount,
  completedJourneyIds,
  coachInsight,
  latestJournalMood,
  onChangeTab,
  onChildDraftChange,
  onJournalSubmit,
  onLogout,
  onParentDraftChange,
  onParentJournalSubmit,
  onSelectChild,
  onSelectStory,
  onSelectStoryChoice,
  onSelectWorld,
  onToggleBodyBoundaries,
  onToggleJourney,
  onUpdateQuizAnswer,
  parentJournalDraft,
  parentJournalEntries,
  quizAnswerIndex,
  selectedChild,
  selectedChildId,
  selectedStoryId,
  session,
  strongestWorld,
  todayLabel,
}) {
  const currentTab = tabItems.find(({ id }) => id === activeTab) ?? tabItems[0];
  const CurrentTabIcon = currentTab.icon;

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="page-width app-topbar-inner">
          <div className="brand-lockup brand-lockup-dark">
            <div className="brand-badge">KW</div>
            <div>
              <p className="brand-name">KidWiz</p>
              <p className="brand-subtitle">
                {session.email} · {session.type === "supabase" ? "live auth" : "demo mode"}
              </p>
            </div>
          </div>

          <div className="app-topbar-actions">
            <div className="mode-pill">
              <CurrentTabIcon size={16} />
              <span>{currentTab.label}</span>
            </div>
            <button className="ghost-button ghost-button-dark" onClick={onLogout}>
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
                  className={`profile-chip ${child.id === selectedChildId ? "is-selected" : ""}`}
                  onClick={() => onSelectChild(child.id)}
                  type="button"
                >
                  <strong>{child.name}</strong>
                  <span>
                    Age {child.age} · Grade {child.grade}
                  </span>
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
                  className={`tab-button ${item.id === activeTab ? "is-active" : ""}`}
                  onClick={() => onChangeTab(item.id)}
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
            <p>{coachInsight}</p>
          </div>
        </aside>

        <main className="app-main">
          {activeTab === "overview" ? (
            <section className="workspace-band">
              <div className="section-heading section-heading-tight">
                <p className="eyebrow eyebrow-dark">{todayLabel}</p>
                <h1>{selectedChild.name}&apos;s daily KidWiz rhythm</h1>
                <p>
                  Strongest track: {strongestWorld?.title}. Current mood:{" "}
                  {latestJournalMood}. Completed today: {completedJourneyCount} of{" "}
                  {dailyJourneys.length}.
                </p>
              </div>

              <div className="mission-grid">
                <article className="mission-stage">
                  <div className="mission-header">
                    <div>
                      <p>Today&apos;s theme</p>
                      <h2>{selectedChild.todayTheme}</h2>
                    </div>
                    <div className="mission-chip">
                      <Star size={16} />
                      <span>{selectedChild.streak}-day streak</span>
                    </div>
                  </div>

                  <p className="mission-copy">{selectedChild.heroLine}</p>

                  <div className="mission-points">
                    {dailyJourneys.map((journey) => {
                      const done = completedJourneyIds.includes(journey.id);

                      return (
                        <button
                          key={journey.id}
                          className={`journey-row ${done ? "is-complete" : ""}`}
                          onClick={() => onToggleJourney(journey.id)}
                          type="button"
                        >
                          <div>
                            <p>{journey.length}</p>
                            <h3>{journey.title}</h3>
                            <span>{journey.focus}</span>
                          </div>
                          <span className="journey-check">
                            {done ? <Check size={16} /> : journey.order}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="signal-column">
                  <div className="signal-card">
                    <div className="signal-head">
                      <Heart size={18} />
                      <h3>Confidence pulse</h3>
                    </div>
                    <strong>{selectedChild.trackScores["brave-heart"]}%</strong>
                    <p>
                      {selectedChild.name} is practicing brave starts, calm resets,
                      and clear self-talk.
                    </p>
                  </div>

                  <div className="signal-card">
                    <div className="signal-head">
                      <PiggyBank size={18} />
                      <h3>Money sense</h3>
                    </div>
                    <strong>{selectedChild.trackScores["money-moves"]}%</strong>
                    <p>
                      Savings choices are sticking best when they show up inside a
                      story or a family mission.
                    </p>
                  </div>

                  <div className="signal-card">
                    <div className="signal-head">
                      <Rocket size={18} />
                      <h3>Parent next move</h3>
                    </div>
                    <p>
                      Ask one curious question at dinner: &quot;What was a choice you
                      felt proud of today?&quot;
                    </p>
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {activeTab === "learn" ? (
            <section className="workspace-band">
              <div className="section-heading section-heading-tight">
                <p className="eyebrow eyebrow-dark">Learning worlds</p>
                <h1>Traditional topics plus real life practice</h1>
                <p>
                  Each world carries a lesson, a tiny challenge, a quiz, and one
                  parent conversation prompt.
                </p>
              </div>

              <div className="world-grid">
                {worldCatalog.map((world) => {
                  const Icon = worldIcons[world.category];
                  const locked = world.sensitive && !bodyBoundariesUnlocked;

                  return (
                    <button
                      key={world.id}
                      className={`world-tile ${activeWorld.id === world.id ? "is-selected" : ""} ${locked ? "is-locked" : ""}`}
                      onClick={() => !locked && onSelectWorld(world.id)}
                      type="button"
                    >
                      <div className="world-tile-top">
                        <Icon size={18} />
                        {locked ? <Lock size={16} /> : <BadgeCheck size={16} />}
                      </div>
                      <h3>{world.title}</h3>
                      <p>{world.summary}</p>
                      <span>{locked ? "Parent unlock required" : world.ageBand}</span>
                    </button>
                  );
                })}
              </div>

              <div className="learning-stage">
                <article className="lesson-column">
                  <p className="eyebrow eyebrow-dark">{activeWorld.category}</p>
                  <h2>{activeWorld.title}</h2>
                  <p className="lesson-copy">{activeWorld.lesson.summary}</p>

                  <div className="lesson-breakout">
                    <div>
                      <p>Today&apos;s lesson</p>
                      <strong>{activeWorld.lesson.title}</strong>
                    </div>
                    <div>
                      <p>Family cue</p>
                      <strong>{activeWorld.lesson.parentCue}</strong>
                    </div>
                  </div>

                  <div className="lesson-chips">
                    <span>{activeWorld.lesson.challenge}</span>
                    <span>{activeWorld.lesson.aiAssist}</span>
                  </div>
                </article>

                <article className="quiz-column">
                  <div className="quiz-head">
                    <Compass size={18} />
                    <h3>{activeWorld.quiz.question}</h3>
                  </div>

                  <div className="quiz-options">
                    {activeWorld.quiz.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        className={`quiz-option ${quizAnswerIndex === optionIndex ? "is-selected" : ""}`}
                        onClick={() => onUpdateQuizAnswer(optionIndex)}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {answeredOption ? (
                    <p className={`quiz-feedback ${answeredCorrectly ? "is-right" : "is-wrong"}`}>
                      {answeredCorrectly
                        ? activeWorld.quiz.success
                        : `${answeredOption} is close, but ${activeWorld.quiz.success.toLowerCase()}`}
                    </p>
                  ) : (
                    <p className="quiz-feedback">
                      Pick one answer to see the hint ladder.
                    </p>
                  )}
                </article>
              </div>
            </section>
          ) : null}

          {activeTab === "stories" ? (
            <section className="workspace-band">
              <div className="section-heading section-heading-tight">
                <p className="eyebrow eyebrow-dark">Story worlds</p>
                <h1>Practice tricky moments inside safe stories</h1>
                <p>
                  The child chooses what happens next, then KidWiz turns that choice
                  into reflection and coaching.
                </p>
              </div>

              <div className="story-workspace">
                <aside className="story-menu">
                  {storyEpisodes.map((story) => (
                    <button
                      key={story.id}
                      className={`story-menu-item ${selectedStoryId === story.id ? "is-selected" : ""}`}
                      onClick={() => onSelectStory(story.id)}
                      type="button"
                    >
                      <strong>{story.title}</strong>
                      <span>{story.focus}</span>
                    </button>
                  ))}
                </aside>

                <article className="story-stage-large">
                  <div className="story-stage-head">
                    <div>
                      <p>{activeStory.focus}</p>
                      <h2>{activeStory.title}</h2>
                    </div>
                    <span>{activeStory.ageBand}</span>
                  </div>

                  <p className="story-body">{activeStory.setup}</p>

                  <div className="story-choice-list">
                    {activeStory.choices.map((choice) => (
                      <button
                        key={choice.id}
                        className={`story-choice ${activeStoryChoice?.id === choice.id ? "is-selected" : ""}`}
                        onClick={() => onSelectStoryChoice(choice.id)}
                        type="button"
                      >
                        <strong>{choice.title}</strong>
                        <span>{choice.result}</span>
                      </button>
                    ))}
                  </div>

                  <div className="story-reflection">
                    <p>Reflection prompt</p>
                    <strong>{activeStory.reflectionPrompt}</strong>
                    <span>
                      {activeStoryChoice
                        ? activeStoryChoice.parentCue
                        : "Choose a path to generate the family debrief cue."}
                    </span>
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {activeTab === "journal" ? (
            <section className="workspace-band">
              <div className="section-heading section-heading-tight">
                <p className="eyebrow eyebrow-dark">Private reflection</p>
                <h1>Two journals, one shared sense of progress</h1>
                <p>
                  Kids get a calm place to name their feelings. Parents get a quiet
                  space to notice patterns and plan better support.
                </p>
              </div>

              <div className="journal-layout">
                <article className="journal-column">
                  <div className="journal-head">
                    <NotebookPen size={18} />
                    <h2>{selectedChild.name}&apos;s journal</h2>
                  </div>

                  <form className="journal-form" onSubmit={onJournalSubmit}>
                    <textarea
                      value={childJournalDraft}
                      onChange={(event) => onChildDraftChange(event.target.value)}
                      placeholder="Today I felt proud when..."
                    />
                    <button className="solid-button" type="submit">
                      Save reflection
                    </button>
                  </form>

                  <div className="journal-feed">
                    {childJournalEntries.map((entry) => (
                      <article key={entry.id} className="entry-row">
                        <div>
                          <p>
                            {entry.title} · {entry.dateLabel}
                          </p>
                          <h3>{entry.mood}</h3>
                          <span>{entry.body}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="journal-column">
                  <div className="journal-head">
                    <Users size={18} />
                    <h2>Parent notes</h2>
                  </div>

                  <form className="journal-form" onSubmit={onParentJournalSubmit}>
                    <textarea
                      value={parentJournalDraft}
                      onChange={(event) => onParentDraftChange(event.target.value)}
                      placeholder="What support seems to help the most right now?"
                    />
                    <button className="solid-button" type="submit">
                      Save parent note
                    </button>
                  </form>

                  <div className="journal-feed">
                    {parentJournalEntries.map((entry) => (
                      <article key={entry.id} className="entry-row">
                        <div>
                          <p>
                            {entry.title} · {entry.dateLabel}
                          </p>
                          <span>{entry.body}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          ) : null}

          {activeTab === "family" ? (
            <section className="workspace-band">
              <div className="section-heading section-heading-tight">
                <p className="eyebrow eyebrow-dark">Family hub</p>
                <h1>Parents get visibility, unlocks, and next steps</h1>
                <p>
                  KidWiz is designed for parent-led onboarding, low-pressure review,
                  and transparent boundaries around sensitive content.
                </p>
              </div>

              <div className="family-grid">
                <article className="family-panel">
                  <div className="panel-head">
                    <ShieldCheck size={18} />
                    <h2>Trust center</h2>
                  </div>

                  <div className="trust-list">
                    {trustSignals.map((signal) => (
                      <div key={signal.title} className="trust-row">
                        <strong>{signal.title}</strong>
                        <span>{signal.copy}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="family-panel">
                  <div className="panel-head">
                    <Lock size={18} />
                    <h2>Sensitive topic access</h2>
                  </div>

                  <p className="panel-copy">
                    Body, boundaries, and puberty content stays behind a parent
                    control until you choose otherwise.
                  </p>

                  <button
                    className={`toggle-button ${bodyBoundariesUnlocked ? "is-on" : ""}`}
                    onClick={onToggleBodyBoundaries}
                    type="button"
                  >
                    <span>{bodyBoundariesUnlocked ? "Unlocked" : "Locked"}</span>
                    <strong>{bodyBoundariesUnlocked ? "Hide track" : "Unlock track"}</strong>
                  </button>
                </article>

                <article className="family-panel">
                  <div className="panel-head">
                    <Sparkles size={18} />
                    <h2>Family rituals</h2>
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
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
