import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
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

function extractTargetAudio(cleanText, fallbackText = "") {
  if (!cleanText) return fallbackText;
  const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.includes("**") || line.startsWith("🌟") || line.startsWith("🇮🇳")) {
      const match = line
        .replace(/^.*?:\s*/gu, "")
        .replace(/\(.*?\)/gu, "")
        .replace(/\[.*?\]/gu, "")
        .replace(/[*#`_:>🌟🇮🇳🔤📖💡]/gu, "")
        .trim();
      if (match && match.length > 0) return match;
    }
  }
  // Extract the first clean non-empty line as speech target
  const firstLine = lines[0]
    ?.replace(/^.*?:\s*/gu, "")
    .replace(/\(.*?\)/gu, "")
    .replace(/\[.*?\]/gu, "")
    .replace(/[*#`_:>🌟🇮🇳🔤📖💡]/gu, "")
    .trim();
  return firstLine || fallbackText;
}

// Call Google Gemini API with fallback models
async function callGemini(apiKey, systemInstruction, history, message) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const formattedContents = [
    ...history.slice(-4).map((msg) => ({
      role: msg.role === "ai" || msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.text }]
    })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} HTTP ${response.status}:`, errorText);
        continue;
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (reply) return reply;
    } catch (err) {
      console.warn(`Gemini model ${model} error:`, err.message);
    }
  }
  return "";
}

// Call Groq API with fallback models
async function callGroq(groqClient, systemInstruction, history, message) {
  const CANDIDATE_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini"
  ];

  const formattedHistory = history.slice(-4).map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.text
  }));

  for (const model of CANDIDATE_MODELS) {
    try {
      const completion = await groqClient.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedHistory,
          { role: "user", content: message }
        ],
        temperature: 0.2,
        max_tokens: 450
      });

      const content = completion.choices?.[0]?.message?.content?.trim() || "";
      if (content) return content;
    } catch (err) {
      console.warn(`Groq model ${model} error:`, err.message);
    }
  }
  return "";
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

  const systemPrompt = `You are an expert AI Language Tutor for TalkVerse.
Learner's Native / Regional Language: ${native.name} (${native.script})
Language to Learn (Target Language): ${target.name} (${target.script})

Instructions:
- Carefully understand the user's message, question, or translation request.
- Provide the exact, accurate answer or translation in ${target.name} (${target.script}).
- Do NOT repeat generic greetings unless the user explicitly greeted you.
- Always explain the meaning clearly in the user's regional language (${native.name}).

Format your response strictly as 3 concise lines:
🌟 **${target.name}:** [Accurate translation / answer in ${target.name} script] ([English Transliteration])
📖 **${native.name}:** [Direct meaning explained in ${native.name} script (${native.script})]
💡 **Usage:** [1 short practical tip or common reply]`;

  try {
    let raw = "";

    // 1. Try Gemini if API key is provided
    if (geminiApiKey) {
      raw = await callGemini(geminiApiKey, systemPrompt, history, message);
    }

    // 2. Fallback to Groq if Gemini did not respond or is not configured
    if (!raw && groq) {
      raw = await callGroq(groq, systemPrompt, history, message);
    }

    if (!raw) {
      return res.json({
        text: fallback.text,
        audioText: fallback.targetText,
        lang: target.code
      });
    }

    let cleanReply = raw;
    if (cleanReply.includes("<think>")) {
      cleanReply = cleanReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      if (cleanReply.includes("</think>")) {
        const parts = cleanReply.split("</think>");
        cleanReply = parts[parts.length - 1].trim();
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

    // Save to Cache only for successful dynamic AI responses
    if (aiResponseCache.size > MAX_CACHE_SIZE) {
      const firstKey = aiResponseCache.keys().next().value;
      aiResponseCache.delete(firstKey);
    }
    aiResponseCache.set(cacheKey, result);

    return res.json(result);
  } catch (error) {
    console.error("Chat AI Error:", error.message);
    return res.json({
      text: fallback.text,
      audioText: fallback.targetText,
      lang: target.code
    });
  }
});

export default router;
