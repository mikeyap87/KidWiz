import { childProfiles } from "../data/kidwizData";
import { createDefaultState, loadSavedState } from "./demoState";
import { getRequestedTab } from "./appWorkspaceHelpers";

export function getInitialBootstrap() {
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
