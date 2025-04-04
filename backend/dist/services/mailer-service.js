"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOTPAndUpdateUser = exports.sendOtpMail = void 0;
const otp_repository_1 = require("../db/repositories/otp-repository");
const user_repository_1 = require("../db/repositories/user-repository");
const api_error_1 = require("../utils/api-error");
const logger_1 = require("../utils/logger");
const generateOTP = (length = 6) => {
    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
const sendOtpMail = async (email) => {
    try {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000);
        const existingOtp = await otp_repository_1.otpRepository.findByUserId(user.id);
        let result;
        if (existingOtp) {
            result = await otp_repository_1.otpRepository.update(existingOtp.id, {
                code: otpCode,
                expiresAt,
            });
        }
        else {
            result = await otp_repository_1.otpRepository.create({
                code: otpCode,
                expiresAt,
                owner: {
                    connect: { id: user.id },
                },
            });
        }
        logger_1.logger.info(`OTP for ${email}: ${otpCode}`);
        return result;
    }
    catch (error) {
        logger_1.logger.error("Error sending OTP:", error);
        throw error;
    }
};
exports.sendOtpMail = sendOtpMail;
const findOTPAndUpdateUser = async (code, newPassword) => {
    try {
        const otpData = await otp_repository_1.otpRepository.findByCode(code);
        if (!otpData) {
            throw new api_error_1.ApiError(404, "OTP code does not exist");
        }
        if (Date.now() > otpData.expiresAt.getTime()) {
            throw new api_error_1.ApiError(400, "OTP code expired");
        }
        const updatedUser = await user_repository_1.userRepository.update(otpData.userId, {
            password: newPassword,
        });
        return updatedUser;
    }
    catch (error) {
        logger_1.logger.error("Error updating user password:", error);
        throw error;
    }
};
exports.findOTPAndUpdateUser = findOTPAndUpdateUser;
//# sourceMappingURL=mailer-service.js.map