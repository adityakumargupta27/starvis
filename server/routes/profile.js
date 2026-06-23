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
      const { StudyProfile } = req.models;
      let profile = await StudyProfile.findOne({ userId: req.user._id });
      if (!profile) {
        profile = await StudyProfile.create({
          userId: req.user._id,
          course: "",
          year: "",
          totalCourses: 12,
          dailyGoalHours: 4.5,
          studyStreakDays: 12,
          subjects: [
            { name: "Math", score: 85 },
            { name: "Science", score: 92 },
            { name: "History", score: 78 },
          ],
          weeklyHours: [
            { day: "Mon", study: 4,   procrastination: 1 },
            { day: "Tue", study: 3,   procrastination: 2 },
            { day: "Wed", study: 5,   procrastination: 1.5 },
            { day: "Thu", study: 2,   procrastination: 3 },
            { day: "Fri", study: 4.5, procrastination: 1 },
            { day: "Sat", study: 6,   procrastination: 0.5 },
          ],
          myCourses: [
            { name: "Mathematics",    progress: 75 },
            { name: "Web Development", progress: 50 },
            { name: "Chemistry",      progress: 86 },
          ],
        });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const { StudyProfile } = req.models;
      let profile = await StudyProfile.findOne({ userId: req.user._id });

      if (!profile) {
        profile = new StudyProfile({ userId: req.user._id });
      }

      profile.course = req.body.course !== undefined ? req.body.course : profile.course;
      profile.year = req.body.year !== undefined ? req.body.year : profile.year;
      profile.totalCourses = req.body.totalCourses !== undefined ? req.body.totalCourses : profile.totalCourses;
      profile.dailyGoalHours = req.body.dailyGoalHours !== undefined ? req.body.dailyGoalHours : profile.dailyGoalHours;
      profile.studyStreakDays = req.body.studyStreakDays !== undefined ? req.body.studyStreakDays : profile.studyStreakDays;
      profile.subjects = req.body.subjects !== undefined ? req.body.subjects : profile.subjects;
      profile.weeklyHours = req.body.weeklyHours !== undefined ? req.body.weeklyHours : profile.weeklyHours;
      profile.myCourses = req.body.myCourses !== undefined ? req.body.myCourses : profile.myCourses;

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;
