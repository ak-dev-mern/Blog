import express from "express";
import {
  likePost,
  unlikePost,
  getAllLikes,
  getLikeCount,
} from "../controllers/like.js";
import { isAuth } from "../middileware/isAuth.js";

const router = express.Router();

router.post("/like/like", isAuth, likePost);
router.delete("/like/unlike", isAuth, unlikePost);
router.get("/like/getall", getAllLikes);
router.get("/like/count/:postId", getLikeCount);

export default router;
