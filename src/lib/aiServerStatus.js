export function createInitialAiServerStatus() {
  return {
    state: "checking",
    configured: false,
    model: null,
    message: "Checking the Learning Studio connection.",
  };
}

export async function checkKidWizAiServer(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/kidwiz/health`);
    const data = await response.json();

    return {
      state: response.ok ? "online" : "offline",
      configured: Boolean(data.configured),
      model: data.model ?? null,
      message: data.configured
        ? `Live AI is connected with ${data.model ?? "the configured model"}.`
        : "Learning Studio is available, but live AI is not configured.",
    };
  } catch {
    return {
      state: "offline",
      configured: false,
      model: null,
      message: "Learning Studio is offline. The family workspace still works.",
    };
  }
}
