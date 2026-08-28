import express from "express";
import { db } from "../data/db.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// GET user progress
router.get("/progress", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email query parameter is required." });
  }

  // Check MongoDB / persistent database
  const localRecord = await db.getProgress(email);
  if (localRecord) {
    return res.json({ progress: localRecord, source: "database" });
  }

  // Supabase fallback if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("email", email)
        .single();

      if (!error && data) {
        await db.saveProgress(data);
        return res.json({ progress: data, source: "supabase" });
      }
    } catch {
      // ignore
    }
  }

  // Default initial progress for new user
  const initial = {
    email,
    xp: 0,
    streak: 1,
    level: 1,
    wordsLearned: 0,
    completedLessons: [],
    nativeLang: "ta",
    targetLang: "kn",
  };

  const saved = await db.saveProgress(initial);
  return res.json({ progress: saved, source: "initial" });
});

// POST / PUT update user progress
router.post("/progress", async (req, res) => {
  const { email, xp, streak, level, wordsLearned, completedLessons, nativeLang, targetLang, hasSelectedLanguages } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required to save progress." });
  }

  const updatedProgress = await db.saveProgress({
    email,
    xp: Number(xp) || 0,
    streak: Number(streak) || 1,
    level: Number(level) || 1,
    wordsLearned: Number(wordsLearned) || 0,
    completedLessons: Array.isArray(completedLessons) ? completedLessons : [],
    nativeLang: nativeLang || "ta",
    targetLang: targetLang || "kn",
    hasSelectedLanguages: typeof hasSelectedLanguages === "boolean" ? hasSelectedLanguages : undefined,
  });

  // Also sync to Supabase if connected
  if (supabase) {
    try {
      await supabase
        .from("user_progress")
        .upsert(updatedProgress, { onConflict: "email" });
    } catch (err) {
      console.warn("Supabase progress upsert notice:", err.message);
    }
  }

  return res.json({
    success: true,
    progress: updatedProgress,
    message: "User progress saved to persistent backend storage!",
  });
});

export default router;
