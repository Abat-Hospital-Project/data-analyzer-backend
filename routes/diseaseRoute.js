import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createDisease,
  diseaseOutcome,
  diseaseSymptom,
} from "../controllers/diseaseController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post("/create", createDisease);
router.post("/associate-symptom", authMiddleware, diseaseSymptom);
router.post("/associate-outcome", authMiddleware, diseaseOutcome);

export default router;
