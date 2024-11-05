import dbConnection from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

const createOutcome = async (req, res) => {
  try {
    const outcomeID = uuidv4();
    const { name } = req.body;

    const [existingOutcome] = await dbConnection.query(
      "SELECT * FROM outcomes WHERE name = ?",
      [name]
    );

    if (existingOutcome.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Outcome already exists",
      });
    }

    const insertOutcomeQuery =
      "INSERT INTO outcomes (outcome_id, name) VALUES (?, ?)";
    await dbConnection.query(insertOutcomeQuery, [outcomeID, name]);

    return res.status(StatusCodes.CREATED).json({
      message: "Outcome created successfully",
      outcomeID,
      name,
    });
  } catch {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error occured" });
  }
};

export { createOutcome };
