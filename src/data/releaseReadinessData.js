export const productionReadinessMilestones = [
  {
    id: "accounts",
    label: "Accounts and family data",
    status: "Needs production wiring",
    copy:
      "Move parent accounts, child profiles, progress, journals, weekly history, and safety events out of browser-only demo state.",
    tone: "warn",
  },
  {
    id: "ai-safety",
    label: "AI safety evidence",
    status: "Local review active",
    copy:
      "Keep moderation, blocked-prompt handling, parent summaries, no-key fallback, and tutor history visible before public child use.",
    tone: "warn",
  },
  {
    id: "privacy",
    label: "Privacy and consent",
    status: "Draft policy active",
    copy:
      "KidWiz now has a parent-readable draft for consent, export, deletion, retention, sensitive-topic unlocks, and AI tutoring review.",
    tone: "warn",
  },
  {
    id: "qa",
    label: "Release QA",
    status: "Repeat every build",
    copy:
      "Run lint, build, desktop/mobile browser checks, AI configured/no-key checks, blocked prompt checks, and console-error scans.",
    tone: "good",
  },
];

export const parentLaunchProofSteps = [
  "Parent can open the demo and understand the next action in under one minute.",
  "Child can resume a lesson, complete one check, and save one reflection without help.",
  "Parent can see AI status, privacy controls, sensitive-topic status, and review summaries.",
  "The app still works when live AI is not configured.",
];

export const launchGateChecks = [
  {
    id: "demo-ready",
    label: "Demo review",
    status: "Ready to show",
    copy: "Use this build to review the parent and child flow on a laptop or iPad.",
    tone: "good",
    actionLabel: "Open Today",
    action: "dashboard",
  },
  {
    id: "family-data",
    label: "Family accounts",
    status: "Not live yet",
    copy: "Real profiles, journals, progress, and safety events still need production storage.",
    tone: "warn",
    actionLabel: "View Parent",
    action: "family",
  },
  {
    id: "ai-proof",
    label: "AI review",
    status: "Needs evidence",
    copy: "Live tutor answers, blocked prompts, and parent summaries need repeated review before public child use.",
    tone: "warn",
    actionLabel: "Open Tutor",
    action: "coach",
  },
  {
    id: "parent-consent",
    label: "Parent consent",
    status: "Draft active",
    copy: "Parent consent, export, deletion, and retention rules are now drafted for review before real families join.",
    tone: "neutral",
    actionLabel: "Check controls",
    action: "family",
  },
];

export const parentPrivacyPromise = [
  {
    label: "Parent consent first",
    status: "Required",
    copy:
      "A parent should approve child profiles, AI tutoring, and any sensitive-topic unlock before real child use.",
  },
  {
    label: "Readable family export",
    status: "Available",
    copy:
      "Parents can download a readable family archive for progress, journals, story choices, tutor memory, and safety events.",
  },
  {
    label: "Confirmed deletion",
    status: "Scoped",
    copy:
      "Cloud deletion requires parent confirmation and removes the signed-in workspace plus AI safety event rows.",
  },
  {
    label: "Short retention by default",
    status: "Draft",
    copy:
      "Keep ordinary learning records while the account is active; delete or anonymize dormant child data after a clear parent notice window.",
  },
];

export const retentionPolicyDraft = [
  {
    label: "Learning progress",
    window: "Until parent deletes account",
    copy: "Lessons, badges, playlists, and weekly snapshots stay available so families can track growth.",
  },
  {
    label: "Child journals",
    window: "Parent-controlled",
    copy: "Reflections should be exportable and deletable by child, category, or full family account.",
  },
  {
    label: "Tutor prompts",
    window: "Short review window",
    copy: "Live AI prompts should be kept only long enough for parent review, safety QA, and abuse prevention.",
  },
  {
    label: "Safety events",
    window: "Separate audit log",
    copy: "Blocked or sensitive events should stay separate from ordinary learning records and remain parent-visible.",
  },
];

export const privacyDecisionChecklist = [
  {
    label: "Consent record",
    copy: "Log which parent approved AI tutoring, sensitive-topic unlocks, and child profile setup.",
  },
  {
    label: "Export path",
    copy: "Let parents download readable family data by child, category, and safety-review area.",
  },
  {
    label: "Deletion path",
    copy: "Support confirmed cloud deletion now, then scoped deletion for one child or one journal category later.",
  },
  {
    label: "Retention window",
    copy: "Use short AI review windows and parent-controlled journal/account retention before public launch.",
  },
];
