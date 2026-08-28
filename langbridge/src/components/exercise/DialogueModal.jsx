import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Volume2,
  Play,
  Pause,
  Mic,
  MicOff,
  MessageSquare
} from "lucide-react";
import Button from "../ui/Button";
import useSpeech from "../../hooks/useSpeech";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import useSoundEffects from "../../hooks/useSoundEffects";
import useStore from "../../store/useStore";
import confetti from "canvas-confetti";

export default function DialogueModal({ scenario, isOpen, onClose, targetCode }) {
  const { speak, stop: stopSpeech } = useSpeech();
  const { playCorrect, playWrong, playSuccess, playClick, playMicStart, playMicStop } = useSoundEffects();
  const { completeLesson } = useStore();

  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [rolePlayMode, setRolePlayMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [turnScores, setTurnScores] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    evaluateWithMLModel
  } = useSpeechRecognition(targetCode);

  const playTimeoutRef = useRef(null);

  // Available speakers in scenario
  const speakers = useMemo(
    () => (scenario ? [...new Set(scenario.turns.map((t) => t.speaker))] : []),
    [scenario]
  );

  useEffect(() => {
    if (speakers.length > 0 && !selectedRole) {
      setSelectedRole(speakers[0]);
    }
  }, [speakers, selectedRole]);

  // Clean stop when closing
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsPlayingAll(false);
      clearTimeout(playTimeoutRef.current);
      setActiveTurnIndex(0);
      setIsFinished(false);
    }
  }, [isOpen, stopSpeech]);

  // Speech evaluation in roleplay mode using ML PKL Model
  useEffect(() => {
    if (rolePlayMode && transcript && scenario) {
      const currentTurn = scenario.turns[activeTurnIndex];
      if (currentTurn && currentTurn.speaker === selectedRole) {
        let isMounted = true;
        evaluateWithMLModel(
          transcript,
          currentTurn.targetText,
          targetCode,
          currentTurn.targetTranslit
        ).then((result) => {
          if (!isMounted) return;
          setTurnScores((prev) => ({
            ...prev,
            [activeTurnIndex]: result
          }));

          if (result.score >= 50) {
            playCorrect();
          } else {
            playWrong();
          }
        });

        return () => {
          isMounted = false;
        };
      }
    }
  }, [transcript, rolePlayMode, activeTurnIndex, scenario, selectedRole, targetCode, evaluateWithMLModel, playCorrect, playWrong]);

  // Sequential Playback loop
  const playTurn = useCallback(
    (index) => {
      if (!scenario || index >= scenario.turns.length) {
        setIsPlayingAll(false);
        setIsFinished(true);
        playSuccess();
        confetti({ particleCount: 70, spread: 60 });
        completeLesson(`scenario-${scenario.id}`, scenario.xp || 60);
        return;
      }

      setActiveTurnIndex(index);
      const turn = scenario.turns[index];
      speak(turn.targetText, targetCode);

      // Estimate audio duration based on character count (approx 85ms per char) + pause
      const estimatedMs = Math.max(2200, turn.targetText.length * 110 + 1200);

      playTimeoutRef.current = setTimeout(() => {
        if (isPlayingAll) {
          playTurn(index + 1);
        }
      }, estimatedMs);
    },
    [scenario, speak, targetCode, isPlayingAll, playSuccess, completeLesson]
  );

  const togglePlayAll = () => {
    playClick();
    if (isPlayingAll) {
      setIsPlayingAll(false);
      clearTimeout(playTimeoutRef.current);
      stopSpeech();
    } else {
      setIsPlayingAll(true);
      playTurn(0);
    }
  };

  const handleMicToggle = (index) => {
    setActiveTurnIndex(index);
    if (isListening) {
      playMicStop();
      stopListening();
    } else {
      playMicStart();
      startListening(targetCode);
    }
  };

  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {scenario.category} Dialogue
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  +{scenario.xp} XP
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">{scenario.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Mode Switch */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                playClick();
                setRolePlayMode(false);
                stopListening();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                !rolePlayMode ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🎧 Listen Mode
            </button>
            <button
              onClick={() => {
                playClick();
                setRolePlayMode(true);
                setIsPlayingAll(false);
                clearTimeout(playTimeoutRef.current);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                rolePlayMode ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🗣️ Spoken Roleplay
            </button>
          </div>

          {/* Role selector if in roleplay mode */}
          {rolePlayMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">I am playing:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none"
              >
                {speakers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Play All Button */}
          {!rolePlayMode && (
            <button
              onClick={togglePlayAll}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isPlayingAll
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              {isPlayingAll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingAll ? "Pause Scenario" : "Play Whole Dialogue"}</span>
            </button>
          )}
        </div>

        {/* Dialogue Scroll Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center"
            >
              <h4 className="text-emerald-300 font-bold text-lg">🎉 Scenario Practice Completed!</h4>
              <p className="text-xs text-emerald-200/80 mt-1">You earned +{scenario.xp} XP for mastering this dialogue.</p>
            </motion.div>
          )}

          {scenario.turns.map((turn, idx) => {
            const isSpeakerActive = activeTurnIndex === idx;
            const isUserTurn = rolePlayMode && turn.speaker === selectedRole;
            const isFirstSpeaker = turn.speaker === speakers[0];
            const scoreObj = turnScores[idx];

            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isSpeakerActive ? 1.01 : 1,
                  opacity: 1
                }}
                className={`p-5 rounded-2xl border transition-all ${
                  isSpeakerActive
                    ? "bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : isUserTurn
                    ? "bg-purple-950/20 border-purple-800/40"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Speaker Tag */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isFirstSpeaker
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {turn.speaker} {isUserTurn ? "(You)" : ""}
                    </span>
                  </div>

                  {/* Actions (Audio & Mic) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTurnIndex(idx);
                        speak(turn.targetText, targetCode);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                      title="Play line audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {isUserTurn && (
                      <button
                        onClick={() => handleMicToggle(idx)}
                        className={`p-2 rounded-xl font-bold transition-all ${
                          isListening && activeTurnIndex === idx
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40"
                        }`}
                        title="Record your line"
                      >
                        {isListening && activeTurnIndex === idx ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Target Language Line */}
                <h4 className="text-xl sm:text-2xl font-bold text-white tracking-wide mb-1">
                  {turn.targetText}
                </h4>

                {/* Transliteration */}
                <p className="text-sm font-mono text-amber-400/90 mb-3 bg-slate-950/60 inline-block px-2.5 py-0.5 rounded-lg border border-slate-800">
                  {turn.targetTranslit}
                </p>

                {/* Mother Tongue Translation & Meaning */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Mother Tongue: </span>
                    <span className="text-slate-300 font-semibold">{turn.nativeText}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Meaning: </span>
                    <span className="text-slate-400">{turn.meaning}</span>
                  </div>
                </div>

                {/* Accuracy feedback in roleplay */}
                {scoreObj && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Pronunciation Score: <strong className="text-purple-300">{scoreObj.score}%</strong>
                    </span>
                    <span className={scoreObj.score >= 60 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {scoreObj.feedback}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Practice real-life conversations to build fluent natural rhythm.
          </p>
          <Button onClick={onClose} className="px-6 py-2.5">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
