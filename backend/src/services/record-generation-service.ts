import { PrismaClient, type Prisma } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

export const generateRecordsForNewStudent = async (studentId: number) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || !student.class) {
      logger.error(
        `Student with id ${studentId} not found or not assigned to a class`
      );
      return;
    }

    // Skip record generation if student has owing amount
    if (student.owing > 0) {
      logger.info(
        `Skipped record generation for new student ${studentId} with owing amount ${student.owing}`
      );
      return;
    }

    const settings = await prisma.settings.findFirst({
      where: { name: "amount" },
    });

    const settingsAmount = settings ? Number.parseInt(settings.value) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current owing amount (should be 0 for new students)
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
        owingAfter: currentOwing, // Initially the same as owingBefore
      },
    });

    logger.info(`Record generated for new student ${studentId}`);
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code !== "P2002") {
      logger.error(
        `Error generating record for new student ${studentId}:`,
        error
      );
    }
  }
};

export const generateDailyRecords = async (options: {
  classId?: number;
  date: Date;
  skipOwingUpdate?: boolean;
}) => {
  const { classId, date, skipOwingUpdate = false } = options;
  const formattedDate = new Date(date);
  formattedDate.setHours(0, 0, 0, 0);

  // Get the settings amount
  const settings = await prisma.settings.findFirst({
    where: { name: "amount" },
  });
  const settingsAmount = settings ? Number.parseInt(settings.value) : 0;

  // Get classes based on the query
  const classes = classId
    ? [await prisma.class.findUnique({ where: { id: classId } })]
    : await prisma.class.findMany();

  const createdRecords = [];
  const skippedRecords = [];
  const skippedOwingStudents = [];
  const updatedOwings = [];

  // Generate records for each student in each class
  for (const classItem of classes) {
    if (!classItem) continue;

    const students = await prisma.student.findMany({
      where: { classId: classItem.id },
    });

    // First, update owing amounts for students who didn't pay yesterday
    const yesterday = new Date(formattedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get yesterday's records
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

    // Skip owing update if requested
    if (!skipOwingUpdate) {
      // Update owing amounts for students who didn't pay yesterday
      for (const record of yesterdayRecords) {
        if (!record.hasPaid && !record.isAbsent && record.student) {
          // If student didn't pay yesterday and wasn't absent, add to their owing
          const newOwingAmount =
            record.student.owing + (record.settingsAmount || 0);

          await prisma.student.update({
            where: { id: record.student.id },
            data: { owing: newOwingAmount },
          });

          // Update yesterday's record to reflect the new owing amount
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

    // Now create today's records with updated owing amounts
    for (const student of students) {
      try {
        // Get the current owing amount for this student
        const currentStudent = await prisma.student.findUnique({
          where: { id: student.id },
        });

        const currentOwing = currentStudent?.owing || 0;

        // Skip record generation for students who are owing
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
            owingAfter: currentOwing, // Initially the same as owingBefore
          },
        });

        createdRecords.push(record);
      } catch (error) {
        // If a record already exists for this student on this day, skip it
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
          skippedRecords.push({
            studentId: student.id,
            date: formattedDate.toString(),
          });
        } else {
          logger.error(`Error creating record: ${error}`);
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
