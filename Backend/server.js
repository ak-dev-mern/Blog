import express from "express";
import dotenv from "dotenv";
import sequelize from "./database/db.js";
import db from "./models/index.js";
import cors from "cors";

dotenv.config();

const host = process.env.HOST;
const app = express();
const port = process.env.PORT;

// Import CORS
app.use(cors());

// Middileware
app.use(express.json());

// import routes
import userRoutes from "./routes/user.js";

// Using routes
app.use("/api", userRoutes);

// Database sync
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Database synced successfully.");
    app.listen(port, () => {
      console.log(`🚀 Server running at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error syncing database:", error);
  });
