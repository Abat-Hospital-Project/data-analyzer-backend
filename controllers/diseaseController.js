import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createAndAssociateDisease = async (req, res) => {
  const { name, outcome, symptom, cardNumber } = req.body;

  try {
    // obtain outcome id from outcome name
    const [outcomeResult] = await dbConnection.query(
      "SELECT outcome_id FROM outcomes WHERE name = ?",
      [outcome]
    );

    if (outcomeResult.length === 0) {
      return res.status(400).json({ msg: "Outcome not found" });
    }

    const outcomeID = outcomeResult[0].outcome_id;

    const [existingDisease] = await dbConnection.query(
      "SELECT disease_id FROM diseases WHERE name = ?",
      [name]
    );

    let diseaseID;

    if (existingDisease.length > 0) {
      diseaseID = existingDisease[0].disease_id;
    } else {
      diseaseID = uuidv4();
      await dbConnection.query(
        "INSERT INTO diseases(disease_id, name) VALUES(?, ?)",
        [diseaseID, name]
      );
    }

    // disease - outcome relationship
    await dbConnection.query(
      "INSERT INTO disease_outcomes (disease_name, outcome_id) VALUES (?, ?)",
      [name, outcomeID]
    );

    // disease - symptom relationship
    await dbConnection.query(
      "INSERT INTO disease_symptoms (disease_id, symptom_name) VALUES (?, ?)",
      [diseaseID, symptom]
    );

    // disease - user relationship
    await dbConnection.query(
      "INSERT INTO user_diseases (card_number, disease_id) VALUES (?, ?)",
      [cardNumber, diseaseID]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Disease created and linked to user, symptom, and outcome successfully",
      diseaseID,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export { createAndAssociateDisease };
