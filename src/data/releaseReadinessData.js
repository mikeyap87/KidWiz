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
    status: "Policy decisions needed",
    copy:
      "Define export, deletion, retention, parent visibility, sensitive-topic unlocks, and AI tutoring consent before real families join.",
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
    status: "Policy needed",
    copy: "KidWiz needs clear consent, export, deletion, and retention rules before real families join.",
    tone: "neutral",
    actionLabel: "Check controls",
    action: "family",
  },
];

export const privacyDecisionChecklist = [
  {
    label: "Consent record",
    copy: "Log who approved AI tutoring, sensitive-topic unlocks, and child profile setup.",
  },
  {
    label: "Export path",
    copy: "Let parents download readable family data by child and by category.",
  },
  {
    label: "Deletion path",
    copy: "Support scoped deletion for one journal area, one child, or the whole family account.",
  },
  {
    label: "Retention window",
    copy: "Choose how long tutor prompts, safety events, weekly snapshots, and journals are kept.",
  },
];
