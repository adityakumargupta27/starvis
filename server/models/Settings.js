import mongoose from "mongoose";

const settingsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    accent: {
      type: String,
      enum: ["purple", "blue", "green", "orange", "pink"],
      default: "purple",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    studyReminders: {
      type: Boolean,
      default: true,
    },
    assignmentAlerts: {
      type: Boolean,
      default: true,
    },
    soundEffects: {
      type: Boolean,
      default: false,
    },
    haptics: {
      type: Boolean,
      default: true,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
    aiPersonality: {
      type: String,
      enum: ["friendly", "professional", "motivating"],
      default: "friendly",
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export { settingsSchema };
export default Settings;
