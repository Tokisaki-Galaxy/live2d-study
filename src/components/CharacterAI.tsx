import { useEffect, useRef, useCallback } from "react";
import { useAIModelContext } from "@/contexts/AIModelContext";
import { getRandomMessage, getRandomEventMessage } from "@/hooks/useCharacter";
import type { AIModelContext, Task, TimerMode, CharacterMood } from "@/types";

interface CharacterAIProps {
  tasks: Task[];
  timerMode: TimerMode;
  timerIsRunning: boolean;
  timeRemaining: number;
  currentSession: number;
  totalSessions: number;
  currentMood: CharacterMood;
  showMessage: (msg: string) => void;
}

/**
 * Component that integrates AI model with character dialogue.
 * When AI model is enabled, it generates contextual messages using the LLM.
 * Falls back to default messages when AI model is disabled or fails.
 */
export const CharacterAI: React.FC<CharacterAIProps> = ({
  tasks,
  timerMode,
  timerIsRunning,
  timeRemaining,
  currentSession,
  totalSessions,
  currentMood,
  showMessage,
}) => {
  const aiModel = useAIModelContext();
  const prevMoodRef = useRef<CharacterMood>(currentMood);
  const prevTimerRunningRef = useRef<boolean>(timerIsRunning);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const lastAIMessageTimeRef = useRef<number>(0);

  // Build context for AI model
  const buildContext = useCallback((): AIModelContext => {
    const pendingTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    return {
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        pendingTaskTitles: pendingTasks.map((t) => t.title),
      },
      timer: {
        mode: timerMode,
        isRunning: timerIsRunning,
        timeRemaining,
        currentSession,
        totalSessions,
      },
      currentTime: new Date().toLocaleString(),
      sessionStartTime: sessionStartTimeRef.current?.toISOString() || null,
      sessionDuration: sessionStartTimeRef.current
        ? Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000)
        : 0,
    };
  }, [tasks, timerMode, timerIsRunning, timeRemaining, currentSession, totalSessions]);

  // Generate AI message with fallback
  const generateAIMessage = useCallback(
    async (promptHint?: string): Promise<string> => {
      if (!aiModel.settings.enabled || !aiModel.settings.apiKey) {
        // Fallback to default message
        return getRandomMessage(currentMood);
      }

      // Rate limit AI calls (minimum 10 seconds between calls)
      const now = Date.now();
      if (now - lastAIMessageTimeRef.current < 10000) {
        return getRandomMessage(currentMood);
      }

      try {
        const context = buildContext();
        const message = await aiModel.generateMessage(context, promptHint);

        if (message) {
          lastAIMessageTimeRef.current = now;
          return message;
        }
      } catch (error) {
        console.error("AI message generation failed:", error);
      }

      // Fallback to default message
      return getRandomMessage(currentMood);
    },
    [aiModel, currentMood, buildContext]
  );

  // Handle timer start/stop events
  useEffect(() => {
    if (timerIsRunning && !prevTimerRunningRef.current) {
      // Timer just started
      sessionStartTimeRef.current = new Date();

      if (aiModel.settings.enabled && aiModel.settings.apiKey) {
        generateAIMessage("The user just started a focus session. Give them an encouraging start message.")
          .then(showMessage)
          .catch(() => showMessage(getRandomEventMessage("timerStart")));
      }
    } else if (!timerIsRunning && prevTimerRunningRef.current && timerMode === "work") {
      // Timer was paused during work (not a normal completion)
      sessionStartTimeRef.current = null;
    }

    prevTimerRunningRef.current = timerIsRunning;
  }, [timerIsRunning, timerMode, aiModel.settings.enabled, aiModel.settings.apiKey, generateAIMessage, showMessage]);

  // Handle mood changes
  useEffect(() => {
    if (prevMoodRef.current !== currentMood) {
      const prevMood = prevMoodRef.current;
      prevMoodRef.current = currentMood;

      if (aiModel.settings.enabled && aiModel.settings.apiKey) {
        let promptHint = "";
        
        if (currentMood === "focus" && prevMood !== "focus") {
          promptHint = "The user entered focus mode. Encourage them to concentrate.";
        } else if (currentMood === "sleep") {
          promptHint = "The user is on a break. Remind them to relax and recharge.";
        } else if (currentMood === "encourage") {
          promptHint = "The user just completed a focus session! Celebrate their achievement.";
        } else if (currentMood === "happy") {
          promptHint = "The user is ready to start. Give them a warm welcome.";
        }

        if (promptHint) {
          generateAIMessage(promptHint)
            .then(showMessage)
            .catch(() => showMessage(getRandomMessage(currentMood)));
        }
      }
    }
  }, [currentMood, aiModel.settings.enabled, aiModel.settings.apiKey, generateAIMessage, showMessage]);

  // Periodic AI messages (every 3 minutes) when not in focus mode
  useEffect(() => {
    if (!aiModel.settings.enabled || !aiModel.settings.apiKey) {
      return;
    }

    const interval = setInterval(
      () => {
        // Only show messages when not in active focus mode
        if (!timerIsRunning || timerMode !== "work") {
          generateAIMessage("Generate an idle/check-in message to keep the user company.")
            .then(showMessage)
            .catch(() => showMessage(getRandomEventMessage("idle")));
        }
      },
      3 * 60 * 1000 // Every 3 minutes
    );

    return () => clearInterval(interval);
  }, [timerIsRunning, timerMode, aiModel.settings.enabled, aiModel.settings.apiKey, generateAIMessage, showMessage]);

  // This component doesn't render anything
  return null;
};
