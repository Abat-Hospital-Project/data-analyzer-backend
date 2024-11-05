import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import VerificationCodeEmailTemplate from "../emails/VerificationCodeEmailTemplate.js";
import ForgotPasswordEmailTemplate from "../emails/ForgotPasswordEmailTemplate.js";
import PasswordChangedEmailTemplate from "../emails/PasswordChangedEmailTemplate.js";
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

  // console.log(password);

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

    //console.log(sixDigitCode);

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

    const query =
      "SELECT id, first_name, last_name, email, age, card_number, phone_number, city, sub_city, kebele, marital_status, disability_status, drug_usage_status, mental_health_status, isVerified FROM users WHERE email = ?";
    const [userDetails] = await dbConnection.query(query, [email]);

    // send verification email
    VerificationCodeEmailTemplate(email, sixDigitCode);

    return res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
      user: userDetails[0],
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
    const checkQuery = `
      SELECT first_name, id, verificationCodeSentAt 
      FROM users 
      WHERE verificationCode = ? AND email = ?
    `;

    const [rows] = await dbConnection.query(checkQuery, [
      verificationCode,
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Verification failed. Invalid code or email.",
      });
    }

    const { verificationCodeSentAt, id, first_name } = rows[0];

    const codeSentAt = new Date(verificationCodeSentAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (codeSentAt.getTime() < oneHourAgo.getTime()) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new code.",
      });
    }

    const updateQuery = `
      UPDATE users 
      SET isVerified = true, 
          verificationCode = null, 
          verificationCodeSentAt = null 
      WHERE verificationCode = ? AND email = ?
    `;

    const [result] = await dbConnection.query(updateQuery, [
      verificationCode,
      email,
    ]);

    if (result.affectedRows > 0) {
      const accessToken = jwt.sign(
        {
          id: id,
          email: email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Email verified successfully!",
        accessToken,
        firstName: first_name,
        userId: id,
        email,
      });
    } else {
      return res.status(400).json({
        message: "Verification failed. Invalid code or email.",
      });
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

  // generate a uuid
  const refreshUUID = uuidv4();

  try {
    const [user] = await dbConnection.query(
      "SELECT first_name, email, password, id, isVerified FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User not found",
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

    const accessToken = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const expiresAt = dayjs().add(7, "day").toDate(); // 7 days from now

    await dbConnection.query(
      "INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
      [refreshUUID, foundUser.id, refreshToken, expiresAt]
    );

    // save the refresh token on httponly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(StatusCodes.OK).json({
      msg: "User login successful",
      firstName: user[0].first_name,
      accessToken,
      userId: user[0].id,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Server error, please try again later",
    });
  }
};

// controller to refresh access token
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const [tokenRecord] = await dbConnection.query(
      "SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?",
      [decoded.id, refreshToken]
    );

    if (tokenRecord.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid refresh token or token does not match the user",
      });
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(StatusCodes.OK).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Invalid or expired refresh token",
    });
  }
};

const updateUserAttributes = async (req, res) => {
  const { userId } = req.params;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    age,
    city,
    subCity,
    kebele,
    maritalStatus,
    drugUsageStatus,
    mentalHealthStatus,
    oldPassword,
    newPassword,
  } = req.body;

  try {
    const [user] = await dbConnection.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    const hashedPassword = user[0].password;

    let hashedNewPassword;

    if (newPassword) {
      if (!oldPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Old password is required to change the password.",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
      if (!isMatch) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Old password is incorrect." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    }

    const query = `
      UPDATE users
      SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone_number = COALESCE(?, phone_number),
        age = COALESCE(?, age),
        city = COALESCE(?, city),
        sub_city = COALESCE(?, sub_city),
        kebele = COALESCE(?, kebele),
        marital_status = COALESCE(?, marital_status),
        drug_usage_status = COALESCE(?, drug_usage_status),
        mental_health_status = COALESCE(?, mental_health_status),
        password = COALESCE(?, password) -- Update password if new password is provided
      WHERE id = ?
    `;

    const [result] = await dbConnection.query(query, [
      firstName,
      lastName,
      email,
      phoneNumber,
      age,
      city,
      subCity,
      kebele,
      maritalStatus,
      drugUsageStatus,
      mentalHealthStatus,
      newPassword ? hashedNewPassword : null,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user attributes:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const getUserByID = async (req, res) => {
  const { userId } = req.params;

  try {
    const query =
      "SELECT id, first_name, last_name, email, gender, age, card_number, phone_number, city, sub_city, kebele, marital_status, disability_status, drug_usage_status, mental_health_status, isVerified FROM users WHERE id = ?";
    const [user] = await dbConnection.query(query, [userId]);

    if (user.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    return res.status(StatusCodes.OK).json(user[0]);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const query =
      "SELECT id, first_name, last_name, email, gender, age, card_number, phone_number, city, sub_city, kebele, marital_status, disability_status, drug_usage_status, mental_health_status, isVerified FROM users";
    const [users] = await dbConnection.query(query);

    if (users.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No users found." });
    }

    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const deleteUserByID = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await dbConnection.query(query, [userId]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

// forget password
const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const [user] = await dbConnection.query(
      "SELECT id, first_name FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return next(CreateError(StatusCodes.NOT_FOUND, "Email not found"));
    }

    // reset token with one hour expiration
    const resetToken = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await ForgotPasswordEmailTemplate(email, user[0].first_name, resetToken);

    return res.status(StatusCodes.OK).json("Password reset email sent.");
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    return next(error);
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user associated with the id from the decoded token
    const [user] = await dbConnection.query(
      "SELECT id, first_name, email FROM Users WHERE id = ?",
      [decoded.id]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired token" });
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dbConnection.query("UPDATE Users SET password = ? WHERE id = ?", [
      hashedPassword,
      user[0].id,
    ]);

    await PasswordChangedEmailTemplate(user[0].email, user[0].first_name);

    return res
      .status(StatusCodes.OK)
      .json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid or expired token" });
  }
};

// associations

const userSymptom = async (req, res) => {
  const { cardNumber, severity, symptomIds } = req.body;

  try {
    for (let index = 0; index < symptomIds.length; index++) {
      const symptomId = symptomIds[index];
      const symptomSeverity = severity[index];

      const insertSymptom =
        "INSERT INTO user_symptoms(card_number, symptom_id, severity, reported_at) VALUES (?, ?, ?, ?)";
      await dbConnection.query(insertSymptom, [
        cardNumber,
        symptomId,
        symptomSeverity,
        new Date(),
      ]);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Symptoms associated with user successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const userDisease = async (req, res) => {
  const { cardNumber, diseaseIds } = req.body;

  try {
    for (let index = 0; index < diseaseIds.length; index++) {
      const diseaseId = diseaseIds[index];

      const insertDisease =
        "INSERT INTO user_diseases(card_number, disease_id, reported_at) VALUES (?, ?, ?)";
      await dbConnection.query(insertDisease, [
        cardNumber,
        diseaseId,
        new Date(),
      ]);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Associated user with disease successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const userOutcome = async (req, res) => {
  const { cardNumber, outcomeId } = req.body;

  try {
    const insertOutcome =
      "INSERT INTO user_outcomes(card_number, outcome_id, reported_at) VALUES (?, ?, ?)";
    await dbConnection.query(insertOutcome, [
      cardNumber,
      outcomeId,
      new Date(),
    ]);

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Associated outcome with user successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

export {
  register,
  verifyEmail,
  login,
  updateUserAttributes,
  getUserByID,
  getAllUsers,
  deleteUserByID,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
  // associations
  userSymptom,
  userDisease,
  userOutcome,
};
