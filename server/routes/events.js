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
      const { CalendarEvent } = req.models;
      const events = await CalendarEvent.find({ userId: req.user._id }).sort({ date: 1 });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(async (req, res) => {
    const { title, date, type, time, course } = req.body;
    try {
      const { CalendarEvent } = req.models;
      const calEvent = await CalendarEvent.create({
        userId: req.user._id,
        title,
        date,
        type,
        time,
        course,
      });
      res.status(201).json(calEvent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(async (req, res) => {
    try {
      const { CalendarEvent } = req.models;
      const calEvent = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
      if (calEvent) {
        calEvent.title = req.body.title !== undefined ? req.body.title : calEvent.title;
        calEvent.date = req.body.date !== undefined ? req.body.date : calEvent.date;
        calEvent.type = req.body.type !== undefined ? req.body.type : calEvent.type;
        calEvent.time = req.body.time !== undefined ? req.body.time : calEvent.time;
        calEvent.course = req.body.course !== undefined ? req.body.course : calEvent.course;

        const updatedEvent = await calEvent.save();
        res.json(updatedEvent);
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const { CalendarEvent } = req.models;
      const calEvent = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (calEvent) {
        res.json({ message: "Event removed" });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
