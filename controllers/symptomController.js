import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createSymptom = async (req, res) => {
  const { name, severity } = req.body;
  try {
    const [existingSymptom] = await dbConnection.query(
      "SELECT name FROM symptoms WHERE name = ?",
      [name]
    );

    if (existingSymptom.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Symptom already exists",
      });
    }
    // generate a uuid
    const symptomID = uuidv4();

    const insertSymptom =
      "INSERT INTO symptoms(symptom_id, name, severity) VALUES(?, ?, ?)";

    await dbConnection.query(insertSymptom, [symptomID, name, severity]);

    return res.status(StatusCodes.CREATED).json({
      msg: "Symptom created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

// link user to symptom
const addUserSymptom = async (req, res) => {
  const { userID } = req.body;
  const { symptomID } = req.body;

  try {
    const query =
      "INSERT INTO user_symptoms (user_id, symptom_id) VALUES (?, ?)";
    await dbConnection.query(query, [userID, symptomID]);

    res
      .status(StatusCodes.CREATED)
      .json({ msg: "Symptom linked to user successfully" });
  } catch (error) {
    console.error("Error linking symptom to user:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
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
  createSymptom,
  getAllSymptoms,
  getSymptom,
  updateSymptom,
  deleteSymptom,
  searchSymptoms,
  addUserSymptom,
};