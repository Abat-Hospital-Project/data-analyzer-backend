import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createAndAssociateDisease } from "../controllers/diseaseController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post("/create", createAndAssociateDisease);

export default router;
