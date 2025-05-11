import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Comment = sequelize.define(
  "Comment",
  {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // adjust table name if different
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posts", // adjust table name if different
        key: "id",
      },
    },
  },
  {
    tableName: "Comments",
  }
);

export default Comment;
