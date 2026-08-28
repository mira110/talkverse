import { useState, useCallback, useRef, useEffect } from "react";

// Client-side Blob/Audio URL cache for instant repeat playback
const clientAudioCache = new Map();

export default function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentAudioRef = useRef(null);

  // Clean stop for any playing audio
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.removeAttribute("src");
        currentAudioRef.current.load();
      } catch {
        // Ignore abort errors
      }
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
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

  // Clean text helper to extract pure readable characters
  const cleanSpeechText = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    return raw
      .replace(/[*#`_~:>🌟🇮🇳🔤📖💡🎉]/gu, " ")
      .replace(/\(.*?\)/gu, " ")
      .replace(/\[.*?\]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Tier 3 Fallback: Browser Web Speech API
  const speakWithBrowserSynthesis = useCallback((textToSpeak, langCode = "ta-IN") => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
    } catch {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  // Play an Audio element safely
  const playAudioElement = useCallback((audioObj, fallbackFn) => {
    currentAudioRef.current = audioObj;

    audioObj.onplay = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    audioObj.onended = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    audioObj.onerror = () => {
      if (fallbackFn) fallbackFn();
      else {
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    const playPromise = audioObj.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio play prevented or failed, trying fallback:", err.message);
        if (fallbackFn) fallbackFn();
        else {
          setIsPlaying(false);
          setIsLoading(false);
        }
      });
    }
  }, []);

  // Primary speak function: Speaks the EXACT text displayed on screen
  const speak = useCallback(
    async (text, langCode = "ta-IN", options = {}) => {
      if (!text || typeof text !== "string") return;

      const cleanText = cleanSpeechText(text);
      if (!cleanText) return;

      stop();
      setIsLoading(true);

      const langPrefix = (langCode || "ta").slice(0, 2).toLowerCase();
      const cacheKey = `${langPrefix}_${cleanText}`;

      // Check client memory cache
      if (clientAudioCache.has(cacheKey)) {
        try {
          const cachedUrl = clientAudioCache.get(cacheKey);
          const cachedAudio = new Audio(cachedUrl);
          playAudioElement(cachedAudio, () => speakWithBrowserSynthesis(cleanText, langCode));
          return;
        } catch {
          // Fallback to fetch
        }
      }

      // Tier 1: Try backend /api/tts endpoint
      try {
        const response = await fetch(`/api/tts?langCode=${encodeURIComponent(langCode)}&text=${encodeURIComponent(cleanText)}`, {
          method: "GET"
        });

        const contentType = response.headers.get("content-type") || "";

        if (response.ok && contentType.includes("audio")) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          clientAudioCache.set(cacheKey, audioUrl);

          const audio = new Audio(audioUrl);
          playAudioElement(audio, () => speakWithBrowserSynthesis(cleanText, langCode));
          return;
        }
      } catch (err) {
        console.warn("Backend TTS fetch failed, switching to direct Google Indic stream:", err);
      }

      // Tier 2: Direct Google Indic Audio Stream Fallback
      try {
        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langPrefix)}&q=${encodeURIComponent(cleanText)}`;
        const directAudio = new Audio(googleUrl);
        playAudioElement(directAudio, () => speakWithBrowserSynthesis(cleanText, langCode));
      } catch {
        // Tier 3: Browser Web Speech Synthesis
        speakWithBrowserSynthesis(cleanText, langCode);
      }
    },
    [stop, playAudioElement, speakWithBrowserSynthesis]
  );

  return { speak, stop, isPlaying, isLoading };
}