import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TTSProvider } from "./contexts/TTSContext.tsx";
import { AIModelProvider } from "./contexts/AIModelContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TTSProvider>
      <AIModelProvider>
        <App />
      </AIModelProvider>
    </TTSProvider>
  </StrictMode>,
);
