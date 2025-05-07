import type { Express } from "express";
import { authRoutes } from "./auth-routes";
import { userRoutes } from "./user-routes";
import { adminRoutes } from "./admin-routes";
import { classRoutes } from "./class-routes";
import { studentRoutes } from "./student-routes";
import { recordRoutes } from "./record-routes";
import { settingsRoutes } from "./settings-routes";
import { teacherRoutes } from "./teacher-routes";
import { expenseRoutes } from "./expense-routes";
import { referenceRoutes } from "./reference-routes";
import { analyticsRoutes } from "./analytics-routes";

export const setupRoutes = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use("/admins", adminRoutes);
  app.use("/users", userRoutes);
  app.use("/classes", classRoutes);
  app.use("/students", studentRoutes);
  app.use("/records", recordRoutes);
  app.use("/settings", settingsRoutes);
  app.use("/teachers", teacherRoutes);
  app.use("/expenses", expenseRoutes);
  app.use("/references", referenceRoutes);
  app.use("/analytics", analyticsRoutes);
};
