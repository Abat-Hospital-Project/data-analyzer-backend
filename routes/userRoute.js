import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  register,
  login,
  verifyEmail,
  updateUserAttributes,
  getAllUsers,
  getUserByID,
  deleteUserByID,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
} from "../controllers/userController.js";
import {
  handleValidationErrors,
  validateEmail,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../middlewares/userValidator.js";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, register);
router.post(
  "/verify-email",
  validateEmail,
  handleValidationErrors,
  verifyEmail
);
router.post("/login", validateLogin, handleValidationErrors, login);
router.post("/update/:userId", authMiddleware, updateUserAttributes);
router.get("/get-all", authMiddleware, getAllUsers); // admin
router.get("/get/:userId", authMiddleware, getUserByID);
router.delete("/delete/:userId", authMiddleware, deleteUserByID); // admin
router.post(
  "/forgot-password",
  validateForgotPassword,
  handleValidationErrors,
  forgetPassword
);
router.post(
  "/reset-password",
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);
router.post("/refresh-token", refreshAccessToken);

export default router;
