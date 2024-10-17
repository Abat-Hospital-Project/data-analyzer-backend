import { sendEmail } from "../services/sendEmail.js";

const frontendURL = process.env.FRONTEND_URL;

export default (clientEmailAddress, userFirstName, resetToken) => {
  const subject = "Reset Password";
  const forgotPasswordTemplate = `
  <!DOCTYPE html>
    <html>
      <head>
        <title>Forgot Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f7f7f7;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333333;
            text-align: center;
            margin-top: 0;
          }
          p {
            color: #333333;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 3px;
          }
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Forgot Password</h1>
          <p>Dear ${userFirstName},</p>
          <p>We received a request to reset your password for your account.</p>
          <p>Please click on the button below to reset your password:</p>
          <p>
            <a class="button" href="${
              frontendURL + "/forgot-password/" + resetToken
            }">Reset Password</a>
          </p>
          <p>If you didn't request a password reset, no further action is required. Your current password will remain unchanged.</p>
        </div>
      </body>
    </html>
  `;
  return sendEmail(clientEmailAddress, subject, forgotPasswordTemplate);
};
