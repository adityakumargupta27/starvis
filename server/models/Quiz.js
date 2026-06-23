import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true },
    subject: { type: String, trim: true },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ["mcq", "short", "long"], default: "mcq" },
        options: [String],
        answer: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    attempts: [
      {
        score: Number,
        total: Number,
        percentage: Number,
        attemptedAt: { type: Date, default: Date.now },
        answers: [
          {
            questionIndex: Number,
            userAnswer: String,
            isCorrect: Boolean,
          },
        ],
      },
    ],
    isAIGenerated: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

quizSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export { quizSchema };
export default Quiz;
