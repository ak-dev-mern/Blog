import express from "express";
import {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.js";
import { isAuth } from "../middileware/isAuth.js";


const router = express.Router();

router.post("/comment/create-comment", isAuth, createComment);
router.get("/comment/getallcomment", getAllComments);
router.put("/comment/update-comment/:id", isAuth, updateComment);
router.delete("/comment/delete-comment/:id", isAuth, deleteComment);

export default router;
