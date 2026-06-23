import mongoose from "mongoose";

const studyProfileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    course: {
      type: String,
      default: "",
    },
    year: {
      type: String,
      default: "",
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    dailyGoalHours: {
      type: Number,
      default: 0,
    },
    studyStreakDays: {
      type: Number,
      default: 0,
    },
    subjects: [
      {
        name: String,
        score: Number,
      },
    ],
    weeklyHours: [
      {
        day: String,
        study: Number,
        procrastination: Number,
      },
    ],
    myCourses: [
      {
        name: String,
        progress: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const StudyProfile = mongoose.model("StudyProfile", studyProfileSchema);

export { studyProfileSchema };
export default StudyProfile;
