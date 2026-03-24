import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Approuter from "./routes/router";

function App() {
  return (
    <BrowserRouter>
      <Approuter />
    </BrowserRouter>
  );
}

export default App;
