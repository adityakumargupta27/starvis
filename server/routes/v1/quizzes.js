import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── List quizzes ───────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { Quiz } = req.models;
    const quizzes = await Quiz.find({ userId: req.user._id, isDeleted: false })
      .select("-questions.explanation")
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Save quiz (after AI generation) ───────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { Quiz } = req.models;
    const { title, subject, questions, isAIGenerated } = req.body;
    if (!title || !questions?.length) {
      return res.status(400).json({ message: "title and questions are required" });
    }
    const quiz = await Quiz.create({
      userId: req.user._id,
      title,
      subject: subject ?? "",
      questions,
      isAIGenerated: isAIGenerated ?? false,
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Get single quiz ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { Quiz } = req.models;
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Submit attempt ─────────────────────────────────────────────────────────
router.post("/:id/attempt", async (req, res) => {
  try {
    const { Quiz } = req.models;
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const { answers } = req.body; // [{questionIndex, userAnswer}]
    let score = 0;
    const graded = answers.map(({ questionIndex, userAnswer }) => {
      const q = quiz.questions[questionIndex];
      const isCorrect = q?.answer?.toLowerCase().trim() === userAnswer?.toLowerCase().trim();
      if (isCorrect) score++;
      return { questionIndex, userAnswer, isCorrect };
    });

    const attempt = {
      score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      answers: graded,
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    res.json({ attempt, questions: quiz.questions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Delete quiz ────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { Quiz } = req.models;
    await Quiz.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isDeleted: true });
    res.json({ message: "Quiz deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
