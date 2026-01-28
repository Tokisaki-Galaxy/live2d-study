import { useState, useCallback, useEffect, useRef } from "react";
import type { TTSSettings, TTSVoice } from "@/types";

const defaultTTSSettings: TTSSettings = {
  enabled: false,
  voiceURI: "",
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
};

const TTS_STORAGE_KEY = "tts-settings";

/**
 * Custom hook for Text-to-Speech functionality using the Web Speech API.
 * TTS output is paused when sound effects are playing to ensure sound effects
 * have higher priority.
 */
export function useTTS() {
  const [settings, setSettings] = useState<TTSSettings>(() => {
    try {
      const saved = localStorage.getItem(TTS_STORAGE_KEY);
      return saved ? { ...defaultTTSSettings, ...JSON.parse(saved) } : defaultTTSSettings;
    } catch {
      return defaultTTSSettings;
    }
  });

  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Initialize isSupported directly - no need for effect
  const [isSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [soundEffectPlaying, setSoundEffectPlaying] = useState(false);

  // Keep a reference to the current utterance for cancellation
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Queue for messages when sound effects are playing
  const messageQueueRef = useRef<string[]>([]);

  // Define updateSettings first since it's used by the voice loading effect
  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Internal speak function without queue management - defined before effects that use it
  const speakInternal = useCallback(
    (text: string) => {
      if (!isSupported || !settings.enabled) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Find and set the selected voice
      const availableVoices = window.speechSynthesis.getVoices();
      const selectedVoice = availableVoices.find((v) => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, settings],
  );

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const mappedVoices: TTSVoice[] = availableVoices.map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
      }));
      setVoices(mappedVoices);

      // If no voice is selected and voices are available, select the first one
      setSettings((prevSettings) => {
        if (!prevSettings.voiceURI && mappedVoices.length > 0) {
          const defaultVoice = mappedVoices.find((v) => v.lang.startsWith("en")) || mappedVoices[0];
          return { ...prevSettings, voiceURI: defaultVoice.voiceURI };
        }
        return prevSettings;
      });
    };

    // Load voices immediately if available
    loadVoices();

    // Some browsers load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TTS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors (e.g., private browsing, quota exceeded)
    }
  }, [settings]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // Process queued messages when sound effect finishes
  useEffect(() => {
    if (!soundEffectPlaying && messageQueueRef.current.length > 0 && settings.enabled) {
      const nextMessage = messageQueueRef.current.shift();
      if (nextMessage) {
        speakInternal(nextMessage);
      }
    }
  }, [soundEffectPlaying, settings.enabled, speakInternal]);

  /**
   * Speak the given text. If a sound effect is playing, the message will be queued
   * and spoken after the sound effect finishes.
   */
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !settings.enabled) return;

      // If sound effect is playing, queue the message
      if (soundEffectPlaying) {
        messageQueueRef.current.push(text);
        return;
      }

      speakInternal(text);
    },
    [isSupported, settings.enabled, soundEffectPlaying, speakInternal],
  );

  /**
   * Stop any ongoing speech
   */
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
    // Clear the queue as well
    messageQueueRef.current = [];
  }, [isSupported]);

  /**
   * Pause the current speech
   */
  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  /**
   * Resume paused speech
   */
  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  /**
   * Notify that a sound effect is starting. This will pause TTS and queue any new messages.
   */
  const notifySoundEffectStart = useCallback(() => {
    setSoundEffectPlaying(true);
    // Pause current speech if any
    if (isSpeaking && isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking, isSupported]);

  /**
   * Notify that a sound effect has ended. This will allow queued TTS messages to play.
   */
  const notifySoundEffectEnd = useCallback(() => {
    setSoundEffectPlaying(false);
  }, []);

  /**
   * Preview the current voice settings with a sample text.
   * Works even when TTS is disabled.
   */
  const preview = useCallback(
    (text: string = "Hello! This is a preview of the selected voice.") => {
      if (!isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Find and set the selected voice
      const availableVoices = window.speechSynthesis.getVoices();
      const selectedVoice = availableVoices.find((v) => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, settings],
  );

  return {
    settings,
    updateSettings,
    voices,
    isSpeaking,
    isSupported,
    soundEffectPlaying,
    speak,
    stop,
    pause,
    resume,
    preview,
    notifySoundEffectStart,
    notifySoundEffectEnd,
  };
}
