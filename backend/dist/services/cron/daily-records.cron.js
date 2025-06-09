"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDailyRecordCreation = void 0;
const client_1 = require("@prisma/client");
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../../utils/logger");
const prisma = new client_1.PrismaClient();
const setupDailyRecordCreation = () => {
    const hours = process.env.DAILY_RECORD_HOUR || "06";
    const minutes = process.env.DAILY_RECORD_MINUTE || "00";
    node_cron_1.default.schedule(`${minutes} ${hours} * * *`, async () => {
        logger_1.logger.info("Running daily record creation job");
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const classes = await prisma.class.findMany({
                include: { students: true },
            });
            const settings = await prisma.settings.findFirst({
                where: { name: "amount" },
            });
            const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
            let createdRecords = 0;
            let skippedRecords = 0;
            let skippedOwingStudents = 0;
            for (const classItem of classes) {
                for (const student of classItem.students) {
                    try {
                        const currentStudent = await prisma.student.findUnique({
                            where: { id: student.id },
                        });
                        const currentOwing = (currentStudent === null || currentStudent === void 0 ? void 0 : currentStudent.owing) || 0;
                        if (currentOwing > 0) {
                            skippedOwingStudents++;
                            logger_1.logger.info(`Skipped record generation for student ${student.id} with owing amount ${currentOwing}`);
                            continue;
                        }
                        await prisma.record.create({
                            data: {
                                classId: classItem.id,
                                payedBy: student.id,
                                submitedAt: today,
                                amount: 0,
                                hasPaid: false,
                                isPrepaid: false,
                                isAbsent: false,
                                settingsAmount,
                                submitedBy: classItem.supervisorId || classItem.id,
                                owingBefore: currentOwing,
                                owingAfter: currentOwing,
                            },
                        });
                        createdRecords++;
                    }
                    catch (error) {
                        if (error.code === "P2002") {
                            skippedRecords++;
                        }
                        else {
                            throw error;
                        }
                    }
                }
            }
            logger_1.logger.info(`Daily record creation job completed successfully. Created: ${createdRecords}, Skipped due to existing records: ${skippedRecords}, Skipped due to owing: ${skippedOwingStudents}`);
        }
        catch (error) {
            logger_1.logger.error("Error in daily record creation job:", error);
        }
    });
};
exports.setupDailyRecordCreation = setupDailyRecordCreation;
//# sourceMappingURL=daily-records.cron.js.map