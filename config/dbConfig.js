import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const dbConnection = mysql2.createPool({
  user: process.env.USER,
  database: process.env.DATABASE,
  host: "localhost",
  password: process.env.PASSWORD,
  connectionLimit: 10,
});

export default dbConnection.promise();
