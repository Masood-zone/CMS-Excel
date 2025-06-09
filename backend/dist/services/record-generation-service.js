"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyRecords = exports.generateRecordsForNewStudent = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const generateRecordsForNewStudent = async (studentId) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { class: true },
        });
        if (!student || !student.class) {
            logger_1.logger.error(`Student with id ${studentId} not found or not assigned to a class`);
            return;
        }
        if (student.owing > 0) {
            logger_1.logger.info(`Skipped record generation for new student ${studentId} with owing amount ${student.owing}`);
            return;
        }
        const settings = await prisma.settings.findFirst({
            where: { name: "amount" },
        });
        const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentOwing = student.owing || 0;
        await prisma.record.create({
            data: {
                classId: student.class.id,
                payedBy: student.id,
                submitedAt: today,
                amount: 0,
                hasPaid: false,
                isPrepaid: false,
                isAbsent: false,
                settingsAmount,
                submitedBy: student.class.supervisorId || student.class.id,
                owingBefore: currentOwing,
                owingAfter: currentOwing,
            },
        });
        logger_1.logger.info(`Record generated for new student ${studentId}`);
    }
    catch (error) {
        if (error.code !== "P2002") {
            logger_1.logger.error(`Error generating record for new student ${studentId}:`, error);
        }
    }
};
exports.generateRecordsForNewStudent = generateRecordsForNewStudent;
const generateDailyRecords = async (options) => {
    const { classId, date, skipOwingUpdate = false } = options;
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);
    const settings = await prisma.settings.findFirst({
        where: { name: "amount" },
    });
    const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
    const classes = classId
        ? [await prisma.class.findUnique({ where: { id: classId } })]
        : await prisma.class.findMany();
    const createdRecords = [];
    const skippedRecords = [];
    const skippedOwingStudents = [];
    const updatedOwings = [];
    for (const classItem of classes) {
        if (!classItem)
            continue;
        const students = await prisma.student.findMany({
            where: { classId: classItem.id },
        });
        const yesterday = new Date(formattedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const yesterdayRecords = await prisma.record.findMany({
            where: {
                classId: classItem.id,
                submitedAt: {
                    gte: yesterday,
                    lte: yesterdayEnd,
                },
            },
            include: { student: true },
        });
        if (!skipOwingUpdate) {
            for (const record of yesterdayRecords) {
                if (!record.hasPaid && !record.isAbsent && record.student) {
                    const newOwingAmount = record.student.owing + (record.settingsAmount || 0);
                    await prisma.student.update({
                        where: { id: record.student.id },
                        data: { owing: newOwingAmount },
                    });
                    await prisma.record.update({
                        where: { id: record.id },
                        data: { owingAfter: newOwingAmount },
                    });
                    updatedOwings.push({
                        studentId: record.student.id,
                        previousOwing: record.student.owing,
                        newOwing: newOwingAmount,
                    });
                }
            }
        }
        for (const student of students) {
            try {
                const currentStudent = await prisma.student.findUnique({
                    where: { id: student.id },
                });
                const currentOwing = (currentStudent === null || currentStudent === void 0 ? void 0 : currentStudent.owing) || 0;
                if (currentOwing > 0) {
                    skippedOwingStudents.push({
                        studentId: student.id,
                        owing: currentOwing,
                    });
                    continue;
                }
                const record = await prisma.record.create({
                    data: {
                        classId: classItem.id,
                        payedBy: student.id,
                        submitedAt: formattedDate,
                        amount: 0,
                        hasPaid: false,
                        isPrepaid: false,
                        isAbsent: false,
                        settingsAmount,
                        submitedBy: classItem.supervisorId || 0,
                        owingBefore: currentOwing,
                        owingAfter: currentOwing,
                    },
                });
                createdRecords.push(record);
            }
            catch (error) {
                if (error.code === "P2002") {
                    skippedRecords.push({
                        studentId: student.id,
                        date: formattedDate.toString(),
                    });
                }
                else {
                    logger_1.logger.error(`Error creating record: ${error}`);
                    throw error;
                }
            }
        }
    }
    return {
        createdRecords: createdRecords.length,
        skippedRecords,
        skippedOwingStudents,
        updatedOwings,
    };
};
exports.generateDailyRecords = generateDailyRecords;
//# sourceMappingURL=record-generation-service.js.map