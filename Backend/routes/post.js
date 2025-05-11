import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../controllers/post.js";
import { isAuth } from "../middileware/isAuth.js";
import upload from "../middileware/upload.js";

const router = express.Router();

router.post("/post/create", isAuth, upload.single("post_image"), createPost);
router.get("/post/getall", getAllPosts);
router.get("/post/:id", getPostById);
router.put("/post/update/:id", isAuth, upload.single("post_image"), updatePost);
router.delete("/post/delete/:id", isAuth, deletePost);

export default router;
