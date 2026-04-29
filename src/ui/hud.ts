import type { I18nController } from "../core/i18n";
import type {
  HeldActionCard,
  UpgradeChoice
} from "../gameplay/progression/upgrades";
import {
  createBoostCardFace,
  getActionCardArt,
  getBoostCardText
} from "./boostCards";

type HudNoticeTone = "danger" | "pickup" | "system";
type HudPulse = "damage" | "death" | "pickup" | "upgrade";
type HudStateTone = "danger" | "neutral" | "system";

interface HudSnapshot {
  actionCards: HeldActionCard[];
  bossLabel?: string;
  bossMode?: string;
  bossRatio?: number;
  chainLabel: string;
  chainRatio: number;
  dashLabel: string;
  dashRatio: number;
  hullLabel: string;
  hullRatio: number;
  pbLabel: string;
  pbTone: HudStateTone;
  passiveCards: UpgradeChoice[];
  scoreLabel: string;
  showControls: boolean;
  state: string;
  stateTone: HudStateTone;
  uptime: string;
  wave: string;
  waveDetail: string;
}

interface HudHandlers {
  onUseActionCard: (
    instanceId: string,
    clientX: number,
    clientY: number
  ) => boolean;
}

export interface HudController {
  announce: (message: string, tone?: HudNoticeTone) => void;
  clearTransientState: () => void;
  notify: (message: string, tone?: HudNoticeTone) => void;
  pulse: (kind: HudPulse) => void;
  setVisible: (visible: boolean) => void;
  update: (snapshot: HudSnapshot) => void;
}

export function createHud(
  container: HTMLDivElement,
  i18n: I18nController,
  handlers?: HudHandlers
): HudController {
  const root = document.createElement("div");
  root.className = "hud";
  root.hidden = true;

  const flash = document.createElement("div");
  flash.className = "feedback-flash";

  const focusBanner = document.createElement("div");
  focusBanner.className = "focus-banner";
  focusBanner.hidden = true;

  const statusCluster = document.createElement("div");
  statusCluster.className = "hud-cluster";

  const statusRail = document.createElement("div");
  statusRail.className = "status-rail";

  const hullMetric = createMetric(statusRail, i18n.t("hud.hull"), "100%", 1);
  const dashMetric = createMetric(statusRail, i18n.t("hud.dash"), i18n.t("hud.ready"), 1);

  const metaStrip = document.createElement("div");
  metaStrip.className = "meta-strip";

  const waveMeta = createMeta(metaStrip, i18n.t("hud.wave"), "W1");
  const waveDetailMeta = createMeta(metaStrip, i18n.t("hud.threat"), i18n.t("wave.sweep"));
  const scoreMeta = createMeta(metaStrip, i18n.t("hud.score"), "0000");
  const pbMeta = createMeta(metaStrip, i18n.t("hud.pb"), "--");
  const chainMeta = createMeta(metaStrip, i18n.t("hud.chain"), "x0");
  const uptimeMeta = createMeta(metaStrip, i18n.t("hud.uptime"), "00.0s");
  const stateMeta = createMeta(metaStrip, i18n.t("hud.state"), i18n.t("hud.standBy"));

  statusCluster.append(statusRail, metaStrip);

  const eventFeed = document.createElement("div");
  eventFeed.className = "event-feed";
  let focusBannerToken = 0;

  const bossStrip = document.createElement("div");
  bossStrip.className = "boss-strip";
  bossStrip.hidden = true;

  const bossLabel = document.createElement("span");
  bossLabel.className = "boss-label";
  bossLabel.textContent = "THE ALGORITHM";

  const bossMode = document.createElement("span");
  bossMode.className = "boss-mode";
  bossMode.textContent = "LOCKED";

  const bossMeter = document.createElement("div");
  bossMeter.className = "boss-meter";

  const bossMeterFill = document.createElement("div");
  bossMeterFill.className = "boss-meter-fill";

  bossMeter.appendChild(bossMeterFill);
  bossStrip.append(bossLabel, bossMode, bossMeter);

  const controlsStrip = document.createElement("div");
  controlsStrip.className = "controls-strip";

  const controlsLabel = document.createElement("span");
  controlsLabel.className = "micro-copy controls-label";

  const controlsGrid = document.createElement("div");
  controlsGrid.className = "controls-grid";

  const actionHand = document.createElement("div");
  actionHand.className = "action-hand";
  actionHand.hidden = true;
  let actionHandSignature = "";

  const passiveRail = document.createElement("div");
  passiveRail.className = "passive-card-rail";
  passiveRail.hidden = true;
  let passiveRailSignature = "";

  root.append(
    flash,
    focusBanner,
    statusCluster,
    eventFeed,
    bossStrip,
    controlsStrip,
    passiveRail,
    actionHand
  );
  controlsStrip.append(controlsLabel, controlsGrid);
  container.appendChild(root);

  const renderControls = (): void => {
    controlsLabel.textContent = i18n.t("controls.combat");
    controlsGrid.replaceChildren(
      createControlChip(i18n.t("controls.move"), "WASD"),
      createControlChip(i18n.t("controls.aim"), "Mouse"),
      createControlChip(i18n.t("controls.fire"), "LMB"),
      createControlChip(i18n.t("controls.dash"), "Space / RMB")
    );
  };

  const renderActionCards = (cards: HeldActionCard[]): void => {
    const signature = `${i18n.getLocale()}|${cards
      .map((card) => `${card.instanceId}:${card.id}`)
      .join("|")}`;

    if (signature === actionHandSignature) {
      return;
    }

    actionHandSignature = signature;
    actionHand.hidden = cards.length === 0;
    actionHand.replaceChildren(
      ...cards.map((card) => createActionCardButton(card, i18n, actionHand, handlers))
    );
  };
  const renderPassiveCards = (cards: UpgradeChoice[]): void => {
    const stacks = stackPassiveCards(cards);
    const signature = `${i18n.getLocale()}|${stacks
      .map((stack) => `${stack.choice.id}:${stack.count}`)
      .join("|")}`;

    if (signature === passiveRailSignature) {
      return;
    }

    passiveRailSignature = signature;
    passiveRail.hidden = stacks.length === 0;
    passiveRail.replaceChildren(
      ...stacks.map((stack) => createPassiveCardStack(stack.choice, stack.count, i18n))
    );
  };
  const setText = (element: HTMLElement, value: string): void => {
    if (element.textContent !== value) {
      element.textContent = value;
    }
  };
  const setClassName = (element: HTMLElement, className: string): void => {
    if (element.className !== className) {
      element.className = className;
    }
  };
  const setHidden = (element: HTMLElement, hidden: boolean): void => {
    if (element.hidden !== hidden) {
      element.hidden = hidden;
    }
  };
  const setCssVariable = (
    element: HTMLElement,
    name: string,
    value: string
  ): void => {
    if (element.style.getPropertyValue(name) !== value) {
      element.style.setProperty(name, value);
    }
  };

  i18n.subscribe(() => {
    actionHandSignature = "";
    passiveRailSignature = "";
    hullMetric.label.textContent = i18n.t("hud.hull");
    dashMetric.label.textContent = i18n.t("hud.dash");
    waveMeta.label.textContent = i18n.t("hud.wave");
    waveDetailMeta.label.textContent = i18n.t("hud.threat");
    scoreMeta.label.textContent = i18n.t("hud.score");
    pbMeta.label.textContent = i18n.t("hud.pb");
    chainMeta.label.textContent = i18n.t("hud.chain");
    uptimeMeta.label.textContent = i18n.t("hud.uptime");
    stateMeta.label.textContent = i18n.t("hud.state");
    renderControls();
  });

  return {
    announce: (message, tone = "system") => {
      const token = ++focusBannerToken;
      focusBanner.hidden = false;
      focusBanner.className = `focus-banner is-${tone}`;
      focusBanner.textContent = message;
      window.setTimeout(() => {
        if (token !== focusBannerToken) {
          return;
        }
        focusBanner.classList.add("is-leaving");
        window.setTimeout(() => {
          if (token !== focusBannerToken) {
            return;
          }
          focusBanner.hidden = true;
          focusBanner.className = "focus-banner";
        }, 240);
      }, 900);
    },
    clearTransientState: () => {
      eventFeed.replaceChildren();
      flash.className = "feedback-flash";
      focusBanner.hidden = true;
      focusBanner.className = "focus-banner";
    },
    notify: (message, tone = "system") => {
      const pill = document.createElement("div");
      pill.className = `event-pill is-${tone}`;
      pill.textContent = message;
      eventFeed.prepend(pill);

      const trimOverflow = (): void => {
        while (eventFeed.childElementCount > 3) {
          eventFeed.lastElementChild?.remove();
        }
      };

      trimOverflow();
      window.setTimeout(() => {
        pill.classList.add("is-leaving");
        window.setTimeout(() => {
          pill.remove();
        }, 220);
      }, 1450);
    },
    pulse: (kind) => {
      const className = `is-${kind}`;
      flash.className = "feedback-flash";
      void flash.offsetWidth;
      flash.classList.add(className);
      window.setTimeout(() => {
        flash.classList.remove(className);
      }, kind === "death" ? 520 : 280);
    },
    setVisible: (visible) => {
      setHidden(root, !visible);
    },
    update: (snapshot) => {
      renderActionCards(snapshot.actionCards ?? []);
      renderPassiveCards(snapshot.passiveCards ?? []);
      setText(hullMetric.value, snapshot.hullLabel);
      setCssVariable(
        hullMetric.fill,
        "--meter-fill",
        `${Math.round(snapshot.hullRatio * 100)}%`
      );
      hullMetric.value.classList.toggle("is-danger", snapshot.hullRatio < 0.35);

      setText(dashMetric.value, snapshot.dashLabel);
      setCssVariable(
        dashMetric.fill,
        "--meter-fill",
        `${Math.round(snapshot.dashRatio * 100)}%`
      );
      dashMetric.value.classList.toggle("is-ready", snapshot.dashRatio >= 0.99);

      setText(waveMeta.value, snapshot.wave);
      setText(waveDetailMeta.value, snapshot.waveDetail);
      setText(scoreMeta.value, snapshot.scoreLabel);
      setText(pbMeta.value, snapshot.pbLabel);
      setClassName(pbMeta.value, `meta-value is-${snapshot.pbTone}`);
      setText(chainMeta.value, snapshot.chainLabel);
      setClassName(
        chainMeta.value,
        snapshot.chainRatio >= 0.98 || snapshot.chainLabel !== "x0"
          ? "meta-value is-system"
          : "meta-value is-neutral"
      );
      setText(uptimeMeta.value, snapshot.uptime);
      setText(stateMeta.value, snapshot.state);
      setClassName(stateMeta.value, `meta-value is-${snapshot.stateTone}`);

      setHidden(bossStrip, !snapshot.bossLabel);
      setText(bossLabel, snapshot.bossLabel ?? "THE ALGORITHM");
      setText(bossMode, snapshot.bossMode ?? "");
      setCssVariable(
        bossMeterFill,
        "--boss-fill",
        `${Math.round((snapshot.bossRatio ?? 0) * 100)}%`
      );

      setHidden(controlsStrip, !snapshot.showControls);
    }
  };
}

function createControlChip(label: string, value: string): HTMLDivElement {
  const chip = document.createElement("div");
  chip.className = "control-chip";

  const title = document.createElement("span");
  title.textContent = label;

  const strong = document.createElement("strong");
  strong.textContent = value;

  chip.append(title, strong);
  return chip;
}

function stackPassiveCards(
  cards: UpgradeChoice[]
): Array<{ choice: UpgradeChoice; count: number }> {
  const stacks = new Map<string, { choice: UpgradeChoice; count: number }>();

  for (const choice of cards) {
    const stack = stacks.get(choice.id);
    if (stack) {
      stack.count += 1;
      continue;
    }

    stacks.set(choice.id, {
      choice,
      count: 1
    });
  }

  return [...stacks.values()];
}

function createPassiveCardStack(
  choice: UpgradeChoice,
  count: number,
  i18n: I18nController
): HTMLDivElement {
  const stack = document.createElement("div");
  stack.className = count > 1 ? "passive-card-stack has-stack" : "passive-card-stack";
  stack.appendChild(
    createBoostCardFace(choice, i18n, {
      count,
      size: "mini"
    })
  );
  return stack;
}

function createActionCardButton(
  card: HeldActionCard,
  i18n: I18nController,
  actionHand: HTMLDivElement,
  handlers?: HudHandlers
): HTMLButtonElement {
  const button = document.createElement("button");
  const text = getBoostCardText(card.id, i18n);
  button.className = `action-card is-${card.id}`;
  button.type = "button";
  button.setAttribute("aria-label", `${text.title}. ${text.description}`);
  button.dataset.cardTitle = text.title;
  button.dataset.cardBody = text.description;
  button.style.setProperty("--card-art", `url("${getActionCardArt(card.id)}")`);

  const art = document.createElement("span");
  art.className = "action-card-art";

  const frame = document.createElement("span");
  frame.className = "action-card-frame";

  button.append(art, frame);

  let isDragging = false;
  let originX = 0;
  let originY = 0;

  const resetDrag = (): void => {
    button.classList.remove("is-dragging");
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
  };

  button.addEventListener("pointerdown", (event) => {
    if (!handlers) {
      return;
    }

    event.preventDefault();
    isDragging = true;
    originX = event.clientX;
    originY = event.clientY;
    button.setPointerCapture(event.pointerId);
    button.classList.add("is-dragging");
  });

  button.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    button.style.setProperty("--drag-x", `${event.clientX - originX}px`);
    button.style.setProperty("--drag-y", `${event.clientY - originY}px`);
  });

  button.addEventListener("pointerup", (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - originX;
    const deltaY = event.clientY - originY;
    const previousPointerEvents = button.style.pointerEvents;
    button.style.pointerEvents = "none";
    const target = document.elementFromPoint(event.clientX, event.clientY);
    button.style.pointerEvents = previousPointerEvents;
    const droppedOnHand = target ? actionHand.contains(target) : false;
    const droppedOnHud = Boolean(
      target?.closest(
        ".hud-cluster, .boss-strip, .event-feed, .controls-strip, .focus-banner"
      )
    );
    const movedEnough = Math.hypot(deltaX, deltaY) > 34;
    const used =
      movedEnough &&
      !droppedOnHand &&
      !droppedOnHud &&
      Boolean(handlers?.onUseActionCard(card.instanceId, event.clientX, event.clientY));

    isDragging = false;
    resetDrag();

    if (used) {
      button.classList.add("is-cast");
      window.setTimeout(() => {
        button.remove();
      }, 180);
    } else {
      button.classList.add("is-returning");
      window.setTimeout(() => {
        button.classList.remove("is-returning");
      }, 180);
    }
  });

  button.addEventListener("pointercancel", () => {
    isDragging = false;
    resetDrag();
  });

  return button;
}

function createMetric(
  parent: HTMLDivElement,
  label: string,
  value: string,
  ratio: number
): {
  fill: HTMLDivElement;
  label: HTMLSpanElement;
  value: HTMLSpanElement;
} {
  const metric = document.createElement("div");
  metric.className = "metric-card";

  const header = document.createElement("div");
  header.className = "metric-head";

  const labelElement = document.createElement("span");
  labelElement.className = "chip-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("span");
  valueElement.className = "metric-value";
  valueElement.textContent = value;

  const meter = document.createElement("div");
  meter.className = "meter";

  const fill = document.createElement("div");
  fill.className = "meter-fill";
  fill.style.setProperty("--meter-fill", `${Math.round(ratio * 100)}%`);

  meter.appendChild(fill);
  header.append(labelElement, valueElement);
  metric.append(header, meter);
  parent.appendChild(metric);

  return {
    fill,
    label: labelElement,
    value: valueElement
  };
}

function createMeta(
  parent: HTMLDivElement,
  label: string,
  value: string
): {
  label: HTMLSpanElement;
  value: HTMLSpanElement;
} {
  const chip = document.createElement("div");
  chip.className = "chip";

  const labelElement = document.createElement("span");
  labelElement.className = "chip-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("span");
  valueElement.className = "meta-value";
  valueElement.textContent = value;

  chip.append(labelElement, valueElement);
  parent.appendChild(chip);

  return {
    label: labelElement,
    value: valueElement
  };
}
