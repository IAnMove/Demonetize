import {
  DEBUG_BUILD_PRESETS,
  DEBUG_WAVE_PRESETS,
  type DebugBuildPresetId
} from "../gameplay/session";
import { UPGRADE_POOL } from "../gameplay/progression/upgradeConfig";
import type { UpgradeId } from "../gameplay/progression/upgrades";

interface DebugPanelHandlers {
  onApplyPreset: (presetId: DebugBuildPresetId) => void;
  onForceWave: (waveNumber: number) => void;
  onForceGameOver: () => void;
  onForceVictory: () => void;
  onPreviewEnemyDeaths: () => void;
  onGrantUpgrade: (upgradeId: UpgradeId, count: number) => void;
  onSetSeed: (seed: string) => void;
  onUseLiveRandom: () => void;
}

export interface DebugPanelController {
  dispose: () => void;
  setVisible: (visible: boolean) => void;
}

const DEBUG_PANEL_STORAGE_KEY = "overseer.debugPanel.open";

export function createDebugPanel(
  container: HTMLElement,
  handlers: DebugPanelHandlers
): DebugPanelController {
  const root = document.createElement("aside");
  root.className = "debug-panel";
  root.hidden = window.localStorage.getItem(DEBUG_PANEL_STORAGE_KEY) !== "true";

  const header = document.createElement("div");
  header.className = "debug-panel-header";

  const title = document.createElement("strong");
  title.textContent = "DEV PLAYTEST";

  const toggleButton = createDebugButton("Hide");
  toggleButton.addEventListener("click", () => setVisible(false));
  header.append(title, toggleButton);

  const status = document.createElement("p");
  status.className = "debug-panel-status";
  status.textContent = "F9 toggles panel. Presets reset the current run.";

  const seedRow = document.createElement("div");
  seedRow.className = "debug-panel-row";

  const seedInput = document.createElement("input");
  seedInput.className = "debug-panel-input";
  seedInput.type = "text";
  seedInput.value = DEBUG_BUILD_PRESETS[0].seed;
  seedInput.setAttribute("aria-label", "Debug seed");

  const seedButton = createDebugButton("Seed");
  seedButton.addEventListener("click", () => {
    const seed = seedInput.value.trim() || DEBUG_BUILD_PRESETS[0].seed;
    seedInput.value = seed;
    handlers.onSetSeed(seed);
    setStatus(`Seed locked: ${seed}`);
  });

  const liveButton = createDebugButton("Live RNG");
  liveButton.addEventListener("click", () => {
    handlers.onUseLiveRandom();
    setStatus("Live Math.random restored.");
  });

  seedRow.append(seedInput, seedButton, liveButton);

  const presets = document.createElement("div");
  presets.className = "debug-panel-section";
  presets.appendChild(createDebugLabel("Build presets"));
  for (const preset of DEBUG_BUILD_PRESETS) {
    const button = createDebugButton(preset.label);
    button.dataset.debugPreset = preset.id;
    button.addEventListener("click", () => {
      seedInput.value = preset.seed;
      handlers.onSetSeed(preset.seed);
      handlers.onApplyPreset(preset.id);
      setStatus(`${preset.label}: W${preset.waveNumber} / ${preset.seed}`);
    });
    presets.appendChild(button);
  }

  const waveControls = document.createElement("div");
  waveControls.className = "debug-panel-section";
  waveControls.appendChild(createDebugLabel("Wave jumps"));
  for (const preset of DEBUG_WAVE_PRESETS) {
    const button = createDebugButton(preset.label);
    button.addEventListener("click", () => {
      const seed = seedInput.value.trim();
      if (seed) {
        handlers.onSetSeed(seed);
      }
      handlers.onForceWave(preset.waveNumber);
      setStatus(`${preset.label}: forced with current build.`);
    });
    waveControls.appendChild(button);
  }

  const outcomeControls = document.createElement("div");
  outcomeControls.className = "debug-panel-section";
  outcomeControls.appendChild(createDebugLabel("Outcome screens"));

  const forceLossButton = createDebugButton("Force Loss");
  forceLossButton.addEventListener("click", () => {
    handlers.onForceGameOver();
    setStatus("Forced game-over screen.");
  });

  const forceWinButton = createDebugButton("Force Win");
  forceWinButton.addEventListener("click", () => {
    handlers.onForceVictory();
    setStatus("Forced victory screen.");
  });

  const enemyFxButton = createDebugButton("Enemy FX");
  enemyFxButton.addEventListener("click", () => {
    handlers.onPreviewEnemyDeaths();
    setStatus("Previewed enemy death effects.");
  });

  outcomeControls.append(forceLossButton, forceWinButton, enemyFxButton);

  const grantControls = document.createElement("div");
  grantControls.className = "debug-panel-section is-wide";
  grantControls.appendChild(createDebugLabel("Grant boost"));

  const grantRow = document.createElement("div");
  grantRow.className = "debug-panel-row";

  const upgradeSelect = document.createElement("select");
  upgradeSelect.className = "debug-panel-select";
  upgradeSelect.setAttribute("aria-label", "Boost to grant");
  for (const upgrade of UPGRADE_POOL) {
    const option = document.createElement("option");
    option.value = upgrade.id;
    option.textContent = `${upgrade.tier === "elite" ? "LEG " : ""}${upgrade.title}`;
    upgradeSelect.appendChild(option);
  }

  const countInput = document.createElement("input");
  countInput.className = "debug-panel-count";
  countInput.type = "number";
  countInput.min = "1";
  countInput.max = "6";
  countInput.step = "1";
  countInput.value = "1";
  countInput.setAttribute("aria-label", "Grant count");

  const grantButton = createDebugButton("Grant");
  grantButton.addEventListener("click", () => {
    const upgradeId = upgradeSelect.value as UpgradeId;
    const count = Number.parseInt(countInput.value, 10) || 1;
    const grantLabel =
      upgradeSelect.selectedOptions[0]?.textContent?.trim() ?? upgradeId;
    handlers.onGrantUpgrade(upgradeId, count);
    setStatus(`Granted ${grantLabel} x${Math.max(1, Math.min(6, count))}.`);
  });

  grantRow.append(upgradeSelect, countInput, grantButton);
  grantControls.appendChild(grantRow);

  const help = document.createElement("p");
  help.className = "debug-panel-help";
  help.textContent =
    "Shortcuts: Shift+1..5 presets, Shift+E/M/L/X/B waves, F9 panel. Dev-only; hidden from production runtime.";

  root.append(
    header,
    status,
    seedRow,
    presets,
    waveControls,
    outcomeControls,
    grantControls,
    help
  );
  container.appendChild(root);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }

    if (event.code === "F9") {
      event.preventDefault();
      setVisible(Boolean(root.hidden));
      return;
    }

    if (!event.shiftKey || isEditingText(event.target)) {
      return;
    }

    const preset = getShortcutPreset(event.code);
    if (preset) {
      event.preventDefault();
      seedInput.value = preset.seed;
      handlers.onSetSeed(preset.seed);
      handlers.onApplyPreset(preset.id);
      setStatus(`${preset.label}: W${preset.waveNumber} / ${preset.seed}`);
      return;
    }

    const waveNumber = getShortcutWave(event.code);
    if (waveNumber > 0) {
      event.preventDefault();
      const seed = seedInput.value.trim();
      if (seed) {
        handlers.onSetSeed(seed);
      }
      handlers.onForceWave(waveNumber);
      setStatus(`Forced wave ${waveNumber}.`);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  function setVisible(visible: boolean): void {
    root.hidden = !visible;
    window.localStorage.setItem(
      DEBUG_PANEL_STORAGE_KEY,
      visible ? "true" : "false"
    );
  }

  function setStatus(message: string): void {
    status.textContent = message;
  }

  return {
    dispose: () => {
      window.removeEventListener("keydown", handleKeyDown);
      root.remove();
    },
    setVisible
  };
}

function createDebugButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "debug-panel-button";
  button.type = "button";
  button.textContent = label;
  return button;
}

function createDebugLabel(label: string): HTMLSpanElement {
  const node = document.createElement("span");
  node.className = "debug-panel-label";
  node.textContent = label;
  return node;
}

function getShortcutPreset(code: string): (typeof DEBUG_BUILD_PRESETS)[number] | null {
  switch (code) {
    case "Digit1":
      return DEBUG_BUILD_PRESETS[0];
    case "Digit2":
      return DEBUG_BUILD_PRESETS[1];
    case "Digit3":
      return DEBUG_BUILD_PRESETS[2];
    case "Digit4":
      return DEBUG_BUILD_PRESETS[3];
    case "Digit5":
      return DEBUG_BUILD_PRESETS[4];
    default:
      return null;
  }
}

function getShortcutWave(code: string): number {
  switch (code) {
    case "KeyE":
      return DEBUG_WAVE_PRESETS[0].waveNumber;
    case "KeyM":
      return DEBUG_WAVE_PRESETS[1].waveNumber;
    case "KeyL":
      return DEBUG_WAVE_PRESETS[2].waveNumber;
    case "KeyX":
      return DEBUG_WAVE_PRESETS[3].waveNumber;
    case "KeyB":
      return DEBUG_WAVE_PRESETS[4].waveNumber;
    default:
      return 0;
  }
}

function isEditingText(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}
