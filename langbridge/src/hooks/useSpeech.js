import { useState, useCallback, useRef, useEffect } from "react";

// Client-side Blob URL cache for instant repeat playback
const clientAudioCache = new Map();

export default function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentAudioRef = useRef(null);

  // Stop any ongoing speech or audio
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Pre-warm browser voices on load
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Fallback to browser SpeechSynthesis API
  const speakWithBrowserSynthesis = useCallback((cleanText, langCode = "ta-IN") => {
    if (!window.speechSynthesis) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = langCode.slice(0, 2).toLowerCase();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase().replace(/_/g, "-").startsWith(langPrefix)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Primary speak function with ElevenLabs + Client Cache + Fallback
  const speak = useCallback(
    async (text, langCode = "kn-IN", options = {}) => {
      if (!text || typeof text !== "string") return;

      // Extract clean text
      const cleanText = text
        .replace(/[*#`_~:>]/gu, "")
        .replace(/^.*?:/gu, "")
        .replace(/\(.*?\)/gu, "")
        .replace(/\[.*?\]/gu, "")
        .trim();

      if (!cleanText) return;

      stop();
      setIsLoading(true);

      const cacheKey = `${langCode}_${cleanText.toLowerCase()}`;

      // Check client-side blob cache for instant replay (< 1ms)
      if (clientAudioCache.has(cacheKey)) {
        try {
          const cachedUrl = clientAudioCache.get(cacheKey);
          const audio = new Audio(cachedUrl);
          currentAudioRef.current = audio;

          audio.onplay = () => {
            setIsLoading(false);
            setIsPlaying(true);
          };
          audio.onended = () => {
            setIsPlaying(false);
            setIsLoading(false);
          };
          audio.onerror = () => {
            speakWithBrowserSynthesis(cleanText, langCode);
          };

          await audio.play();
          return;
        } catch {
          // Fallback to fetch or synthesis
        }
      }

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            langCode,
            voiceId: options.voiceId
          })
        });

        const contentType = response.headers.get("content-type") || "";

        if (response.ok && contentType.includes("audio")) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          clientAudioCache.set(cacheKey, audioUrl);

          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          audio.onplay = () => {
            setIsLoading(false);
            setIsPlaying(true);
          };
          audio.onended = () => {
            setIsPlaying(false);
            setIsLoading(false);
          };
          audio.onerror = () => {
            speakWithBrowserSynthesis(cleanText, langCode);
          };

          await audio.play();
        } else {
          // Received JSON fallback instructions or non-audio response
          speakWithBrowserSynthesis(cleanText, langCode);
        }
      } catch (err) {
        console.warn("ElevenLabs TTS request failed, using browser synthesis fallback:", err);
        speakWithBrowserSynthesis(cleanText, langCode);
      }
    },
    [stop, speakWithBrowserSynthesis]
  );

  return { speak, stop, isPlaying, isLoading };
}