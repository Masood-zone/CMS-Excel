"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOwingUpdate = exports.scheduleOwingUpdate = void 0;
const client_1 = require("../db/client");
const logger_1 = require("../utils/logger");
const pendingUpdates = new Map();
const scheduleOwingUpdate = (students, delayMs) => {
    students.forEach((student) => {
        if (pendingUpdates.has(student.recordId)) {
            clearTimeout(pendingUpdates.get(student.recordId));
            pendingUpdates.delete(student.recordId);
        }
        const timeoutId = setTimeout(async () => {
            try {
                await updateStudentOwing(student);
                pendingUpdates.delete(student.recordId);
            }
            catch (error) {
                logger_1.logger.error(`Error updating owing for student ${student.studentId}:`, error);
            }
        }, delayMs);
        pendingUpdates.set(student.recordId, timeoutId);
        logger_1.logger.info(`Scheduled owing update for student ${student.studentId} (record ${student.recordId}) in ${delayMs / 1000} seconds`);
    });
};
exports.scheduleOwingUpdate = scheduleOwingUpdate;
const cancelOwingUpdate = (recordId) => {
    if (pendingUpdates.has(recordId)) {
        clearTimeout(pendingUpdates.get(recordId));
        pendingUpdates.delete(recordId);
        logger_1.logger.info(`Cancelled owing update for record ${recordId}`);
        return true;
    }
    return false;
};
exports.cancelOwingUpdate = cancelOwingUpdate;
const updateStudentOwing = async (student) => {
    const { studentId, recordId, currentOwing, settingsAmount } = student;
    const record = await client_1.prisma.record.findUnique({
        where: { id: recordId },
    });
    if (!record) {
        logger_1.logger.warn(`Record ${recordId} not found when updating owing`);
        return;
    }
    if (!record.hasPaid && !record.isAbsent) {
        const newOwingAmount = currentOwing + settingsAmount;
        await client_1.prisma.student.update({
            where: { id: studentId },
            data: { owing: newOwingAmount },
        });
        await client_1.prisma.record.update({
            where: { id: recordId },
            data: { owingAfter: newOwingAmount },
        });
        logger_1.logger.info(`Updated owing for student ${studentId}: ${currentOwing} -> ${newOwingAmount} (record ${recordId})`);
    }
    else {
        logger_1.logger.info(`Skipped owing update for student ${studentId} as record ${recordId} is now paid or absent`);
    }
};
//# sourceMappingURL=owing-service.js.map