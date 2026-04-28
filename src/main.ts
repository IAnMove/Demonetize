import "./styles.css";
import { createApp } from "./core/app";

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("Expected #app root element.");
}

createApp(rootElement);
