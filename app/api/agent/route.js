import { SYSTEM_PROMPT } from "../../../lib/agentPrompt";
import { fallbackParse } from "../../../lib/fallback";

export const runtime = "nodejs";

const REQUIRED_KEYS = ["chat_reply", "is_cpgrams_eligible", "needs_clarification"];

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function valid(obj) {
  return obj && REQUIRED_KEYS.every((k) => k in obj);
}

async function callGemini(messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no gemini key");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  return extractJson(data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

// OpenAI-compatible chat completions: works for Groq, OpenAI, Sarvam, OpenRouter.
async function callCompat(messages) {
  const base = process.env.COMPAT_BASE_URL;
  const key = process.env.COMPAT_API_KEY;
  const model = process.env.COMPAT_MODEL;
  if (!base || !key || !model) throw new Error("no compat config");
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      // Sarvam's API expects this header instead of Bearer; harmless elsewhere.
      "api-subscription-key": key,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`compat ${res.status}`);
  const data = await res.json();
  return extractJson(data?.choices?.[0]?.message?.content);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  if (!messages.length) {
    return Response.json({ error: "no messages" }, { status: 400 });
  }

  const provider = process.env.NIVARAN_PROVIDER || "mock";
  let parsed = null;
  let source = "fallback";

  if (provider !== "mock") {
    try {
      if (provider === "gemini") parsed = await callGemini(messages);
      else parsed = await callCompat(messages);
      if (valid(parsed)) source = "llm";
      else parsed = null;
    } catch {
      parsed = null; // fall through to deterministic parser
    }
  }

  if (!parsed) {
    const userTurns = messages.filter((m) => m.role === "user").map((m) => m.content);
    const askedClarification = messages.some((m) => {
      if (m.role !== "assistant") return false;
      try {
        return JSON.parse(m.content)?.needs_clarification === true;
      } catch {
        return /"needs_clarification"\s*:\s*true/.test(m.content);
      }
    });
    parsed = fallbackParse(userTurns, askedClarification);
  }

  return Response.json({ source, data: parsed });
}
