/**
 * STARVIS AI — Subscription Plan Definitions
 * Payment mode is controlled by PAYMENT_MODE env var:
 *   "mock"       → all upgrades succeed instantly (dev/demo)
 *   "razorpay"   → plug in Razorpay credentials when ready
 *   "stripe"     → plug in Stripe credentials when ready
 */

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    interval: null,
    limits: {
      aiRequestsPerDay: 10,
      notesMax: 20,
      documentsMax: 3,
      flashcardDecksMax: 5,
      quizzesPerDay: 3,
      pomodoroSessions: true,  // unlimited
    },
    features: [
      "AI Chat (10 requests/day)",
      "AI Notes Generator",
      "3 PDF uploads",
      "5 Flashcard decks",
      "Quiz Generator (3/day)",
      "Pomodoro Timer",
      "Attendance Tracker",
      "CGPA Calculator",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: 299,
    currency: "INR",
    interval: "month",
    limits: {
      aiRequestsPerDay: 100,
      notesMax: 500,
      documentsMax: 50,
      flashcardDecksMax: 100,
      quizzesPerDay: 30,
      pomodoroSessions: true,
    },
    features: [
      "AI Chat (100 requests/day)",
      "Unlimited AI Notes",
      "50 PDF uploads with Chat",
      "Unlimited Flashcard decks",
      "Quiz Generator (30/day)",
      "AI Study Planner",
      "Focus Analytics",
      "Priority support",
    ],
  },

  premium: {
    id: "premium",
    name: "Premium",
    price: 599,
    currency: "INR",
    interval: "month",
    limits: {
      aiRequestsPerDay: -1,       // unlimited
      notesMax: -1,
      documentsMax: -1,
      flashcardDecksMax: -1,
      quizzesPerDay: -1,
      pomodoroSessions: true,
    },
    features: [
      "Everything in Pro",
      "Unlimited AI requests",
      "Unlimited PDF uploads",
      "AI Exam Predictor",
      "AI Career Guidance",
      "AI Resume Builder",
      "Advanced analytics",
      "Export everything",
    ],
  },
};

export const PLAN_IDS = Object.keys(PLANS);

/**
 * Check if a feature usage is within plan limits.
 * @param {string} planId - "free" | "pro" | "premium"
 * @param {string} limitKey - key in PLANS[planId].limits
 * @param {number} currentUsage - current count
 * @returns {boolean}
 */
export function isWithinLimit(planId, limitKey, currentUsage) {
  const plan = PLANS[planId] ?? PLANS.free;
  const limit = plan.limits[limitKey];
  if (limit === true || limit === -1) return true;   // unlimited
  return currentUsage < limit;
}

export const PAYMENT_MODE = process.env.PAYMENT_MODE ?? "mock";
