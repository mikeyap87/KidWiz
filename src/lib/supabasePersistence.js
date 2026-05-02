import { createDefaultState } from "./demoState";
import {
  parentPrivacyPromise,
  retentionPolicyDraft,
} from "../data/releaseReadinessData";

const WORKSPACES_TABLE = "kidwiz_family_workspaces";
const SAFETY_EVENTS_TABLE = "kidwiz_ai_safety_events";
const STATE_VERSION = 1;

export function createInitialCloudSyncStatus() {
  return {
    state: "local",
    label: "Local demo",
    detail: "Saved in this browser.",
    tone: "neutral",
  };
}

export function createCloudSyncStatus(state, detail = "") {
  const statusByState = {
    disabled: {
      label: "Local demo",
      detail: "Supabase is not configured yet.",
      tone: "neutral",
    },
    idle: {
      label: "Cloud ready",
      detail: "Signed in and ready to save.",
      tone: "neutral",
    },
    signin_required: {
      label: "Cloud sign-in",
      detail: "Supabase is configured. Send a parent magic link to save this family workspace.",
      tone: "neutral",
    },
    loading: {
      label: "Loading cloud",
      detail: "Checking for a saved family workspace.",
      tone: "neutral",
    },
    saving: {
      label: "Saving",
      detail: "Saving this family workspace.",
      tone: "neutral",
    },
    saved: {
      label: "Cloud saved",
      detail: "Family workspace saved.",
      tone: "good",
    },
    deleted: {
      label: "Cloud deleted",
      detail: "The cloud copy was deleted. Local browser review is still available.",
      tone: "warn",
    },
    setup_required: {
      label: "Cloud setup needed",
      detail: "Run the KidWiz Supabase migration first.",
      tone: "warn",
    },
    error: {
      label: "Cloud not saved",
      detail: "KidWiz could not save to Supabase.",
      tone: "warn",
    },
  };

  const base = statusByState[state] ?? statusByState.error;

  return {
    state,
    label: base.label,
    detail: detail || base.detail,
    tone: base.tone,
  };
}

function normalizeSupabaseError(error) {
  if (!error) {
    return null;
  }

  const message = error.message ?? String(error);
  const missingTable =
    error.code === "42P01" ||
    error.code === "PGRST116" ||
    error.code === "PGRST205" ||
    /does not exist|schema cache|Could not find the table/i.test(message);

  return {
    state: missingTable ? "setup_required" : "error",
    message,
  };
}

export function buildPersistableKidWizState(appState) {
  const workspaceState = { ...appState };
  delete workspaceState.session;

  return {
    ...workspaceState,
    cloudSchemaVersion: STATE_VERSION,
  };
}

export function buildFamilyExportPayload(appState) {
  const safetyEvents = extractSafetyEvents(appState);

  return {
    exportedAt: new Date().toISOString(),
    exportVersion: STATE_VERSION,
    familyName: appState.familyName,
    note:
      "KidWiz family export for parent review. Session credentials and Supabase user ids are excluded.",
    privacy: {
      parentPromise: parentPrivacyPromise,
      retentionDraft: retentionPolicyDraft,
    },
    workspace: buildPersistableKidWizState(appState),
    safetyEvents: safetyEvents.map(({ childId, event }) => ({
      childId,
      ...event,
    })),
  };
}

export function mergeCloudWorkspaceState(currentState, cloudState) {
  if (!cloudState || typeof cloudState !== "object") {
    return currentState;
  }

  const defaults = createDefaultState();
  const session = currentState.session;

  return {
    ...defaults,
    ...cloudState,
    session,
    activeTab: currentState.activeTab ?? cloudState.activeTab ?? defaults.activeTab,
  };
}

export function extractSafetyEvents(appState) {
  return Object.entries(appState.learningStudioByChild ?? {}).flatMap(
    ([childId, studio]) =>
      (studio?.safetyEvents ?? []).map((event) => ({
        childId,
        event,
      })),
  );
}

export async function loadKidWizCloudWorkspace({ client, userId }) {
  const { data, error } = await client
    .from(WORKSPACES_TABLE)
    .select("id, family_name, state_version, app_state, updated_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    const normalized = normalizeSupabaseError(error);
    return {
      ok: false,
      status: normalized.state,
      error: normalized.message,
      workspace: null,
    };
  }

  return {
    ok: true,
    status: data ? "loaded" : "empty",
    workspace: data ?? null,
  };
}

export async function saveKidWizCloudWorkspace({ appState, client, userId }) {
  const persistableState = buildPersistableKidWizState(appState);
  const { data, error } = await client
    .from(WORKSPACES_TABLE)
    .upsert(
      {
        owner_id: userId,
        family_name: appState.familyName,
        state_version: STATE_VERSION,
        app_state: persistableState,
      },
      { onConflict: "owner_id" },
    )
    .select("id, updated_at")
    .single();

  if (error) {
    const normalized = normalizeSupabaseError(error);
    return {
      ok: false,
      status: normalized.state,
      error: normalized.message,
      workspaceId: null,
    };
  }

  const safetyResult = await saveKidWizSafetyEvents({
    appState,
    client,
    userId,
    workspaceId: data.id,
  });

  if (!safetyResult.ok) {
    return {
      ok: false,
      status: safetyResult.status,
      error: safetyResult.error,
      workspaceId: data.id,
    };
  }

  return {
    ok: true,
    status: "saved",
    workspaceId: data.id,
    updatedAt: data.updated_at,
  };
}

export async function deleteKidWizCloudWorkspace({ client, userId }) {
  const { error: safetyError } = await client
    .from(SAFETY_EVENTS_TABLE)
    .delete()
    .eq("owner_id", userId);

  if (safetyError) {
    const normalized = normalizeSupabaseError(safetyError);
    return {
      ok: false,
      status: normalized.state,
      error: normalized.message,
    };
  }

  const { error: workspaceError } = await client
    .from(WORKSPACES_TABLE)
    .delete()
    .eq("owner_id", userId);

  if (workspaceError) {
    const normalized = normalizeSupabaseError(workspaceError);
    return {
      ok: false,
      status: normalized.state,
      error: normalized.message,
    };
  }

  return {
    ok: true,
    status: "deleted",
  };
}

export async function saveKidWizSafetyEvents({
  appState,
  client,
  userId,
  workspaceId,
}) {
  const safetyEvents = extractSafetyEvents(appState);

  if (safetyEvents.length === 0) {
    return {
      ok: true,
      status: "empty",
    };
  }

  const rows = safetyEvents.map(({ childId, event }) => ({
    owner_id: userId,
    workspace_id: workspaceId,
    child_id: childId,
    event_key: event.id,
    status: event.status,
    source: event.source,
    lesson_title: event.lessonTitle,
    prompt_excerpt: event.prompt ? event.prompt.slice(0, 240) : null,
    event_payload: event,
  }));

  const { error } = await client
    .from(SAFETY_EVENTS_TABLE)
    .upsert(rows, { onConflict: "owner_id,event_key" });

  if (error) {
    const normalized = normalizeSupabaseError(error);
    return {
      ok: false,
      status: normalized.state,
      error: normalized.message,
    };
  }

  return {
    ok: true,
    status: "saved",
  };
}
