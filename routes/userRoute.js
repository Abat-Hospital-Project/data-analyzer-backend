import express from "express";
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
} from "../controllers/userController.js";
import {
  handleValidationErrors,
  validateEmailPassword,
  validateLogin,
  validateRegister,
} from "../middlewares/userValidator.js";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, register);
router.post(
  "/verify-email",
  validateEmailPassword,
  handleValidationErrors,
  verifyEmail
);
router.post("/login", validateLogin, handleValidationErrors, login);
router.post("/update/:userId", updateUserAttributes);
router.get("/get-all", getAllUsers); // admin
router.get("/get/:userId", getUserByID);
router.delete("/delete/:userId", deleteUserByID); // admin
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;
