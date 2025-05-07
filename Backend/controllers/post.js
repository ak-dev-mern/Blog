import Post from "../models/Post.js";

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
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Single Post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Optional: Check if user is owner of post (if `req.user.id` available)
    if (post.user_id !== req.user?.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.title = title || post.title;
    post.body = content || post.body;

    await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
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
