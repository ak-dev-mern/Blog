import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { text, postId } = req.body;
    const user_id = req.user?.id;

    if (!user_id) return res.status(403).json({ message: "Unauthorized" });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!text || !postId || !user_id) {
      return res
        .status(400)
        .json({ message: "Missing text, postId, or user_id" });
    }

    // Create the comment
    const comment = await Comment.create({ text, user_id, post_id: postId });

    // Fetch the created comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: {
        model: User,
        attributes: ["id", "username", "email"], // include only what you need
      },
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment: commentWithUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all comments
export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: { post_id: postId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["username", "profile_image"],
        },
      ],
    });

    return res.status(200).json({ comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
