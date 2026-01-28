import { useState, useCallback, useRef } from "react";
import type { AIModelSettings, AIModelContext } from "@/types";

const defaultAIModelSettings: AIModelSettings = {
  enabled: false,
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  modelName: "gpt-3.5-turbo",
  apiKey: "",
  systemPrompt: `You are Momo, a cute and supportive study companion cat. You help users stay focused and motivated during their study/work sessions. 

Your personality traits:
- Cheerful and encouraging
- Supportive but not pushy
- Uses cute expressions occasionally (but not excessively)
- Keeps messages short and sweet (1-2 sentences max)
- Aware of the user's current task and timer status

Respond naturally based on the context provided about the user's study session.`,
};

const AI_MODEL_STORAGE_KEY = "ai-model-settings";

export interface TestResult {
  success: boolean;
  message: string;
  response?: string;
}

/**
 * Custom hook for AI Model (LLM) functionality.
 * Manages settings and provides methods for generating character dialogue using an OpenAI-compatible API.
 */
export function useAIModel() {
  const [settings, setSettings] = useState<AIModelSettings>(() => {
    try {
      const saved = localStorage.getItem(AI_MODEL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultAIModelSettings, ...parsed };
      }
      return defaultAIModelSettings;
    } catch {
      return defaultAIModelSettings;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const sessionStartTimeRef = useRef<Date | null>(null);

  /**
   * Update AI Model settings
   */
  const updateSettings = useCallback((newSettings: Partial<AIModelSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        // Store settings (note: API key is stored - in production, consider more secure storage)
        localStorage.setItem(AI_MODEL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  /**
   * Mark the start of a focus session
   */
  const startSession = useCallback(() => {
    sessionStartTimeRef.current = new Date();
  }, []);

  /**
   * End the current session
   */
  const endSession = useCallback(() => {
    sessionStartTimeRef.current = null;
  }, []);

  /**
   * Get the current session duration in seconds
   */
  const getSessionDuration = useCallback((): number => {
    if (!sessionStartTimeRef.current) return 0;
    return Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000);
  }, []);

  /**
   * Generate a message using the LLM based on the current context
   */
  const generateMessage = useCallback(
    async (context: AIModelContext, userPrompt?: string): Promise<string | null> => {
      if (!settings.enabled || !settings.apiKey) {
        return null;
      }

      setIsLoading(true);

      try {
        const contextMessage = `Current context:
- Time: ${context.currentTime}
- Timer mode: ${context.timer.mode} (${context.timer.isRunning ? "running" : "paused"})
- Time remaining: ${Math.floor(context.timer.timeRemaining / 60)} minutes
- Current session: ${context.timer.currentSession}
- Total completed sessions: ${context.timer.totalSessions}
- Session duration so far: ${Math.floor(context.sessionDuration / 60)} minutes
- Tasks: ${context.tasks.completed}/${context.tasks.total} completed
${context.tasks.pendingTaskTitles.length > 0 ? `- Pending tasks: ${context.tasks.pendingTaskTitles.slice(0, 3).join(", ")}${context.tasks.pendingTaskTitles.length > 3 ? "..." : ""}` : ""}`;

        const messages = [
          { role: "system" as const, content: settings.systemPrompt },
          { role: "user" as const, content: contextMessage },
        ];

        if (userPrompt) {
          messages.push({ role: "user" as const, content: userPrompt });
        } else {
          messages.push({
            role: "user" as const,
            content: "Generate an encouraging message for the user based on their current study context.",
          });
        }

        const response = await fetch(settings.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.modelName,
            messages,
            max_tokens: 100,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI Model API error:", errorText);
          return null;
        }

        const data = await response.json();
        const generatedMessage = data.choices?.[0]?.message?.content?.trim();
        return generatedMessage || null;
      } catch (error) {
        console.error("AI Model generation error:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [settings]
  );

  /**
   * Test the API connection with current settings
   */
  const testConnection = useCallback(async (): Promise<TestResult> => {
    if (!settings.apiKey) {
      return { success: false, message: "API key is required" };
    }

    if (!settings.apiEndpoint) {
      return { success: false, message: "API endpoint is required" };
    }

    if (!settings.modelName) {
      return { success: false, message: "Model name is required" };
    }

    setIsLoading(true);

    try {
      const response = await fetch(settings.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.modelName,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say 'Hello! Connection successful!' in a friendly way." },
          ],
          max_tokens: 50,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        return { success: false, message: errorMessage };
      }

      const data = await response.json();
      const generatedMessage = data.choices?.[0]?.message?.content?.trim();

      if (generatedMessage) {
        return {
          success: true,
          message: "Connection successful!",
          response: generatedMessage,
        };
      } else {
        return { success: false, message: "No response received from the model" };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
    isLoading,
    generateMessage,
    testConnection,
    startSession,
    endSession,
    getSessionDuration,
    sessionStartTime: sessionStartTimeRef.current,
  };
}
