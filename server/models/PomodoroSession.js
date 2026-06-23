import mongoose from "mongoose";

const pomodoroSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    mode: { type: String, enum: ["focus", "shortBreak", "longBreak"], default: "focus" },
    plannedDuration: { type: Number, required: true },
    actualDuration: { type: Number, default: null },
    completed: { type: Boolean, default: false },
    subject: { type: String, trim: true },
    notes: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pomodoroSessionSchema.index({ userId: 1, startedAt: -1 });
pomodoroSessionSchema.index({ userId: 1, completed: 1 });

const PomodoroSession = mongoose.model("PomodoroSession", pomodoroSessionSchema);

export { pomodoroSessionSchema };
export default PomodoroSession;
