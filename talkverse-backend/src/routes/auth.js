import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../data/db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "talkverse-super-secure-indic-secret-key-2026";

// Helper to generate real JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /api/auth/firebase-sync - Sync Firebase authenticated user into persistent backend database
router.post("/firebase-sync", async (req, res) => {
  const { email, displayName, photoURL, uid, token } = req.body;

  if (!email) {
    return res.status(400).json({ error: "User email is required for sync." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const name = displayName?.trim() || cleanEmail.split("@")[0];
    const avatar_url = photoURL || null;

    let isNewUser = false;
    let user = await db.findUserByEmail(cleanEmail);

    if (!user) {
      isNewUser = true;
      // Create new user in persistent database / MongoDB
      user = await db.createUser({
        id: uid || `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        avatar_url,
        authProvider: "firebase",
      });

      // Initialize persistent learning progress
      await db.saveProgress({
        email: cleanEmail,
        xp: 0,
        streak: 1,
        level: 1,
        wordsLearned: 0,
        completedLessons: [],
        nativeLang: "ta",
        targetLang: "kn",
        hasSelectedLanguages: false,
      });
    } else {
      const existingProgress = await db.getProgress(cleanEmail);
      isNewUser = Boolean(
        !existingProgress ||
          (!existingProgress.hasSelectedLanguages &&
            (Number(existingProgress.xp) || 0) === 0 &&
            (!existingProgress.completedLessons || existingProgress.completedLessons.length === 0))
      );

      // Update profile picture and last login
      user = await db.updateUser(cleanEmail, {
        name: name || user.name,
        avatar_url: avatar_url || user.avatar_url,
        lastLoginAt: new Date().toISOString(),
      });
    }

    const sessionToken = token || generateToken(user);
    const userProgress = await db.getProgress(cleanEmail);

    return res.status(200).json({
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        createdAt: user.createdAt,
      },
      token: sessionToken,
      progress: userProgress,
      isNewUser,
      message: "Firebase user successfully synchronized with database",
    });
  } catch (err) {
    console.error("Firebase sync error:", err);
    return res.status(500).json({ error: "Failed to sync Firebase user to database." });
  }
});

// POST /api/auth/signup - Real user registration with bcrypt password hash
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await db.findUserByEmail(cleanEmail);

    if (existingUser) {
      // If user signed in previously via Google without a password, link the password seamlessly
      if (!existingUser.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const updatedUser = await db.updateUser(cleanEmail, {
          name: name?.trim() || existingUser.name,
          passwordHash,
          lastLoginAt: new Date().toISOString(),
        });
        const existingProgress = await db.getProgress(cleanEmail);
        const isNewUser = Boolean(
          !existingProgress ||
            (!existingProgress.hasSelectedLanguages &&
              (Number(existingProgress.xp) || 0) === 0 &&
              (!existingProgress.completedLessons || existingProgress.completedLessons.length === 0))
        );
        const token = generateToken(updatedUser);
        return res.status(200).json({
          user: {
            id: updatedUser.id || updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar_url: updatedUser.avatar_url,
            createdAt: updatedUser.createdAt,
          },
          token,
          progress: existingProgress,
          isNewUser,
          message: "Password linked to account successfully!",
        });
      }

      return res.status(400).json({
        error: "An account with this email already exists. Please sign in instead.",
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save real user in persistent database / MongoDB
    const newUser = await db.createUser({
      name: name?.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      passwordHash,
      authProvider: "email",
    });

    // Initialize real user progress
    const initialProgress = await db.saveProgress({
      email: newUser.email,
      xp: 0,
      streak: 1,
      level: 1,
      wordsLearned: 0,
      completedLessons: [],
      nativeLang: "ta",
      targetLang: "kn",
      hasSelectedLanguages: false,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        createdAt: newUser.createdAt,
      },
      token,
      progress: initialProgress,
      isNewUser: true,
      message: "Account created successfully!",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during account registration." });
  }
});

// POST /api/auth/login - Real authentication against stored hashed credentials
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    let user = await db.findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        error: "No account found with this email. Please create an account first.",
      });
    }

    // If account was created via Google / social login and has no password set yet,
    // automatically link this password to their account and log them in!
    if (!user.passwordHash) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      user = await db.updateUser(cleanEmail, {
        passwordHash: newHash,
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      // Compare bcrypt password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          error: "Incorrect password. Please verify and try again.",
        });
      }

      // Update last login timestamp
      await db.updateUser(cleanEmail, { lastLoginAt: new Date().toISOString() });
    }

    const userProgress = await db.getProgress(cleanEmail);
    const isNewUser = Boolean(
      !userProgress ||
        (!userProgress.hasSelectedLanguages &&
          (Number(userProgress.xp) || 0) === 0 &&
          (!userProgress.completedLessons || userProgress.completedLessons.length === 0))
    );

    const token = generateToken(user);

    return res.status(200).json({
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        createdAt: user.createdAt,
      },
      token,
      progress: userProgress,
      isNewUser,
      message: "Welcome back!",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
});

// GET /api/auth/me - Verify session token
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authorization token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;