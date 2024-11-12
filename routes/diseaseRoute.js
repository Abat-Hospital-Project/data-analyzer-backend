import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createDisease,
  deleteDisease,
  diseaseOutcome,
  diseaseSymptom,
  getAllDiseases,
  getDisease,
  updateDisease,
} from "../controllers/diseaseController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post("/create", createDisease);
router.post("/associate-symptom", authMiddleware, diseaseSymptom);
router.post("/associate-outcome", authMiddleware, diseaseOutcome);
router.get("/get-all", authMiddleware, getAllDiseases);
router.get("/get/:diseaseId", authMiddleware, getDisease);
router.put("/update/:diseaseId", authMiddleware, updateDisease);
router.delete("/delete/:diseaseId", authMiddleware, deleteDisease);

export default router;
