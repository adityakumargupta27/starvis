import express from "express";
import { protect } from "../../middleware/auth.js";
import { getTenantModels } from "../../middleware/tenant.js";
import { PLANS } from "../../config/plans.js";
import User from "../../models/User.js";

const router = express.Router();
router.use(protect);
router.use(getTenantModels);

// Get current subscription details & limits usage
router.get("/subscription", async (req, res) => {
  try {
    const userPlan = req.user.plan || "free";
    const planConfig = PLANS[userPlan] || PLANS.free;

    // Count actual usage in tenant DB
    const notesCount = await req.models.Note.countDocuments({ isDeleted: false });
    const docsCount = await req.models.Document.countDocuments({ isDeleted: false });
    const flashcardsCount = await req.models.FlashcardDeck.countDocuments({ isDeleted: false });
    const quizzesCount = await req.models.Quiz.countDocuments({ isDeleted: false });

    res.json({
      plan: userPlan,
      expiresAt: req.user.planExpiresAt || null,
      limits: planConfig.limits,
      features: planConfig.features,
      usage: {
        notes: notesCount,
        documents: docsCount,
        flashcardDecks: flashcardsCount,
        quizzes: quizzesCount,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upgrade plan (mock mode)
router.post("/upgrade", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["free", "pro", "premium"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    // Since this is mock mode:
    // Simply update the user's plan directly in the database
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = plan;
    // Expire in 30 days for mock plan if not free
    user.planExpiresAt = plan !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    await user.save();

    res.json({
      message: `Successfully upgraded to ${plan} plan!`,
      plan: user.plan,
      expiresAt: user.planExpiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
