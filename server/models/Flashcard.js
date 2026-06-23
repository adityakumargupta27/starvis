import mongoose from "mongoose";

const flashcardDeckSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    description: { type: String, default: "" },
    isAIGenerated: { type: Boolean, default: false },
    cardCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

flashcardDeckSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const flashcardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    deckId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    confidence: { type: Number, default: 0, min: 0, max: 5 },
    lastReviewed: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

flashcardSchema.index({ deckId: 1, isDeleted: 1 });

const FlashcardDeck = mongoose.model("FlashcardDeck", flashcardDeckSchema);
const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export { flashcardDeckSchema, flashcardSchema };
export { FlashcardDeck, Flashcard };
export default FlashcardDeck;
