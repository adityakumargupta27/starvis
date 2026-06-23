import mongoose from "mongoose";

const todoSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    category: {
      type: String,
      enum: ["General", "Study", "Assignment", "Personal", "Exam Prep"],
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.index({ userId: 1, completed: 1 });

const Todo = mongoose.model("Todo", todoSchema);

export { todoSchema };
export default Todo;
