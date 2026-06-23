import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── Start session ──────────────────────────────────────────────────────────
router.post("/start", async (req, res) => {
  try {
    const { PomodoroSession } = req.models;
    const { mode = "focus", plannedDuration = 25, subject, notes } = req.body;
    const session = await PomodoroSession.create({
      userId: req.user._id,
      mode,
      plannedDuration,
      subject: subject ?? "",
      notes: notes ?? "",
      startedAt: new Date(),
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── End session ────────────────────────────────────────────────────────────
router.patch("/:id/end", async (req, res) => {
  try {
    const { PomodoroSession } = req.models;
    const { actualDuration, completed } = req.body;
    const session = await PomodoroSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        actualDuration: actualDuration ?? null,
        completed: completed ?? false,
        endedAt: new Date(),
      },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Session history ────────────────────────────────────────────────────────
router.get("/history", async (req, res) => {
  try {
    const { PomodoroSession } = req.models;
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    const sessions = await PomodoroSession.find({
      userId: req.user._id,
      startedAt: { $gte: since },
    }).sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Stats summary ──────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const { PomodoroSession } = req.models;
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const sessions = await PomodoroSession.find({
      userId: req.user._id,
      mode: "focus",
      completed: true,
      startedAt: { $gte: since },
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.actualDuration ?? s.plannedDuration), 0);
    const totalSessions = sessions.length;

    // Group by day
    const byDay = {};
    sessions.forEach((s) => {
      const day = s.startedAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + (s.actualDuration ?? s.plannedDuration);
    });

    res.json({ totalMinutes, totalSessions, byDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
