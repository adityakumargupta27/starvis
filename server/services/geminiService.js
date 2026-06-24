/**
 * geminiService.js
 * Gemini-only AI service with a reliable model fallback chain.
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
console.log(
  `[Gemini] Initializing with key: ${
    apiKey ? apiKey.slice(0, 5) + "..." + apiKey.slice(-5) : "undefined/empty"
  }`
);
const genAI = new GoogleGenerativeAI(apiKey);

// ── Fallback model chain — verified valid model IDs (from ListModels API) ─
const FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",   // Best free-tier option, separate quota
  "gemini-2.0-flash-lite",   // Fallback: lightweight, low quota usage
  "gemini-flash-latest",     // Alias for latest flash model
  "gemini-2.5-flash",        // More capable, higher quota usage
  "gemini-2.0-flash",        // Final fallback
];

// ── System prompts ────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  chat: `You are STARVIS, an AI academic copilot for students. You help with:
- Explaining concepts clearly and concisely
- Creating study plans and schedules
- Summarizing topics
- Motivating and coaching students
- Assignment and problem-solving help
- Productivity and learning tips
Keep responses concise, friendly, and academic. Use emojis occasionally.`,

  notes: `You are an expert academic note-taker. Generate well-structured, comprehensive notes from the provided content.
Format: Use headers (##), bullet points, bold for key terms, and include a summary section.
Make notes exam-ready — clear, accurate, and scannable.`,

  quiz: `You are an expert educator. Generate a quiz from the provided topic or content.
Return a valid JSON array of questions with this exact structure:
[{
  "question": "...",
  "type": "mcq" | "short" | "long",
  "options": ["A", "B", "C", "D"],
  "answer": "correct answer",
  "explanation": "brief explanation"
}]
Return ONLY the JSON array, no markdown fences.`,

  flashcards: `You are an expert at creating study flashcards. Generate flashcards from the provided topic or content.
Return a valid JSON array:
[{
  "front": "question or term",
  "back": "answer or definition"
}]
Return ONLY the JSON array, no markdown fences. Create 10-20 flashcards.`,

  studyPlan: `You are an expert study coach. Create a detailed, adaptive study plan.
Format as structured markdown with days, topics, time allocations, and goals.
Be specific, realistic, and motivating.`,

  documentChat: `You are an AI assistant helping a student understand their uploaded document.
Answer questions based strictly on the document content provided.
Be precise and cite relevant sections when possible.`,
};

// ── Core: run with model fallback + retry on 503/429 ─────────────────────
async function runWithFallbackAndRetry(fn, systemInstruction, maxRetries = 2) {
  let lastError;

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini] Trying model "${modelName}" attempt ${attempt + 1}`);
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
        return await fn(model);
      } catch (err) {
        lastError = err;
        const status =
          err.status ||
          (err.message?.includes("503") ? 503 : null) ||
          (err.message?.includes("429") ? 429 : null);

        console.warn(`[Gemini] "${modelName}" attempt ${attempt + 1} failed: ${err.message}`);

        if ((status === 503 || status === 429) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1500 + Math.random() * 500;
          console.log(`[Gemini] Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break; // try next model
      }
    }
  }

  throw lastError || new Error("All Gemini models failed to respond.");
}

// ── Public API ────────────────────────────────────────────────────────────

async function generateText(prompt, systemPromptKey = "chat") {
  const instruction = SYSTEM_PROMPTS[systemPromptKey] ?? SYSTEM_PROMPTS.chat;
  return runWithFallbackAndRetry(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  }, instruction);
}

async function chat(history = [], userMessage) {
  const instruction = SYSTEM_PROMPTS.chat;
  return runWithFallbackAndRetry(async (model) => {
    const geminiHistory = history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
    const chatSession = model.startChat({ history: geminiHistory });
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  }, instruction);
}

async function generateNotes(topic, existingContent = "") {
  const prompt = existingContent
    ? `Generate comprehensive study notes for:\n\nContent:\n${existingContent}`
    : `Generate comprehensive study notes on the topic: "${topic}"`;
  return generateText(prompt, "notes");
}

async function generateQuiz(topic, content = "", count = 10, type = "mcq") {
  const prompt = content
    ? `Generate ${count} ${type} questions from this content:\n\n${content}\n\nReturn only the JSON array.`
    : `Generate ${count} ${type} questions on the topic: "${topic}"\n\nReturn only the JSON array.`;

  const raw = await generateText(prompt, "quiz");
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

async function generateFlashcards(topic, content = "") {
  const prompt = content
    ? `Generate flashcards from this content:\n\n${content}\n\nReturn only the JSON array.`
    : `Generate flashcards on the topic: "${topic}"\n\nReturn only the JSON array.`;

  const raw = await generateText(prompt, "flashcards");
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

async function generateStudyPlan({ subjects, examDate, hoursPerDay, currentLevel }) {
  const prompt = `Create a detailed study plan with these parameters:
- Subjects/Topics: ${subjects.join(", ")}
- Exam date: ${examDate}
- Available study hours per day: ${hoursPerDay}
- Current level: ${currentLevel ?? "intermediate"}
Make it realistic, day-by-day with specific goals.`;
  return generateText(prompt, "studyPlan");
}

async function chatWithDocument(documentText, question, history = []) {
  const instruction = SYSTEM_PROMPTS.documentChat;
  return runWithFallbackAndRetry(async (model) => {
    const geminiHistory = history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));
    const chatSession = model.startChat({ history: geminiHistory });
    const prompt = `Document Content:\n${documentText.slice(0, 8000)}\n\nQuestion: ${question}`;
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  }, instruction);
}

export default {
  chat,
  generateNotes,
  generateQuiz,
  generateFlashcards,
  generateStudyPlan,
  chatWithDocument,
  generateText,
};
