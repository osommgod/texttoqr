import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors closeButton expand />
  </React.StrictMode>,
);