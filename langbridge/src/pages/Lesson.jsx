import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Heart,
  Clock,
  RotateCcw,
  Trophy,
  Mic,
  MicOff,
  Flame,
  Star,
  Sparkles,
  Zap,
  Layers,
  Award
} from "lucide-react";
import Button from "../components/ui/Button";
import useSpeech from "../hooks/useSpeech";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSoundEffects from "../hooks/useSoundEffects";
import useStore from "../store/useStore";
import confetti from "canvas-confetti";
import { useParams, useNavigate } from "react-router-dom";

const langCodes = {
  ta: "ta-IN",
  ml: "ml-IN",
  kn: "kn-IN",
  te: "te-IN",
  hi: "hi-IN",
};

// Floating XP and Combo animation overlay
function FloatingGameNotification({ points = 10, label = "XP", isCombo = false }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.6, rotate: isCombo ? -8 : 0 }}
      animate={{ opacity: 0, y: -100, scale: 1.3, rotate: isCombo ? 6 : 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black drop-shadow-2xl ${
        isCombo
          ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-2xl border-2 border-yellow-200"
          : "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xl border border-amber-200"
      }`}
    >
      <Sparkles className="w-6 h-6 animate-spin" />
      <span>+{points} {label}</span>
    </motion.div>
  );
}

const fallbackVocab = [
  {
    meaning: "Hello / Greetings",
    ta: { word: "வணக்கம்", translit: "Vanakkam" },
    ml: { word: "നമസ്കാരം", translit: "Namaskaram" },
    kn: { word: "ನಮಸ್ಕಾರ", translit: "Namaskara" },
    te: { word: "నమస్కారం", translit: "Namaskaram" },
    hi: { word: "नमस्ते", translit: "Namaste" }
  },
  {
    meaning: "Thank you",
    ta: { word: "நன்றி", translit: "Nandri" },
    ml: { word: "നന്ദി", translit: "Nandi" },
    kn: { word: "ಧನ್ಯವಾದಗಳು", translit: "Dhanyavadagalu" },
    te: { word: "ధన్యవాదాలు", translit: "Dhanyavadalu" },
    hi: { word: "धन्यवाद", translit: "Dhanyavaad" }
  },
  {
    meaning: "Good morning",
    ta: { word: "காலை வணக்கம்", translit: "Kaalaivanakkam" },
    ml: { word: "സുപ്രഭാതം", translit: "Suprabhatham" },
    kn: { word: "ಶುಭೋದಯ", translit: "Shubhodaya" },
    te: { word: "శుభోదయం", translit: "Shubhodayam" },
    hi: { word: "सुप्रभात", translit: "Suprabhat" }
  },
  {
    meaning: "Welcome",
    ta: { word: "வரவேற்கிறேன்", translit: "Varaverkiren" },
    ml: { word: "സ്വാഗതം", translit: "Swagatham" },
    kn: { word: "ಸ್ವಾಗತ", translit: "Swagata" },
    te: { word: "స్వాగతం", translit: "Swagatham" },
    hi: { word: "स्वागत है", translit: "Swagat hai" }
  }
];

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { speak, isPlaying, isLoading: isSpeechLoading } = useSpeech();
  const { playCorrect, playWrong, playSuccess, playClick, playMicStart, playMicStop } = useSoundEffects();
  const { completeLesson, targetLang = "hi", nativeLang = "ta" } = useStore();
  
  const timerRef = useRef(null);
  const targetCode = langCodes[targetLang] || "hi-IN";

  // Derive canonical unit suffix (e.g. "01", "02")
  const unitSuffix = useMemo(() => {
    if (!lessonId) return "01";
    const parts = lessonId.split("-");
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    if (!isNaN(num)) {
      return String(num).padStart(2, "0");
    }
    return lastPart || "01";
  }, [lessonId]);

  const canonicalLessonId = `${nativeLang}-${targetLang}-${unitSuffix}`;

  // Keep route synced with the active language pair
  useEffect(() => {
    if (lessonId && lessonId !== canonicalLessonId) {
      navigate(`/lesson/${canonicalLessonId}`, { replace: true });
    }
  }, [lessonId, canonicalLessonId, navigate]);

  const {
    isListening,
    transcript,
    audioLevel,
    startListening,
    stopListening,
    evaluatePronunciation,
    evaluateWithMLModel
  } = useSpeechRecognition(targetCode);

  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Game Stage Phases: "learn" (Cards) -> "match" (Match Blitz) -> "speak" (Voice Arena) -> "listen" (Audio Detective) -> "quiz" (Speed Blitz) -> "complete" / "gameover"
  const [phase, setPhase] = useState("learn");
  const [cardIndex, setCardIndex] = useState(0);

  // Game Mechanics: Lives, Score, Combo, Timers
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameNotification, setGameNotification] = useState(null);
  const [screenShake, setScreenShake] = useState(false);

  // Match Blitz State
  const [selectedNativeCard, setSelectedNativeCard] = useState(null);
  const [selectedTargetCard, setSelectedTargetCard] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [matchError, setMatchError] = useState(null);

  // Voice Arena State
  const [speakIndex, setSpeakIndex] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Audio Detective State
  const [listenIndex, setListenIndex] = useState(0);
  const [listenSelected, setListenSelected] = useState(null);
  const [listenChecked, setListenChecked] = useState(false);

  // Speed Quiz Blitz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12);

  // Trigger floating notifications
  const triggerNotification = useCallback((points, label = "XP", isCombo = false) => {
    setGameNotification({ points, label, isCombo, id: Date.now() });
    setTimeout(() => setGameNotification(null), 1100);
  }, []);

  // Safe Confetti Launcher
  const triggerConfetti = useCallback(() => {
    try {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E8A317", "#F59E0B", "#10B981", "#6366F1", "#EC4899"]
        });
      }
    } catch {
      // Ignore if canvas is unavailable
    }
  }, []);

  // Fetch lesson data with dynamic language pair support
  useEffect(() => {
    let isMounted = true;
    async function fetchLesson() {
      try {
        setLoading(true);
        const res = await fetch(`/api/lessons/${canonicalLessonId}?native=${nativeLang}&target=${targetLang}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setLessonData(data);
          }
        } else {
          throw new Error("Failed to fetch lesson data");
        }
      } catch (err) {
        console.warn("Lesson fetch note:", err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchLesson();
    return () => {
      isMounted = false;
    };
  }, [canonicalLessonId, nativeLang, targetLang]);

  // Guaranteed fallback data arrays aligned with user's selected language pair
  const words = useMemo(() => {
    if (lessonData?.words && Array.isArray(lessonData.words) && lessonData.words.length > 0) {
      return lessonData.words;
    }
    const n = nativeLang || "ta";
    const t = targetLang || "hi";
    return fallbackVocab.map((item) => ({
      word: item[n]?.word || item.ta.word,
      transliteration: item[n]?.translit || item.ta.translit,
      meaning: item.meaning,
      meaningInTarget: item[t]?.word || item.hi.word,
      targetTranslit: item[t]?.translit || item.hi.translit
    }));
  }, [lessonData, nativeLang, targetLang]);

  const matchPairs = useMemo(() => {
    if (lessonData?.matchPairs && Array.isArray(lessonData.matchPairs) && lessonData.matchPairs.length > 0) {
      return lessonData.matchPairs;
    }
    return words.slice(0, 4).map((w, idx) => ({
      id: idx + 1,
      native: w.word,
      target: w.meaningInTarget,
      translit: w.targetTranslit
    }));
  }, [lessonData, words]);

  const quiz = useMemo(() => {
    if (lessonData?.quiz && Array.isArray(lessonData.quiz) && lessonData.quiz.length > 0) {
      return lessonData.quiz;
    }
    return words.slice(0, 4).map((w, idx) => {
      const correctWord = w.meaningInTarget;
      const otherWords = words.filter((_, i) => i !== idx).map((o) => o.meaningInTarget);
      const options = [correctWord, ...otherWords.slice(0, 3)].sort(() => 0.5 - Math.random());
      return {
        question: `What is "${w.word}"?`,
        options,
        correct: options.indexOf(correctWord),
        nativePrompt: w.word,
        targetWord: correctWord,
        transliteration: w.targetTranslit
      };
    });
  }, [lessonData, words]);

  // Shuffled native and target cards for matching game
  const shuffledNative = useMemo(() => {
    return [...matchPairs].sort(() => 0.5 - Math.random());
  }, [matchPairs]);

  const shuffledTarget = useMemo(() => {
    return [...matchPairs].sort(() => 0.5 - Math.random());
  }, [matchPairs]);

  // Safely index current items
  const currentWord = words[cardIndex] || words[0] || {};
  const currentSpeak = words[speakIndex] || words[0] || {};
  const currentListen = quiz[listenIndex] || quiz[0] || {};
  const currentQuiz = quiz[quizIndex] || quiz[0] || {};

  // Calculate Next Unit ID
  const nextUnitId = useMemo(() => {
    try {
      const currentUnitNum = parseInt(unitSuffix, 10) || 1;
      const nextUnitNum = Math.min(13, currentUnitNum + 1);
      return `${nativeLang}-${targetLang}-${String(nextUnitNum).padStart(2, "0")}`;
    } catch {
      // Ignore
    }
    return `/dashboard`;
  }, [unitSuffix, nativeLang, targetLang]);

  // Dynamic Overall Progress Calculation
  const progress = useMemo(() => {
    if (phase === "learn") return Math.min(20, Math.round(((cardIndex + 1) / (words.length || 1)) * 20));
    if (phase === "match") return Math.min(40, 20 + Math.round((matchedIds.length / (matchPairs.length || 1)) * 20));
    if (phase === "speak") return Math.min(60, 40 + Math.round(((speakIndex + 1) / (words.length || 1)) * 20));
    if (phase === "listen") return Math.min(80, 60 + Math.round(((listenIndex + 1) / (quiz.length || 1)) * 20));
    if (phase === "quiz") return Math.min(99, 80 + Math.round(((quizIndex + 1) / (quiz.length || 1)) * 20));
    return 100;
  }, [phase, cardIndex, words.length, matchedIds.length, matchPairs.length, speakIndex, listenIndex, quiz.length, quizIndex]);

  // Real-time Speech Evaluation Effect
  const currentSpeakMeaning = currentSpeak?.meaningInTarget;
  const currentSpeakTranslit = currentSpeak?.targetTranslit;

  useEffect(() => {
    if (phase === "speak" && transcript && currentSpeakMeaning) {
      let isCurrent = true;
      async function runSpeechEval() {
        try {
          const result = await evaluateWithMLModel(
            transcript,
            currentSpeakMeaning,
            targetLang,
            currentSpeakTranslit
          );
          if (!isCurrent) return;
          setEvaluationResult(result);
          if (result.score >= 55) {
            playCorrect();
            const earned = result.score >= 80 ? 30 : 20;
            setScore((s) => s + earned);
            setCombo((c) => {
              const next = c + 1;
              setMaxCombo((m) => Math.max(m, next));
              return next;
            });
            triggerNotification(earned, "SPEECH XP", combo >= 2);
          } else {
            playWrong();
            setCombo(0);
          }
        } catch {
          if (!isCurrent) return;
          const fallbackResult = evaluatePronunciation(
            transcript,
            currentSpeakMeaning,
            currentSpeakTranslit
          );
          setEvaluationResult(fallbackResult);
        }
      }
      runSpeechEval();
      return () => {
        isCurrent = false;
      };
    }
  }, [transcript, phase, currentSpeakMeaning, currentSpeakTranslit, evaluateWithMLModel, evaluatePronunciation, playCorrect, playWrong, targetLang, combo, triggerNotification]);

  // STAGE 1: Flashcards Next Handler
  const handleNextCard = () => {
    playClick();
    setScore((s) => s + 15);
    triggerNotification(15, "XP");
    if (cardIndex < words.length - 1) {
      setCardIndex((c) => c + 1);
    } else {
      if (matchPairs.length >= 2) {
        setPhase("match");
      } else {
        setPhase("speak");
      }
    }
  };

  // STAGE 2: Card Matcher Click Handler
  const handleSelectCard = (type, item) => {
    playClick();
    if (matchedIds.includes(item.id)) return;

    if (type === "native") {
      setSelectedNativeCard(item);
      if (selectedTargetCard) {
        checkMatch(item, selectedTargetCard);
      }
    } else {
      setSelectedTargetCard(item);
      speak(item.target, targetCode);
      if (selectedNativeCard) {
        checkMatch(selectedNativeCard, item);
      }
    }
  };

  const checkMatch = (nativeItem, targetItem) => {
    if (nativeItem.id === targetItem.id) {
      playCorrect();
      setMatchedIds((prev) => {
        const next = [...prev, nativeItem.id];
        if (next.length >= matchPairs.length) {
          setTimeout(() => setPhase("speak"), 750);
        }
        return next;
      });
      setSelectedNativeCard(null);
      setSelectedTargetCard(null);
      
      const earned = 25;
      setScore((s) => s + earned);
      setCombo((c) => {
        const next = c + 1;
        setMaxCombo((m) => Math.max(m, next));
        return next;
      });
      triggerNotification(earned, "COMBO XP", true);
    } else {
      playWrong();
      setCombo(0);
      setMatchError([nativeItem.id, targetItem.id]);
      setScreenShake(true);
      setTimeout(() => {
        setSelectedNativeCard(null);
        setSelectedTargetCard(null);
        setMatchError(null);
        setScreenShake(false);
      }, 700);
    }
  };

  // STAGE 3: Spoken Mic Toggle
  const handleToggleSpeakMic = () => {
    if (isListening) {
      playMicStop();
      stopListening();
    } else {
      playMicStart();
      setEvaluationResult(null);
      startListening(targetCode);
    }
  };

  const handleNextSpeak = () => {
    playClick();
    stopListening();
    setEvaluationResult(null);
    if (speakIndex < words.length - 1) {
      setSpeakIndex((s) => s + 1);
    } else {
      setPhase("listen");
    }
  };

  // STAGE 4: Listen & Comprehend Choice
  const handleCheckListen = () => {
    if (listenSelected === null || listenChecked) return;
    setListenChecked(true);

    const isMatch = listenSelected === currentListen.correct;
    if (isMatch) {
      playCorrect();
      const earned = 25;
      setScore((s) => s + earned);
      setCombo((c) => {
        const next = c + 1;
        setMaxCombo((m) => Math.max(m, next));
        return next;
      });
      triggerNotification(earned, "AUDIO XP", combo >= 2);
    } else {
      playWrong();
      setCombo(0);
      setHearts((h) => {
        const nextHearts = Math.max(0, h - 1);
        if (nextHearts === 0) {
          setTimeout(() => setPhase("gameover"), 800);
        }
        return nextHearts;
      });
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }
  };

  const handleNextListen = () => {
    playClick();
    setListenSelected(null);
    setListenChecked(false);
    if (listenIndex < quiz.length - 1) {
      setListenIndex((l) => l + 1);
    } else {
      setPhase("quiz");
    }
  };

  // STAGE 5: Speed Quiz Timeout Handler
  const handleQuizTimeout = useCallback(() => {
    playWrong();
    setShowResult(true);
    setCombo(0);
    setHearts((h) => {
      const nextHearts = Math.max(0, h - 1);
      if (nextHearts === 0) {
        setTimeout(() => setPhase("gameover"), 800);
      }
      return nextHearts;
    });
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 600);
  }, [playWrong]);

  // Dynamic Countdown Timer for Speed Quiz
  useEffect(() => {
    if (phase === "quiz" && !showResult && hearts > 0) {
      setTimeLeft(12);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleQuizTimeout();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, quizIndex, showResult, hearts, handleQuizTimeout]);

  // STAGE 5: Option Select
  const handleSelectQuizOption = (index) => {
    if (showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(index);

    const isRight = index === currentQuiz.correct;
    setShowResult(true);

    if (isRight) {
      playCorrect();
      const speedBonus = timeLeft >= 7 ? 15 : 5;
      const totalEarned = 25 + speedBonus;
      setScore((s) => s + totalEarned);
      setCombo((c) => {
        const next = c + 1;
        setMaxCombo((m) => Math.max(m, next));
        return next;
      });
      triggerNotification(totalEarned, speedBonus > 5 ? "SPEED BONUS!" : "QUIZ XP", true);
    } else {
      playWrong();
      setCombo(0);
      setHearts((h) => {
        const nextHearts = Math.max(0, h - 1);
        if (nextHearts === 0) {
          setTimeout(() => setPhase("gameover"), 800);
        }
        return nextHearts;
      });
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }
  };

  const handleNextQuiz = () => {
    playClick();
    setSelectedOption(null);
    setShowResult(false);

    if (quizIndex < quiz.length - 1) {
      setQuizIndex((q) => q + 1);
    } else {
      // Victory Completion Guaranteed Flow
      playSuccess();
      const finalReward = lessonData?.xp_reward || 80;
      completeLesson(lessonId, finalReward);
      setPhase("complete");
      triggerConfetti();
    }
  };

  // Revive with Hearts
  const handleRevive = () => {
    playClick();
    setHearts(2);
    setShowResult(false);
    setSelectedOption(null);
    setPhase("quiz");
  };

  // Retry Entire Lesson
  const handleRetryLesson = () => {
    playClick();
    setPhase("learn");
    setCardIndex(0);
    setMatchedIds([]);
    setSelectedNativeCard(null);
    setSelectedTargetCard(null);
    setSpeakIndex(0);
    setEvaluationResult(null);
    setListenIndex(0);
    setListenSelected(null);
    setListenChecked(false);
    setQuizIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setHearts(3);
    setScore(0);
    setCombo(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mb-4 shadow-lg shadow-amber-500/20"
        />
        <p className="text-amber-400 font-bold tracking-wide animate-pulse">Loading Game Arena...</p>
        <span className="text-xs text-slate-500 mt-1">Preparing vocabulary quest</span>
      </div>
    );
  }

  // Star Rating based on hearts & accuracy
  const starsEarned = hearts >= 3 ? 3 : hearts === 2 ? 2 : 1;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 ${
        screenShake ? "animate-shake" : ""
      }`}
    >
      {/* Floating Game Event Banner */}
      {gameNotification && (
        <FloatingGameNotification
          points={gameNotification.points}
          label={gameNotification.label}
          isCombo={gameNotification.isCombo}
        />
      )}

      {/* GAME HUD (Top Bar) */}
      <header className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back / Exit Button */}
          <button
            onClick={() => navigate("/dashboard")}
            title="Return to Dashboard"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Progress & Quest Stages */}
          <div className="flex-1 max-w-md mx-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                {phase === "learn" && "Stage 1 • Card Forge"}
                {phase === "match" && "Stage 2 • Match Blitz"}
                {phase === "speak" && "Stage 3 • Voice Arena"}
                {phase === "listen" && "Stage 4 • Sound Detective"}
                {phase === "quiz" && "Stage 5 • Speed Blitz"}
                {phase === "complete" && "Victory Achieved! 🏆"}
                {phase === "gameover" && "Out of Lives"}
              </span>
              <span className="font-mono text-slate-300">{progress}%</span>
            </div>
            
            {/* Glowing Neon Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full shadow-sm shadow-amber-500/50"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Score, Combo & Hearts Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Combo Streak Counter */}
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="hidden sm:flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 font-black text-xs px-2.5 py-1 rounded-xl shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-bounce" />
                <span>{combo}x STREAK</span>
              </motion.div>
            )}

            {/* Total Game Score */}
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl">
              <Trophy className="w-3.5 h-3.5" />
              <span>{score} XP</span>
            </div>

            {/* Lives / Hearts Indicator */}
            <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-xl">
              <Heart
                className={`w-4 h-4 text-rose-500 fill-rose-500 ${
                  hearts <= 1 ? "animate-ping text-rose-400" : ""
                }`}
              />
              <span className="text-xs font-black text-rose-400">{hearts}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GAME ARENA */}
      <main className="max-w-4xl mx-auto w-full flex-1 p-4 sm:p-6 flex flex-col justify-center items-center relative">
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* STAGE 1: CARD FORGE (Flashcards & Vocabulary)            */}
          {/* ======================================================== */}
          {phase === "learn" && (
            <motion.div
              key={`card-${cardIndex}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5" /> Card {cardIndex + 1} of {words.length}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Listen, Read & Memorize
                </h2>
              </div>

              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400" />

                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Target Word ({targetLang.toUpperCase()})
                </div>
                
                <h3 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-md">
                  {currentWord.meaningInTarget}
                </h3>

                <div className="mb-6">
                  <span className="text-base sm:text-lg font-mono text-amber-300 bg-amber-500/15 px-4 py-1 rounded-full border border-amber-500/30 inline-block font-semibold">
                    {currentWord.targetTranslit}
                  </span>
                </div>

                <div className="my-5 border-t border-slate-800/80 pt-5 bg-slate-900/40 rounded-2xl p-4">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Mother Tongue ({nativeLang.toUpperCase()})
                  </div>
                  <p className="text-2xl font-bold text-slate-100">{currentWord.word}</p>
                  <p className="text-slate-400 text-sm mt-0.5 font-medium">{currentWord.meaning}</p>
                </div>

                {/* Instant Audio Speaker Button */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => speak(currentWord.meaningInTarget, targetCode)}
                    disabled={isSpeechLoading}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10"
                  >
                    <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-pulse text-amber-400" : ""}`} />
                    <span>{isPlaying ? "Pronouncing..." : "Play Audio"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleNextCard}
                  className="w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-amber-500/20"
                >
                  <span>{cardIndex < words.length - 1 ? "Next Word (+15 XP)" : "Start Match Blitz ➔"}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE 2: MATCH BLITZ (Interactive Arcade Tile Matcher)    */}
          {/* ======================================================== */}
          {phase === "match" && (
            <motion.div
              key="match-phase"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5" /> Stage 2 • Arcade Match
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Connect the Word Pairs</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Tap a word from each column to link them (+25 XP per pair)</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {/* Native Column */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 text-center bg-slate-900/60 py-1.5 rounded-xl border border-slate-800">
                    Mother Tongue
                  </div>
                  {shuffledNative.map((item) => {
                    const isMatched = matchedIds.includes(item.id);
                    const isSelected = selectedNativeCard?.id === item.id;
                    const isErr = matchError && matchError[0] === item.id;

                    return (
                      <motion.button
                        key={`native-${item.id}`}
                        whileHover={{ scale: isMatched ? 1 : 1.02 }}
                        whileTap={{ scale: isMatched ? 1 : 0.98 }}
                        disabled={isMatched}
                        onClick={() => handleSelectCard("native", item)}
                        className={`w-full p-4 rounded-2xl border text-center font-bold transition-all ${
                          isMatched
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50 line-through cursor-not-allowed"
                            : isErr
                            ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-shake"
                            : isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/20"
                            : "bg-slate-900 border-slate-800 text-white hover:border-slate-700"
                        }`}
                      >
                        {item.native}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Target Column */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 text-center bg-slate-900/60 py-1.5 rounded-xl border border-slate-800">
                    Target Script
                  </div>
                  {shuffledTarget.map((item) => {
                    const isMatched = matchedIds.includes(item.id);
                    const isSelected = selectedTargetCard?.id === item.id;
                    const isErr = matchError && matchError[1] === item.id;

                    return (
                      <motion.button
                        key={`target-${item.id}`}
                        whileHover={{ scale: isMatched ? 1 : 1.02 }}
                        whileTap={{ scale: isMatched ? 1 : 0.98 }}
                        disabled={isMatched}
                        onClick={() => handleSelectCard("target", item)}
                        className={`w-full p-4 rounded-2xl border text-center font-bold transition-all ${
                          isMatched
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50 line-through cursor-not-allowed"
                            : isErr
                            ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-shake"
                            : isSelected
                            ? "bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/20"
                            : "bg-slate-900 border-slate-800 text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="text-base">{item.target}</div>
                        <div className="text-xs font-mono text-slate-400 font-normal mt-0.5">{item.translit}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE 3: VOICE ARENA (Spoken AI Pronunciation Duel)       */}
          {/* ======================================================== */}
          {phase === "speak" && (
            <motion.div
              key={`speak-${speakIndex}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  <Mic className="w-3.5 h-3.5" /> Stage 3 • Voice Arena ({speakIndex + 1}/{words.length})
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Speak with Real AI</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Tap mic and pronounce the phrase clearly</p>
              </div>

              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-7 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400" />

                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Target Word</div>
                <h3 className="text-4xl sm:text-5xl font-black text-white mb-2">{currentSpeak.meaningInTarget}</h3>
                
                <div className="mb-4">
                  <span className="text-base font-mono text-purple-300 bg-purple-500/15 px-4 py-1 rounded-full border border-purple-500/30 inline-block font-semibold">
                    {currentSpeak.targetTranslit}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-5">
                  <button
                    onClick={() => speak(currentSpeak.meaningInTarget, targetCode)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-purple-300 bg-slate-800/90 px-3.5 py-1.5 rounded-full border border-slate-700 transition-all hover:scale-105"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Hear Native Sound</span>
                  </button>
                </div>

                {/* Big Glowing Voice Orb Button */}
                <div className="flex flex-col items-center justify-center my-3">
                  <div className="relative">
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl"
                        animate={{ scale: [1, 1.4 + audioLevel * 0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleSpeakMic}
                      className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
                        isListening
                          ? "bg-rose-600 text-white ring-8 ring-rose-500/30 animate-pulse"
                          : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-purple-500/30"
                      }`}
                    >
                      {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                      <span className="text-[10px] font-black uppercase mt-1">
                        {isListening ? "Listening..." : "Tap to Speak"}
                      </span>
                    </motion.button>
                  </div>

                  {/* Audio Decibel Equalizer */}
                  {isListening && (
                    <div className="flex items-center gap-1 mt-4 h-6">
                      {[0.3, 0.6, 1, 0.7, 0.9, 0.5, 0.8].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: `${Math.max(4, h * 24 * (audioLevel || 0.5))}px` }}
                          transition={{ duration: 0.08 }}
                          className="w-1.5 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Pronunciation Score Card */}
                {evaluationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-5 p-4 rounded-2xl border text-left ${
                      evaluationResult.score >= 80
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : evaluationResult.score >= 55
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {evaluationResult.score >= 80 ? "S-Rank Native Accuracy" : evaluationResult.score >= 55 ? "A-Rank Good Tone" : "B-Rank Needs Practice"}
                      </span>
                      <span className="text-lg font-black">{evaluationResult.score}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                      <div
                        className={`h-full rounded-full ${
                          evaluationResult.score >= 80
                            ? "bg-emerald-400"
                            : evaluationResult.score >= 55
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                        style={{ width: `${evaluationResult.score}%` }}
                      />
                    </div>

                    <p className="text-xs sm:text-sm font-semibold">{evaluationResult.feedback}</p>
                    {evaluationResult.spoken && (
                      <p className="text-xs text-slate-400 mt-1">
                        Detected: &quot;<span className="text-slate-200">{evaluationResult.spoken}</span>&quot;
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  onClick={handleNextSpeak}
                  className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 underline font-medium"
                >
                  Skip for now
                </button>
                <Button onClick={handleNextSpeak} className="px-8 py-3.5 flex items-center gap-2 font-bold shadow-lg shadow-purple-500/20">
                  <span>{speakIndex < words.length - 1 ? "Next Word" : "Audio Detective ➔"}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE 4: AUDIO DETECTIVE (Listening Comprehension)         */}
          {/* ======================================================== */}
          {phase === "listen" && (
            <motion.div
              key={`listen-${listenIndex}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  <Volume2 className="w-3.5 h-3.5" /> Stage 4 • Audio Detective ({listenIndex + 1}/{quiz.length})
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Listen and Identify</h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl text-center mb-5">
                <button
                  onClick={() => speak(currentListen.targetWord, targetCode)}
                  className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 mx-auto flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 mb-3"
                >
                  <Volume2 className="w-10 h-10 animate-pulse" />
                </button>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tap to hear audio</p>
                <p className="text-lg font-bold text-white mt-2">Which word matches the sound?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {(currentListen.options || []).map((opt, idx) => {
                  const isSelected = listenSelected === idx;
                  const isCorrectAnswer = idx === currentListen.correct;

                  let btnStyle = "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700";
                  if (listenChecked) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold ring-2 ring-emerald-500/50";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500/25 border-rose-500 text-rose-300 ring-2 ring-rose-500/50";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-cyan-500/25 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/50 shadow-md shadow-cyan-500/20";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={listenChecked}
                      onClick={() => setListenSelected(idx)}
                      className={`p-4 rounded-2xl border text-center font-bold transition-all text-base ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                {!listenChecked ? (
                  <Button
                    onClick={handleCheckListen}
                    disabled={listenSelected === null}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 font-bold shadow-lg shadow-cyan-500/20"
                  >
                    Verify Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextListen} className="w-full py-3.5 flex items-center justify-center gap-2 font-bold">
                    <span>{listenIndex < quiz.length - 1 ? "Next Audio Track" : "Speed Blitz Quiz ➔"}</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE 5: SPEED BLITZ QUIZ (Timed Precision Trivia)        */}
          {/* ======================================================== */}
          {phase === "quiz" && (
            <motion.div
              key={`quiz-${quizIndex}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              {/* Adrenaline Countdown Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Stage 5 • Speed Quiz ({quizIndex + 1}/{quiz.length})
                </div>
                
                <div
                  className={`flex items-center gap-1 font-mono font-black text-sm px-3 py-1 rounded-full border transition-colors ${
                    timeLeft <= 4
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                      : timeLeft <= 7
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Ticking Visual Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 4 ? "bg-rose-500" : timeLeft <= 7 ? "bg-amber-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${(timeLeft / 12) * 100}%` }}
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center mb-5 relative">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1.5">{currentQuiz.question}</h3>
                <p className="text-xs text-slate-400 font-medium">Select the accurate translation</p>
              </div>

              <div className="space-y-3 mb-5">
                {(currentQuiz.options || []).map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectAnswer = index === currentQuiz.correct;

                  let style = "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700";
                  if (showResult) {
                    if (isCorrectAnswer) {
                      style = "bg-emerald-500/25 border-emerald-400 text-emerald-300 font-black ring-2 ring-emerald-500/50";
                    } else if (isSelected) {
                      style = "bg-rose-500/25 border-rose-500 text-rose-300 ring-2 ring-rose-500/50";
                    }
                  } else if (isSelected) {
                    style = "bg-amber-500/25 border-amber-400 text-amber-300";
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResult ? 1 : 1.01 }}
                      whileTap={{ scale: showResult ? 1 : 0.99 }}
                      disabled={showResult}
                      onClick={() => handleSelectQuizOption(index)}
                      className={`w-full p-4 rounded-2xl border text-left font-bold transition-all flex items-center justify-between text-base ${style}`}
                    >
                      <span>{option}</span>
                      {showResult && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {showResult && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-400" />}
                    </motion.button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <Button onClick={handleNextQuiz} className="w-full py-3.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-amber-500/20">
                    <span>{quizIndex < quiz.length - 1 ? "Next Question" : "Complete Quest & View Rewards 🏆"}</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE: VICTORY HALL (Game Complete / Rewards Showcase)    */}
          {/* ======================================================== */}
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg text-center bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400" />
              
              {/* Star Rating Animation */}
              <div className="flex items-center justify-center gap-3 mb-4 mt-2">
                {[1, 2, 3].map((starIdx) => (
                  <motion.div
                    key={starIdx}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + starIdx * 0.15, type: "spring", stiffness: 300 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border ${
                      starIdx <= starsEarned
                        ? "bg-gradient-to-tr from-amber-500 to-yellow-300 border-yellow-200 text-slate-950 shadow-lg shadow-amber-500/30"
                        : "bg-slate-800/60 border-slate-700 text-slate-600"
                    }`}
                  >
                    <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${starIdx <= starsEarned ? "fill-slate-950" : ""}`} />
                  </motion.div>
                ))}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                Quest Mastered! 🏆
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 font-medium">
                You conquered vocabulary, matching, AI pronunciation, and speed quiz challenges!
              </p>

              {/* Game Stats Cards */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 text-left">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">XP Gained</span>
                  <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
                    +{score || lessonData?.xp_reward || 80}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Streak</span>
                  <div className="text-lg sm:text-xl font-black text-orange-400 mt-0.5">
                    {maxCombo > 1 ? `${maxCombo}x 🔥` : "1x"}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Lives Saved</span>
                  <div className="text-lg sm:text-xl font-black text-rose-400 mt-0.5">
                    {hearts}/3 ❤️
                  </div>
                </div>
              </div>

              {/* Mastered Vocabulary Review List */}
              <div className="mb-6 text-left">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Words Mastered ({words.length})</span>
                  <span className="text-emerald-400 font-semibold">100% Cleared</span>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {words.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-200">{w.meaningInTarget}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{w.targetTranslit} • {w.word}</div>
                      </div>
                      <button
                        onClick={() => speak(w.meaningInTarget, targetCode)}
                        className="p-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {nextUnitId !== "/dashboard" ? (
                  <Button
                    onClick={() => {
                      playClick();
                      navigate(`/lesson/${nextUnitId}`);
                    }}
                    className="w-full py-3.5 font-bold text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Play Next Unit 🚀</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 text-slate-200 border-slate-700 hover:bg-slate-800"
                >
                  Return to Dashboard
                </Button>

                <button
                  onClick={handleRetryLesson}
                  className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay for High Score</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* STAGE: GAME OVER (Out of Lives / Revive Option)           */}
          {/* ======================================================== */}
          {phase === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md text-center bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center mb-5 animate-pulse">
                <Heart className="w-10 h-10 fill-rose-500/40" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-1.5">Out of Lives!</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 font-medium">
                Language mastering takes repetition. Revive with bonus hearts or restart!
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRevive}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>Revive (+2 Hearts)</span>
                </Button>

                <button
                  onClick={handleRetryLesson}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Lesson</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}