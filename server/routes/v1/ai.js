/**
 * /api/v1/ai — Centralized AI proxy
 * All Gemini calls go through here — API key never reaches the browser.
 */
import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";
import gemini from "../../services/geminiService.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── Chat ───────────────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    const reply = await gemini.chat(history, message);
    res.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(500).json({ message: "AI service unavailable. Please try again." });
  }
});

// ── Generate Notes ─────────────────────────────────────────────────────────
router.post("/notes", async (req, res) => {
  try {
    const { topic, content } = req.body;
    if (!topic && !content) return res.status(400).json({ message: "Topic or content required" });

    const notes = await gemini.generateNotes(topic, content);
    res.json({ notes });
  } catch (error) {
    console.error("Notes gen error:", error.message);
    res.status(500).json({ message: "Failed to generate notes" });
  }
});

// ── Generate Quiz ──────────────────────────────────────────────────────────
router.post("/quiz", async (req, res) => {
  try {
    const { topic, content, count = 10, type = "mcq" } = req.body;
    if (!topic && !content) return res.status(400).json({ message: "Topic or content required" });

    const questions = await gemini.generateQuiz(topic, content, count, type);
    res.json({ questions });
  } catch (error) {
    console.error("Quiz gen error:", error.message);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
});

// ── Generate Flashcards ────────────────────────────────────────────────────
router.post("/flashcards", async (req, res) => {
  try {
    const { topic, content } = req.body;
    if (!topic && !content) return res.status(400).json({ message: "Topic or content required" });

    const cards = await gemini.generateFlashcards(topic, content);
    res.json({ cards });
  } catch (error) {
    console.error("Flashcard gen error:", error.message);
    res.status(500).json({ message: "Failed to generate flashcards" });
  }
});

// ── Generate Study Plan ────────────────────────────────────────────────────
router.post("/study-plan", async (req, res) => {
  try {
    const { subjects, examDate, hoursPerDay, currentLevel } = req.body;
    if (!subjects?.length || !examDate) {
      return res.status(400).json({ message: "subjects and examDate are required" });
    }

    const plan = await gemini.generateStudyPlan({ subjects, examDate, hoursPerDay, currentLevel });
    res.json({ plan });
  } catch (error) {
    console.error("Study plan error:", error.message);
    res.status(500).json({ message: "Failed to generate study plan" });
  }
});

// ── Chat with Document ─────────────────────────────────────────────────────
router.post("/document-chat", async (req, res) => {
  try {
    const { documentId, question, history = [] } = req.body;
    if (!documentId || !question) {
      return res.status(400).json({ message: "documentId and question are required" });
    }

    const { Document } = req.models;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id, isDeleted: false });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!doc.extractedText) return res.status(400).json({ message: "Document has no extracted text" });

    const reply = await gemini.chatWithDocument(doc.extractedText, question, history);

    // Persist chat
    doc.chatHistory.push({ role: "user", content: question });
    doc.chatHistory.push({ role: "assistant", content: reply });
    await doc.save();

    res.json({ reply });
  } catch (error) {
    console.error("Doc chat error:", error.message);
    res.status(500).json({ message: "Failed to chat with document" });
  }
});

export default router;
