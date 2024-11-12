import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  cardDisease,
  cardOutcome,
  cardSymptom,
  createCard,
  getAllCards,
  getCard,
} from "../controllers/cardController.js";

const router = express.Router();

router.post("/create", createCard);
router.post("/card-symptom", authMiddleware, cardSymptom);
router.post("/card-disease", authMiddleware, cardDisease);
router.post("/card-outcome", authMiddleware, cardOutcome);
router.get("/get-all", authMiddleware, getAllCards);
router.get("/get/:cardId", authMiddleware, getCard);
// router.put("/update/:cardId", authMiddleware, updateCard);
// router.delete("/delete/:cardId", authMiddleware, deleteCard);

export default router;
