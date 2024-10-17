import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// create the transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error with transporter configuration:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

export default transporter;
