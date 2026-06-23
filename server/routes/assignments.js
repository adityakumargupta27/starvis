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
      const { Assignment } = req.models;
      const assignments = await Assignment.find({ userId: req.user._id }).sort({ dueDate: 1 });
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(async (req, res) => {
    const { course, assignment, dueDate, status, priority } = req.body;
    try {
      const { Assignment } = req.models;
      const dbAssignment = await Assignment.create({
        userId: req.user._id,
        course,
        assignment,
        dueDate,
        status,
        priority,
      });
      res.status(201).json(dbAssignment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(async (req, res) => {
    try {
      const { Assignment } = req.models;
      const dbAssignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
      if (dbAssignment) {
        dbAssignment.course = req.body.course !== undefined ? req.body.course : dbAssignment.course;
        dbAssignment.assignment = req.body.assignment !== undefined ? req.body.assignment : dbAssignment.assignment;
        dbAssignment.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : dbAssignment.dueDate;
        dbAssignment.status = req.body.status !== undefined ? req.body.status : dbAssignment.status;
        dbAssignment.priority = req.body.priority !== undefined ? req.body.priority : dbAssignment.priority;

        const updatedAssignment = await dbAssignment.save();
        res.json(updatedAssignment);
      } else {
        res.status(404).json({ message: "Assignment not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const { Assignment } = req.models;
      const dbAssignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (dbAssignment) {
        res.json({ message: "Assignment removed" });
      } else {
        res.status(404).json({ message: "Assignment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
