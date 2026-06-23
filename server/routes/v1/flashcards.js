import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// ── List decks ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { FlashcardDeck } = req.models;
    const decks = await FlashcardDeck.find({ userId: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Create deck ────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { FlashcardDeck } = req.models;
    const { title, subject, description, isAIGenerated } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    const deck = await FlashcardDeck.create({
      userId: req.user._id,
      title: title.trim(),
      subject: subject ?? "",
      description: description ?? "",
      isAIGenerated: isAIGenerated ?? false,
    });
    res.status(201).json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Get cards in deck ──────────────────────────────────────────────────────
router.get("/:deckId/cards", async (req, res) => {
  try {
    const { Flashcard } = req.models;
    const cards = await Flashcard.find({ deckId: req.params.deckId, isDeleted: false }).sort({ createdAt: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Add cards to deck ──────────────────────────────────────────────────────
router.post("/:deckId/cards", async (req, res) => {
  try {
    const { Flashcard, FlashcardDeck } = req.models;
    const { cards } = req.body; // array of {front, back}
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ message: "cards array is required" });
    }

    const docs = cards.map((c) => ({
      userId: req.user._id,
      deckId: req.params.deckId,
      front: c.front,
      back: c.back,
    }));
    const created = await Flashcard.insertMany(docs);

    // Update card count
    await FlashcardDeck.findByIdAndUpdate(req.params.deckId, {
      $inc: { cardCount: created.length },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Update card confidence (spaced repetition) ─────────────────────────────
router.patch("/:deckId/cards/:cardId/confidence", async (req, res) => {
  try {
    const { Flashcard } = req.models;
    const { confidence } = req.body;
    if (confidence === undefined) return res.status(400).json({ message: "confidence required" });
    const card = await Flashcard.findByIdAndUpdate(
      req.params.cardId,
      { confidence, lastReviewed: new Date() },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Delete deck (soft) ─────────────────────────────────────────────────────
router.delete("/:deckId", async (req, res) => {
  try {
    const { FlashcardDeck } = req.models;
    await FlashcardDeck.findByIdAndUpdate(req.params.deckId, { isDeleted: true });
    res.json({ message: "Deck deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
