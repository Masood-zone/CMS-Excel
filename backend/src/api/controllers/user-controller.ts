import type { Request, Response } from "express";
import { userService } from "../../services/user-service";
import { catchAsync } from "../../utils/catch-async";

export const userController = {
  getAll: catchAsync(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(users);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const user = await userService.getUserById(id);
    res.json(user);
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const updatedUser = await userService.updateUser(id, req.body);
    res.json(updatedUser);
  }),

  delete: catchAsync(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  }),
};
