import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendWelcomeEmail, sendLoginAlertEmail } from "../services/emailService.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const initials = getInitials(name);

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      initials,
    });

    if (user) {
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("Welcome email failed:", err.message)
      );
      res.status(201).json({
        uid: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        plan: user.plan || "free",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      sendLoginAlertEmail(user.email, user.name).catch((err) =>
        console.error("Login alert email failed:", err.message)
      );
      res.json({
        uid: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        avatar: user.avatar,
        plan: user.plan || "free",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth/Register via Google
// @route   POST /api/auth/google
// @access  Public
router.post("/google", async (req, res) => {
  const { name, email, avatar, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId linked, link it
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      const initials = getInitials(name || "User");
      user = await User.create({
        name: name || "User",
        email,
        avatar,
        initials,
        googleId,
      });
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("Welcome email failed:", err.message)
      );
    }

    res.json({
      uid: user._id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      avatar: user.avatar,
      plan: user.plan || "free",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Guest login/signup
// @route   POST /api/auth/guest
// @access  Public
router.post("/guest", async (req, res) => {
  try {
    const randomId = Math.random().toString(36).substring(2, 7);
    const name = `Guest ${randomId}`;
    const email = `guest_${randomId}@starvis.app`;
    const initials = "G";

    const user = await User.create({
      name,
      email,
      initials,
      password: await bcrypt.hash(Math.random().toString(36), 10),
    });

    res.status(201).json({
      uid: user._id,
      name: user.name,
      email: user.email,
      initials: user.initials,
      plan: user.plan || "free",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
