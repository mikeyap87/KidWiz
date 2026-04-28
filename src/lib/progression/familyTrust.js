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
          ? "Child reflections and parent notes stay clearly separated."
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
      "A quick parent-facing check of what is protected, what is visible, and what adults can control.",
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
      copy: "Child journal entries should have clear visibility and deletion settings.",
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
      copy: "Archived weekly reports should have a clear retention window and delete path.",
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
      status: "Parent-reviewed",
      copy: "AI tutoring should keep moderation, parent-readable summaries, and retention settings visible.",
      tone: "warn",
    },
    {
      label: "Exports",
      status: `${exportItemCount} family item${exportItemCount === 1 ? "" : "s"}`,
      copy: "Parents should be able to export child data in a readable family archive.",
      tone: exportItemCount > 0 ? "good" : "neutral",
    },
    {
      label: "Deletion",
      status: "Guided",
      copy: "Deletion should be scoped, confirmed, and paired with a short recovery window.",
      tone: "warn",
    },
  ];

  return {
    title: "Parent Consent & Privacy Center",
    copy:
      "A parent-readable privacy view for what KidWiz remembers, which consent decisions matter, and what export or deletion controls families should expect.",
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
