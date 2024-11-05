import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createOutcome } from "../controllers/outcomeController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post("/create", authMiddleware, createOutcome);

export default router;
