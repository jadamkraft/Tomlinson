import React from "react";
import ReactDOM from "react-dom/client";
import { Workbox } from "workbox-window";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
if ("serviceWorker" in navigator) {
  const wb = new Workbox("/sw.js", { type: "module" });

  wb.register()
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });

  // Handle service worker updates
  wb.addEventListener("controlling", () => {
    window.location.reload();
  });
}
