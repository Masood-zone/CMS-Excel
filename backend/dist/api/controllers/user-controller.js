"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("../../services/user-service");
const catch_async_1 = require("../../utils/catch-async");
exports.userController = {
    getAll: (0, catch_async_1.catchAsync)(async (req, res) => {
        const users = await user_service_1.userService.getAllUsers();
        res.json(users);
    }),
    getById: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const user = await user_service_1.userService.getUserById(id);
        res.json(user);
    }),
    update: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        const updatedUser = await user_service_1.userService.updateUser(id, req.body);
        res.json(updatedUser);
    }),
    delete: (0, catch_async_1.catchAsync)(async (req, res) => {
        const id = Number.parseInt(req.params.id);
        await user_service_1.userService.deleteUser(id);
        res.status(204).send();
    }),
};
//# sourceMappingURL=user-controller.js.map