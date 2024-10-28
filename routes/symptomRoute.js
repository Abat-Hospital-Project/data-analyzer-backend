import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  addUserSymptom,
  createSymptom,
  deleteSymptom,
  getAllSymptoms,
  getSymptom,
  searchSymptoms,
  updateSymptom,
} from "../controllers/symptomController.js";
import {
  handleValidationErrors,
  validateSymptomFields,
} from "../middlewares/symptomValidator.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  validateSymptomFields,
  handleValidationErrors,
  createSymptom
);
router.post("/add", authMiddleware, addUserSymptom);
router.get("/get-all", authMiddleware, getAllSymptoms);
router.get("/get/:symptomId", authMiddleware, getSymptom);
router.get("/search", authMiddleware, searchSymptoms);
router.put("/update/:symptomId", authMiddleware, updateSymptom);
router.delete("/delete/:symptomId", authMiddleware, deleteSymptom);

export default router;
