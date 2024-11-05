import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createDisease = async (req, res) => {
  try {
    const diseaseID = uuidv4();
    const { name } = req.body;

    const [existingDisease] = await dbConnection.query(
      "SELECT * FROM diseases WHERE name = ?",
      [name]
    );

    if (existingDisease.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Disease already exists",
      });
    }

    const insertDiseaseQuery =
      "INSERT INTO diseases (disease_id, name) VALUES (?, ?)";
    await dbConnection.query(insertDiseaseQuery, [diseaseID, name]);

    return res.status(StatusCodes.CREATED).json({
      message: "Disease created successfully",
      diseaseID,
      name,
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error occured" });
  }
};

const diseaseSymptom = async (req, res) => {
  const { symptomIds, diseaseIds } = req.body;

  try {
    for (let index = 0; index < symptomIds.length; index++) {
      const symptomId = symptomIds[index];
      const diseaseId = diseaseIds[index];

      const insertSymptom =
        "INSERT INTO disease_symptoms(disease_id, symptom_id, reported_at) VALUES (?, ?, ?)";
      await dbConnection.query(insertSymptom, [
        diseaseId,
        symptomId,
        new Date(),
      ]);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Associated disease with symptom successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const diseaseOutcome = async (req, res) => {
  const { outcomeIds, diseaseIds } = req.body;

  try {
    for (let index = 0; index < symptomIds.length; index++) {
      const outcomeId = outcomeIds[index];
      const diseaseId = diseaseIds[index];

      const insertSymptom =
        "INSERT INTO disease_outcomes(disease_id, outcome_id, reported_at) VALUES (?, ?, ?)";
      await dbConnection.query(insertSymptom, [
        diseaseId,
        outcomeId,
        new Date(),
      ]);
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Associated disease with outcome successfully" });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error, try again later" });
  }
};

const getAllDiseases = async (req, res) => {
  try {
    const query = "SELECT * FROM diseases";
    const [diseases] = await dbConnection.query(query);

    if (diseases.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No diseases found" });
    }

    return res.status(StatusCodes.OK).json(diseases);
  } catch (error) {
    console.error("Error retrieving diseases:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const getDisease = async (req, res) => {
  const { diseaseId } = req.params;

  try {
    const query = "SELECT disease_id, name FROM diseases WHERE disease_id = ?";
    const [disease] = await dbConnection.query(query, [diseaseId]);

    if (disease.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Disease not found" });
    }

    return res.status(StatusCodes.OK).json(disease[0]);
  } catch (error) {
    console.error("Error retrieving disease:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const updateDisease = async (req, res) => {
  const { diseaseId } = req.params;
  const { name } = req.body;

  try {
    const [disease] = await dbConnection.query(
      "SELECT name FROM diseases WHERE disease_id = ?",
      [diseaseId]
    );

    if (disease.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Disease not found" });
    }

    const query = `
      UPDATE diseases
      SET 
        name = COALESCE(?, name),
      WHERE disease_id = ?
    `;

    const [result] = await dbConnection.query(query, [name, diseaseId]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Disease not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Disease updated successfully." });
  } catch (error) {
    console.error("Error updating disease:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const deleteDisease = async (req, res) => {
  const { diseaseId } = req.params;

  try {
    const query = "DELETE FROM diseases WHERE disease_id = ?";
    const [result] = await dbConnection.query(query, [diseaseId]);

    if (result.affectedRows === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Disease not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Disease deleted successfully." });
  } catch (error) {
    console.error("Error deleting disease:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};

const searchDiseases = async (req, res) => {
  try {
    const { name } = req.body;

    let query = "SELECT * FROM diseases WHERE 1=1";
    const queryParams = [];

    if (name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${name}%`);
    }

    const [diseases] = await dbConnection.query(query, queryParams);

    if (diseases.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No diseases found" });
    }

    return res.status(StatusCodes.OK).json(diseases);
  } catch (error) {
    console.error("Error retrieving diseases:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error, please try again later." });
  }
};
export {
  createDisease,
  diseaseSymptom,
  diseaseOutcome,
  getDisease,
  getAllDiseases,
  updateDisease,
  searchDiseases,
  deleteDisease,
};
