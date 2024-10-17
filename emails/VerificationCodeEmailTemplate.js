import { sendEmail } from "../services/sendEmail.js";

export default (clientEmailAddress, verificationCode) => {
  const subject = "Verification Code";
  const verificationEmailTemplate = `
    <p>Your verification code is: ${verificationCode}</p>
    <p>This code will expire in 1 hour. Please use it to verify your account.</p>`;
  return sendEmail(
    "verification",
    clientEmailAddress,
    subject,
    verificationEmailTemplate
  );
};
