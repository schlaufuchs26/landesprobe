import { createRoot } from "react-dom/client";
import { App } from "./src/App";
import "./src/styles.css";

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(<App />);
}
