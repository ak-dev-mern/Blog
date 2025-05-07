import sequelize from "../database/db.js";
import User from "./User.js";
import Post from "./Post.js";
import Comment from "./Comment.js";
import Like from "./Like.js";

// Associations

// User → Post
User.hasMany(Post, { foreignKey: "user_id" });
Post.belongsTo(User, { foreignKey: "user_id" });

// User → Comment 
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

// Post → Comment 
Post.hasMany(Comment, { foreignKey: "post_id" });
Comment.belongsTo(Post, { foreignKey: "post_id" });

// User ↔ Post
User.belongsToMany(Post, {
  through: Like,
  foreignKey: "user_id",
  as: "LikedPosts",
});
Post.belongsToMany(User, {
  through: Like,
  foreignKey: "post_id",
  as: "Likers",
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
