import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudyProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const data = await api.get("/profile");
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch study profile from server, falling back to localStorage", err);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<StudyProfile>;
            setProfile((prev) => ({ ...prev, ...parsed }));
          }
        } catch {
          // ignore localStorage parsing errors
        }
      }
    };

    fetchProfile();
  }, [user]);

  const saveProfile = async (updates: Partial<StudyProfile>) => {
    const optimisticProfile = { ...profile, ...updates };
    setProfile(optimisticProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optimisticProfile));

    if (user) {
      try {
        const saved = await api.put<StudyProfile>("/profile", updates);
        setProfile((prev) => ({ ...prev, ...saved }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        return saved;
      } catch (err) {
        console.error("Failed to save study profile to server", err);
        throw err;
      }
    }

    return optimisticProfile;
  };

  const resetProfile = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);

    if (user) {
      try {
        await api.put("/profile", DEFAULT_PROFILE);
      } catch (err) {
        console.error("Failed to reset study profile on server", err);
      }
    }
  };

  return { profile, saveProfile, resetProfile };
}
