import express from "express";
import {
  likePost,
  unlikePost,
  getAllLikes,
  getLikeCount,
} from "../controllers/like.js";
import { isAuth } from "../middileware/isAuth.js";

const router = express.Router();

router.post("/like/like-post", isAuth, likePost);
router.delete("/like/unlike-post", isAuth, unlikePost);
router.get("/like/getalllike", getAllLikes);
router.get("/like/count/:postId", getLikeCount);

export default router;
