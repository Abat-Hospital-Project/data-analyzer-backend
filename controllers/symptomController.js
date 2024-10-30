import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createAndAssociateSymptom = async (req, res) => {
  const { name, severity, cardNumber, disease, outcome } = req.body;

  try {
    // obtain disease id from disease table
    const [diseaseResult] = await dbConnection.query(
      "SELECT disease_id FROM diseases WHERE name = ?",
      [disease]
    );

    if (diseaseResult.length === 0) {
      return res.status(400).json({ msg: "Disease not found" });
    }

    const diseaseID = diseaseResult[0].disease_id;

    // obtain outcome id from outcome table
    const [outcomeResult] = await dbConnection.query(
      "SELECT outcome_id FROM outcomes WHERE name = ?",
      [outcome]
    );

    if (outcomeResult.length === 0) {
      return res.status(400).json({ msg: "Outcome not found" });
    }

    const outcomeID = outcomeResult[0].outcome_id;

    const [existingSymptom] = await dbConnection.query(
      "SELECT symptom_id FROM symptoms WHERE name = ?",
      [name]
    );

    let symptomID;

    if (existingSymptom.length > 0) {
      symptomID = existingSymptom[0].symptom_id;
    } else {
      symptomID = uuidv4();
      await dbConnection.query(
        "INSERT INTO symptoms(symptom_id, name) VALUES(?, ?)",
        [symptomID, name]
      );
    }

    // user to symptom relationship
    await dbConnection.query(
      "INSERT INTO user_symptoms (card_number, symptom_id, severity, disease_id, outcome_id) VALUES (?, ?, ?, ?, ?)",
      [cardNumber, symptomID, severity, diseaseID, outcomeID]
    );

    // symptom to disease relationship
    await dbConnection.query(
      "INSERT INTO disease_symptoms (disease_id, symptom_name) VALUES (?, ?)",
      [diseaseID, name]
    );

    // symptom to outcome relationship
    await dbConnection.query(
      "INSERT INTO symptom_outcomes(symptom_name, outcome_id) VALUES (?, ?)",
      [name, outcomeID]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Symptom created and linked to user, disease, and outcome successfully",
      symptom_id: symptomID,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const getAllSymptoms = async (req, res) => {
  try {
    const query = "SELECT * FROM symptoms";
    const [symptoms] = await dbConnection.query(query);

    if (symptoms.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No symptoms found" });
    }

    return res.status(StatusCodes.OK).json(symptoms);
  } catch (error) {
    console.error("Error retrieving symptoms:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const getSymptom = async (req, res) => {
  const { symptomId } = req.params;

  try {
    const query =
      "SELECT symptom_id, name, severity FROM symptoms WHERE symptom_id = ?";
    const [symptom] = await dbConnection.query(query, [symptomId]);

    if (symptom.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Symptom not found." });
    }

    return res.status(StatusCodes.OK).json(symptom[0]);
  } catch (error) {
    console.error("Error retrieving symptom:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const updateSymptom = async (req, res) => {
  const { symptomId } = req.params;
  const { name, severity } = req.body;

  try {
    const [symptom] = await dbConnection.query(
      "SELECT name FROM symptoms WHERE symptom_id = ?",
      [symptomId]
    );

    if (symptom.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Symptom not found." });
    }

    const query = `
      UPDATE symptoms
      SET 
        name = COALESCE(?, name),
        severity = COALESCE(?, severity)
      WHERE symptom_id = ?
    `;

    const [result] = await dbConnection.query(query, [
      name,
      severity,
      symptomId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Symptom not found." });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Symptom updated successfully." });
  } catch (error) {
    console.error("Error updating symptoms:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const deleteSymptom = async (req, res) => {
  const { symptomId } = req.params;

  try {
    const query = "DELETE FROM symptoms WHERE symptom_id = ?";
    const [result] = await dbConnection.query(query, [symptomId]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Symptom not found." });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Symptom deleted successfully." });
  } catch (error) {
    console.error("Error deleting symptom:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const searchSymptoms = async (req, res) => {
  try {
    const { name, severity } = req.body;

    let query = "SELECT * FROM symptoms WHERE 1=1";
    const queryParams = [];

    if (name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${name}%`);
    }

    if (severity) {
      const severityNum = parseInt(severity, 10);

      if (!isNaN(severityNum) && severityNum >= 1 && severityNum <= 10) {
        query += " AND severity = ?";
        queryParams.push(severityNum);
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Severity must be a number between 1 and 10." });
      }
    }

    const [symptoms] = await dbConnection.query(query, queryParams);

    if (symptoms.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No symptoms found" });
    }

    return res.status(StatusCodes.OK).json(symptoms);
  } catch (error) {
    console.error("Error retrieving symptoms:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

export {
  createAndAssociateSymptom,
  getAllSymptoms,
  getSymptom,
  updateSymptom,
  deleteSymptom,
  searchSymptoms,
};
