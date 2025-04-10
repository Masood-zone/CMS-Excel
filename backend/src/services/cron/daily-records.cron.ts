import { PrismaClient, type Prisma } from "@prisma/client";
import cron from "node-cron";
import { logger } from "../../utils/logger";

const prisma = new PrismaClient();

export const setupDailyRecordCreation = () => {
  // Schedule the job to run every day at 11:11 PM
  cron.schedule("10 11 * * *", async () => {
    logger.info("Running daily record creation job");

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

      for (const classItem of classes) {
        for (const student of classItem.students) {
          try {
            // Get current owing amount for the student
            const currentStudent = await prisma.student.findUnique({
              where: { id: student.id },
            });

            const currentOwing = currentStudent?.owing || 0;

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
                // Add the owing fields
                owingBefore: currentOwing,
                owingAfter: currentOwing, // Initially the same as owingBefore
              },
            });
            createdRecords++;
          } catch (error) {
            if (
              (error as Prisma.PrismaClientKnownRequestError).code === "P2002"
            ) {
              skippedRecords++;
            } else {
              throw error;
            }
          }
        }
      }

      logger.info(
        `Daily record creation job completed successfully. Created: ${createdRecords}, Skipped: ${skippedRecords}`
      );
    } catch (error) {
      logger.error("Error in daily record creation job:", error);
    }
  });
};
