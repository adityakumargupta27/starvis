import mongoose from "mongoose";
import { todoSchema } from "../models/Todo.js";
import { calendarEventSchema } from "../models/CalendarEvent.js";
import { assignmentSchema } from "../models/Assignment.js";
import { studyProfileSchema } from "../models/StudyProfile.js";
import { settingsSchema } from "../models/Settings.js";

const getTenantModels = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Tenant resolution requires authentication" });
  }

  try {
    const dbName = `starvis_user_${req.user._id.toString()}`;
    // mongoose.connection.useDb caches connection instances
    const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });

    // Safely compile/retrieve models on the tenant connection to avoid OverwriteModelError
    req.models = {
      Todo: tenantDb.models.Todo || tenantDb.model("Todo", todoSchema),
      CalendarEvent: tenantDb.models.CalendarEvent || tenantDb.model("CalendarEvent", calendarEventSchema),
      Assignment: tenantDb.models.Assignment || tenantDb.model("Assignment", assignmentSchema),
      StudyProfile: tenantDb.models.StudyProfile || tenantDb.model("StudyProfile", studyProfileSchema),
      Settings: tenantDb.models.Settings || tenantDb.model("Settings", settingsSchema),
    };

    next();
  } catch (error) {
    console.error("Tenant Database Connection Error:", error);
    res.status(500).json({ message: "Database connection routing failed" });
  }
};

export { getTenantModels };
