import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  loginUser,
  myProfile,
  registerUser,
  updateUser,
} from "../controllers/user.js";
import { isAuth } from "../middileware/isAuth.js";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/profile", isAuth, myProfile);
router.get("/user/getalluser", isAuth, getAllUsers);
router.get("/user/:id", isAuth, getUserById);
router.put("/user/update-user/:id", isAuth, updateUser);
router.delete("/user/delete-user/:id", isAuth, deleteUser);

export default router;
