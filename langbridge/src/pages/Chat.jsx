import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Mic, MicOff, Bot, User, Volume2, RotateCcw, Globe } from "lucide-react";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeech from "../hooks/useSpeech";
import useSoundEffects from "../hooks/useSoundEffects";
import useStore from "../store/useStore";
import { useNavigate } from "react-router-dom";

const langMeta = {
  ta: { name: "Tamil", script: "தமிழ்", code: "ta-IN", flag: "🇮🇳", greeting: "வணக்கம்" },
  ml: { name: "Malayalam", script: "മലയാളം", code: "ml-IN", flag: "🇮🇳", greeting: "നമസ്കാരം" },
  kn: { name: "Kannada", script: "ಕನ್ನಡ", code: "kn-IN", flag: "🇮🇳", greeting: "ನಮಸ್ಕಾರ" },
  te: { name: "Telugu", script: "తెలుగు", code: "te-IN", flag: "🇮🇳", greeting: "నమస్కారం" },
  hi: { name: "Hindi", script: "हिन्दी", code: "hi-IN", flag: "🇮🇳", greeting: "नमस्ते" },
};

const starterPrompts = [
  { label: "👋 Introduce myself", prompt: "How do I introduce myself and state my profession politely?" },
  { label: "🍽️ Order food & drinks", prompt: "How do I order food, ask for water, and request the bill?" },
  { label: "🙏 Respectful greetings", prompt: "What are polite everyday greetings and farewells?" },
  { label: "🛒 Shopping & bargaining", prompt: "How do I ask 'How much does this cost?' and 'Can you discount?'" },
  { label: "🚕 Booking an auto / cab", prompt: "How do I tell an auto driver 'Please take me to the station' and 'Put meter'?" },
  { label: "💼 Office & Meetings", prompt: "What are common polite phrases used in office discussions and emails?" }
];

const precisionActionChips = [
  { label: "💬 How do I reply?", suffix: "How do I naturally reply to this in a conversation?" },
  { label: "🔄 Formal vs Casual", suffix: "Explain the formal vs informal spoken differences for this." },
  { label: "💡 2 Real Examples", suffix: "Give me 2 real-life mini dialogues using this phrase." },
  { label: "🗣️ Pronounce slowly", suffix: "Break down each syllable phonetically with pronunciation tips." }
];

export default function Chat() {
  const navigate = useNavigate();
  const { nativeLang = "ta", targetLang = "kn" } = useStore();
  const { speak, stop: stopSpeech, isPlaying, isLoading: isAudioLoading } = useSpeech();
  const { playClick, playMicStart, playMicStop } = useSoundEffects();

  const currentNative = langMeta[nativeLang] || langMeta.ta;
  const currentTarget = langMeta[targetLang] || langMeta.kn;

  // Mode: "native" (ask tutor in mother tongue) vs "target" (speak target words for feedback)
  const [micMode, setMicMode] = useState("native"); // "native" | "target"
  const currentMicLangCode = micMode === "native" ? currentNative.code : currentTarget.code;

  const {
    isListening,
    transcript,
    audioLevel,
    startListening,
    stopListening
  } = useSpeechRecognition(currentMicLangCode);

  const getInitialMessage = useCallback(() => {
    const greetings = {
      kn: `🌟 **ಕನ್ನಡ (Kannada):** ನಮಸ್ಕಾರ! (Namaskara!)\n🔤 **Pronunciation:** \`Namaskara!\`\n\n📖 **வணக்கம்!** I am your high-precision AI Kannada tutor.\nAsk any sentence, word, or grammar rule in your mother tongue to practice!`,
      ta: `🌟 **தமிழ் (Tamil):** வணக்கம்! (Vanakkam!)\n🔤 **Pronunciation:** \`Vanakkam!\`\n\n📖 I am your high-precision AI Tamil tutor.\nAsk questions, learn spoken dialects, or practice conversation!`,
      te: `🌟 **తెలుగు (Telugu):** నమస్కారం! (Namaskaram!)\n🔤 **Pronunciation:** \`Namaskaram!\`\n\n📖 I am your high-precision AI Telugu tutor.\nLet's master everyday conversations and phrases!`,
      ml: `🌟 **മലയാളം (Malayalam):** നമസ്കാരം! (Namaskaram!)\n🔤 **Pronunciation:** \`Namaskaram!\`\n\n📖 I am your high-precision AI Malayalam tutor.\nAsk me any phrases, idioms, or pronunciations!`,
      hi: `🌟 **हिन्दी (Hindi):** नमस्ते! (Namaste!)\n🔤 **Pronunciation:** \`Namaste!\`\n\n📖 I am your high-precision AI Hindi tutor.\nType or speak to start fluent regional practice!`
    };
    return greetings[targetLang] || greetings.kn;
  }, [targetLang]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: getInitialMessage(),
      audioText: currentTarget.greeting || currentTarget.name,
      lang: currentTarget.code
    }
  ]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleSend = useCallback(async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now(), role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5),
          nativeLang: nativeLang || "ta",
          targetLang: targetLang || "kn"
        })
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const aiReply = data.text || "I am ready! Ask any word or phrase.";
      const audioText = data.audioText || aiReply;
      const replyLang = data.lang || currentTarget.code;

      const aiMessage = {
        id: Date.now() + 1,
        role: "ai",
        text: aiReply,
        audioText,
        lang: replyLang
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (audioText && audioText.length > 0) {
        speak(audioText, replyLang);
      }
    } catch {
      // Fallback
      setTimeout(() => {
        const fallbackReply = `🌟 **${currentTarget.name}:** ${currentTarget.greeting}!\n📖 **Meaning:** Welcome! Feel free to ask any question.`;
        const aiMessage = {
          id: Date.now() + 1,
          role: "ai",
          text: fallbackReply,
          audioText: currentTarget.greeting,
          lang: currentTarget.code
        };
        setMessages((prev) => [...prev, aiMessage]);
        speak(currentTarget.greeting, currentTarget.code);
      }, 500);
    } finally {
      setIsAiTyping(false);
    }
  }, [messages, nativeLang, targetLang, currentTarget.code, currentTarget.name, currentTarget.greeting, speak]);

  useEffect(() => {
    if (transcript) {
      handleSend(transcript);
    }
  }, [transcript, handleSend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isAiTyping) return;
    playClick();
    handleSend(input.trim());
  };

  const handleResetChat = () => {
    playClick();
    stopSpeech();
    setMessages([
      {
        id: Date.now(),
        role: "ai",
        text: getInitialMessage(),
        audioText: currentTarget.name,
        lang: currentTarget.code
      }
    ]);
  };

  const handleToggleMic = () => {
    if (isListening) {
      playMicStop();
      stopListening();
    } else {
      playMicStart();
      startListening(currentMicLangCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Header */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClick();
                navigate("/dashboard");
              }}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/10">
                <Bot className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <span>Indic AI Tutor</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                    Qwen 3.6
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  {currentNative.name} ({currentNative.script}) ➔ {currentTarget.name} ({currentTarget.script})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mic Lang Selector */}
            <button
              onClick={() => {
                playClick();
                setMicMode((m) => (m === "native" ? "target" : "native"));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Switch voice input language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Mic: {micMode === "native" ? currentNative.name : currentTarget.name}</span>
            </button>

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Feed */}
      <main className="max-w-4xl mx-auto w-full flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl rounded-3xl p-5 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-semibold rounded-tr-none"
                  : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
              }`}
            >
              {msg.role === "ai" ? (
                <div className="space-y-3">
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Audio Speaker & Quick Drill Chips */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => speak(msg.audioText || msg.text, msg.lang || currentTarget.code)}
                      disabled={isAudioLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-colors"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse text-amber-300" : ""}`} />
                      <span>{isPlaying ? "Pronouncing..." : "Listen Audio"}</span>
                    </button>

                    <div className="flex flex-wrap gap-1.5">
                      {precisionActionChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(`${chip.suffix} (Regarding: "${msg.audioText || 'the phrase'}")`)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-none p-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1">Composing authentic Indic response...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Starter Prompts Carousel */}
      {messages.length <= 2 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {starterPrompts.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(starter.prompt)}
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all hover:scale-105"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask in ${currentNative.name} or practice ${currentTarget.name}...`}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 pr-12 transition-all"
              />

              {/* Live Audio Wave visualizer while listening */}
              {isListening && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 h-4">
                  {[0.4, 0.8, 1, 0.6, 0.9].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${Math.max(3, h * 16 * audioLevel)}px` }}
                      className="w-1 bg-amber-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mic Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleMic}
              className={`p-3.5 rounded-2xl border transition-all ${
                isListening
                  ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title={isListening ? "Stop listening" : `Start speaking in ${micMode === "native" ? currentNative.name : currentTarget.name}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            {/* Send Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.92 }}
              disabled={!input.trim() || isAiTyping}
              className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/10"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </footer>
    </div>
  );
}