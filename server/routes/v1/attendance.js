import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── Get all subjects with attendance ──────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { Attendance } = req.models;
    const records = await Attendance.find({ userId: req.user._id, isDeleted: false });

    // Compute summary per subject
    const summary = records.map((r) => {
      const total = r.records.filter((x) => x.status !== "cancelled").length;
      const present = r.records.filter((x) => x.status === "present").length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      const belowTarget = percentage < r.targetPercentage;

      // How many more classes needed to reach target
      let classesNeeded = 0;
      if (belowTarget && r.targetPercentage > 0) {
        const target = r.targetPercentage / 100;
        classesNeeded = Math.ceil((target * total - present) / (1 - target));
      }

      return {
        _id: r._id,
        subject: r.subject,
        total,
        present,
        absent: r.records.filter((x) => x.status === "absent").length,
        percentage,
        targetPercentage: r.targetPercentage,
        belowTarget,
        classesNeeded,
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get records for a subject ──────────────────────────────────────────────
router.get("/:id/records", async (req, res) => {
  try {
    const { Attendance } = req.models;
    const att = await Attendance.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!att) return res.status(404).json({ message: "Subject not found" });
    res.json(att);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Add subject ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { Attendance } = req.models;
    const { subject, targetPercentage } = req.body;
    if (!subject?.trim()) return res.status(400).json({ message: "Subject is required" });

    // Prevent duplicates
    const existing = await Attendance.findOne({ userId: req.user._id, subject: subject.trim(), isDeleted: false });
    if (existing) return res.status(409).json({ message: "Subject already exists" });

    const att = await Attendance.create({
      userId: req.user._id,
      subject: subject.trim(),
      targetPercentage: targetPercentage ?? 75,
      records: [],
    });
    res.status(201).json(att);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Mark attendance ────────────────────────────────────────────────────────
router.post("/:id/mark", async (req, res) => {
  try {
    const { Attendance } = req.models;
    const { date, status, notes } = req.body;
    if (!date || !status) return res.status(400).json({ message: "date and status are required" });

    const att = await Attendance.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!att) return res.status(404).json({ message: "Subject not found" });

    // Replace if same date already exists
    const existingIdx = att.records.findIndex((r) => r.date === date);
    if (existingIdx >= 0) {
      att.records[existingIdx] = { date, status, notes: notes ?? "" };
    } else {
      att.records.push({ date, status, notes: notes ?? "" });
    }
    await att.save();
    res.json(att);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Delete subject ─────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { Attendance } = req.models;
    await Attendance.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isDeleted: true });
    res.json({ message: "Subject removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
