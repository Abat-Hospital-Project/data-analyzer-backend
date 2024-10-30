import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createAndAssociateOutcome = async (req, res) => {
  const { name, disease, symptom, cardNumber } = req.body;

  try {
    const [existingOutcome] = await dbConnection.query(
      "SELECT outcome_id FROM outcomes WHERE name = ?",
      [name]
    );

    let outcomeID;

    if (existingOutcome.length > 0) {
      outcomeID = existingOutcome[0].outcome_id;
    } else {
      outcomeID = uuidv4();
      await dbConnection.query(
        "INSERT INTO outcomes(outcome_id, name, card_number) VALUES(?, ?, ?)",
        [outcomeID, name, cardNumber]
      );
    }

    // disease - outcome relationship
    await dbConnection.query(
      "INSERT INTO disease_outcomes (disease_name, outcome_id) VALUES (?, ?)",
      [disease, outcomeID]
    );

    // symptom - outcome relationship
    await dbConnection.query(
      "INSERT INTO symptom_outcomes (symptom_name, outcome_id) VALUES (?, ?)",
      [symptom, outcomeID]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Outcome created and linked to user, symptom, and disease successfully",
      outcomeID,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export { createAndAssociateOutcome };
