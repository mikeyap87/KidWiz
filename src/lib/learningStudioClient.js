export const MAX_LEARNING_STUDIO_ITEMS = 20;

function createEmptyPromptResult() {
  return {
    promptStatus: "empty",
    childAnswer: "Type one question or learning request first.",
    parentSummary: "No prompt was sent to the Learning Studio.",
    safetyDecision: {
      status: "not_checked",
      source: "browser",
      reason: "Empty prompt.",
    },
    suggestedNextAction: "Add a short lesson-specific prompt.",
  };
}

function createOfflineResult() {
  return {
    promptStatus: "server_offline",
    childAnswer:
      "The live Learning Studio is not connected yet. Ask a parent to open the Learning Studio connection.",
    parentSummary:
      "The KidWiz Learning Studio helper is not responding right now.",
    safetyDecision: {
      status: "not_checked",
      source: "browser",
      reason: "Learning Studio is offline or unreachable.",
    },
    suggestedNextAction: "Start the Learning Studio helper before live AI review.",
  };
}

function createServerErrorResult(result) {
  return {
    promptStatus: result.promptStatus ?? "server_error",
    childAnswer:
      result.childAnswer ?? "KidWiz could not run the live tutor response yet.",
    parentSummary:
      result.parentSummary ??
      result.error ??
      "The Learning Studio connection returned an error.",
    safetyDecision: result.safetyDecision ?? {
      status: "not_checked",
      source: "server",
      reason: result.error ?? "Server error.",
    },
    suggestedNextAction:
      result.suggestedNextAction ??
      "Check the Learning Studio connection, then try again.",
  };
}

export function buildLearningStudioPayload({
  activeLesson,
  activeTrack,
  mode,
  prompt,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  return {
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
    selectedGoals: selectedGoals.map((goal) => ({
      id: goal.id,
      title: goal.title,
    })),
    activeTrack: {
      id: activeTrack.id,
      title: activeTrack.title,
      ageBand: activeTrack.ageBand,
      sensitive: Boolean(activeTrack.sensitive),
    },
    activeLesson: {
      id: activeLesson.id,
      title: activeLesson.title,
      summary: activeLesson.summary,
      parentCue: activeLesson.parentCue,
    },
  };
}

export function createLearningStudioArtifacts({
  activeLesson,
  activeTrack,
  mode,
  prompt,
  result,
  timestamp,
}) {
  const turn = {
    id: `studio-turn-${timestamp}`,
    mode,
    prompt,
    promptStatus: result.promptStatus,
    childAnswer: result.childAnswer,
    parentSummary: result.parentSummary,
    suggestedNextAction: result.suggestedNextAction,
    safetyDecision: result.safetyDecision,
    model: result.model,
    lessonId: activeLesson.id,
    lessonTitle: activeLesson.title,
    trackTitle: activeTrack.title,
    dateLabel: "Just now",
  };

  const notebookCard = result.notebookCard
    ? {
        id: `studio-note-${timestamp}`,
        title: result.notebookCard.title ?? activeLesson.title,
        body: result.notebookCard.body ?? result.childAnswer,
        tags: result.notebookCard.tags ?? [activeTrack.title],
        lessonTitle: activeLesson.title,
        dateLabel: "Just now",
      }
    : null;

  const questionBankItem = result.questionBankItem
    ? {
        id: `studio-question-${timestamp}`,
        question:
          result.questionBankItem.question ??
          `What is one useful move from ${activeLesson.title}?`,
        answer: result.questionBankItem.answer ?? result.childAnswer,
        lessonTitle: activeLesson.title,
        mode,
        dateLabel: "Just now",
      }
    : null;

  const safetyEvent =
    result.safetyDecision?.status && result.safetyDecision.status !== "allowed"
      ? {
          id: `studio-safety-${timestamp}`,
          status: result.safetyDecision.status,
          source: result.safetyDecision.source,
          reason: result.safetyDecision.reason,
          prompt,
          lessonTitle: activeLesson.title,
          dateLabel: "Just now",
        }
      : null;

  return {
    turn,
    notebookCard,
    questionBankItem,
    safetyEvent,
  };
}

export function addLearningStudioSubmissionToState(current, submission) {
  return {
    ...current,
    turns: [submission.turn, ...(current.turns ?? [])].slice(
      0,
      MAX_LEARNING_STUDIO_ITEMS,
    ),
    notebookCards: submission.notebookCard
      ? [submission.notebookCard, ...(current.notebookCards ?? [])].slice(
          0,
          MAX_LEARNING_STUDIO_ITEMS,
        )
      : (current.notebookCards ?? []),
    questionBankItems: submission.questionBankItem
      ? [
          submission.questionBankItem,
          ...(current.questionBankItems ?? []),
        ].slice(0, MAX_LEARNING_STUDIO_ITEMS)
      : (current.questionBankItems ?? []),
    safetyEvents: submission.safetyEvent
      ? [submission.safetyEvent, ...(current.safetyEvents ?? [])].slice(
          0,
          MAX_LEARNING_STUDIO_ITEMS,
        )
      : (current.safetyEvents ?? []),
  };
}

export async function submitLearningStudioPrompt({
  activeLesson,
  activeTrack,
  apiUrl,
  mode,
  now = Date.now,
  prompt,
  selectedChild,
  selectedCoachStyle,
  selectedGoals,
}) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return {
      ok: false,
      result: createEmptyPromptResult(),
    };
  }

  const payload = buildLearningStudioPayload({
    activeLesson,
    activeTrack,
    mode,
    prompt: trimmedPrompt,
    selectedChild,
    selectedCoachStyle,
    selectedGoals,
  });

  let result;

  try {
    const response = await fetch(`${apiUrl}/api/kidwiz/tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    result = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        result: createServerErrorResult(result),
      };
    }
  } catch {
    return {
      ok: false,
      result: createOfflineResult(),
    };
  }

  const timestamp = typeof now === "function" ? now() : now;
  const artifacts = createLearningStudioArtifacts({
    activeLesson,
    activeTrack,
    mode,
    prompt: trimmedPrompt,
    result,
    timestamp,
  });

  return {
    ok: true,
    result,
    ...artifacts,
  };
}
