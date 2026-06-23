/**
 * STARVIS AI — Centralized Gemini AI Service
 * All AI calls go through this service — API key never leaves the server.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const MODEL = "gemini-2.0-flash";

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
  "options": ["A", "B", "C", "D"],   // only for mcq
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

/**
 * Generic text generation
 */
async function generateText(prompt, systemPromptKey = "chat") {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPTS[systemPromptKey] ?? SYSTEM_PROMPTS.chat,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Multi-turn chat with history
 */
async function chat(history = [], userMessage) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPTS.chat,
  });

  const geminiHistory = history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chatSession = model.startChat({ history: geminiHistory });
  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
}

/**
 * Generate structured notes from topic or content
 */
async function generateNotes(topic, existingContent = "") {
  const prompt = existingContent
    ? `Generate comprehensive study notes for:\n\nContent:\n${existingContent}`
    : `Generate comprehensive study notes on the topic: "${topic}"`;
  return generateText(prompt, "notes");
}

/**
 * Generate quiz questions
 */
async function generateQuiz(topic, content = "", count = 10, type = "mcq") {
  const prompt = content
    ? `Generate ${count} ${type} questions from this content:\n\n${content}\n\nReturn only the JSON array.`
    : `Generate ${count} ${type} questions on the topic: "${topic}"\n\nReturn only the JSON array.`;

  const raw = await generateText(prompt, "quiz");
  // Strip markdown fences if model adds them
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Generate flashcards
 */
async function generateFlashcards(topic, content = "") {
  const prompt = content
    ? `Generate flashcards from this content:\n\n${content}\n\nReturn only the JSON array.`
    : `Generate flashcards on the topic: "${topic}"\n\nReturn only the JSON array.`;

  const raw = await generateText(prompt, "flashcards");
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Generate AI study plan
 */
async function generateStudyPlan({ subjects, examDate, hoursPerDay, currentLevel }) {
  const prompt = `Create a detailed study plan with these parameters:
- Subjects/Topics: ${subjects.join(", ")}
- Exam date: ${examDate}
- Available study hours per day: ${hoursPerDay}
- Current level: ${currentLevel ?? "intermediate"}
Make it realistic, day-by-day with specific goals.`;
  return generateText(prompt, "studyPlan");
}

/**
 * Chat with document content
 */
async function chatWithDocument(documentText, question, history = []) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPTS.documentChat,
  });

  const geminiHistory = history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chatSession = model.startChat({ history: geminiHistory });
  const prompt = `Document Content:\n${documentText.slice(0, 8000)}\n\nQuestion: ${question}`;
  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
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
