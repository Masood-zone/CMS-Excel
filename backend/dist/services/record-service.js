"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordService = void 0;
const record_repository_1 = require("../db/repositories/record-repository");
const settings_repository_1 = require("../db/repositories/settings-repository");
const student_repository_1 = require("../db/repositories/student-repository");
const class_repository_1 = require("../db/repositories/class-repository");
const client_1 = require("@prisma/client");
const api_error_1 = require("../utils/api-error");
const client_2 = require("../db/client");
exports.recordService = {
    getAllRecords: async () => {
        return record_repository_1.recordRepository.findAll();
    },
    generateDailyRecords: async (options) => {
        const { classId, date } = options;
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);
        const settings = await settings_repository_1.settingsRepository.findByName("amount");
        const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
        const classes = classId
            ? [await class_repository_1.classRepository.findById(classId)]
            : await class_repository_1.classRepository.findAll();
        const createdRecords = [];
        const skippedRecords = [];
        for (const classItem of classes) {
            if (!classItem)
                continue;
            const students = await student_repository_1.studentRepository.findByClassId(classItem.id);
            for (const student of students) {
                try {
                    const record = await record_repository_1.recordRepository.create({
                        class: { connect: { id: classItem.id } },
                        student: { connect: { id: student.id } },
                        submitedAt: formattedDate,
                        amount: 0,
                        hasPaid: false,
                        isPrepaid: false,
                        isAbsent: false,
                        settingsAmount,
                        teacher: { connect: { id: classItem.supervisorId || 0 } },
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
                        throw error;
                    }
                }
            }
        }
        return {
            createdRecords: createdRecords.length,
            skippedRecords,
        };
    },
    getRecordsByClass: async (classId, date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        try {
            const studentsInClass = await student_repository_1.studentRepository.findByClassId(classId);
            const settings = await settings_repository_1.settingsRepository.findByName("amount");
            const settingsAmount = settings ? parseInt(settings.value) : 0;
            const existingRecords = await record_repository_1.recordRepository.findByClassAndDate(classId, date);
            const recordMap = new Map(existingRecords.map((record) => [record.payedBy, record]));
            const allRecords = await Promise.all(studentsInClass.map(async (student) => {
                let record = recordMap.get(student.id);
                if (!record) {
                    try {
                        record = await record_repository_1.recordRepository.create({
                            class: { connect: { id: classId } },
                            student: { connect: { id: student.id } },
                            submitedAt: startOfDay,
                            amount: 0,
                            hasPaid: false,
                            isPrepaid: false,
                            isAbsent: false,
                            settingsAmount,
                            teacher: { connect: { id: classId } },
                        });
                    }
                    catch (error) {
                        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                            error.code === "P2002") {
                            const foundRecord = await client_2.prisma.record.findFirst({
                                where: {
                                    classId,
                                    payedBy: student.id,
                                    submitedAt: {
                                        gte: startOfDay,
                                        lte: endOfDay,
                                    },
                                },
                                include: { student: true },
                            });
                            record = foundRecord || undefined;
                        }
                        else {
                            console.error(`Failed to create/fetch record for student ${student.id}:`, error);
                            return null;
                        }
                    }
                }
                return record;
            }));
            const validRecords = allRecords.filter((record) => record !== null);
            const unpaidStudents = validRecords.filter((record) => !record.hasPaid && !record.isAbsent);
            const paidStudents = validRecords.filter((record) => record.hasPaid);
            const absentStudents = validRecords.filter((record) => record.isAbsent);
            return { unpaidStudents, paidStudents, absentStudents };
        }
        catch (error) {
            console.error("Error in getRecordsByClass:", error);
            throw error;
        }
    },
    getStudentRecordsByClassAndDate: async (classId, date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return client_2.prisma.record.findMany({
            where: {
                classId,
                submitedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { student: true },
        });
    },
    getAllTeacherSubmittedRecords: async (date) => {
        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));
        const records = await client_2.prisma.record.findMany({
            where: {
                submitedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                class: true,
                student: true,
                teacher: true,
            },
        });
        const formattedRecords = records.reduce((acc, record) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            if (record.classId === null) {
                return acc;
            }
            if (!acc[record.classId]) {
                acc[record.classId] = {
                    classId: record.classId,
                    date: record.submitedAt.toISOString().split("T")[0],
                    paidStudents: [],
                    unpaidStudents: [],
                    absentStudents: [],
                    submittedBy: record.submitedBy,
                    teacher: {
                        id: ((_a = record.teacher) === null || _a === void 0 ? void 0 : _a.id) || 0,
                        name: ((_b = record.teacher) === null || _b === void 0 ? void 0 : _b.name) || "",
                    },
                    class: {
                        id: ((_c = record.class) === null || _c === void 0 ? void 0 : _c.id) || 0,
                        name: ((_d = record.class) === null || _d === void 0 ? void 0 : _d.name) || "",
                    },
                };
            }
            const studentRecord = {
                id: record.payedBy || 0,
                amount: record.settingsAmount || 0,
                paidBy: ((_e = record.payedBy) === null || _e === void 0 ? void 0 : _e.toString()) || "",
                hasPaid: record.hasPaid || false,
                date: record.submitedAt.toISOString().split("T")[0],
                name: ((_f = record.student) === null || _f === void 0 ? void 0 : _f.name) || "",
                class: ((_g = record.class) === null || _g === void 0 ? void 0 : _g.name) || "",
            };
            if (record.isAbsent) {
                (_j = (_h = acc[record.classId]) === null || _h === void 0 ? void 0 : _h.absentStudents) === null || _j === void 0 ? void 0 : _j.push(Object.assign(Object.assign({}, studentRecord), { amount_owing: record.settingsAmount || 0 }));
            }
            else if (record.hasPaid) {
                (_l = (_k = acc[record.classId]) === null || _k === void 0 ? void 0 : _k.paidStudents) === null || _l === void 0 ? void 0 : _l.push(studentRecord);
            }
            else {
                (_o = (_m = acc[record.classId]) === null || _m === void 0 ? void 0 : _m.unpaidStudents) === null || _o === void 0 ? void 0 : _o.push(studentRecord);
            }
            return acc;
        }, {});
        return Object.values(formattedRecords);
    },
    getTeacherSubmittedRecords: async (teacherId, date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const submittedRecords = await client_2.prisma.record.findMany({
            where: {
                submitedBy: teacherId,
                submitedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                class: true,
                student: true,
            },
        });
        const groupedRecords = submittedRecords.reduce((acc, record) => {
            if (record.classId !== null && !acc[record.classId]) {
                acc[record.classId] = {
                    id: record.id,
                    date: record.submitedAt,
                    class: record.class,
                    paidStudents: [],
                    unpaidStudents: [],
                    absentStudents: [],
                };
            }
            if (record.isAbsent) {
                if (record.classId !== null) {
                    acc[record.classId].absentStudents.push(record);
                }
            }
            else if (record.hasPaid) {
                if (record.classId !== null) {
                    acc[record.classId].paidStudents.push(record);
                }
            }
            else {
                if (record.classId !== null) {
                    acc[record.classId].unpaidStudents.push(record);
                }
            }
            return acc;
        }, {});
        return Object.values(groupedRecords);
    },
    submitTeacherRecord: async (recordData) => {
        const { classId, date, unpaidStudents, paidStudents, absentStudents, submittedBy, } = recordData;
        if (!classId ||
            !date ||
            !submittedBy ||
            !Array.isArray(unpaidStudents) ||
            !Array.isArray(paidStudents) ||
            !Array.isArray(absentStudents)) {
            throw new api_error_1.ApiError(400, "Invalid input data");
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new api_error_1.ApiError(400, "Invalid date");
        }
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const allStudents = [...unpaidStudents, ...paidStudents, ...absentStudents];
        const updatedRecords = await client_2.prisma.$transaction(allStudents.map((student) => {
            var _a, _b;
            return client_2.prisma.record.upsert({
                where: {
                    payedBy_submitedAt: {
                        payedBy: parseInt(student.paidBy),
                        submitedAt: startOfDay,
                    },
                },
                update: {
                    amount: student.amount || student.amount_owing || 0,
                    hasPaid: student.hasPaid,
                    isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
                    submitedBy: submittedBy,
                },
                create: {
                    classId: parseInt(classId.toString()),
                    payedBy: parseInt(student.paidBy),
                    submitedAt: startOfDay,
                    amount: (_b = (_a = student.amount) !== null && _a !== void 0 ? _a : student.amount_owing) !== null && _b !== void 0 ? _b : 0,
                    hasPaid: student.hasPaid,
                    isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
                    submitedBy: submittedBy,
                    settingsAmount: student.amount || student.amount_owing,
                },
            });
        }));
        return updatedRecords;
    },
    updateStudentStatus: async (id, statusData) => {
        const { hasPaid, isAbsent } = statusData;
        if (typeof hasPaid !== "boolean" || typeof isAbsent !== "boolean") {
            throw new api_error_1.ApiError(400, "Invalid input data");
        }
        return record_repository_1.recordRepository.updateStudentStatus(id, { hasPaid, isAbsent });
    },
    updateRecord: async (id, recordData) => {
        const { amount, submitedBy, payedBy, isPrepaid, hasPaid, classId, isAbsent, } = recordData;
        return record_repository_1.recordRepository.update(id, {
            amount: amount !== undefined
                ? typeof amount === "string"
                    ? parseInt(amount)
                    : amount
                : undefined,
            submitedAt: submitedBy !== undefined
                ? typeof submitedBy === "string"
                    ? new Date(submitedBy)
                    : new Date(submitedBy)
                : undefined,
            isPrepaid: isPrepaid !== undefined ? Boolean(isPrepaid) : undefined,
            hasPaid: hasPaid !== undefined ? Boolean(hasPaid) : undefined,
            class: classId !== undefined
                ? {
                    connect: {
                        id: typeof classId === "string" ? parseInt(classId) : classId,
                    },
                }
                : undefined,
            isAbsent: isAbsent !== undefined ? Boolean(isAbsent) : undefined,
        });
    },
    deleteRecord: async (id) => {
        return record_repository_1.recordRepository.delete(id);
    },
};
//# sourceMappingURL=record-service.js.map