import { useState, useEffect } from "react";

export interface StudyProfile {
  name: string;
  course: string;
  year: string;
  totalCourses: number;
  dailyGoalHours: number;
  studyStreakDays: number;
  subjects: { name: string; score: number }[];
  weeklyHours: { day: string; study: number; procrastination: number }[];
  myCourses: { name: string; progress: number }[];
}

// Original hardcoded data — shown by default, user can override via "Edit data"
const DEFAULT_PROFILE: StudyProfile = {
  name: "",
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
};

const STORAGE_KEY = "starvis_study_profile";

export function useStudyProfile() {
  // Always start with defaults so dashboard is never blank
  const [profile, setProfile] = useState<StudyProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Merge saved data on top of defaults so new fields don't go missing
        const parsed = JSON.parse(raw) as Partial<StudyProfile>;
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore parse errors — fall back to defaults
    }
  }, []);

  const saveProfile = (updates: Partial<StudyProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
  };

  return { profile, saveProfile, resetProfile };
}
