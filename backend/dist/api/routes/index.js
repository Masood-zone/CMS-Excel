"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_routes_1 = require("./auth-routes");
const user_routes_1 = require("./user-routes");
const class_routes_1 = require("./class-routes");
const student_routes_1 = require("./student-routes");
const record_routes_1 = require("./record-routes");
const settings_routes_1 = require("./settings-routes");
const teacher_routes_1 = require("./teacher-routes");
const expense_routes_1 = require("./expense-routes");
const reference_routes_1 = require("./reference-routes");
const analytics_routes_1 = require("./analytics-routes");
const setupRoutes = (app) => {
    app.use("/auth", auth_routes_1.authRoutes);
    app.use("/users", user_routes_1.userRoutes);
    app.use("/classes", class_routes_1.classRoutes);
    app.use("/students", student_routes_1.studentRoutes);
    app.use("/records", record_routes_1.recordRoutes);
    app.use("/settings", settings_routes_1.settingsRoutes);
    app.use("/teachers", teacher_routes_1.teacherRoutes);
    app.use("/expenses", expense_routes_1.expenseRoutes);
    app.use("/references", reference_routes_1.referenceRoutes);
    app.use("/analytics", analytics_routes_1.analyticsRoutes);
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map