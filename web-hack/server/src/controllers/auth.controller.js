import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signup = async (req, res) => {
  try {
    // Added 'role' to the destructuring assignment
    const { fullName, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role, // Pass the role to the creation object
    });

    const token = signToken(newUser._id);
    sendCookie(res, token);

    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      message: "UPLINK_ESTABLISHED: Operative registered.",
      token,
      data: { user: newUser },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message:
        error.code === 11000
          ? "NODE_EXISTS: Email already in use."
          : error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "AUTH_REQUIRED: Email and password required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "ACCESS_DENIED: Operative not found.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "INVALID_CREDENTIALS",
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    sendCookie(res, token);

    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "ACCESS_GRANTED: Welcome back, Operative.",
      token,
      data: { user }, // The user object here will now include the role from the DB
    });
  } catch {
    res.status(500).json({
      status: "error",
      message: "SYSTEM_FAILURE: Internal server error.",
    });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "UPLINK_TERMINATED: Session cleared.",
  });
};