import mongoose from "mongoose";

const calendarEventSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    type: {
      type: String,
      enum: ["exam", "assignment", "study", "class"],
      required: true,
    },
    time: {
      type: String,
    },
    course: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

calendarEventSchema.index({ userId: 1, date: 1 });

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

export { calendarEventSchema };
export default CalendarEvent;
