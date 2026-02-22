import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App.jsx";

createRoot(document.querySelector("#app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

