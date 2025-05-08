import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const user_id = req.user?.id;

    if (!user_id) return res.status(403).json({ message: "Unauthorized" });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ text, user_id, post_id: postId });

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all comments for a specific post
export const getAllCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Validate postId
    if (!postId || isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const comments = await Comment.findAll({
      where: { postId }, // Filter by postId
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"], // Commonly needed user info
        },
      ],
      order: [["createdAt", "DESC"]],
      // Add pagination if needed:
      // limit: 20,
      // offset: req.query.page ? (req.query.page - 1) * 20 : 0
    });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      message: "Failed to fetch comments",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.text = text || comment.text;
    await comment.save();

    return res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.destroy();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
