import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import chatRouter from "./src/routes/chat.js";
import authRouter from "./src/routes/auth.js";
import userRouter from "./src/routes/user.js";
import ttsRouter from "./src/routes/tts.js";
import pronounceRouter from "./src/routes/pronounce.js";
import { indicLexicon, unitCatalog, dialogueScenarios } from "./src/data/indicLexicon.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "TalkVerse High-Performance Indic Server is running!" });
});

// AI Pronunciation & Voice Assessment Router (Python PKL Engine)
app.use("/api/ai", pronounceRouter);

// ElevenLabs TTS Voice Router
app.use("/api/tts", ttsRouter);

// AI Chat Router
app.use("/api/chat", chatRouter);

// Authentication Router
app.use("/api/auth", authRouter);

// User Cloud Progress Sync Router
app.use("/api/user", userRouter);

// Generate comprehensive dynamic lessons across all 20 language combinations
function generateLessonsForPair(native, target) {
  const prefix = `${native}-${target}-`;
  return unitCatalog.map((u) => {
    const rawList = indicLexicon[u.key] || indicLexicon.greetings;
    const words = rawList.map((item) => ({
      word: item[native]?.word || item.ta.word,
      transliteration: item[native]?.translit || item.ta.translit,
      meaning: item.meaning,
      meaningInTarget: item[target]?.word || item.kn.word,
      targetTranslit: item[target]?.translit || item.kn.translit
    }));

    // Quiz generator with intelligent options
    const quiz = rawList.slice(0, 4).map((item, idx) => {
      const correctWord = item[target]?.word || item.kn.word;
      const wrongOptions = rawList
        .filter((_, i) => i !== idx)
        .map((other) => other[target]?.word || other.kn.word)
        .slice(0, 3);
      const options = [correctWord, ...wrongOptions].sort(() => 0.5 - Math.random());
      const correct = options.indexOf(correctWord);

      return {
        question: `What is "${item[native]?.word || item.meaning}"?`,
        options,
        correct,
        nativePrompt: item[native]?.word,
        targetWord: correctWord,
        transliteration: item[target]?.translit
      };
    });

    // Pair matching cards for match game
    const matchPairs = rawList.slice(0, 4).map((item, idx) => ({
      id: idx + 1,
      native: item[native]?.word,
      target: item[target]?.word,
      translit: item[target]?.translit
    }));

    return {
      id: `${prefix}${u.idSuffix}`,
      title: u.title,
      description: `Master ${u.title.toLowerCase()} via your mother tongue`,
      difficulty: u.xp >= 80 ? "advanced" : u.xp >= 60 ? "intermediate" : "beginner",
      xp_reward: u.xp,
      icon: u.icon,
      words,
      quiz,
      matchPairs
    };
  });
}

// GET all lessons for language pair
app.get("/api/lessons", (req, res) => {
  const { native = "ta", target = "kn" } = req.query;
  const lessons = generateLessonsForPair(native, target);
  res.json(lessons);
});

// GET interactive dialogue scenarios for language pair
app.get("/api/dialogues", (req, res) => {
  const { native = "ta", target = "kn" } = req.query;
  const scenarios = dialogueScenarios.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    xp: s.xp,
    turns: s.turns.map((turn) => {
      const nativeObj = turn[native] || turn.ta;
      const targetObj = turn[target] || turn.kn;
      return {
        speaker: turn.speaker,
        nativeText: nativeObj.text,
        nativeTranslit: nativeObj.translit,
        targetText: targetObj.text,
        targetTranslit: targetObj.translit,
        meaning: targetObj.meaning || nativeObj.meaning
      };
    })
  }));
  res.json(scenarios);
});

// GET single lesson by ID
app.get("/api/lessons/:id", (req, res) => {
  const { id } = req.params;
  const { native: qNative, target: qTarget } = req.query;

  const parts = id.split("-");
  let native = qNative;
  let target = qTarget;
  let unitSuffix = "01";

  if (parts.length >= 3) {
    native = native || parts[0];
    target = target || parts[1];
    unitSuffix = parts.slice(2).join("-");
  } else if (parts.length === 2) {
    native = native || parts[0];
    target = target || parts[1];
  } else if (parts.length === 1) {
    unitSuffix = parts[0];
  }

  native = native || "ta";
  target = target || "kn";

  const lessons = generateLessonsForPair(native, target);
  const paddedSuffix = /^\d+$/.test(unitSuffix) ? unitSuffix.padStart(2, "0") : unitSuffix;
  const targetId = `${native}-${target}-${paddedSuffix}`;
  const lesson = lessons.find((l) => l.id === id || l.id === targetId || l.id.endsWith(`-${paddedSuffix}`));

  if (lesson) {
    res.json(lesson);
  } else {
    res.json(lessons[0]);
  }
});

// Serve frontend static build files
const distPath = path.join(__dirname, "../langbridge/dist");
app.use(express.static(distPath));

// SPA Catch-all middleware to serve index.html for all frontend routes
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TalkVerse Indic Server is live on http://localhost:${PORT}`);
});