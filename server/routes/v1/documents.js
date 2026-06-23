import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";
import gemini from "../../services/geminiService.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// Multer — in-memory storage (no disk writes needed — we extract text then discard)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [".pdf", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF and TXT files are supported"));
  },
});

// ── List all documents ─────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { Document } = req.models;
    const docs = await Document.find({ userId: req.user._id, isDeleted: false })
      .select("-extractedText -chatHistory")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Upload + parse document ────────────────────────────────────────────────
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { Document } = req.models;
    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");

    let extractedText = "";
    if (ext === "pdf") {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text;
    } else if (ext === "txt") {
      extractedText = req.file.buffer.toString("utf-8");
    }

    // Generate a quick AI summary
    let summary = "";
    if (extractedText.length > 100) {
      try {
        summary = await gemini.generateText(
          `Summarize this document in 3-4 sentences:\n\n${extractedText.slice(0, 4000)}`,
          "notes"
        );
      } catch (_) { /* non-blocking */ }
    }

    const doc = await Document.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      fileType: ext,
      fileSize: req.file.size,
      extractedText,
      summary,
    });

    res.status(201).json({
      _id: doc._id,
      originalName: doc.originalName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      summary: doc.summary,
      createdAt: doc.createdAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Get single document (with chat history) ────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { Document } = req.models;
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    }).select("-extractedText"); // don't send full text to frontend
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Delete document ────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { Document } = req.models;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDeleted: true },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
