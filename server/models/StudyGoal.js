import mongoose from "mongoose";

const studyGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    subjects: {
      type: [String],
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    hoursPerDay: {
      type: Number,
      default: 2,
    },
    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    planText: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studyGoalSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const StudyGoal = mongoose.model("StudyGoal", studyGoalSchema);

export { studyGoalSchema };
export default StudyGoal;
