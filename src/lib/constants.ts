// Application-wide constants
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "STARVIS AI";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "2.0.0";

// Subscription Plans (mirrors server/config/plans.js)
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    limits: { aiRequestsPerDay: 10, notesMax: 20, documentsMax: 3, flashcardDecksMax: 5, quizzesPerDay: 3 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 299,
    limits: { aiRequestsPerDay: 100, notesMax: 500, documentsMax: 50, flashcardDecksMax: 100, quizzesPerDay: 30 },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 599,
    limits: { aiRequestsPerDay: -1, notesMax: -1, documentsMax: -1, flashcardDecksMax: -1, quizzesPerDay: -1 },
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Routes
export const ROUTES = {
  dashboard: "/",
  analytics: "/analytics",
  assignments: "/assignments",
  todo: "/todo",
  calendar: "/calendar",
  notes: "/notes",
  documents: "/documents",
  flashcards: "/flashcards",
  quiz: "/quiz",
  pomodoro: "/pomodoro",
  studyPlanner: "/study-planner",
  settings: "/settings",
  billing: "/billing",
} as const;
