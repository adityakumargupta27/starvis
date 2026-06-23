import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── List notes ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { Note } = req.models;
    const { subject, q } = req.query;
    const filter = { userId: req.user._id, isDeleted: false };
    if (subject) filter.subject = subject;
    if (q) filter.title = { $regex: q, $options: "i" };
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Create note ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { Note } = req.models;
    const { title, content, subject, tags, isAIGenerated } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    const note = await Note.create({
      userId: req.user._id,
      title: title.trim(),
      content: content ?? "",
      subject: subject ?? "",
      tags: tags ?? [],
      isAIGenerated: isAIGenerated ?? false,
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Get single note ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { Note } = req.models;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Update note ────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { Note } = req.models;
    const { title, content, subject, tags } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { $set: { title, content, subject, tags } },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Soft delete note ───────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { Note } = req.models;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
