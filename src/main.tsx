import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.js";

const root = document.querySelector("#app");
if (!root) throw new Error("Root element #app not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

