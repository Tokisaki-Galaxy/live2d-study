/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, type ReactNode } from "react";
import { useAIModel } from "@/hooks/useAIModel";

// Type for the AI Model context value
type AIModelContextType = ReturnType<typeof useAIModel>;

const AIModelContext = createContext<AIModelContextType | null>(null);

interface AIModelProviderProps {
  children: ReactNode;
}

/**
 * AI Model Provider component that wraps the app and provides AI Model functionality.
 */
export const AIModelProvider: React.FC<AIModelProviderProps> = ({ children }) => {
  const aiModel = useAIModel();

  return <AIModelContext.Provider value={aiModel}>{children}</AIModelContext.Provider>;
};

/**
 * Hook to access AI Model context. Must be used within an AIModelProvider.
 */
export const useAIModelContext = (): AIModelContextType => {
  const context = useContext(AIModelContext);
  if (!context) {
    throw new Error("useAIModelContext must be used within an AIModelProvider");
  }
  return context;
};
