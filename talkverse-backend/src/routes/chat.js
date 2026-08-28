import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
let groq = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
}

// In-Memory Fast Response Cache (LRU-like)
const aiResponseCache = new Map();
const MAX_CACHE_SIZE = 500;

const langDetails = {
  ta: { name: "Tamil", script: "தமிழ்", code: "ta-IN", greeting: "வணக்கம்" },
  ml: { name: "Malayalam", script: "മലയാളം", code: "ml-IN", greeting: "നമസ്കാരം" },
  kn: { name: "Kannada", script: "ಕನ್ನಡ", code: "kn-IN", greeting: "ನಮಸ್ಕಾರ" },
  te: { name: "Telugu", script: "తెలుగు", code: "te-IN", greeting: "నమస్కారం" },
  hi: { name: "Hindi", script: "हिन्दी", code: "hi-IN", greeting: "नमस्ते" }
};

const defaultFallbacks = {
  kn: {
    targetText: "ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    text: "🌟 **ಕನ್ನಡ (Kannada):** ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?\n🔤 **Pronunciation:** `Namaskara! Neevu hegiddiri?`\n\n📖 **Mother-Tongue Meaning:** வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்?\n💡 **Usage:** Common polite greeting used in daily conversations.",
    lang: "kn-IN"
  },
  ta: {
    targetText: "வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்?",
    text: "🌟 **தமிழ் (Tamil):** வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்?\n🔤 **Pronunciation:** `Vanakkam! Neengal eppadi irukkireergal?`\n\n📖 **Meaning:** Hello! How are you?\n💡 **Usage:** Standard respectful greeting for any occasion.",
    lang: "ta-IN"
  },
  te: {
    targetText: "నమస్కారం! మీరు ఎలా ఉన్నారు?",
    text: "🌟 **తెలుగు (Telugu):** నమస్కారం! మీరు ఎలా ఉన్నారు?\n🔤 **Pronunciation:** `Namaskaram! Meeru ela unnaru?`\n\n📖 **Meaning:** Hello! How are you?\n💡 **Usage:** Polite greeting suitable for friends, colleagues, and elders.",
    lang: "te-IN"
  },
  ml: {
    targetText: "നമസ്കാരം! സുഖമാണോ?",
    text: "🌟 **മലയാളം (Malayalam):** നമസ്കാരം! സുഖമാണോ?\n🔤 **Pronunciation:** `Namaskaram! Sukhamano?`\n\n📖 **Meaning:** Hello! Are you doing well?\n💡 **Usage:** Universal, respectful greeting in Kerala.",
    lang: "ml-IN"
  },
  hi: {
    targetText: "नमस्ते! आप कैसे हैं?",
    text: "🌟 **हिन्दी (Hindi):** नमस्ते! आप कैसे हैं?\n🔤 **Pronunciation:** `Namaste! Aap kaise hain?`\n\n📖 **Meaning:** Hello! How are you?\n💡 **Usage:** Standard polite greeting across all Hindi-speaking regions.",
    lang: "hi-IN"
  }
};

function extractTargetAudio(cleanText, fallbackText) {
  if (!cleanText) return fallbackText;
  const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.includes("**") || line.startsWith("🌟") || line.startsWith("🇮🇳")) {
      const match = line
        .replace(/[*#`_:>🌟🇮🇳🔤📖💡]/gu, "")
        .replace(/^.*?:/gu, "")
        .replace(/\(.*?\)/gu, "")
        .replace(/\[.*?\]/gu, "")
        .trim();
      if (match && match.length > 1) return match;
    }
  }
  return fallbackText;
}

router.post("/", async (req, res) => {
  const { message, history = [], nativeLang = "ta", targetLang = "kn" } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "A valid message is required." });
  }

  const native = langDetails[nativeLang] || langDetails.ta;
  const target = langDetails[targetLang] || langDetails.kn;
  const fallback = defaultFallbacks[targetLang] || defaultFallbacks.kn;

  // Check cache for instant sub-millisecond response
  const cacheKey = `${nativeLang}_${targetLang}_${message.toLowerCase().trim()}`;
  if (aiResponseCache.has(cacheKey)) {
    const cached = aiResponseCache.get(cacheKey);
    return res.json({ ...cached, cached: true });
  }

  if (!groq) {
    return res.json({
      text: fallback.text,
      audioText: fallback.targetText,
      lang: target.code
    });
  }

  const systemPrompt = `You are a high-precision AI Language Tutor for TalkVerse.
Learner's Native Language: ${native.name} (${native.script})
Target Language: ${target.name} (${target.script})

Provide immediate, high-precision answers with no preamble. Follow this exact format:

🌟 **${target.name} (${target.script}):** [Phrase in ${target.name} script]
🔤 **Pronunciation:** \`[Roman transliteration]\` (Phonetic in ${native.name} script: \`[guide]\`)
📖 **${native.name} Meaning:** [Direct explanation written authentically in ${native.name} (${native.script})]
💡 **Usage & Reply:** [1 key spoken tip & 1 natural reply phrase]`;

  try {
    const formattedHistory = history.slice(-3).map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text
    }));

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      temperature: 0.5,
      max_tokens: 2500
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    let cleanReply = raw;
    if (cleanReply.includes("<think>")) {
      if (cleanReply.includes("</think>")) {
        cleanReply = cleanReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      } else {
        const parts = cleanReply.split("</think>");
        if (parts.length > 1) {
          cleanReply = parts[1].trim();
        }
      }
    }
    if (!cleanReply || cleanReply.length < 5) {
      cleanReply = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() || fallback.text;
    }

    const audioText = extractTargetAudio(cleanReply, fallback.targetText);
    const result = {
      text: cleanReply,
      audioText,
      lang: target.code
    };

    // Save to Cache
    if (aiResponseCache.size > MAX_CACHE_SIZE) {
      const firstKey = aiResponseCache.keys().next().value;
      aiResponseCache.delete(firstKey);
    }
    aiResponseCache.set(cacheKey, result);

    return res.json(result);
  } catch (error) {
    console.error("Groq AI Precision Error:", error.message);
    return res.json({
      text: fallback.text,
      audioText: fallback.targetText,
      lang: target.code
    });
  }
});

export default router;
