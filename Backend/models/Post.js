import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Post = sequelize.define(
  "Post",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    post_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Posts",
  }
);

export default Post;
