import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Import debug utilities (available in browser console)
import "./utils/firebaseDebug";

// Hide initial loader when React is ready
document.body.classList.add('loaded');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
