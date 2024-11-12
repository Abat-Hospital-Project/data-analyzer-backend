import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createCard = async (req, res) => {
  try {
    const cardID = uuidv4();
    const { cardNumber } = req.body;

    const [existingCard] = await dbConnection.query(
      "SELECT * FROM cards WHERE card_number = ?",
      [cardNumber]
    );

    if (existingCard.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Card already exists",
      });
    }

    const insertCardQuery =
      "INSERT INTO cards (card_id, card_number) VALUES (?, ?)";
    await dbConnection.query(insertCardQuery, [cardID, cardNumber]);

    return res.status(StatusCodes.CREATED).json({
      message: "Card created successfully",
      cardID,
      cardNumber,
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error occured" });
  }
};

// associations
const cardSymptom = async (req, res) => {
  const { cardNumber, severity, symptomIds } = req.body;

  try {
    const associatedSymptoms = []; // to store symptom details

    for (let index = 0; index < symptomIds.length; index++) {
      const symptomId = symptomIds[index];
      const symptomSeverity = severity[index];

      const insertSymptom =
        "INSERT INTO card_symptoms(card_number, symptom_id, severity, reported_at) VALUES (?, ?, ?, ?)";
      await dbConnection.query(insertSymptom, [
        cardNumber,
        symptomId,
        symptomSeverity,
        new Date(),
      ]);

      // push the symptom and severity into the array
      associatedSymptoms.push({
        symptomId,
        severity: symptomSeverity,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      msg: "Symptoms associated with card number successfully",
      associatedSymptoms,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const cardDisease = async (req, res) => {
  const { cardNumber, diseaseIds } = req.body;

  try {
    const associatedDiseases = [];
    for (let index = 0; index < diseaseIds.length; index++) {
      const diseaseId = diseaseIds[index];

      const insertDisease =
        "INSERT INTO card_diseases(card_number, disease_id, reported_at) VALUES (?, ?, ?)";
      await dbConnection.query(insertDisease, [
        cardNumber,
        diseaseId,
        new Date(),
      ]);

      associatedDiseases.push({
        diseaseId,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      msg: "Associated  with disease successfully",
      associatedDiseases,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const cardOutcome = async (req, res) => {
  const { cardNumber, outcomeId } = req.body;

  try {
    const insertOutcome =
      "INSERT INTO card_outcomes(card_number, outcome_id, reported_at) VALUES (?, ?, ?)";
    await dbConnection.query(insertOutcome, [
      cardNumber,
      outcomeId,
      new Date(),
    ]);

    return res.status(StatusCodes.CREATED).json({
      msg: "Associated  with outcome successfully",
      outcome: {
        cardNumber,
        outcomeId,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const getAllCards = async (req, res) => {
  try {
    const query = "SELECT * FROM cards";
    const [cards] = await dbConnection.query(query);

    if (cards.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No cards found" });
    }

    return res.status(StatusCodes.OK).json(cards);
  } catch (error) {
    console.error("Error retrieving cards:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const getCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const query = "SELECT card_id, card_number FROM cards WHERE card_id = ?";
    const [card] = await dbConnection.query(query, [cardId]);

    if (card.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Card not found" });
    }

    return res.status(StatusCodes.OK).json(card[0]);
  } catch (error) {
    console.error("Error retrieving card:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

// const updateCard = async (req, res) => {
//   const { cardId } = req.params;
//   const { cardNumber } = req.body;

//   try {
//     const [card] = await dbConnection.query(
//       "SELECT card_number FROM cards WHERE card_id = ?",
//       [cardId]
//     );

//     if (card.length === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "Card not found" });
//     }

//     const query = `
//       UPDATE cards
//       SET
//         card_number = COALESCE(?, card_number)
//       WHERE card_id = ?
//     `;

//     const [result] = await dbConnection.query(query, [cardNumber, cardId]);

//     if (result.affectedRows === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "Card not found" });
//     }

//     return res
//       .status(StatusCodes.OK)
//       .json({ message: "Card number updated successfully." });
//   } catch (error) {
//     console.error("Error updating card number:", error);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Server error, please try again later." });
//   }
// };

// const deleteCard = async (req, res) => {
//   const { cardId } = req.params;

//   try {
//     const query = "DELETE FROM cards WHERE card_id = ?";
//     const [result] = await dbConnection.query(query, [cardId]);

//     if (result.affectedRows === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "Card not found" });
//     }

//     return res
//       .status(StatusCodes.OK)
//       .json({ message: "Card deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting card:", error);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Server error, please try again later." });
//   }
// };

export {
  createCard,
  cardSymptom,
  cardDisease,
  cardOutcome,
  getAllCards,
  getCard,
};
