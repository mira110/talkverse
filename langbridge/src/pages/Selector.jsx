import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Button from "../components/ui/Button";
import useStore from "../store/useStore";
import { useNavigate } from "react-router-dom";

const languages = [
  { code: "ta", name: "Tamil", script: "தமிழ்", sample: "வணக்கம்", color: "#E8722A" },
  { code: "ml", name: "Malayalam", script: "മലയാളം", sample: "നമസ്കാരം", color: "#10B981" },
  { code: "kn", name: "Kannada", script: "ಕನ್ನಡ", sample: "ನಮಸ್ಕಾರ", color: "#8B5CF6" },
  { code: "te", name: "Telugu", script: "తెలుగు", sample: "నమస్కారం", color: "#EF4444" },
  { code: "hi", name: "Hindi", script: "हिन्दी", sample: "नमस्ते", color: "#F59E0B" },
];

export default function Selector() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const { setNativeLang, setTargetLang, setHasSelectedLanguages, nativeLang } = useStore();
  const navigate = useNavigate();

  const availableLangs = step === 2
    ? languages.filter((l) => l.code !== nativeLang)
    : languages;

  const handleSelect = (lang) => {
    setSelected(lang.code);
  };

  const handleNext = () => {
    if (step === 1) {
      setNativeLang(selected);
      setSelected(null);
      setStep(2);
    } else {
      setTargetLang(selected);
      setHasSelectedLanguages(true);
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setSelected(nativeLang);
      setStep(1);
    } else {
      navigate("/");
    }
  };

  const selectedLang = languages.find((l) => l.code === selected);

  return (
    <div className="min-h-screen bg-light text-text-main flex flex-col">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? "bg-primary text-white" : "bg-primary/15 text-primary"}`}>
            {step > 1 ? <Check size={16} /> : "1"}
          </div>
          <div className={`w-12 h-0.5 ${step > 1 ? "bg-primary" : "bg-light-border"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? "bg-primary text-white" : "bg-light-border text-text-muted"}`}>
            2
          </div>
        </div>

        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold">
              {step === 1 ? "I speak..." : "I want to learn..."}
            </h1>
            <p className="text-text-muted mt-3 text-lg">
              {step === 1
                ? "Select your native language"
                : `Choose a language to learn via ${languages.find(l => l.code === nativeLang)?.name}`}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full mb-12">
          <AnimatePresence>
            {availableLangs.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => handleSelect(lang)}
                className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                  selected === lang.code
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/15 scale-[1.02]"
                    : "border-light-border bg-light-card hover:border-primary/30 hover:shadow-md"
                }`}
              >
                {/* Check Mark */}
                {selected === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                )}

                {/* Color Dot */}
                <div
                  className="w-4 h-4 rounded-full mb-4"
                  style={{ backgroundColor: lang.color }}
                />

                {/* Script Name */}
                <div className="text-2xl font-bold mb-1" style={{ color: lang.color }}>
                  {lang.script}
                </div>

                {/* English Name */}
                <div className="text-lg font-semibold text-text-main">
                  {lang.name}
                </div>

                {/* Sample Word */}
                <div className="text-text-muted text-sm mt-2">
                  "{lang.sample}"
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Continue Button */}
        <AnimatePresence>
          {selected && selectedLang && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-text-muted text-sm">
                Selected: <span className="font-semibold text-text-main">{selectedLang.name} ({selectedLang.script})</span>
              </div>
              <Button variant="primary" size="lg" onClick={handleNext}>
                {step === 1 ? "Continue" : "Begin Learning"} <ArrowRight size={20} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}