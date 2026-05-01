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
const inputSource = readProjectFile("src/core/input.ts");
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
  indexHtml.includes('<script async src="https://vibej.am/2026/widget.js"></script>') &&
    !indexHtml.includes("https://vibejam.cc/2026/widget.js"),
  "index.html must keep the canonical Vibe Jam 2026 widget script URL."
);
assert(
  indexHtml.includes('<link rel="icon" href="/favicon.ico" sizes="any" />') &&
    statSync(join(projectRoot, "public/favicon.ico")).size < 20_000,
  "index.html must expose a lightweight favicon.ico avatar."
);
assert(
  indexHtml.includes("<title>DEMONETIZED: The Authenticity Purge</title>") &&
    indexHtml.includes("boot-intro") &&
    indexHtml.includes("tope-cover-light.webp") &&
    indexHtml.includes("boot-intro-copy-fragment") &&
    indexHtml.includes("Accept Contract") &&
    indexHtml.includes("bootAccepted") &&
    indexHtml.includes("tope:boot-accepted") &&
    !indexHtml.includes("Loading purge contract") &&
    !indexHtml.includes("Contract locked") &&
    !indexHtml.includes("boot-progress") &&
    !/class="boot-intro-start"[\s\S]*?disabled/.test(indexHtml),
  "index.html must render the contract intro immediately without loading copy or progress UI."
);
assert(
  statSync(join(projectRoot, "public/promo/tope-cover-light.webp")).size < 90_000 &&
    !indexHtml.includes('url("/promo/tope-cover.png")') &&
    !stylesSource.includes('url("/promo/tope-cover.png")'),
  "Initial intro art should use the lightweight CEO background instead of the full PNG."
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
  appSource.includes('params.get("portal") === "true"') &&
    appSource.includes('previousRef: params.get("ref")') &&
    appSource.includes("Portal Compliance Loadout") &&
    appSource.includes('"card-purge"') &&
    appSource.includes('"card-overcore"') &&
    appSource.includes('"card-repair"') &&
    appSource.includes("buildPortalExitUrl") &&
    appSource.includes("buildPortalReturnUrl") &&
    appSource.includes("hasTriggeredPortal") &&
    appSource.includes("scene.setPortals(portalEntries)") &&
    appSource.includes("https://vibejam.cc/portal/2026") &&
    appSource.includes("THEIRTUBE TRANSFER NODE") &&
    appSource.includes("RETURN PORTAL") &&
    sceneSource.includes("createPortalView") &&
    sceneSource.includes("drawPortalLabel"),
  "Portal mode should bypass menus with a mapped loadout, render neon portals, and keep one-shot redirects."
);
assert(
  overlaySource.includes("intro-screen") && overlaySource.includes("onSkipIntro"),
  "Intro overlay and skip handler must be wired."
);
assert(
  overlaySource.includes("renderIntroCopy") &&
    overlaySource.includes("intro-copy-fragment") &&
    stylesSource.includes("intro-phrase-reveal") &&
    stylesSource.includes("intro-actions-reveal"),
  "Intro contract copy should reveal as readable phrases instead of behaving like a loading screen."
);
assert(
  overlaySource.includes("https://x.com/TheINAOG") &&
    overlaySource.includes("@TheINAOG") &&
    !overlaySource.includes("https://github.com/IAnMove/Demonetize") &&
    overlaySource.includes("run-about") &&
    i18nSource.includes('"about.source"') &&
    i18nSource.includes("Repo privado") &&
    stylesSource.includes(".run-about"),
  "Game-over screen should expose a discreet X profile and private-repo note."
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
  "Channel avatar atlas should be optimized for obituary rendering."
);
assert(
    !audioSource.includes("SpeechSynthesisUtterance") &&
    !audioSource.includes("demonetization complete") &&
    !audioSource.includes("preloadAudioAssets") &&
    !audioSource.includes("jumpingcyborgmix2.ogg") &&
    audioSource.includes("jumpingcyborgmix2.mp3") &&
    audioSource.includes("STARTUP_CUES") &&
    statSync(join(projectRoot, "public/assets/audio/music/jumpingcyborgmix2.mp3")).size <
      3_000_000 &&
    appSource.includes("notify.enemyKilled") &&
    i18nSource.includes("TheirTube") &&
    i18nSource.includes("inautentico"),
  "TheirTube audio should avoid the removed robotic verdict voice and heavy startup preloads."
);
assert(
  appSource.includes("channelAvatarIndex") &&
    sceneSource.includes("createChannelObituaryView") &&
    sceneSource.includes("drawChannelObituaryLabel") &&
    sceneSource.includes("DEMONETIZATION COMPLETE"),
  "Channel kills should render a red obituary marker with the demonetization verdict."
);
assert(
  sceneSource.includes("view.avatarRig.visible = false") &&
    !sceneSource.includes("getChannelAvatarIndex(enemy.id)") &&
    !appSource.includes("onSetEnemyAvatarMode") &&
    !debugPanelSource.includes("Channel avatars"),
  "Living enemies should hide channel avatars; channel images are reserved for death obituaries."
);
assert(
  /\.passive-card-rail\s*\{[^}]*bottom:\s*1rem/s.test(stylesSource) &&
    /\.boost-card-face\.is-mini\s*\{[^}]*width:\s*4\.85rem/s.test(stylesSource),
  "Passive cards should render larger at the bottom-left HUD position."
);
assert(
  inputSource.includes("setTouchControlsVisible") &&
    inputSource.includes("mobile-controls") &&
    inputSource.includes("mobile-stick") &&
    inputSource.includes("mobile-aim-pad") &&
    inputSource.includes("mobile-dash-button") &&
    inputSource.includes("pointerType !== \"mouse\"") &&
    appSource.includes("input.setTouchControlsVisible(state === \"playing\")") &&
    stylesSource.includes(".mobile-controls") &&
    stylesSource.includes("@media (hover: none), (pointer: coarse)") &&
    stylesSource.includes("touch-action: none"),
  "Mobile play should expose touch movement, aim/fire, and dash controls only while playing."
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
  ["boot", "playing"],
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
