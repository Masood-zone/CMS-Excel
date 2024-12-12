import { saveOTP } from "./prisma.queries";

const cron = require("node-cron");
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const otpGen = require("otp-generator");
const TOKEN = "450b9c52860332a566da3dbdcad4e8cf";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "greesoft@demomailtrap.com",
  name: "Greesoft Canteen Management Password Reset",
};

function generateTemplate(email: string, otp: string) {
  const mesageBodyTemplate = `
        ## Password Reset Request

        Dear User,

        We received a request to reset your password for your account associated with this email address: **${email}**. 

        To proceed with resetting your password, please use the following One-Time code (OTC):

        ### **Your code: ${otp}  **

        This code is valid for the next **10 minutes**. If you did not request a password reset, please ignore this email. Your password will remain unchanged.

        ### Instructions to Reset Your Password:

        1. Go to the password reset page: [Password Reset Link]
        2. Enter the OTP provided above.
        3. Follow the prompts to create a new password.

        If you have any questions or need further assistance, feel free to contact our support team at greesoftcompany@gmail.com.

        Thank you!

        Best regards,  
        Greesoft Compnay 
        `;

  return mesageBodyTemplate;
}

export async function sendOtpMail(recieverMail: string) {
  const otp = otpGen.generate(5, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const text = generateTemplate(recieverMail, otp);
  const recipients = [recieverMail];

  try {
    const res_data = saveOTP(recieverMail, otp);
    transport.sendMail({
      from: sender,
      to: recipients,
      subject: "Password Reset",
      text: text,
    });
    return res_data;
  } catch (err:any) {
    throw new Error("There was an error sending the mail", err);
  }
}
