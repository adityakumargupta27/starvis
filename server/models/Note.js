import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: [{ type: String, lowercase: true, trim: true }],
    subject: { type: String, trim: true },
    isAIGenerated: { type: Boolean, default: false },
    sourceDocument: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
noteSchema.index({ userId: 1, subject: 1 });

const Note = mongoose.model("Note", noteSchema);

export { noteSchema };
export default Note;
