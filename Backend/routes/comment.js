import express from "express";
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from "../controllers/comment.js";
import { isAuth } from "../middileware/isAuth.js";

const router = express.Router();

router.post("/comment/create", isAuth, createComment);
router.get("/comment/:postId", getCommentsByPostId);
router.put("/comment/update/:id", isAuth, updateComment);
router.delete("/comment/delete/:id", isAuth, deleteComment);

export default router;
