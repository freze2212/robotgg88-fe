import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/swal-frame-popup.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const publicUrl = process.env.PUBLIC_URL || "";
document.documentElement.style.setProperty(
  "--frame-popup-bg-url",
  `url("${publicUrl}/assets/frame-popup.png")`
);

declare global {
  interface Window {
    __ASSET_V__?: number;
  }
}
if (typeof window !== "undefined") {
  window.__ASSET_V__ = Date.now();
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals())
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
