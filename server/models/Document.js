import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    originalName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx", "txt", "pptx"], required: true },
    fileSize: { type: Number },
    extractedText: { type: String, default: "" },
    summary: { type: String, default: "" },
    chatHistory: [
      {
        role: { type: String, enum: ["user", "assistant"] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export { documentSchema };
export default Document;
