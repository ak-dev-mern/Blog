import express from "express";
import dotenv from "dotenv";
import sequelize from "./database/db.js";
import db from "./models/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const host = process.env.HOST;
const app = express();
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middileware
app.use(cookieParser());
app.use(express.json());

// import routes
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import commentRoutes from "./routes/comment.js";
import likeRoutes from "./routes/like.js";

// Using routes
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);

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
