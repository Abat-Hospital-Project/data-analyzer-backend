import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createAndAssociateOutcome } from "../controllers/outcomeController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post("/create", createAndAssociateOutcome);

export default router;
