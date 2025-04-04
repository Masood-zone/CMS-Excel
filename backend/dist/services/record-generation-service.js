"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecordsForNewStudent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generateRecordsForNewStudent = async (studentId) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { class: true },
        });
        if (!student || !student.class) {
            console.error(`Student with id ${studentId} not found or not assigned to a class`);
            return;
        }
        const settings = await prisma.settings.findFirst({
            where: { name: "amount" },
        });
        const settingsAmount = settings ? parseInt(settings.value) : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
            },
        });
        console.log(`Record generated for new student ${studentId}`);
    }
    catch (error) {
        if (error.code !== "P2002") {
            console.error(`Error generating record for new student ${studentId}:`, error);
        }
    }
};
exports.generateRecordsForNewStudent = generateRecordsForNewStudent;
//# sourceMappingURL=record-generation-service.js.map