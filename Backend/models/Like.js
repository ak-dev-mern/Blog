import sequelize from "../database/db.js";

const Like = sequelize.define(
  "Like",
  {},
  {
    tableName: "Likes",
    timestamps: true,
  }
);

export default Like;
