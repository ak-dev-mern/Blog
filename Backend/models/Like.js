import sequelize from "../database/db.js";


const Like = sequelize.define("Like", {}, { tableName: "Likes" });

export default Like;
