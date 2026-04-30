import type { I18nController } from "../core/i18n";
import {
  isActionCardId,
  type ActionCardId,
  type UpgradeChoice,
  type UpgradeId
} from "../gameplay/progression/upgrades";

type BoostCardSize = "mini" | "preview";

interface BoostCardOptions {
  count?: number;
  kicker?: string;
  size?: BoostCardSize;
}

interface BoostCardSkin {
  accent: string;
  art: string | null;
  glow: string;
  glyph: string;
}

export function createBoostCardFace(
  choice: Pick<UpgradeChoice, "id" | "tier">,
  i18n: I18nController,
  options: BoostCardOptions = {}
): HTMLDivElement {
  const size = options.size ?? "preview";
  const skin = getBoostCardSkin(choice.id);
  const text = getBoostCardText(choice.id, i18n);
  const typeLabel = getBoostCardTypeLabel(choice, i18n);
  const root = document.createElement("div");
  root.className = [
    "boost-card-face",
    `is-${size}`,
    isActionCardId(choice.id)
      ? "is-action"
      : choice.tier === "elite"
        ? "is-legendary"
        : "is-passive"
  ].join(" ");
  root.setAttribute("aria-label", `${text.title}. ${text.description}`);
  root.style.setProperty("--boost-card-accent", skin.accent);
  root.style.setProperty("--boost-card-glow", skin.glow);
  if (skin.art) {
    root.style.setProperty("--boost-card-art", `url("${skin.art}")`);
  }

  const art = document.createElement("span");
  art.className = skin.art ? "boost-card-art has-image" : "boost-card-art";

  const glyph = document.createElement("span");
  glyph.className = "boost-card-glyph";
  glyph.textContent = skin.glyph;

  const frame = document.createElement("span");
  frame.className = "boost-card-frame";

  const body = document.createElement("span");
  body.className = "boost-card-body";

  const kicker = document.createElement("span");
  kicker.className = "boost-card-kicker";
  kicker.textContent = options.kicker ?? typeLabel;

  const title = document.createElement("strong");
  title.className = "boost-card-title";
  title.textContent = text.title;

  const description = document.createElement("span");
  description.className = "boost-card-description";
  description.textContent = text.description;

  body.append(kicker, title, description);
  art.appendChild(glyph);
  root.append(art, frame, body);

  if ((options.count ?? 1) > 1) {
    const stack = document.createElement("span");
    stack.className = "boost-card-count";
    stack.textContent = `x${options.count}`;
    root.dataset.stackCount = `${options.count}`;
    root.appendChild(stack);
  }

  return root;
}

export function getActionCardArt(cardId: ActionCardId): string {
  switch (cardId) {
    case "card-purge":
      return "/cards/card-purge.webp";
    case "card-repair":
      return "/cards/card-repair.webp";
    case "card-overcore":
      return "/cards/card-armor.webp";
  }
}

export function getBoostCardText(
  upgradeId: UpgradeId,
  i18n: I18nController
): { description: string; title: string } {
  switch (upgradeId) {
    case "card-purge":
      return {
        description: i18n.t("card.purge.desc"),
        title: i18n.t("card.purge.title")
      };
    case "card-repair":
      return {
        description: i18n.t("card.repair.desc"),
        title: i18n.t("card.repair.title")
      };
    case "card-overcore":
      return {
        description: i18n.t("card.overcore.desc"),
        title: i18n.t("card.overcore.title")
      };
    default:
      return i18n.getUpgradeText(upgradeId);
  }
}

function getBoostCardTypeLabel(
  choice: Pick<UpgradeChoice, "id" | "tier">,
  i18n: I18nController
): string {
  const isSpanish = i18n.getLocale() === "es";

  if (isActionCardId(choice.id)) {
    return isSpanish ? "Accion" : "Action";
  }

  if (choice.tier === "elite") {
    return isSpanish ? "Legendaria" : "Legendary";
  }

  return isSpanish ? "Pasiva" : "Passive";
}

function getBoostCardSkin(upgradeId: UpgradeId): BoostCardSkin {
  switch (upgradeId) {
    case "card-purge":
      return {
        accent: "#ff648f",
        art: getActionCardArt(upgradeId),
        glow: "rgba(255, 91, 127, 0.34)",
        glyph: "APPEAL"
      };
    case "card-repair":
      return {
        accent: "#72ffd5",
        art: getActionCardArt(upgradeId),
        glow: "rgba(114, 255, 213, 0.32)",
        glyph: "TRUST"
      };
    case "card-overcore":
      return {
        accent: "#ffb84a",
        art: getActionCardArt(upgradeId),
        glow: "rgba(255, 184, 74, 0.34)",
        glyph: "REVIEW"
      };
    case "arc-splitter":
      return damageSkin("ARC");
    case "halo-drone":
      return supportSkin("DRONE");
    case "ricochet-core":
      return spreadSkin("BOUNCE");
    case "starburst-rounds":
      return damageSkin("BURST");
    case "rail-pierce":
      return damageSkin("RAIL");
    case "nova-dash":
      return dashSkin("NOVA");
    case "afterimage-trail":
      return dashSkin("ECHO");
    case "gravity-well":
      return spreadSkin("WELL");
    case "satellite-lattice":
      return {
        accent: "#ffb84a",
        art: null,
        glow: "rgba(255, 184, 74, 0.34)",
        glyph: "ORBIT"
      };
    case "comet-bloom":
      return {
        accent: "#ff8a4a",
        art: null,
        glow: "rgba(255, 138, 74, 0.34)",
        glyph: "COMET"
      };
    case "afterburn-link":
    case "dash-capacitors":
    case "vector-thrusters":
      return dashSkin("DASH");
    case "breach-pulse":
    case "shock-greaves":
    case "zero-point-capacitor":
      return dashSkin("PULSE");
    case "burn-drive":
      return dashSkin("MOVE");
    case "chatgpt-router":
    case "echo-web":
    case "prism-loader":
      return spreadSkin("+1");
    case "split-lattice":
    case "eclipse-protocol":
      return spreadSkin("+2");
    case "codex-overclock":
    case "heat-sink-bypass":
    case "ion-repeaters":
      return damageSkin("RATE");
    case "coil-rifling":
    case "glass-reactor":
    case "overcharge-rounds":
    case "overseer-lens":
    case "siege-gyros":
      return damageSkin("DMG");
    case "claude-lattice":
    case "magnet-sweep":
    case "recovery-matrix":
    case "signal-choir":
      return supportSkin("TRUST");
    case "fortress-frame":
    case "phase-battery":
      return supportSkin("SIGNAL");
    default:
      return supportSkin("CORE");
  }
}

function dashSkin(glyph: string): BoostCardSkin {
  return {
    accent: "#31f5ff",
    art: null,
    glow: "rgba(49, 245, 255, 0.34)",
    glyph
  };
}

function damageSkin(glyph: string): BoostCardSkin {
  return {
    accent: "#ff8a4a",
    art: null,
    glow: "rgba(255, 138, 74, 0.32)",
    glyph
  };
}

function spreadSkin(glyph: string): BoostCardSkin {
  return {
    accent: "#ff4fd8",
    art: null,
    glow: "rgba(255, 79, 216, 0.32)",
    glyph
  };
}

function supportSkin(glyph: string): BoostCardSkin {
  return {
    accent: "#96ff47",
    art: null,
    glow: "rgba(150, 255, 71, 0.3)",
    glyph
  };
}
