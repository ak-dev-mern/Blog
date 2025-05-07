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

router.post(
  "/post/create-post",
  isAuth,
  upload.single("post_image"),
  createPost
);
router.get("/post/getallpost", getAllPosts);
router.get("/post/:id", getPostById);
router.put("/post/update-post/:id", isAuth, updatePost);
router.delete("/post/delete-post/:id", isAuth, deletePost);

export default router;
