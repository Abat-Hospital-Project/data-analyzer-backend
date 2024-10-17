import express from "express";
import { register, login, verifyEmail } from "../controllers/userController.js";
import {
  handleValidationErrors,
  validateLogin,
  validateRegister,
} from "../middlewares/userValidator.js";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/verify-email", verifyEmail);
router.post("/login", validateLogin, handleValidationErrors, login);

export default router;
