"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classController = void 0;
const class_service_1 = require("../../services/class-service");
const catch_async_1 = require("../../utils/catch-async");
exports.classController = {
    getAll: (0, catch_async_1.catchAsync)(async (req, res) => {
        const classes = await class_service_1.classService.getAllClasses();
        res.json(classes);
    }),
    getById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const classItem = await class_service_1.classService.getClassById(id);
        res.json(classItem);
    }),
    create: (0, catch_async_1.catchAsync)(async (req, res) => {
        const newClass = await class_service_1.classService.createClass(req.body);
        res.status(201).json(newClass);
    }),
    update: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const updatedClass = await class_service_1.classService.updateClass(id, req.body);
        res.json(updatedClass);
    }),
    delete: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await class_service_1.classService.deleteClass(id);
        res.status(204).send();
    }),
    assignTeacher: (0, catch_async_1.catchAsync)(async (req, res) => {
        const { name } = req.params;
        const { teacher_email } = req.body;
        const updatedClass = await class_service_1.classService.assignTeacher(name, teacher_email);
        res.status(200).json({
            message: "Teacher assigned successfully",
            updatedClass,
        });
    }),
    getClassBySupervisorId: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const classItem = await class_service_1.classService.getClassBySupervisorId(id);
        res.json({ supervisor: classItem });
    }),
};
//# sourceMappingURL=class-controller.js.map