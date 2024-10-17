import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import VerificationCodeEmailTemplate from "../emails/VerificationCodeEmailTemplate.js";
import { generateSixDigitCode } from "../utils/verificationCodeGenerator.js";
import { formatDateToMySQL } from "../utils/dateUtils.js";

const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    age,
    password,
    confirmPassword,
    phoneNumber,
    city,
    subCity,
    kebele,
    maritalStatus,
    disabilityStatus,
    drugUsageStatus,
    mentalHealthStatus,
    cardNumber,
  } = req.body;

  console.log(password);

  try {
    const [existingUser] = await dbConnection.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User already exists",
      });
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // verification code
    const sixDigitCode = generateSixDigitCode();
    const verificationCodeDate = formatDateToMySQL(new Date());

    console.log(sixDigitCode);

    const insertUser =
      "INSERT INTO users(first_name, last_name, email, password, gender, age, phone_number, city, sub_city, kebele, marital_status, disability_status, drug_usage_status, mental_health_status, card_number, verificationCode, verificationCodeSentAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    await dbConnection.query(insertUser, [
      firstName,
      lastName,
      email,
      hashedPassword,
      gender,
      age,
      phoneNumber,
      city,
      subCity,
      kebele,
      maritalStatus,
      disabilityStatus,
      drugUsageStatus,
      mentalHealthStatus,
      cardNumber,
      sixDigitCode,
      verificationCodeDate,
    ]);

    // send verification email
    VerificationCodeEmailTemplate(email, sixDigitCode);

    return res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const verifyEmail = async (req, res) => {
  const { verificationCode, email } = req.body;

  try {
    // select the time where the verification code was sent at
    const checkQuery = `
      SELECT verificationCodeSentAt 
      FROM users 
      WHERE verificationCode = ? AND email = ?
    `;

    const [rows] = await dbConnection.query(checkQuery, [
      verificationCode,
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Verification failed. Invalid code or email." });
    }

    const { verificationCodeSentAt } = rows[0];

    // check if the code is older than 1 hour
    const codeSentAt = new Date(verificationCodeSentAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (codeSentAt.getTime() < oneHourAgo.getTime()) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // verify the user
    const query = `
      UPDATE users 
      SET isVerified = true, 
          verificationCode = null, 
          verificationCodeSentAt = null 
      WHERE verificationCode = ? AND email = ?
    `;

    const [result] = await dbConnection.query(query, [verificationCode, email]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Email verified successfully!" });
    } else {
      return res
        .status(400)
        .json({ message: "Verification failed. Invalid code or email." });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await dbConnection.query(
      "SELECT first_name, last_name, email, password, id, isVerified FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credentials",
      });
    }

    const foundUser = user[0];

    if (!foundUser.isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Please verify your email before logging in",
      });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user[0].id,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        email: user[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(StatusCodes.OK).json({
      msg: "User login successful",
      token,
      userId: user[0].id,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Server error, please try again later",
    });
  }
};

const updateUserAttributes = async (req, res) => {};

const getUserByID = async (req, res) => {};

const getAllUsers = async (req, res) => {};

const deleteUserByID = async (req, res) => {};

// password
const forgotPassword = async (req, res) => {};

const resetPassord = async (req, res) => {};

export {
  register,
  verifyEmail,
  login,
  updateUserAttributes,
  getUserByID,
  getAllUsers,
  deleteUserByID,
  forgotPassword,
  resetPassord,
};
