import { classRepository } from "../db/repositories/class-repository";
import { userRepository } from "../db/repositories/user-repository";
import { ApiError } from "../utils/api-error";

export const classService = {
  getAllClasses: async () => {
    return classRepository.findAll();
  },

  getClassById: async (id: number) => {
    const classItem = await classRepository.findById(id);
    if (!classItem) {
      throw new ApiError(404, "Class not found");
    }
    return classItem;
  },

  createClass: async (classData: {
    name: string;
    description?: string;
    supervisorId?: number | string;
  }) => {
    const { name, description, supervisorId } = classData;

    return classRepository.create({
      name,
      description,
      supervisor: supervisorId
        ? {
            connect: {
              id:
                typeof supervisorId === "string"
                  ? Number.parseInt(supervisorId)
                  : supervisorId,
            },
          }
        : undefined,
    });
  },

  updateClass: async (
    id: number,
    classData: {
      name?: string;
      description?: string;
      supervisorId?: number | string;
    }
  ) => {
    const { name, description, supervisorId } = classData;

    return classRepository.update(id, {
      name,
      description,
      supervisor: supervisorId
        ? {
            connect: {
              id:
                typeof supervisorId === "string"
                  ? Number.parseInt(supervisorId)
                  : supervisorId,
            },
          }
        : undefined,
    });
  },

  deleteClass: async (id: number) => {
    return classRepository.delete(id);
  },

  assignTeacher: async (className: string, teacherEmail: string) => {
    if (!className || !teacherEmail) {
      throw new ApiError(400, "Class name and teacher email are required");
    }

    const teacher = await userRepository.findByEmail(teacherEmail);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    return classRepository.assignTeacher(className, teacher.id);
  },

  getClassBySupervisorId: async (supervisorId: number) => {
    return classRepository.findBySupervisorId(supervisorId);
  },
};
