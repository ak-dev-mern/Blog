import express from "express";
import {
  createComment,
  getAllCommentsForPost,
  updateComment,
  deleteComment,
} from "../controllers/comment.js";
import { isAuth } from "../middileware/isAuth.js";

const router = express.Router();

router.post("/comment/create/:postId", isAuth, createComment);
router.get("/comment/post/:postId", getAllCommentsForPost);
router.put("/comment/update/:id", isAuth, updateComment);
router.delete("/comment/delete/:id", isAuth, deleteComment);

export default router;
