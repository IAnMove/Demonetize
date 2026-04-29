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
const configSource = readProjectFile("src/core/config.ts");
const i18nSource = readProjectFile("src/core/i18n.ts");
const overlaySource = readProjectFile("src/ui/overlays.ts");
const sceneSource = readProjectFile("src/render/scene.ts");
const stateMachineSource = readProjectFile("src/core/stateMachine.ts");
const stylesSource = readProjectFile("src/styles.css");

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
assert(
  configSource.includes("playerDeathHoldSeconds") &&
    appSource.includes("pendingGameOver") &&
    sceneSource.includes("spawnPlayerDeathBreakup"),
  "Death flow should hold the game-over overlay until player breakup renders."
);
assert(
  /\.passive-card-rail\s*\{[^}]*bottom:\s*1rem/s.test(stylesSource) &&
    /\.boost-card-face\.is-mini\s*\{[^}]*width:\s*4\.85rem/s.test(stylesSource),
  "Passive cards should render larger at the bottom-left HUD position."
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
