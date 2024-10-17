import transporter from "../utils/emailConfig.js";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (clientEmailAddress, subject, emailTemplate) => {
  const message = {
    from: process.env.EMAIL,
    to: clientEmailAddress,
    subject: subject,
    html: emailTemplate,
  };

  return await sendMail(message);
};

const sendMail = async (message) => {
  try {
    await transporter.sendMail(message);
    return {
      message: "Email sent successfully",
      status: true,
    };
  } catch (error) {
    return {
      message: "Failed to send email",
      status: false,
      error: error.message,
    };
  }
};
