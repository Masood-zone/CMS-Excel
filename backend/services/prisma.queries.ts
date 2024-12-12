import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { createUserInterface } from "../src/types/user.interface";

const prisma = new PrismaClient();

export async function getAllTeachers() {
  const data = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
      phone: true,
      gender: true,
      assigned_class: true,
    },
    where: { role: { in: ["Teacher", "TEACHER"] } },
  });
  return data;
}

export async function submitPrepaid(
  set_amount: number,
  amount: number,
  payedBy: number,
  submitedBy: number,
  classId: number
) {
  // Validate inputs
  if (set_amount <= 0 || amount <= 0) {
    throw new Error("Amounts must be greater than 0");
  }

  // Calculate how many records to create
  const numberOfRecords = Math.floor(set_amount / amount);

  // Get the current date
  const currentDate = new Date();

  const records = [];

  // Create records sequentially with incrementing dates
  for (let i = 0; i < numberOfRecords; i++) {
    const submissionDate = new Date(currentDate);
    submissionDate.setDate(currentDate.getDate() + i); // Increment date by i days

    // Create a record in the database
    const record = await prisma.record.create({
      data: {
        amount: amount,
        submitedBy: submitedBy,
        payedBy: payedBy,
        submitedAt: submissionDate, // Use incremented date
        isPrepaid: true,
        hasPaid: true,
        classId: classId,
      },
    });

    records.push(record); // Store the created record in the array
  }

  return records; // Return all created records
}

export async function createAmount(amount: number) {
  const amount_update = await prisma.settings.create({
    data: {
      value: amount.toString(),
      name: "amount",
    },
  });
  return amount_update;
}

export async function updateAmount(amount: string) {
  try {
    const amount_update = await prisma.settings.update({
      where: {
        id: 1,
      },
      data: {
        value: amount.toString(),
      },
    });
    return amount_update;
  } catch (error) {
    console.error("Error updating amount:", error);
    throw new Error("Failed to update amount setting");
  }
}

export async function getAmount() {
  try {
    const amountUpdate = await prisma.settings.findUnique({
      where: {
        id: 1,
        name: "amount",
      },
    });

    // Check if the record was found
    if (!amountUpdate) {
      throw new Error("Amount setting not found");
    }

    return amountUpdate; // Return the found record
  } catch (error) {
    console.error("Error fetching amount:", error);
    throw new Error("Failed to retrieve amount setting"); // Re-throw with a more user-friendly message
  }
}

export async function getClassBySupervisorId(id: number) {
  try {
    const data = await prisma.class.findUnique({
      where: {
        id: id,
      },
    });

    const supervisor = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
      },
      where: {
        id: data?.id,
      },
    });

    return supervisor;
  } catch (error) {
    throw new Error("Faild to retrieve data");
  }
}

export async function createUser(data: createUserInterface) {
  try {
    const result_data = await prisma.user.create({
      data: data,
    });
    return result_data;
  } catch (error) {}
}

export async function createClass(data: createUserInterface) {
  try {
    const result_data = await prisma.user.create({
      data: data,
    });
    return result_data;
  } catch (error) {}
}

export async function findOTPAndUpdateUser(
  code: string,
  newPassword: string
): Promise<any> {
  try {
    // Find the OTP code
    const otp_data = await prisma.otpCodes.findFirst({
      where: { code },
    });

    // Check if OTP exists
    if (!otp_data) {
      throw new Error("OTP code does not exist");
    }

    // Check if OTP has expired
    if (Date.now() > otp_data.expiresAt.getTime()) {
      throw new Error("OTP code expired");
    }

    

    // Update the user with the new password
    const updated_user = await prisma.user.update({
      where: { id: otp_data.userId },
      data: { password: newPassword },
    });

    return updated_user; // Return the updated user or a success message
  } catch (err) {
    // Log the error for debugging purposes
    console.error(err);

    // Rethrow with additional context
    throw new Error(`Could not update user password: ${err}`);
  }
}

export async function saveOTP(email: string, otpRaw: string) {
  try {
    const user_data = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user_data) {
      throw new Error("User not found");
    }

    const existingOtp = await prisma.otpCodes.findFirst({
      where: {
        userId: user_data?.id,
      },
    });

    let result_data;
    if (existingOtp) {
      result_data = await prisma.otpCodes.update({
        where: {
          id: existingOtp?.id,
        },
        data: {
          code: otpRaw,
          expiresAt: new Date(Date.now() + 10 * 60000), 
        },
      });
    } else {
      result_data = await prisma.otpCodes.create({
        data: {
          code: otpRaw,
          expiresAt: new Date(Date.now() + 10 * 60000), 
          userId: user_data?.id,
        },
      });
    }

    return result_data;
  } catch (error) {
    console.error("Error saving OTP:", error);
    throw new Error("Could not update value for this user");
  }
}

export async function updateUserPassword(email: string, password: string) {
  try {
    const result_data = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: password,
      },
    });
    return result_data;
  } catch (error) {
    throw new Error("Could no update top value for this user");
  }
}
