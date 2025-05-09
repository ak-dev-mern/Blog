import sequelize from "../database/db.js";
import User from "./User.js";
import Post from "./Post.js";
import Comment from "./Comment.js";
import Like from "./Like.js";

// Post hasMany Comments
Post.hasMany(Comment, { foreignKey: "post_id" });
Comment.belongsTo(Post, { foreignKey: "post_id" });

// Comment belongs to User
Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });

// Post belongs to User
Post.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Post, { foreignKey: "user_id" });

// Post ↔ User (likes)
Post.belongsToMany(User, { through: Like, as: "Likers", foreignKey: "post_id" });
User.belongsToMany(Post, { through: Like, as: "LikedPosts", foreignKey: "user_id" });

// OPTIONAL: if comments have likes
Comment.belongsToMany(User, {
  through: "CommentLikes",
  as: "LikedUsers",
  foreignKey: "comment_id",
});
User.belongsToMany(Comment, {
  through: "CommentLikes",
  as: "LikedComments",
  foreignKey: "user_id",
});


const db = {
  sequelize,
  Sequelize: sequelize,
  User,
  Post,
  Comment,
  Like,
};

export default db;
