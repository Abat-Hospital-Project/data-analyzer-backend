import { sendEmail } from "../services/sendEmail.js";

export default (clientEmailAddress, userFirstName) => {
  const subject = "Account password has changed";
  const passwordChangedEmailTemplate = `<!DOCTYPE html>
    <html>
      <head>
        <title>Password Changed Successfully</title>
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
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Changed Successfully</h1>
          <p>Dear ${userFirstName},</p>
          <p>Your password for your account has been successfully changed.</p>
          <p>If you did not make this change, please contact our customer support.</p>
        </div>
      </body>
    </html>
  `;
  return sendEmail(clientEmailAddress, subject, passwordChangedEmailTemplate);
};
