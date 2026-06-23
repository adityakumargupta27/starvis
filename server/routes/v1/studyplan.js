import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";
import gemini from "../../services/geminiService.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// Get all study plans / goals
router.get("/", async (req, res) => {
  try {
    const { StudyGoal } = req.models;
    const plans = await StudyGoal.find({ userId: req.user._id, isDeleted: false })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate and save a new study plan
router.post("/", async (req, res) => {
  try {
    const { StudyGoal } = req.models;
    const { subjects, examDate, hoursPerDay, currentLevel } = req.body;

    if (!subjects || !subjects.length || !examDate) {
      return res.status(400).json({ message: "Subjects and exam date are required" });
    }

    // Call centralized Gemini service
    const planText = await gemini.generateStudyPlan({
      subjects,
      examDate,
      hoursPerDay: hoursPerDay ?? 2,
      currentLevel: currentLevel ?? "intermediate",
    });

    const newPlan = await StudyGoal.create({
      userId: req.user._id,
      subjects,
      examDate: new Date(examDate),
      hoursPerDay: hoursPerDay ?? 2,
      currentLevel: currentLevel ?? "intermediate",
      planText,
    });

    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update plan status (complete/incomplete)
router.put("/:id", async (req, res) => {
  try {
    const { StudyGoal } = req.models;
    const { isCompleted } = req.body;

    const plan = await StudyGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { $set: { isCompleted: isCompleted ?? false } },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete study plan
router.delete("/:id", async (req, res) => {
  try {
    const { StudyGoal } = req.models;

    const plan = await StudyGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    res.json({ message: "Study plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
