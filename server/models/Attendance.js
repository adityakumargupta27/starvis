import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
    subject: { type: String, required: true, trim: true },
    records: [
      {
        date: { type: String, required: true },
        status: { type: String, enum: ["present", "absent", "cancelled"], required: true },
        notes: { type: String, default: "" },
      },
    ],
    targetPercentage: { type: Number, default: 75 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, subject: 1, isDeleted: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export { attendanceSchema };
export default Attendance;
