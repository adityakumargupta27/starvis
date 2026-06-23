import express from "express";
import { protect } from "../../middleware/auth.js";

const router = express.Router();
router.use(protect);

/**
 * POST /api/v1/cgpa/calculate
 * Body: { semesters: [{ credits, grade }][] }
 * Returns: current CGPA
 */
router.post("/calculate", (req, res) => {
  try {
    const { semesters } = req.body;
    if (!Array.isArray(semesters) || semesters.length === 0) {
      return res.status(400).json({ message: "semesters array is required" });
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const sem of semesters) {
      for (const course of sem.courses ?? []) {
        const { credits, grade } = course;
        const points = gradeToPoints(grade);
        totalPoints += points * credits;
        totalCredits += credits;
      }
    }

    const cgpa = totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;
    res.json({ cgpa, totalCredits, totalPoints: +totalPoints.toFixed(2) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/v1/cgpa/predict
 * Body: { currentCGPA, completedCredits, targetCGPA, remainingCredits }
 * Returns: required GPA for remaining semesters
 */
router.post("/predict", (req, res) => {
  try {
    const { currentCGPA, completedCredits, targetCGPA, remainingCredits } = req.body;
    if (currentCGPA == null || completedCredits == null || targetCGPA == null || remainingCredits == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const totalCredits = completedCredits + remainingCredits;
    const currentPoints = currentCGPA * completedCredits;
    const targetPoints = targetCGPA * totalCredits;
    const requiredPoints = targetPoints - currentPoints;
    const requiredGPA = remainingCredits > 0 ? +(requiredPoints / remainingCredits).toFixed(2) : null;

    const achievable = requiredGPA !== null && requiredGPA <= 10;

    res.json({
      requiredGPA,
      achievable,
      message: achievable
        ? `You need ${requiredGPA}/10 in remaining semesters to hit ${targetCGPA} CGPA.`
        : `Target of ${targetCGPA} CGPA is not achievable with remaining ${remainingCredits} credits.`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Grade → GPA point conversion (10-point scale, common in Indian universities)
function gradeToPoints(grade) {
  const table = {
    O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0,
    // Percentage to points fallback
  };
  if (table[grade] !== undefined) return table[grade];
  // Numeric grade support
  const num = parseFloat(grade);
  if (!isNaN(num)) return num;
  return 0;
}

export default router;
