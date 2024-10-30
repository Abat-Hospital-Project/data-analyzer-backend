import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dbConnection from "./config/dbConfig.js";

// routes
import userRoutes from "./routes/userRoute.js";
import symptomRoutes from "./routes/symptomRoute.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Testing");
// });

app.use("/api/user", userRoutes);
app.use("/api/symptoms", symptomRoutes);

dbConnection
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start database connection:", error);
    process.exit(1);
  });
