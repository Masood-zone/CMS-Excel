import { prisma } from "../db/client";
import { logger } from "../utils/logger";

// Type for student owing update data
interface StudentOwingUpdate {
  studentId: number;
  recordId: number;
  currentOwing: number;
  settingsAmount: number;
}

// Store for pending owing updates
const pendingUpdates: Map<number, NodeJS.Timeout> = new Map();

/**
 * Schedule an owing update for students after a delay
 * @param students Array of student data to update
 * @param delayMs Delay in milliseconds before updating
 */
export const scheduleOwingUpdate = (
  students: StudentOwingUpdate[],
  delayMs: number
) => {
  students.forEach((student) => {
    // Cancel any existing update for this record
    if (pendingUpdates.has(student.recordId)) {
      clearTimeout(pendingUpdates.get(student.recordId));
      pendingUpdates.delete(student.recordId);
    }

    // Schedule new update
    const timeoutId = setTimeout(async () => {
      try {
        await updateStudentOwing(student);
        pendingUpdates.delete(student.recordId);
      } catch (error) {
        logger.error(
          `Error updating owing for student ${student.studentId}:`,
          error
        );
      }
    }, delayMs);

    pendingUpdates.set(student.recordId, timeoutId);
    logger.info(
      `Scheduled owing update for student ${student.studentId} (record ${
        student.recordId
      }) in ${delayMs / 1000} seconds`
    );
  });
};

/**
 * Cancel a scheduled owing update for a record
 * @param recordId The record ID to cancel updates for
 */
export const cancelOwingUpdate = (recordId: number) => {
  if (pendingUpdates.has(recordId)) {
    clearTimeout(pendingUpdates.get(recordId));
    pendingUpdates.delete(recordId);
    logger.info(`Cancelled owing update for record ${recordId}`);
    return true;
  }
  return false;
};

/**
 * Update a student's owing amount and the record
 * @param student Student data to update
 */
const updateStudentOwing = async (student: StudentOwingUpdate) => {
  const { studentId, recordId, currentOwing, settingsAmount } = student;

  // Get the current record to make sure it's still unpaid and not absent
  const record = await prisma.record.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    logger.warn(`Record ${recordId} not found when updating owing`);
    return;
  }

  // Only update if the record is still unpaid and not absent
  if (!record.hasPaid && !record.isAbsent) {
    // Calculate new owing amount
    const newOwingAmount = currentOwing + settingsAmount;

    // Update student's owing amount
    await prisma.student.update({
      where: { id: studentId },
      data: { owing: newOwingAmount },
    });

    // Update record's owingAfter field
    await prisma.record.update({
      where: { id: recordId },
      data: { owingAfter: newOwingAmount },
    });

    logger.info(
      `Updated owing for student ${studentId}: ${currentOwing} -> ${newOwingAmount} (record ${recordId})`
    );
  } else {
    logger.info(
      `Skipped owing update for student ${studentId} as record ${recordId} is now paid or absent`
    );
  }
};
