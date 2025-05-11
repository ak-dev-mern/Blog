import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import fs from "fs";
import path from "path";


// Craete new post
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const image = req.file ? req.file.filename : null;

    const newPost = await Post.create({
      title,
      content,
      user_id,
      post_image: image,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        post_image: image,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Get all post

export const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: posts } = await Post.findAndCountAll({
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      include: [
        { model: User, attributes: ["username", "profile_image"] },
        { model: Comment },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    const hasMore = offset + posts.length < count;

    return res.status(200).json({ posts, hasMore });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Single Post by ID

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User, // post.User
          attributes: ["id", "username", "profile_image"],
        },
        {
          model: Comment, // post.Comments[]
          include: [
            {
              model: User, // comment.User
              attributes: ["id", "username", "profile_image"],
            },
          ],
        },
        {
          model: User,
          as: "Likers", // post.Likers[]
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postData = {
      ...post.toJSON(),
      likesCount: post.Likers?.length || 0,
      likedBy: post.Likers?.map((u) => u.id),
      comments: post.Comments?.map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        comment: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.User, // include username, profile_image
        likedBy: comment.LikedUsers?.map((u) => u.id) || [],
        likesCount: comment.LikedUsers?.length || 0,
      })),
    };

    console.log(post.Comments);

    return res.status(200).json({ post: postData });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update post (title and content, only if provided)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const postImage = req.file; // multer adds this if image is uploaded

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user_id !== req.user?.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update text fields
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    // If a new image is uploaded
    if (postImage) {
      // Optional: Delete the old image file from disk
      if (post.post_image) {
        const oldImagePath = path.join("uploads", post.post_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new filename
      post.post_image = postImage.filename;
    }

    await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: error.message });
  }
};


// Delete Post

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user_id !== req.user?.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.destroy();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
