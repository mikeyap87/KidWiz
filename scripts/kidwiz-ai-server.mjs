import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "127.0.0.1";
const DEFAULT_PORT = 5291;
const MODERATION_MODEL = "omni-moderation-latest";

loadLocalEnv(".env.local");
loadLocalEnv(".env");

const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const PORT = Number(process.env.KIDWIZ_AI_SERVER_PORT || DEFAULT_PORT);

const learningModes = {
  learn: "Learn with me",
  quiz: "Quiz me",
  explain: "Explain another way",
  visualize: "Show a visual idea",
  notebook: "Save to notebook",
};

const localSafetyRules = [
  {
    id: "secrecy",
    pattern: /\b(secret|don't tell|do not tell|hide this|private safety)\b/i,
    copy: "Secrecy-heavy prompts should move to a trusted adult and parent review.",
  },
  {
    id: "self-harm",
    pattern: /\b(kill myself|hurt myself|self harm|suicide|want to die)\b/i,
    copy: "Self-harm language requires immediate trusted-adult support.",
  },
  {
    id: "medical",
    pattern: /\b(medicine|medical|doctor|diagnose|pain|injury|bleeding)\b/i,
    copy: "Medical questions should be handled by a trusted adult or clinician.",
  },
  {
    id: "adult-safety",
    pattern: /\b(sex|nude|abuse|touching|body secret|unsafe adult)\b/i,
    copy: "Adult or body-safety content should stay parent-visible and age-banded.",
  },
];

function loadLocalEnv(fileName) {
  const envPath = resolve(fileName);

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValueParts] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5290",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function getLocalSafetyDecision(prompt, activeTrack) {
  const matchedRule = localSafetyRules.find((rule) => rule.pattern.test(prompt));
  const sensitiveTrack = Boolean(activeTrack?.sensitive);

  if (matchedRule) {
    return {
      status: "parent_review",
      source: "local-rule",
      reason: matchedRule.copy,
      ruleId: matchedRule.id,
    };
  }

  if (sensitiveTrack) {
    return {
      status: "parent_review",
      source: "track-rule",
      reason: "Sensitive-topic tracks stay parent-visible in this AI preview.",
      ruleId: "sensitive-track",
    };
  }

  return {
    status: "allowed",
    source: "local-rule",
    reason: "Prompt stayed inside the child-safe learning lane.",
    ruleId: "general-learning",
  };
}

async function moderatePrompt(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  const moderationResponse = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODERATION_MODEL,
      input: prompt,
    }),
  });

  if (!moderationResponse.ok) {
    const body = await moderationResponse.text();
    throw new Error(`Moderation failed: ${moderationResponse.status} ${body}`);
  }

  const moderation = await moderationResponse.json();
  const result = moderation.results?.[0];

  if (result?.flagged) {
    return {
      status: "parent_review",
      source: "openai-moderation",
      reason: "OpenAI moderation flagged the prompt for parent review.",
      categories: result.categories,
    };
  }

  return {
    status: "allowed",
    source: "openai-moderation",
    reason: "OpenAI moderation did not flag the prompt.",
    categories: result?.categories ?? {},
  };
}

function buildParentReviewResponse({ prompt, mode, activeLesson, selectedChild, safetyDecision }) {
  const lessonTitle = activeLesson?.title ?? "today's lesson";
  const childName = selectedChild?.name ?? "your child";

  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: MODEL,
    mode,
    promptStatus: "parent_review",
    childAnswer:
      "This is a good moment to bring in a trusted grown-up. KidWiz can help you say the first sentence, but it should not handle this alone.",
    parentSummary: `${childName} asked a prompt while working on ${lessonTitle}. KidWiz paused the AI response because: ${safetyDecision.reason}`,
    safetyDecision,
    suggestedNextAction:
      "Open a short parent conversation, then return to the lesson once the child has support.",
    notebookCard: {
      title: "Parent review moment",
      body: `Prompt needing review: ${prompt}`,
      tags: ["parent review", learningModes[mode] ?? "Learning Studio"],
    },
    questionBankItem: null,
  };
}

function buildTutorPrompt(payload) {
  const {
    activeLesson,
    activeTrack,
    mode,
    prompt,
    selectedChild,
    selectedCoachStyle,
    selectedGoals = [],
  } = payload;
  const modeLabel = learningModes[mode] ?? learningModes.learn;
  const goalText = selectedGoals.map((goal) => goal.title).join(", ") || "family growth";

  return [
    "You are Spark, the KidWiz child-safe learning tutor.",
    `Mode: ${modeLabel}.`,
    `Child: ${selectedChild.name}, age ${selectedChild.age}, grade ${selectedChild.grade}.`,
    `Active track: ${activeTrack.title}.`,
    `Active lesson: ${activeLesson.title}. Lesson summary: ${activeLesson.summary}`,
    `Parent-approved coach style: ${selectedCoachStyle.title}.`,
    `Family goals: ${goalText}.`,
    "Stay inside the active lesson. Use warm, age-aware language. Do not pretend to be a friend, therapist, doctor, or parent.",
    "Return JSON only with keys: childAnswer, parentSummary, suggestedNextAction, notebookCard, questionBankItem.",
    "notebookCard must be null unless the mode is Save to notebook or the answer creates a useful durable learning note.",
    "questionBankItem must be null unless the mode is Quiz me.",
    `Child prompt: ${prompt}`,
  ].join("\n");
}

function parseTutorJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("The tutor response did not include JSON.");
    }

    return JSON.parse(jsonMatch[0]);
  }
}

async function generateTutorResponse(payload, safetyDecision) {
  const apiKey = process.env.OPENAI_API_KEY;

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: buildTutorPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "kidwiz_tutor_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              childAnswer: { type: "string" },
              parentSummary: { type: "string" },
              suggestedNextAction: { type: "string" },
              notebookCard: {
                anyOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      body: { type: "string" },
                      tags: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["title", "body", "tags"],
                  },
                  { type: "null" },
                ],
              },
              questionBankItem: {
                anyOf: [
                  {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                  },
                  { type: "null" },
                ],
              },
            },
            required: [
              "childAnswer",
              "parentSummary",
              "suggestedNextAction",
              "notebookCard",
              "questionBankItem",
            ],
          },
        },
      },
    }),
  });

  if (!aiResponse.ok) {
    const body = await aiResponse.text();
    throw new Error(`Tutor generation failed: ${aiResponse.status} ${body}`);
  }

  const data = await aiResponse.json();
  const outputText =
    data.output_text ??
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n") ??
    "";
  const parsed = parseTutorJson(outputText);

  return {
    configured: true,
    model: MODEL,
    mode: payload.mode,
    promptStatus: "answered",
    childAnswer: parsed.childAnswer ?? "Try one small step from the lesson, then check what changed.",
    parentSummary:
      parsed.parentSummary ??
      `${payload.selectedChild.name} received lesson-scoped help for ${payload.activeLesson.title}.`,
    safetyDecision,
    suggestedNextAction:
      parsed.suggestedNextAction ?? "Save one note or return to the active lesson.",
    notebookCard: parsed.notebookCard ?? null,
    questionBankItem: parsed.questionBankItem ?? null,
  };
}

async function handleTutorRequest(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 503, {
      configured: false,
      model: MODEL,
      promptStatus: "not_configured",
      childAnswer:
        "Live AI is not connected on this Mac yet. Ask a parent to add the OpenAI key, then try again.",
      parentSummary:
        "KidWiz Learning Studio is wired, but OPENAI_API_KEY is missing from the local server environment.",
      safetyDecision: {
        status: "not_checked",
        source: "server-config",
        reason: "No OpenAI API key is configured.",
      },
      suggestedNextAction: "Add OPENAI_API_KEY to .env.local and restart npm run ai:server.",
      notebookCard: null,
      questionBankItem: null,
    });
    return;
  }

  const payload = await readRequestBody(request);
  const prompt = String(payload.prompt ?? "").trim();

  if (!prompt) {
    sendJson(response, 400, {
      error: "Prompt is required.",
    });
    return;
  }

  const localSafetyDecision = getLocalSafetyDecision(prompt, payload.activeTrack);

  if (localSafetyDecision.status !== "allowed") {
    sendJson(
      response,
      200,
      buildParentReviewResponse({
        ...payload,
        prompt,
        safetyDecision: localSafetyDecision,
      }),
    );
    return;
  }

  const moderationDecision = await moderatePrompt(prompt);

  if (moderationDecision.status !== "allowed") {
    sendJson(
      response,
      200,
      buildParentReviewResponse({
        ...payload,
        prompt,
        safetyDecision: moderationDecision,
      }),
    );
    return;
  }

  const tutorResponse = await generateTutorResponse(
    {
      ...payload,
      prompt,
    },
    moderationDecision,
  );

  sendJson(response, 200, tutorResponse);
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (request.method === "GET" && request.url === "/api/kidwiz/health") {
      sendJson(response, 200, {
        ok: true,
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: MODEL,
        moderationModel: MODERATION_MODEL,
      });
      return;
    }

    if (request.method === "POST" && request.url === "/api/kidwiz/tutor") {
      await handleTutorRequest(request, response);
      return;
    }

    sendJson(response, 404, {
      error: "Not found.",
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message,
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`KidWiz AI server running at http://${HOST}:${PORT}`);
});
