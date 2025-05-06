import express from "express";
import dotenv from "dotenv";
import sequelize from "./database/db.js";
import cors from "cors";

dotenv.config();

const host = process.env.HOST;

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

db.sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully.");
    app.listen(port, () => {
      console.log(`server is running on http://${host}:${port}`);
    });
  })

  .catch((error) => {
    console.error("❌ Error syncing database:", error);
  });
