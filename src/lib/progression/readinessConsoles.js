import { courseCatalog, storyEpisodes } from "../../data/kidwizData";

export function buildLaunchReadinessConsole() {
  const rows = [
    {
      label: "Auth",
      status: "Parent-led",
      readiness: "Account layer",
      copy: "Parent accounts, child profiles, and roles should stay tied to one family workspace.",
      tone: "warn",
    },
    {
      label: "Database",
      status: "Family memory",
      readiness: "Data layer",
      copy: "Progress, journals, reports, unlocks, and weekly history need a durable family memory layer.",
      tone: "warn",
    },
    {
      label: "AI safety",
      status: "Bounded design",
      readiness: "Safety layer",
      copy: "Spark should stay lesson-scoped with moderation, prompt review, and parent-readable history.",
      tone: "warn",
    },
    {
      label: "Privacy",
      status: "Parent-visible",
      readiness: "Needs policy",
      copy: "Child journals and family notes need export, deletion, retention, consent, and visibility choices.",
      tone: "warn",
    },
    {
      label: "Billing",
      status: "Planned",
      readiness: "Future",
      copy: "Subscription plans, checkout, trials, invoices, and cancellation flows should stay parent-owned.",
      tone: "neutral",
    },
    {
      label: "QA",
      status: "Design checks",
      readiness: "Growing",
      copy: "Design, accessibility, and regression checks should protect the family experience as it grows.",
      tone: "good",
    },
    {
      label: "Analytics",
      status: "Planned",
      readiness: "Future",
      copy: "Learning engagement and parent outcomes should be measured with privacy-safe event tracking.",
      tone: "neutral",
    },
  ];
  const readyCount = rows.filter((row) => row.tone === "good").length;

  return {
    score: Math.round((readyCount / rows.length) * 100),
    title: "Family Readiness Plan",
    copy:
      "A plain-English view of the trust, data, safety, privacy, billing, and quality layers families should be able to count on.",
    rows,
    nextSteps: [
      "Create the family data model for children, courses, journals, progress, unlocks, and safety events.",
      "Add AI safety rails for moderation, age-aware routing, prompt logs, and parent-reviewable coach activity.",
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
    title: "Family Data Map",
    copy:
      "A parent-readable map of the family records KidWiz should protect as learning history grows.",
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
        copy: "Authored lessons across academics and life skills.",
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
      copy: "KidWiz should save prompt summaries, safety decisions, and coach actions for parent review.",
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
      "A reviewable view of how KidWiz can make AI tutoring useful without making it unsupervised: every response has a lesson scope, safety decision, and parent-readable summary.",
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
