import mongoose from "mongoose";

// ── Existing schemas ──────────────────────────────────────────────────────
import { todoSchema } from "../models/Todo.js";
import { calendarEventSchema } from "../models/CalendarEvent.js";
import { assignmentSchema } from "../models/Assignment.js";
import { studyProfileSchema } from "../models/StudyProfile.js";
import { settingsSchema } from "../models/Settings.js";

// ── New schemas ───────────────────────────────────────────────────────────
import { noteSchema } from "../models/Note.js";
import { documentSchema } from "../models/Document.js";
import { flashcardDeckSchema, flashcardSchema } from "../models/Flashcard.js";
import { quizSchema } from "../models/Quiz.js";
import { pomodoroSessionSchema } from "../models/PomodoroSession.js";
import { attendanceSchema } from "../models/Attendance.js";
import { studyGoalSchema } from "../models/StudyGoal.js";


/**
 * Safely get or register a model on a connection.
 * Avoids OverwriteModelError when nodemon reloads.
 */
function safeModel(conn, name, schema) {
  return conn.models[name] ?? conn.model(name, schema);
}

/**
 * getTenantModels middleware
 * Resolves a per-user isolated database (starvis_user_<id>)
 * and attaches typed model references to req.models.
 */
const getTenantModels = (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Tenant resolution requires authentication" });
  }

  try {
    const dbName = `starvis_user_${req.user._id.toString()}`;
    const db = mongoose.connection.useDb(dbName, { useCache: true });

    req.models = {
      // Existing
      Todo: safeModel(db, "Todo", todoSchema),
      CalendarEvent: safeModel(db, "CalendarEvent", calendarEventSchema),
      Assignment: safeModel(db, "Assignment", assignmentSchema),
      StudyProfile: safeModel(db, "StudyProfile", studyProfileSchema),
      Settings: safeModel(db, "Settings", settingsSchema),
      // New
      Note: safeModel(db, "Note", noteSchema),
      Document: safeModel(db, "Document", documentSchema),
      FlashcardDeck: safeModel(db, "FlashcardDeck", flashcardDeckSchema),
      Flashcard: safeModel(db, "Flashcard", flashcardSchema),
      Quiz: safeModel(db, "Quiz", quizSchema),
      PomodoroSession: safeModel(db, "PomodoroSession", pomodoroSessionSchema),
      Attendance: safeModel(db, "Attendance", attendanceSchema),
      StudyGoal: safeModel(db, "StudyGoal", studyGoalSchema),
    };

    next();
  } catch (error) {
    console.error("Tenant DB Error:", error.message);
    res.status(500).json({ message: "Database routing failed" });
  }
};

export { getTenantModels };
