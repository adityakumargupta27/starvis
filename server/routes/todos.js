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
      const { Todo } = req.models;
      const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(async (req, res) => {
    const { text, priority, category, completed } = req.body;
    try {
      const { Todo } = req.models;
      const todo = await Todo.create({
        userId: req.user._id,
        text,
        priority,
        category,
        completed: completed || false,
      });
      res.status(201).json(todo);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route("/completed/clear")
  .delete(async (req, res) => {
    try {
      const { Todo } = req.models;
      await Todo.deleteMany({ userId: req.user._id, completed: true });
      res.json({ message: "Completed tasks cleared" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(async (req, res) => {
    try {
      const { Todo } = req.models;
      const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
      if (todo) {
        todo.text = req.body.text !== undefined ? req.body.text : todo.text;
        todo.completed = req.body.completed !== undefined ? req.body.completed : todo.completed;
        todo.priority = req.body.priority !== undefined ? req.body.priority : todo.priority;
        todo.category = req.body.category !== undefined ? req.body.category : todo.category;

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const { Todo } = req.models;
      const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (todo) {
        res.json({ message: "Task removed" });
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
