import { useState, useEffect, useRef, useCallback } from "react";

// Levenshtein distance string similarity metric (0 to 100%)
export function calculateSimilarity(s1 = "", s2 = "") {
  const clean1 = s1.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").trim();
  const clean2 = s2.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").trim();

  if (!clean1 && !clean2) return 100;
  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 100;

  // Exact substring match bonus
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    const ratio = Math.min(clean1.length, clean2.length) / Math.max(clean1.length, clean2.length);
    return Math.max(85, Math.round(ratio * 100));
  }

  const track = Array(clean2.length + 1)
    .fill(null)
    .map(() => Array(clean1.length + 1).fill(null));

  for (let i = 0; i <= clean1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= clean2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= clean2.length; j += 1) {
    for (let i = 1; i <= clean1.length; i += 1) {
      const indicator = clean1[i - 1] === clean2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[clean2.length][clean1.length];
  const maxLen = Math.max(clean1.length, clean2.length);
  const similarity = Math.max(0, Math.round((1 - distance / maxLen) * 100));
  return similarity;
}

export default function useSpeechRecognition(defaultLangCode = "ta-IN") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const audioAnimationRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
  }, []);

  // Simulate dynamic sound waveform while recording
  const startAudioWaveSimulation = useCallback(() => {
    let phase = 0;
    const updateLevel = () => {
      phase += 0.2;
      const baseLevel = 0.35 + 0.45 * Math.abs(Math.sin(phase) + Math.cos(phase * 1.5) * 0.5);
      const jitter = (Math.random() - 0.5) * 0.2;
      setAudioLevel(Math.min(1, Math.max(0.1, baseLevel + jitter)));
      audioAnimationRef.current = requestAnimationFrame(updateLevel);
    };
    audioAnimationRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const stopAudioWaveSimulation = useCallback(() => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startListening = useCallback(
    (customLangCode) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = customLangCode || defaultLangCode;
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript("");
          startAudioWaveSimulation();
        };

        recognition.onresult = (event) => {
          const results = event.results;
          if (results.length > 0) {
            const topResult = results[0][0];
            const text = topResult.transcript;
            const conf = topResult.confidence ? Math.round(topResult.confidence * 100) : 85;
            setTranscript(text);
            setConfidence(conf);
          }
        };

        recognition.onerror = (e) => {
          console.warn("Speech recognition error:", e.error);
          if (e.error !== "no-speech") {
            setError(`Speech recognition notice: ${e.error}`);
          }
          setIsListening(false);
          stopAudioWaveSimulation();
        };

        recognition.onend = () => {
          setIsListening(false);
          stopAudioWaveSimulation();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setError("Microphone access could not be initialized.");
        setIsListening(false);
        stopAudioWaveSimulation();
      }
    },
    [defaultLangCode, startAudioWaveSimulation, stopAudioWaveSimulation]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    stopAudioWaveSimulation();
  }, [stopAudioWaveSimulation]);

  // Evaluate user pronunciation against expected target word and transliteration (Local & ML)
  const evaluatePronunciation = useCallback((spokenText, targetWord, targetTranslit) => {
    if (!spokenText) return { score: 0, feedback: "No speech detected", grade: "retry" };

    const scoreNative = calculateSimilarity(spokenText, targetWord);
    const scoreTranslit = targetTranslit ? calculateSimilarity(spokenText, targetTranslit) : 0;
    const finalScore = Math.max(scoreNative, scoreTranslit);

    let feedback = "Keep practicing! Listen carefully and try again.";
    let grade = "retry"; // < 50%

    if (finalScore >= 80) {
      feedback = "🌟 Outstanding pronunciation! Natural and clear.";
      grade = "excellent";
    } else if (finalScore >= 50) {
      feedback = "👏 Good attempt! Very close, keep refining your tone.";
      grade = "good";
    }

    return {
      score: finalScore,
      feedback,
      grade,
      spoken: spokenText
    };
  }, []);

  // Advanced Acoustic & Phonetic Evaluation via Python PKL Machine Learning Model
  const evaluateWithMLModel = useCallback(async (spokenText, targetWord, targetLang = "ta", targetTranslit = "") => {
    try {
      const response = await fetch("/api/ai/pronounce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spoken_text: spokenText,
          target_word: targetWord,
          target_lang: targetLang,
          transliteration: targetTranslit,
        }),
      });

      if (response.ok) {
        const mlData = await response.json();
        return {
          score: mlData.score,
          phoneme_accuracy: mlData.phoneme_accuracy,
          pitch_harmony: mlData.pitch_harmony,
          feedback: mlData.feedback,
          grade: mlData.grade,
          source: mlData.source,
          spoken: spokenText,
        };
      }
    } catch (err) {
      console.warn("ML Voice API notice, using local evaluation:", err.message);
    }

    return evaluatePronunciation(spokenText, targetWord, targetTranslit);
  }, [evaluatePronunciation]);

  return {
    isListening,
    transcript,
    confidence,
    error,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    evaluatePronunciation,
    evaluateWithMLModel,
    calculateSimilarity
  };
}