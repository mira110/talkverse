import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Volume2,
  Trophy,
  Mic,
  MicOff
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../components/ui/Button";
import useStore from "../store/useStore";
import useSpeech from "../hooks/useSpeech";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSoundEffects from "../hooks/useSoundEffects";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

// Comprehensive multi-language sentence datasets across Tamil, Malayalam, Telugu, Kannada, and Hindi
const sentenceDictionary = {
  // Target: Kannada (kn)
  kn: [
    {
      id: 1,
      translations: {
        ta: "நான் நலமாக இருக்கிறேன்",
        ml: "എനിക്ക് സുഖമാണ്",
        te: "నేను బాగున్నాను",
        hi: "मैं ठीक हूँ"
      },
      targetSentence: "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ",
      correctOrder: ["ನಾನು", "ಆರಾಮಾಗಿದ್ದೇನೆ"],
      scrambled: ["ಆರಾಮಾಗಿದ್ದೇನೆ", "ನಾನು"],
      transliteration: "Naanu aaraamaagiddene"
    },
    {
      id: 2,
      translations: {
        ta: "உங்கள் பெயர் என்ன?",
        ml: "നിങ്ങളുടെ പേര് എന്താണ്?",
        te: "మీ పేరు ఏమిటి?",
        hi: "आपका नाम क्या है?"
      },
      targetSentence: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
      correctOrder: ["ನಿಮ್ಮ", "ಹೆಸರು", "ಏನು?"],
      scrambled: ["ಏನು?", "ಹೆಸರು", "ನಿಮ್ಮ"],
      transliteration: "Nimma hesaru enu?"
    },
    {
      id: 3,
      translations: {
        ta: "எனக்கு கன்னடம் பிடிக்கும்",
        ml: "എനിക്ക് കന്നഡ ഇഷ്ടമാണ്",
        te: "నాకు కన్నడ ఇష్టం",
        hi: "मुझे कन्नड़ पसंद है"
      },
      targetSentence: "ನನಗೆ ಕನ್ನಡ ಇಷ್ಟ",
      correctOrder: ["ನನಗೆ", "ಕನ್ನಡ", "ಇಷ್ಟ"],
      scrambled: ["ಇಷ್ಟ", "ನನಗೆ", "ಕನ್ನಡ"],
      transliteration: "Nanage Kannada ishta"
    },
    {
      id: 4,
      translations: {
        ta: "மிக்க நன்றி",
        ml: "വളരെ നന്ദി",
        te: "చాలా ధన్యవాదాలు",
        hi: "बहुत बहुत धन्यवाद"
      },
      targetSentence: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
      correctOrder: ["ತುಂಬಾ", "ಧನ್ಯವಾದಗಳು"],
      scrambled: ["ಧನ್ಯವಾದಗಳು", "ತುಂಬಾ"],
      transliteration: "Tumba dhanyavadagalu"
    }
  ],

  // Target: Tamil (ta)
  ta: [
    {
      id: 1,
      translations: {
        kn: "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ",
        ml: "എനിക്ക് സുഖമാണ്",
        te: "నేను బాగున్నాను",
        hi: "मैं ठीक हूँ"
      },
      targetSentence: "நான் நலமாக இருக்கிறேன்",
      correctOrder: ["நான்", "நலமாக", "இருக்கிறேன்"],
      scrambled: ["இருக்கிறேன்", "நான்", "நலமாக"],
      transliteration: "Naan nalamaaga irukkiren"
    },
    {
      id: 2,
      translations: {
        kn: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
        ml: "നിങ്ങളുടെ പേര് എന്താണ്?",
        te: "మీ పేరు ఏమిటి?",
        hi: "आपका नाम क्या है?"
      },
      targetSentence: "உங்கள் பெயர் என்ன?",
      correctOrder: ["உங்கள்", "பெயர்", "என்ன?"],
      scrambled: ["என்ன?", "பெயர்", "உங்கள்"],
      transliteration: "Ungal peyar enna?"
    },
    {
      id: 3,
      translations: {
        kn: "ನನಗೆ ತಮಿಳು ಇಷ್ಟ",
        ml: "എനിക്ക് തമിഴ് ഇഷ്ടമാണ്",
        te: "నాకు తమిళం ఇష్టం",
        hi: "मुझे तमिल पसंद है"
      },
      targetSentence: "எனக்கு தமிழ் பிடிக்கும்",
      correctOrder: ["எனக்கு", "தமிழ்", "பிடிக்கும்"],
      scrambled: ["பிடிக்கும்", "எனக்கு", "தமிழ்"],
      transliteration: "Enakku Thamizh pidikkum"
    },
    {
      id: 4,
      translations: {
        kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
        ml: "വളരെ നന്ദി",
        te: "చాలా ధన్యవాదాలు",
        hi: "बहुत धन्यवाद"
      },
      targetSentence: "மிக்க நன்றி",
      correctOrder: ["மிக்க", "நன்றி"],
      scrambled: ["நன்றி", "மிக்க"],
      transliteration: "Mikka nandri"
    }
  ],

  // Target: Telugu (te)
  te: [
    {
      id: 1,
      translations: {
        ta: "நான் நலமாக இருக்கிறேன்",
        kn: "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ",
        ml: "എനിക്ക് സുഖമാണ്",
        hi: "मैं ठीक हूँ"
      },
      targetSentence: "నేను బాగున్నాను",
      correctOrder: ["నేను", "బాగున్నాను"],
      scrambled: ["బాగున్నాను", "నేను"],
      transliteration: "Nenu baagunnaanu"
    },
    {
      id: 2,
      translations: {
        ta: "உங்கள் பெயர் என்ன?",
        kn: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
        ml: "നിങ്ങളുടെ പേര് എന്താണ്?",
        hi: "आपका नाम क्या है?"
      },
      targetSentence: "మీ పేరు ఏమిటి?",
      correctOrder: ["మీ", "పేరు", "ఏమిటి?"],
      scrambled: ["ఏమిటి?", "పేరు", "మీ"],
      transliteration: "Meeru peru emiti?"
    },
    {
      id: 3,
      translations: {
        ta: "எனக்கு தெலுங்கு பிடிக்கும்",
        kn: "ನನಗೆ ತೆಲುಗು ಇಷ್ಟ",
        ml: "എനിക്ക് തെലുങ്ക് ഇഷ്ടമാണ്",
        hi: "मुझे तेलुगु पसंद है"
      },
      targetSentence: "నాకు తెలుగు ఇష్టం",
      correctOrder: ["నాకు", "తెలుగు", "ఇష్టం"],
      scrambled: ["ఇష్టం", "నాకు", "తెలుగు"],
      transliteration: "Naaku Telugu ishtam"
    },
    {
      id: 4,
      translations: {
        ta: "மிக்க நன்றி",
        kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
        ml: "വളരെ നന്ദി",
        hi: "बहुत बहुत धन्यवाद"
      },
      targetSentence: "చాలా ధన్యవాదాలు",
      correctOrder: ["చాలా", "ధన్యవాదాలు"],
      scrambled: ["ధన్యవాదాలు", "చాలా"],
      transliteration: "Chaala dhanyavaadalu"
    }
  ],

  // Target: Malayalam (ml)
  ml: [
    {
      id: 1,
      translations: {
        ta: "நான் நலமாக இருக்கிறேன்",
        kn: "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ",
        te: "నేను బాగున్నాను",
        hi: "मैं ठीक हूँ"
      },
      targetSentence: "എനിക്ക് സുഖമാണ്",
      correctOrder: ["എനിക്ക്", "സുഖമാണ്"],
      scrambled: ["സുഖമാണ്", "എനിക്ക്"],
      transliteration: "Enikku sukhamaanu"
    },
    {
      id: 2,
      translations: {
        ta: "உங்கள் பெயர் என்ன?",
        kn: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
        te: "మీ పేరు ఏమిటి?",
        hi: "आपका नाम क्या है?"
      },
      targetSentence: "നിങ്ങളുടെ പേര് എന്താണ്?",
      correctOrder: ["നിങ്ങളുടെ", "പേര്", "എന്താണ്?"],
      scrambled: ["എന്താണ്?", "പേര്", "നിങ്ങളുടെ"],
      transliteration: "Ningalude peru enthaanu?"
    },
    {
      id: 3,
      translations: {
        ta: "எனக்கு மலையாளம் பிடிக்கும்",
        kn: "ನನಗೆ ಮಲಯಾಳಂ ಇಷ್ಟ",
        te: "నాకు మలయాళం ఇష్టం",
        hi: "मुझे मलयालम पसंद है"
      },
      targetSentence: "എനിക്ക് മലയാളം ഇഷ്ടമാണ്",
      correctOrder: ["എനിക്ക്", "മലയാളം", "ഇഷ്ടമാണ്"],
      scrambled: ["ഇഷ്ടമാണ്", "എനിക്ക്", "മലയാളം"],
      transliteration: "Enikku Malayalam ishtamaanu"
    },
    {
      id: 4,
      translations: {
        ta: "மிக்க நன்றி",
        kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
        te: "చాలా ధన్యవాదాలు",
        hi: "बहुत धन्यवाद"
      },
      targetSentence: "വളരെ നന്ദി",
      correctOrder: ["വളരെ", "നന്ദി"],
      scrambled: ["നന്ദി", "വളരെ"],
      transliteration: "Valare nandi"
    }
  ],

  // Target: Hindi (hi)
  hi: [
    {
      id: 1,
      translations: {
        ta: "நான் நலமாக இருக்கிறேன்",
        kn: "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ",
        te: "నేను బాగున్నాను",
        ml: "എനിക്ക് സുഖമാണ്"
      },
      targetSentence: "मैं ठीक हूँ",
      correctOrder: ["मैं", "ठीक", "हूँ"],
      scrambled: ["हूँ", "मैं", "ठीक"],
      transliteration: "Main theek hoon"
    },
    {
      id: 2,
      translations: {
        ta: "உங்கள் பெயர் என்ன?",
        kn: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
        te: "మీ పేరు ఏమిటి?",
        ml: "നിങ്ങളുടെ പേര് എന്താണ്?"
      },
      targetSentence: "आपका नाम क्या है?",
      correctOrder: ["आपका", "नाम", "क्या", "है?"],
      scrambled: ["है?", "नाम", "आपका", "क्या"],
      transliteration: "Aapka naam kya hai?"
    },
    {
      id: 3,
      translations: {
        ta: "எனக்கு இந்தி பிடிக்கும்",
        kn: "ನನಗೆ ಹಿಂದಿ ಇಷ್ಟ",
        te: "నాకు హిందీ ఇష్టం",
        ml: "എനിക്ക് ഹിന്ദി ഇഷ്ടമാണ്"
      },
      targetSentence: "मुझे हिन्दी पसंद है",
      correctOrder: ["मुझे", "हिन्दी", "पसंद", "है"],
      scrambled: ["है", "पसंद", "मुझे", "हिन्दी"],
      transliteration: "Mujhe Hindi pasand hai"
    },
    {
      id: 4,
      translations: {
        ta: "மிக்க நன்றி",
        kn: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
        te: "చాలా ధన్యవాదాలు",
        ml: "വളരെ നന്ദി"
      },
      targetSentence: "बहुत बहुत धन्यवाद",
      correctOrder: ["बहुत", "बहुत", "धन्यवाद"],
      scrambled: ["धन्यवाद", "बहुत", "बहुत"],
      transliteration: "Bahut bahut dhanyavaad"
    }
  ]
};

const langCodes = {
  ta: "ta-IN",
  ml: "ml-IN",
  kn: "kn-IN",
  te: "te-IN",
  hi: "hi-IN"
};

function SortableItem({ word, isError }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: word });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-2xl border text-center font-bold text-lg select-none cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? "bg-primary/20 border-primary shadow-xl scale-105 z-20 text-primary"
          : isError
          ? "bg-rose-500/20 border-rose-500 text-rose-300"
          : "bg-light-card border-light-border text-text-main hover:border-primary/40 shadow-xs"
      }`}
    >
      {word}
    </div>
  );
}

export default function Practice() {
  const navigate = useNavigate();
  const { targetLang = "kn", nativeLang = "ta", addXP } = useStore();
  const { speak, isPlaying, isLoading } = useSpeech();
  const { playCorrect, playWrong, playSuccess, playClick, playMicStart, playMicStop } = useSoundEffects();

  const [activeTab, setActiveTab] = useState("builder"); // "builder" | "pronunciation"
  const targetCode = langCodes[targetLang] || "kn-IN";

  const {
    isListening,
    transcript,
    audioLevel,
    startListening,
    stopListening,
    evaluatePronunciation
  } = useSpeechRecognition(targetCode);

  const sentences = useMemo(() => {
    const list = sentenceDictionary[targetLang] || sentenceDictionary.kn;
    return list.map((item) => ({
      ...item,
      nativePrompt: item.translations[nativeLang] || Object.values(item.translations)[0]
    }));
  }, [targetLang, nativeLang]);

  const [index, setIndex] = useState(0);
  const [words, setWords] = useState(() => sentences[0]?.scrambled || []);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  const currentSentence = sentences[index] || sentences[0];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Evaluate spoken sentence in pronunciation tab
  useEffect(() => {
    if (activeTab === "pronunciation" && transcript && currentSentence) {
      const result = evaluatePronunciation(
        transcript,
        currentSentence.targetSentence,
        currentSentence.transliteration
      );
      setSpeechResult(result);
      if (result.score >= 60) {
        playCorrect();
        setScore((s) => s + 1);
      } else {
        playWrong();
      }
    }
  }, [transcript, activeTab, currentSentence, evaluatePronunciation, playCorrect, playWrong]);

  const handleDragEnd = (event) => {
    if (checked) return;
    const { active, over } = event;
    if (active.id !== over?.id) {
      setWords((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCheck = () => {
    const isMatch = JSON.stringify(words) === JSON.stringify(currentSentence.correctOrder);
    setIsCorrect(isMatch);
    setChecked(true);
    if (isMatch) {
      playCorrect();
      setScore((s) => s + 1);
      speak(currentSentence.targetSentence, targetCode);
    } else {
      playWrong();
    }
  };

  const handleNext = () => {
    playClick();
    stopListening();
    setSpeechResult(null);
    if (index < sentences.length - 1) {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      setWords(sentences[nextIdx].scrambled);
      setChecked(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      playSuccess();
      addXP(40);
      confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleReset = () => {
    playClick();
    setWords(currentSentence.scrambled);
    setChecked(false);
    setIsCorrect(false);
  };

  const handleRestartSession = () => {
    playClick();
    setIndex(0);
    setWords(sentences[0].scrambled);
    setChecked(false);
    setIsCorrect(false);
    setScore(0);
    setCompleted(false);
    setSpeechResult(null);
  };

  const handleToggleMic = () => {
    if (isListening) {
      playMicStop();
      stopListening();
    } else {
      playMicStart();
      setSpeechResult(null);
      startListening(targetCode);
    }
  };

  return (
    <div className="min-h-screen bg-light text-text-main flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-light-border bg-light-card">
        <button
          className="text-text-muted hover:text-text-main flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} /> <span className="text-sm font-medium">Dashboard</span>
        </button>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-light-bg p-1 rounded-xl border border-light-border">
          <button
            onClick={() => {
              playClick();
              setActiveTab("builder");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "builder"
                ? "bg-primary text-white shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            🧩 Drag &amp; Drop
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveTab("pronunciation");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pronunciation"
                ? "bg-secondary text-white shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            🗣️ Spoken Practice
          </button>
        </div>

        <div className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full text-sm">
          {score}/{sentences.length}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {!completed ? (
          <>
            {/* Progress Dots */}
            <div className="flex gap-2 mb-8">
              {sentences.map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    i < index
                      ? "bg-emerald-500"
                      : i === index
                      ? "bg-primary scale-125 ring-4 ring-primary/20"
                      : "bg-light-border"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg"
              >
                {/* Prompt */}
                <div className="text-center mb-8">
                  <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                    {activeTab === "builder" ? "Arrange the words to match:" : "Speak this sentence fluently:"}
                  </p>
                  <div className="inline-flex items-center gap-3 py-4 px-6 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-xs">
                    <div className="text-2xl sm:text-3xl font-extrabold text-secondary">
                      {currentSentence.nativePrompt}
                    </div>
                    <button
                      onClick={() => speak(currentSentence.targetSentence, targetCode)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all shadow-xs ${
                        isPlaying ? "bg-secondary scale-105 animate-pulse" : "bg-primary hover:bg-primary/80"
                      }`}
                      title="Listen target sentence audio"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* TAB 1: DRAG & DROP PUZZLE */}
                {activeTab === "builder" && (
                  <>
                    <div className="space-y-3 mb-8 min-h-[160px]">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={words} strategy={verticalListSortingStrategy}>
                          {words.map((word) => (
                            <SortableItem key={word} word={word} isError={checked && !isCorrect} />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      {checked && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center w-full bg-light-card border border-light-border p-4 rounded-2xl shadow-xs"
                        >
                          <div
                            className={`flex items-center justify-center gap-2 font-bold mb-1 ${
                              isCorrect ? "text-emerald-600" : "text-rose-500"
                            }`}
                          >
                            {isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            <span>{isCorrect ? "Perfect Assembly!" : "Not quite right"}</span>
                          </div>
                          <div className="font-mono text-xs text-text-muted">
                            Pronunciation: {currentSentence.transliteration}
                          </div>
                        </motion.div>
                      )}

                      <div className="flex gap-3 w-full">
                        {!checked ? (
                          <>
                            <Button variant="ghost" onClick={handleReset} className="w-1/3">
                              <RotateCcw size={16} /> Reset
                            </Button>
                            <Button onClick={handleCheck} className="flex-1">
                              Check Order
                            </Button>
                          </>
                        ) : (
                          <Button onClick={handleNext} className="w-full flex items-center justify-center gap-2">
                            <span>{index < sentences.length - 1 ? "Next Sentence" : "Complete Practice"}</span>
                            <ChevronRight size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: SPOKEN SENTENCE PRONUNCIATION */}
                {activeTab === "pronunciation" && (
                  <div className="bg-light-card border border-light-border rounded-3xl p-6 shadow-xs text-center">
                    <div className="text-xs font-bold text-text-muted uppercase mb-1">Target Sentence</div>
                    <h3 className="text-2xl sm:text-3xl font-black text-text-main mb-2">
                      {currentSentence.targetSentence}
                    </h3>
                    <p className="text-sm font-mono text-primary bg-primary/10 inline-block px-3 py-0.5 rounded-full border border-primary/20 mb-6">
                      {currentSentence.transliteration}
                    </p>

                    {/* Big Mic Button with live audio wave */}
                    <div className="flex flex-col items-center justify-center my-4">
                      <div className="relative">
                        {isListening && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-secondary/30 blur-xl"
                            animate={{ scale: [1, 1.35 + audioLevel * 0.4, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleToggleMic}
                          className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all shadow-lg ${
                            isListening
                              ? "bg-rose-600 text-white ring-8 ring-rose-500/30 animate-pulse"
                              : "bg-secondary text-white hover:brightness-110"
                          }`}
                        >
                          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                        </motion.button>
                      </div>

                      <span className="text-xs font-bold text-text-muted mt-3">
                        {isListening ? "Listening to your sentence..." : "Tap mic and read sentence"}
                      </span>

                      {isListening && (
                        <div className="flex items-center gap-1 mt-3 h-5">
                          {[0.4, 0.7, 1, 0.6, 0.8, 0.5, 0.9].map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: `${Math.max(4, h * 20 * audioLevel)}px` }}
                              className="w-1 bg-secondary rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Speech Result Display */}
                    {speechResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-2xl border text-left ${
                          speechResult.score >= 70
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : speechResult.score >= 50
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : "bg-rose-50 border-rose-300 text-rose-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase">Accuracy Score</span>
                          <span className="text-lg font-black">{speechResult.score}%</span>
                        </div>
                        <p className="text-sm font-semibold">{speechResult.feedback}</p>
                        {speechResult.spoken && (
                          <p className="text-xs text-text-muted mt-1">
                            Heard: &quot;{speechResult.spoken}&quot;
                          </p>
                        )}
                      </motion.div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleNext} className="w-full flex items-center justify-center gap-2">
                        <span>{index < sentences.length - 1 ? "Next Sentence" : "Complete Spoken Practice"}</span>
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* Completed Session */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center bg-light-card border border-light-border rounded-3xl p-8 shadow-xs"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center mb-6">
              <Trophy size={40} />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Practice Complete!</h2>
            <p className="text-text-muted text-sm mb-6">
              You built sentences with correct regional grammar and refined your pronunciation.
            </p>

            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-8">
              <div className="text-xs font-bold text-secondary uppercase">XP Bonus Earned</div>
              <div className="text-3xl font-black text-secondary mt-0.5">+40 XP</div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => navigate("/dashboard")} className="w-full py-3">
                Return to Dashboard
              </Button>
              <button
                onClick={handleRestartSession}
                className="w-full py-2.5 text-text-muted hover:text-text-main text-xs font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Practice Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}