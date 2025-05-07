import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// New user registration
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: "User email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profile_image: null,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user email address
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Check password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Generate signed token
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });

    // Exclude password before sending user
    const { password: userPassword, ...UserDetails } = user.get({
      plain: true,
    });
    return res.status(200).json({
      message: `Welcome ${user.username}`,
      token,
      user: UserDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
