import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY || "";
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

// In-Memory Audio Buffer Cache (LRU-style)
const audioBufferCache = new Map();
const MAX_CACHE_SIZE = 500;

const langVoiceMap = {
  ta: DEFAULT_VOICE_ID,
  te: DEFAULT_VOICE_ID,
  kn: DEFAULT_VOICE_ID,
  ml: DEFAULT_VOICE_ID,
  hi: DEFAULT_VOICE_ID,
};

function cleanTextForSpeech(rawText) {
  if (!rawText) return "";
  return rawText
    .replace(/[*#`_~:>🌟🇮🇳🔤📖💡🎉]/gu, "")
    .replace(/^.*?:/gu, "")
    .replace(/\(.*?\)/gu, "")
    .replace(/\[.*?\]/gu, "")
    .trim();
}

// Function to fetch audio via Google Indic TTS
async function fetchGoogleTTSAudio(cleanText, langPrefix) {
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langPrefix)}&q=${encodeURIComponent(cleanText)}`;
  const response = await fetch(ttsUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://translate.google.com/"
    }
  });

  if (!response.ok) {
    throw new Error(`Google TTS request failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// GET /api/tts/status - Status check
router.get("/status", (req, res) => {
  res.json({
    configured: Boolean(ELEVENLABS_API_KEY),
    googleTTSFallback: true,
    supportedLanguages: ["ta", "kn", "te", "ml", "hi"],
    cachedCount: audioBufferCache.size
  });
});

// Common handler for synthesizing and serving audio
async function handleSynthesizeSpeech(req, res, text, langCode, voiceId) {
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required for speech synthesis." });
  }

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    return res.status(400).json({ error: "No readable speech content found." });
  }

  const langPrefix = (langCode || "ta").slice(0, 2).toLowerCase();
  const cacheKey = `${langPrefix}_${cleanText.toLowerCase()}`;

  // 1. Check in-memory Cache
  if (audioBufferCache.has(cacheKey)) {
    const cached = audioBufferCache.get(cacheKey);
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": cached.length,
      "X-Cache": "HIT",
      "X-Audio-Source": "cache",
      "Cache-Control": "public, max-age=86400"
    });
    return res.send(cached);
  }

  let audioBuffer = null;
  let source = "google-indic-tts";

  // 2. Try ElevenLabs if configured
  if (ELEVENLABS_API_KEY) {
    try {
      const targetVoiceId = voiceId || langVoiceMap[langPrefix] || DEFAULT_VOICE_ID;
      const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (elResponse.ok) {
        const arrayBuffer = await elResponse.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        source = "elevenlabs";
      }
    } catch (err) {
      console.warn("ElevenLabs error, falling back to Google Indic TTS:", err.message);
    }
  }

  // 3. Guaranteed High-Fidelity Google Indic TTS
  if (!audioBuffer) {
    try {
      audioBuffer = await fetchGoogleTTSAudio(cleanText, langPrefix);
      source = "google-indic-tts";
    } catch (err) {
      console.error("Google TTS error:", err.message);
      return res.status(500).json({ error: "Failed to generate speech audio." });
    }
  }

  // Save to Cache
  if (audioBufferCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = audioBufferCache.keys().next().value;
    audioBufferCache.delete(oldestKey);
  }
  audioBufferCache.set(cacheKey, audioBuffer);

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Length": audioBuffer.length,
    "X-Cache": "MISS",
    "X-Audio-Source": source,
    "Cache-Control": "public, max-age=86400"
  });

  return res.send(audioBuffer);
}

// GET /api/tts - Stream audio via query params (?text=...&langCode=...)
router.get("/", async (req, res) => {
  try {
    const { text, langCode, voiceId } = req.query;
    await handleSynthesizeSpeech(req, res, text, langCode, voiceId);
  } catch (error) {
    console.error("GET TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tts - Stream audio via JSON body
router.post("/", async (req, res) => {
  try {
    const { text, langCode, voiceId } = req.body;
    await handleSynthesizeSpeech(req, res, text, langCode, voiceId);
  } catch (error) {
    console.error("POST TTS Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
