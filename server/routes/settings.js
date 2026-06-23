import express from "express";
import { protect } from "../middleware/auth.js";
import { getTenantModels } from "../middleware/tenant.js";

const router = express.Router();

// Apply auth protection and tenant resolution to all routes
router.use(protect);
router.use(getTenantModels);

router.route("/")
  .get(async (req, res) => {
    try {
      const { Settings } = req.models;
      let settings = await Settings.findOne({ userId: req.user._id });
      if (!settings) {
        settings = await Settings.create({
          userId: req.user._id,
          accent: "purple",
          notifications: true,
          studyReminders: true,
          assignmentAlerts: true,
          soundEffects: false,
          haptics: true,
          darkMode: true,
          aiPersonality: "friendly",
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const { Settings } = req.models;
      let settings = await Settings.findOne({ userId: req.user._id });

      if (!settings) {
        settings = new Settings({ userId: req.user._id });
      }

      settings.accent = req.body.accent !== undefined ? req.body.accent : settings.accent;
      settings.notifications = req.body.notifications !== undefined ? req.body.notifications : settings.notifications;
      settings.studyReminders = req.body.studyReminders !== undefined ? req.body.studyReminders : settings.studyReminders;
      settings.assignmentAlerts = req.body.assignmentAlerts !== undefined ? req.body.assignmentAlerts : settings.assignmentAlerts;
      settings.soundEffects = req.body.soundEffects !== undefined ? req.body.soundEffects : settings.soundEffects;
      settings.haptics = req.body.haptics !== undefined ? req.body.haptics : settings.haptics;
      settings.darkMode = req.body.darkMode !== undefined ? req.body.darkMode : settings.darkMode;
      settings.aiPersonality = req.body.aiPersonality !== undefined ? req.body.aiPersonality : settings.aiPersonality;

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
