import { otpRepository } from "../db/repositories/otp-repository";
import { userRepository } from "../db/repositories/user-repository";
import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";

// Function to generate a random OTP
const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export const sendOtpMail = async (email: string) => {
  try {
    // Find the user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate a new OTP
    const otpCode = generateOTP();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60000);

    // Check if user already has an OTP
    const existingOtp = await otpRepository.findByUserId(user.id);

    let result;
    if (existingOtp) {
      // Update existing OTP
      result = await otpRepository.update(existingOtp.id, {
        code: otpCode,
        expiresAt,
      });
    } else {
      // Create new OTP
      result = await otpRepository.create({
        code: otpCode,
        expiresAt,
        owner: {
          connect: { id: user.id },
        },
      });
    }

    // In a real application, you would send an email here
    // For now, we'll just log the OTP
    logger.info(`OTP for ${email}: ${otpCode}`);

    return result;
  } catch (error) {
    logger.error("Error sending OTP:", error);
    throw error;
  }
};

export const findOTPAndUpdateUser = async (
  code: string,
  newPassword: string
) => {
  try {
    // Find the OTP code
    const otpData = await otpRepository.findByCode(code);

    // Check if OTP exists
    if (!otpData) {
      throw new ApiError(404, "OTP code does not exist");
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt.getTime()) {
      throw new ApiError(400, "OTP code expired");
    }

    // Update the user with the new password
    const updatedUser = await userRepository.update(otpData.userId, {
      password: newPassword,
    });

    return updatedUser;
  } catch (error) {
    logger.error("Error updating user password:", error);
    throw error;
  }
};
