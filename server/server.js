import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const result = dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("[Dotenv] Loaded keys:", Object.keys(result.parsed || {}));
if (result.error) console.error("[Dotenv] Load error:", result.error);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./db.js";

// ── Legacy routes (v0 — kept for backward compat while frontend migrates) ─
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import eventRoutes from "./routes/events.js";
import assignmentRoutes from "./routes/assignments.js";
import profileRoutes from "./routes/profile.js";
import settingsRoutes from "./routes/settings.js";

// ── v1 routes ──────────────────────────────────────────────────────────────
import aiRoutes from "./routes/v1/ai.js";
import notesRoutes from "./routes/v1/notes.js";
import documentsRoutes from "./routes/v1/documents.js";
import flashcardsRoutes from "./routes/v1/flashcards.js";
import quizzesRoutes from "./routes/v1/quizzes.js";
import pomodoroRoutes from "./routes/v1/pomodoro.js";
import attendanceRoutes from "./routes/v1/attendance.js";
import cgpaRoutes from "./routes/v1/cgpa.js";
import billingRoutes from "./routes/v1/billing.js";
import studyPlanRoutes from "./routes/v1/studyplan.js";


const app = express();

// ── Security middleware ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(mongoSanitize());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "https://starvis.vercel.app",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "capacitor://localhost"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      // Allow any localhost development origin dynamically
      if (origin.startsWith("http://localhost:") || origin === "http://localhost" || origin.startsWith("http://127.0.0.1:")) {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── General rate limiter ────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." },
});
app.use(limiter);

// ── Stricter rate limit for AI endpoints ────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { message: "AI rate limit reached. Wait a moment and try again." },
});

// ── Body parsing + compression ──────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

// ── Connect DB ──────────────────────────────────────────────────────────────
connectDB();

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", version: "2.0.0" }));

// ── Legacy API routes (v0) — gradually migrate frontend to v1 ───────────────
app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);

app.use("/api/todos", todoRoutes);
app.use("/api/v1/todos", todoRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/v1/events", eventRoutes);

app.use("/api/assignments", assignmentRoutes);
app.use("/api/v1/assignments", assignmentRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/v1/profile", profileRoutes);

app.use("/api/settings", settingsRoutes);
app.use("/api/v1/settings", settingsRoutes);

// ── v1 API routes ───────────────────────────────────────────────────────────
app.use("/api/v1/ai", aiLimiter, aiRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/documents", documentsRoutes);
app.use("/api/v1/flashcards", flashcardsRoutes);
app.use("/api/v1/quizzes", quizzesRoutes);
app.use("/api/v1/pomodoro", pomodoroRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/cgpa", cgpaRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/studyplan", studyPlanRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(status).json({
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`STARVIS API v2 running on port ${PORT} [${process.env.NODE_ENV}]`)); // env refreshed
