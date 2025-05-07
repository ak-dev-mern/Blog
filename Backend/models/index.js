// models/index.js
import sequelize from "../database/db.js";
import User from "./User.js";

// Define associations here if needed
// e.g., User.hasMany(Post); Post.belongsTo(User);

const db = {
  sequelize,
  Sequelize: sequelize, // Optional, if you want to access Sequelize methods later
  User,
};

export default db;
