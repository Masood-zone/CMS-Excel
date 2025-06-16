import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { ApiError } from "../../utils/api-error";
import multer from "multer";
import { importService } from "../../services/import-service";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith(".xlsx") ||
      file.originalname.toLowerCase().endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

export const importController = {
  uploadMiddleware: upload.single("file"),

  importStudents: catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const { classId } = req.body;
    const userId = req.params.id;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const result = await importService.importStudentsFromExcel(
      req.file.buffer,
      req.file.originalname,
      classId ? Number.parseInt(classId) : undefined,
      userId ? Number.parseInt(userId) : undefined
    );

    res.json(result);
  }),
};
