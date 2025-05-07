import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(403).json({
        message: "Please login to access",
      });
    }

    // Decode JWT signed token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findByPk(decodedData._id);
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Please login to access",
    });
  }
};
