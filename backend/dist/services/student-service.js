"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = void 0;
const student_repository_1 = require("../db/repositories/student-repository");
const record_generation_service_1 = require("./record-generation-service");
const api_error_1 = require("../utils/api-error");
const client_1 = require("../db/client");
exports.studentService = {
    getAllStudents: async () => {
        return student_repository_1.studentRepository.findAll();
    },
    getStudentById: async (id) => {
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student) {
            throw new api_error_1.ApiError(404, "Student not found");
        }
        return student;
    },
    getStudentsByClassId: async (classId) => {
        return student_repository_1.studentRepository.findByClassId(classId);
    },
    createStudent: async (studentData) => {
        const { name, age, parentPhone, gender, classId } = studentData;
        const newStudent = await student_repository_1.studentRepository.create({
            name,
            age: typeof age === "string" ? Number.parseInt(age) : age,
            parentPhone,
            gender,
            class: classId ? { connect: { id: classId } } : undefined,
        });
        await (0, record_generation_service_1.generateRecordsForNewStudent)(newStudent.id);
        return newStudent;
    },
    updateStudent: async (id, studentData) => {
        const { name, age, parentPhone, gender } = studentData;
        return student_repository_1.studentRepository.update(id, {
            name,
            age: age !== undefined
                ? typeof age === "string"
                    ? Number.parseInt(age)
                    : age
                : undefined,
            parentPhone,
            gender,
        });
    },
    getStudentOwingDetails: async (id) => {
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student) {
            throw new api_error_1.ApiError(404, "Student not found");
        }
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const allRecords = await client_1.prisma.record.findMany({
            where: {
                payedBy: id,
                submitedAt: {
                    gte: ninetyDaysAgo,
                },
            },
            orderBy: {
                submitedAt: "desc",
            },
        });
        const owingHistoryRecords = allRecords.filter((record) => record.owingBefore !== record.owingAfter ||
            record.amount > 0 ||
            record.hasPaid);
        return {
            student,
            currentOwing: student.owing,
            owingHistory: owingHistoryRecords.map((record) => ({
                id: record.id,
                date: record.submitedAt,
                hasPaid: record.hasPaid,
                isAbsent: record.isAbsent,
                amountPaid: record.amount,
                owingBefore: record.owingBefore,
                owingAfter: record.owingAfter,
                settingsAmount: record.settingsAmount,
                description: getOwingRecordDescription(record),
            })),
        };
    },
    payStudentOwing: async (id, amount) => {
        var _a;
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student) {
            throw new api_error_1.ApiError(404, "Student not found");
        }
        if (amount <= 0) {
            throw new api_error_1.ApiError(400, "Payment amount must be greater than zero");
        }
        const currentOwing = student.owing;
        const newOwingAmount = Math.max(0, currentOwing - amount);
        const excessPayment = currentOwing < amount ? amount - currentOwing : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const settings = await client_1.prisma.settings.findFirst({
            where: { name: "amount" },
        });
        const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
        const existingRecord = await client_1.prisma.record.findFirst({
            where: {
                payedBy: id,
                submitedAt: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
        });
        const paymentDescription = excessPayment > 0
            ? `Payment of ${amount} GHC against owing of ${currentOwing} GHC (excess: ${excessPayment} GHC)`
            : `Payment of ${amount} GHC against owing of ${currentOwing} GHC`;
        if (existingRecord) {
            await client_1.prisma.record.update({
                where: { id: existingRecord.id },
                data: {
                    amount: existingRecord.amount + amount,
                    hasPaid: true,
                    owingBefore: currentOwing,
                    owingAfter: newOwingAmount,
                    description: paymentDescription,
                },
            });
        }
        else {
            await client_1.prisma.record.create({
                data: {
                    classId: student.classId,
                    payedBy: student.id,
                    submitedAt: today,
                    amount: amount,
                    hasPaid: true,
                    isPrepaid: false,
                    isAbsent: false,
                    settingsAmount,
                    submitedBy: student.classId
                        ? ((_a = (await client_1.prisma.class.findUnique({
                            where: { id: student.classId },
                        }))) === null || _a === void 0 ? void 0 : _a.supervisorId) || 0
                        : 0,
                    owingBefore: currentOwing,
                    owingAfter: newOwingAmount,
                    description: paymentDescription,
                },
            });
        }
        await student_repository_1.studentRepository.update(id, {
            owing: newOwingAmount,
        });
        return {
            student: Object.assign(Object.assign({}, student), { owing: newOwingAmount }),
            paymentAmount: amount,
            previousOwing: currentOwing,
            newOwing: newOwingAmount,
            excessPayment: excessPayment,
            fullyPaid: newOwingAmount === 0,
        };
    },
    getOwingStudentsByClassId: async (classId) => {
        const owingStudents = await client_1.prisma.student.findMany({
            where: {
                classId,
                owing: {
                    gt: 0,
                },
            },
            include: {
                class: true,
            },
            orderBy: {
                owing: "desc",
            },
        });
        const totalOwing = owingStudents.reduce((sum, student) => sum + student.owing, 0);
        return {
            owingStudents,
            totalOwing,
            count: owingStudents.length,
        };
    },
    getAllOwingStudents: async () => {
        return client_1.prisma.student.findMany({
            where: {
                owing: {
                    gt: 0,
                },
            },
            orderBy: {
                owing: "desc",
            },
            include: {
                class: true,
            },
        });
    },
    deleteStudent: async (id) => {
        return student_repository_1.studentRepository.delete(id);
    },
};
function getOwingRecordDescription(record) {
    if (record.description) {
        return record.description;
    }
    if (record.hasPaid && record.amount > 0) {
        if (record.owingBefore > record.owingAfter) {
            return `Payment of ${record.amount} against owing balance`;
        }
        else {
            return `Regular payment of ${record.amount}`;
        }
    }
    else if (record.isAbsent) {
        return "Marked as absent";
    }
    else if (record.owingAfter > record.owingBefore) {
        return `Owing increased by ${record.owingAfter - record.owingBefore}`;
    }
    else if (record.owingBefore > record.owingAfter) {
        return `Owing decreased by ${record.owingBefore - record.owingAfter}`;
    }
    else {
        return "No change in owing amount";
    }
}
//# sourceMappingURL=student-service.js.map