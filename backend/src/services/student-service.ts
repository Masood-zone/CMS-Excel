import { studentRepository } from "../db/repositories/student-repository";
import { generateRecordsForNewStudent } from "./record-generation-service";
import { ApiError } from "../utils/api-error";

export const studentService = {
  getAllStudents: async () => {
    return studentRepository.findAll();
  },

  getStudentById: async (id: number) => {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    return student;
  },

  getStudentsByClassId: async (classId: number) => {
    return studentRepository.findByClassId(classId);
  },

  createStudent: async (studentData: {
    name: string;
    age: string | number;
    parentPhone?: string;
    gender?: string;
    classId?: number;
  }) => {
    const { name, age, parentPhone, gender, classId } = studentData;

    const newStudent = await studentRepository.create({
      name,
      age: typeof age === "string" ? Number.parseInt(age) : age,
      parentPhone,
      gender,
      class: classId ? { connect: { id: classId } } : undefined,
    });

    // Generate records for the new student
    await generateRecordsForNewStudent(newStudent.id);

    return newStudent;
  },

  updateStudent: async (
    id: number,
    studentData: {
      name?: string;
      age?: string | number;
      parentPhone?: string;
      gender?: string;
    }
  ) => {
    const { name, age, parentPhone, gender } = studentData;

    return studentRepository.update(id, {
      name,
      age:
        age !== undefined
          ? typeof age === "string"
            ? Number.parseInt(age)
            : age
          : undefined,
      parentPhone,
      gender,
    });
  },

  deleteStudent: async (id: number) => {
    return studentRepository.delete(id);
  },
};
