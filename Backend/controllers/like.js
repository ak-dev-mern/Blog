import Like from "../models/Like.js";
import Post from "../models/Post.js";

// Like a post
export const likePost = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { postId } = req.body;

    if (!user_id) return res.status(403).json({ message: "Unauthorized" });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Prevent duplicate likes
    const existingLike = await Like.findOne({
      where: { user_id, post_id: postId },
    });
    if (existingLike) return res.status(400).json({ message: "Already liked" });

    const like = await Like.create({ user_id, post_id: postId });

    return res.status(201).json({ message: "Post liked", like });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { postId } = req.body;

    const like = await Like.findOne({ where: { user_id, post_id: postId } });
    if (!like) return res.status(404).json({ message: "Like not found" });

    await like.destroy();

    return res.status(200).json({ message: "Post unliked" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all likes
export const getAllLikes = async (req, res) => {
  try {
    const likes = await Like.findAll({
      include: [
        { model: Post, attributes: ["id", "title"] },
        { model: User, attributes: ["username"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ likes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get like count per post
export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const count = await Like.count({ where: { post_id: postId } });

    return res.status(200).json({ postId, likeCount: count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
