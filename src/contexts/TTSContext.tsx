/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useTTS } from "@/hooks/useTTS";

// Type for the TTS context value
type TTSContextType = ReturnType<typeof useTTS>;

const TTSContext = createContext<TTSContextType | null>(null);

interface TTSProviderProps {
  children: ReactNode;
}

/**
 * TTS Provider component that wraps the app and provides TTS functionality.
 */
export const TTSProvider: React.FC<TTSProviderProps> = ({ children }) => {
  const tts = useTTS();

  return <TTSContext.Provider value={tts}>{children}</TTSContext.Provider>;
};

/**
 * Hook to access TTS context. Must be used within a TTSProvider.
 */
export const useTTSContext = (): TTSContextType => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error("useTTSContext must be used within a TTSProvider");
  }
  return context;
};

interface CharacterTTSProps {
  message: string;
  showBubble: boolean;
}

/**
 * Component that handles speaking character messages via TTS.
 * This component should be placed near where character messages are displayed.
 */
export const CharacterTTS: React.FC<CharacterTTSProps> = ({
  message,
  showBubble,
}) => {
  const { settings, speak } = useTTSContext();
  const lastSpokenMessageRef = useRef<string>("");

  // Speak message when bubble is shown and message changes
  useEffect(() => {
    // Only speak if:
    // 1. TTS is enabled
    // 2. The bubble is being shown (new message appeared)
    // 3. The message is different from the last spoken one
    if (
      settings.enabled &&
      showBubble &&
      message &&
      message !== lastSpokenMessageRef.current
    ) {
      // Remove emojis for cleaner TTS output (common emoji ranges)
      const cleanMessage = message.replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}]/gu,
        ""
      ).trim();
      
      if (cleanMessage) {
        speak(cleanMessage);
        lastSpokenMessageRef.current = message;
      }
    }
  }, [message, showBubble, settings.enabled, speak]);

  // Reset last spoken message when bubble hides
  useEffect(() => {
    if (!showBubble) {
      // Clear the last spoken message after a delay to allow for the same message
      // to be spoken again if it's re-displayed
      const timer = setTimeout(() => {
        lastSpokenMessageRef.current = "";
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showBubble]);

  // This component doesn't render anything
  return null;
};
