import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function readProjectFile(path) {
  return readFileSync(join(projectRoot, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function transitionPattern(from, to) {
  const key = from.includes("-") ? `"${from}"` : from;
  return new RegExp(`${escapePattern(key)}:\\s*\\[[^\\]]*"${escapePattern(to)}"`, "m");
}

const packageJson = JSON.parse(readProjectFile("package.json"));
const indexHtml = readProjectFile("index.html");
const mainSource = readProjectFile("src/main.ts");
const appSource = readProjectFile("src/core/app.ts");
const i18nSource = readProjectFile("src/core/i18n.ts");
const overlaySource = readProjectFile("src/ui/overlays.ts");
const stateMachineSource = readProjectFile("src/core/stateMachine.ts");

for (const scriptName of ["dev", "build", "preview", "smoke", "test"]) {
  assert(
    typeof packageJson.scripts?.[scriptName] === "string",
    `Missing package script: ${scriptName}`
  );
}

assert(
  /<div\s+id=["']app["']/.test(indexHtml),
  "index.html must expose the #app mount point."
);
assert(
  mainSource.includes('document.querySelector<HTMLDivElement>("#app")'),
  "main.ts must query the typed #app mount point."
);
assert(
  mainSource.includes("createApp(rootElement)"),
  "main.ts must boot the application."
);
assert(
  appSource.includes('stateMachine.transition("intro")'),
  "App boot should transition from boot to intro."
);
assert(
  overlaySource.includes("intro-screen") && overlaySource.includes("onSkipIntro"),
  "Intro overlay and skip handler must be wired."
);
assert(
  i18nSource.includes('"intro.copy"') && i18nSource.includes('"title.main"'),
  "Intro and rethemed title copy must be localized."
);

const states = [
  "boot",
  "intro",
  "title",
  "playing",
  "chapter-transition",
  "between-waves",
  "game-over",
  "victory"
];

for (const state of states) {
  assert(
    stateMachineSource.includes(`"${state}"`),
    `GameState is missing ${state}.`
  );
}

const transitions = [
  ["boot", "intro"],
  ["intro", "title"],
  ["title", "playing"],
  ["playing", "chapter-transition"],
  ["playing", "between-waves"],
  ["playing", "game-over"],
  ["playing", "victory"],
  ["chapter-transition", "playing"],
  ["between-waves", "playing"],
  ["game-over", "playing"],
  ["game-over", "title"],
  ["victory", "playing"],
  ["victory", "title"]
];

for (const [from, to] of transitions) {
  assert(
    transitionPattern(from, to).test(stateMachineSource),
    `Missing state transition: ${from} -> ${to}`
  );
}

console.log("Smoke checks passed.");
