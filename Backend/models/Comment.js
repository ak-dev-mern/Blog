import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Comment = sequelize.define(
  "Comment",
  {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "Comments",
  }
);


export default Comment;
