import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TTSProvider } from "./contexts/TTSContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TTSProvider>
      <App />
    </TTSProvider>
  </StrictMode>,
);
