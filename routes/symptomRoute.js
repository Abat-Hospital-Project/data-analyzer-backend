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
import {} from "../middlewares/userValidator.js";

const router = express.Router();

router.post("/create", createSymptom);
router.post("/add", addUserSymptom);
router.get("/get-all", getAllSymptoms);
router.get("/get/:symptomId", getSymptom);
router.get("/search", searchSymptoms);
router.put("/update/:symptomId", updateSymptom);
router.delete("/delete/:symptomId", deleteSymptom);

export default router;
