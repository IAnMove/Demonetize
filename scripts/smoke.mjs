import { readFileSync, statSync } from "node:fs";
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
const audioSource = readProjectFile("src/core/audio.ts");
const channelLoreSource = readProjectFile("src/gameplay/channelLore.ts");
const configSource = readProjectFile("src/core/config.ts");
const i18nSource = readProjectFile("src/core/i18n.ts");
const playerSource = readProjectFile("src/gameplay/player/player.ts");
const enemySource = readProjectFile("src/gameplay/enemies/enemies.ts");
const runRecordsSource = readProjectFile("src/core/runRecords.ts");
const debugPanelSource = readProjectFile("src/ui/debugPanel.ts");
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
  indexHtml.includes("<title>T.O.P.E.: Corporate Purge AI</title>") &&
    indexHtml.includes("boot-intro") &&
    indexHtml.includes("Loading purge contract") &&
    indexHtml.includes("Contract locked") &&
    /class="boot-intro-start"[\s\S]*?disabled/.test(indexHtml),
  "index.html must render the rethemed boot intro and locked start affordance before the JS bundle loads."
);
assert(
  !indexHtml.includes("Ano 2026") && !i18nSource.includes("Ano 2026"),
  "Spanish intro copy should avoid the unaccented 'Ano 2026' fallback."
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
  appSource.includes('rootElement.querySelector(".boot-intro")') &&
    appSource.includes("rootElement.replaceChildren(shell)"),
  "App boot should keep the static intro visible until the real intro is ready."
);
assert(
  sceneSource.includes("spawnEnemyDeathBreakup") &&
    sceneSource.includes("createEnemyDeathShardPool") &&
    sceneSource.includes("getEnemyDeathProfile"),
  "Enemy deaths should spawn archetype-specific breakup fragments."
);
assert(
  playerSource.includes("PlayerDamageSourceKind") &&
    playerSource.includes("lastDamageSource") &&
    appSource.includes("view.player.lastDamageSource"),
  "Death summaries should prefer structured player damage attribution over visual heuristics."
);
assert(
  enemySource.includes('source: "boss-beam"') &&
    enemySource.includes("source: enemy.archetype") &&
    appSource.includes('type RunLossReason = PlayerDamageSourceKind | "overrun"'),
  "Enemy and boss damage should record exact loss sources."
);
assert(
  runRecordsSource.includes("selectedChoiceIds") &&
    runRecordsSource.includes("usedActionCards") &&
    overlaySource.includes("createSummaryFromLastRun") &&
    overlaySource.includes("titleLastRunBuild"),
  "Run records should persist and render the previous build recap."
);
assert(
  statSync(join(projectRoot, "public/avatars/channel-avatars.jpg")).size < 500_000 &&
    statSync(join(projectRoot, "public/avatars/channel-avatars-2.jpg")).size < 500_000 &&
    channelLoreSource.includes("CHANNEL_AVATAR_ATLAS_COUNT = 2") &&
    channelLoreSource.includes("getChannelAvatarAtlasIndex") &&
    channelLoreSource.includes("getChannelName") &&
    channelLoreSource.includes("CHANNEL_AVATAR_ATLAS_COLUMNS") &&
    sceneSource.includes("/avatars/channel-avatars.jpg") &&
    sceneSource.includes("/avatars/channel-avatars-2.jpg") &&
    sceneSource.includes("updateChannelAvatarGeometryUv"),
  "Channel avatar atlas should be optimized and rendered on enemy views."
);
assert(
  audioSource.includes("SpeechSynthesisUtterance") &&
    audioSource.includes("inauthentic content") &&
    appSource.includes("notify.enemyKilled") &&
    i18nSource.includes("T.O.P.E.") &&
    i18nSource.includes("contenido inautentico"),
  "Corporate AI lore should include channel takedown feedback and robotic verdict copy."
);
assert(
  appSource.includes("channelAvatarIndex") &&
    sceneSource.includes("createChannelObituaryView") &&
    sceneSource.includes("drawChannelObituaryLabel") &&
    i18nSource.includes("INAUTHENTIC CONTENT"),
  "Channel kills should render a red obituary marker with the exact inauthentic-content verdict."
);
assert(
  sceneSource.includes('EnemyAvatarMode = "floor" | "hidden" | "top"') &&
    sceneSource.includes("setEnemyAvatarMode") &&
    sceneSource.includes("updateEnemyAvatarDisc") &&
    appSource.includes("onSetEnemyAvatarMode") &&
    debugPanelSource.includes("Channel avatars") &&
    debugPanelSource.includes('"floor"') &&
    debugPanelSource.includes('"hidden"'),
  "DEV runtime should expose top/floor/hidden living-channel avatar comparison modes."
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
