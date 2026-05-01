import { createAudioBus } from "./audio";
import { GAME_CONFIG } from "./config";
import { createInputController } from "./input";
import { createI18n, type I18nController } from "./i18n";
import { FixedStepLoop } from "./loop";
import {
  applyMetaRunModifiersToPlayer,
  depositRunMoney,
  getMetaRunModifiers,
  loadMetaProgression,
  purchaseMetaUpgrade,
  type MetaProgressionState,
  type MetaRunModifiers
} from "./metaProgression";
import { loadRunRecords, recordRunResult } from "./runRecords";
import { GameStateMachine, type GameState } from "./stateMachine";
import { getChannelAvatarIndex, getChannelName } from "../gameplay/channelLore";
import type { FrameEvent } from "../gameplay/events";
import {
  applyDebugBuildPreset,
  applyUpgradeSelection,
  advanceChapterTransition,
  createGameSession,
  forceWaveForDebugSession,
  getFallbackAim,
  getSessionSnapshot,
  grantUpgradeForDebug,
  resetGameSession,
  useActionCard,
  updateGameSession,
  type DebugBuildPresetId
} from "../gameplay/session";
import type { ActionCardId, UpgradeId } from "../gameplay/progression/upgrades";
import {
  ACTION_CARD_IDS,
  getUpgradeChoice,
  isActionCardId,
  rollEliteUpgradeChoices,
  rollUpgradeChoices
} from "../gameplay/progression/upgrades";
import { getBuildProfile } from "../gameplay/progression/builds";
import { getWavePlan, getWaveThemeId } from "../gameplay/waves/waveConfig";
import type { PlayerDamageSourceKind } from "../gameplay/player/player";
import { createGameScene } from "../render/scene";
import { createDebugPanel } from "../ui/debugPanel";
import { createHud } from "../ui/hud";
import { createOverlays } from "../ui/overlays";

type RunLossReason = PlayerDamageSourceKind | "overrun";

interface RunSummary {
  bestCombo: number;
  bestRescueStreak: number;
  channelsDestroyed: number;
  chapter: number;
  elapsedSeconds: number;
  lossReason?: RunLossReason;
  lostRescueCount: number;
  moneyEarned: number;
  rank: "a" | "b" | "c" | "d" | "s";
  rescuedCount: number;
  score: number;
  selectedChoiceIds: UpgradeId[];
  selectedChoices: ReturnType<typeof getSessionSnapshot>["progression"]["selectedChoices"];
  usedActionCards: ActionCardId[];
  waveNumber: number;
}

interface PortalContext {
  fromPortal: boolean;
  params: URLSearchParams;
  previousRef: string | null;
}

type PortalId = "exit" | "return";

interface PortalRuntimeEntry {
  id: PortalId;
  kind: "exit" | "return";
  label: string;
  position: { x: number; y: number };
  radius: number;
}

const PORTAL_EXIT_URL = "https://vibejam.cc/portal/2026";
const PORTAL_EXIT_POSITION = { x: 12.4, y: -9.4 };
const PORTAL_RETURN_POSITION = { x: -4.4, y: 0.6 };
const PORTAL_TRIGGER_RADIUS = 1.7;
const PORTAL_LOADOUT = {
  cards: [
    // Inauthentic Content Scanner / Revenue Redirector / Compliance Drone
    "card-purge",
    "card-overcore",
    "card-repair"
  ],
  name: "Portal Compliance Loadout"
} as const satisfies { cards: readonly ActionCardId[]; name: string };

export function createApp(rootElement: HTMLDivElement): void {
  const portalContext = readPortalContext();
  const bootIntro = rootElement.querySelector(".boot-intro");
  const shell = document.createElement("div");
  shell.className = "app-shell";
  if (bootIntro) {
    shell.style.visibility = "hidden";
  }

  const sceneLayer = document.createElement("div");
  sceneLayer.className = "scene-layer";

  const overlayLayer = document.createElement("div");
  overlayLayer.className = "overlay-layer";

  shell.append(sceneLayer, overlayLayer);
  rootElement.appendChild(shell);

  const stateMachine = new GameStateMachine("boot");
  const audio = createAudioBus();
  const i18n = createI18n();
  const scene = createGameScene(sceneLayer);
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    scene.setReducedMotion(event.matches);
  };
  scene.setReducedMotion(reducedMotionQuery.matches);
  reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  const input = createInputController(sceneLayer);
  let hud: ReturnType<typeof createHud>;
  const session = createGameSession();
  let metaProgression: MetaProgressionState = loadMetaProgression();
  let activeRunModifiers: MetaRunModifiers = getMetaRunModifiers(metaProgression);
  let runRecords = loadRunRecords();
  let announcedWave = 0;
  let actionCardFreezeRemaining = 0;
  let activeDraftMode: "chapter-transition" | "opening-action" | "upgrade" | null = null;
  let draftRerollsRemaining = 0;
  let debugRandomRestore: (() => void) | null = null;
  let hasTriggeredPortal = false;
  let openingActionPicksRemaining = 1;
  let pbAnnouncedThisRun = false;
  let usedActionCards: ActionCardId[] = [];
  let pendingGameOver:
    | {
        summary: RunSummary;
        timeRemaining: number;
      }
    | null = null;
  let pendingVictory:
    | {
        summary: RunSummary;
        timeRemaining: number;
      }
    | null = null;

  const openActionCardDraft = (resetPickCount = true): void => {
    activeDraftMode = "opening-action";
    draftRerollsRemaining = 0;
    if (resetPickCount) {
      openingActionPicksRemaining = activeRunModifiers.openingActionPicks;
    }
    const openingView = getSessionSnapshot(session);
    overlays.setProgression(
      ACTION_CARD_IDS.map((cardId) => getUpgradeChoice(cardId)),
      openingView.progression.selectedChoices,
      0,
      createRunSummary(openingView, [], usedActionCards),
      false,
      "opening-action",
      0,
      openingActionPicksRemaining
    );
    stateMachine.transition("between-waves");
  };

  const resetRunForNewContract = (): void => {
    hud.clearTransientState();
    input.clearTransientState();
    pendingGameOver = null;
    pendingVictory = null;
    announcedWave = 0;
    pbAnnouncedThisRun = false;
    actionCardFreezeRemaining = 0;
    activeDraftMode = null;
    draftRerollsRemaining = 0;
    usedActionCards = [];
    resetGameSession(session);
    activeRunModifiers = getMetaRunModifiers(metaProgression);
    applyMetaRunModifiersToPlayer(session.player, activeRunModifiers);
    openingActionPicksRemaining = activeRunModifiers.openingActionPicks;
  };

  const startPortalRun = (): void => {
    audio.setMusicMode("battle");
    resetRunForNewContract();
    activeDraftMode = null;
    draftRerollsRemaining = 0;
    openingActionPicksRemaining = 0;
    shell.dataset.portalLoadout = PORTAL_LOADOUT.name;
    for (const actionCardId of PORTAL_LOADOUT.cards) {
      applyUpgradeSelection(session, actionCardId);
    }
    input.clearTransientState();
    hud.clearTransientState();
    stateMachine.transition("playing");
  };

  const portalEntries = createPortalEntries(portalContext);

  const triggerPortalRedirect = (target: string): void => {
    if (hasTriggeredPortal) {
      return;
    }

    hasTriggeredPortal = true;
    window.location.assign(target);
  };

  const checkPortalCollision = (
    playerPosition: { x: number; y: number },
    playerHealth: number,
    playerMaxHealth: number,
    playerSpeed: number
  ): void => {
    if (hasTriggeredPortal) {
      return;
    }

    for (const portal of portalEntries) {
      if (!isInsidePortal(playerPosition, portal)) {
        continue;
      }

      if (portal.id === "return") {
        const returnUrl = buildPortalReturnUrl(portalContext);
        if (returnUrl) {
          triggerPortalRedirect(returnUrl);
        }
        return;
      }

      triggerPortalRedirect(
        buildPortalExitUrl(portalContext, {
          health: playerHealth,
          maxHealth: playerMaxHealth,
          speed: playerSpeed
        })
      );
      return;
    }
  };

  hud = createHud(overlayLayer, i18n, {
    onUseActionCard: (instanceId, clientX, clientY) => {
      if (
        stateMachine.value !== "playing" ||
        actionCardFreezeRemaining > 0 ||
        pendingGameOver ||
        pendingVictory
      ) {
        return false;
      }

      if (!scene.screenToGround(clientX, clientY)) {
        return false;
      }

      const result = useActionCard(session, instanceId);
      if (!result.applied) {
        return false;
      }

      scene.emitEffects(result.frameEvents);
      audio.dispatch(result.frameEvents);
      if (result.actionId) {
        usedActionCards.push(result.actionId);
        actionCardFreezeRemaining = getActionCardFreezeSeconds(result.actionId);
        hud.pulse(
          result.actionId === "card-purge"
            ? "damage"
            : result.actionId === "card-overcore"
              ? "upgrade"
              : "pickup"
        );
        hud.announce(getActionCardAnnouncement(result.actionId, i18n), "system");
        hud.notify(getActionCardNotification(result.actionId, i18n), "system");
      }

      return true;
    }
  });

  const startRun = (): void => {
    audio.setMusicMode("battle");
    audio.prime();
    audio.playCue("ui-accept");
    resetRunForNewContract();
    openActionCardDraft();
  };

  const restartRun = (): void => {
    audio.setMusicMode("battle");
    audio.prime();
    audio.playCue("ui-accept");
    resetRunForNewContract();
    openActionCardDraft();
  };

  const skipIntro = (): void => {
    if (stateMachine.value !== "intro") {
      return;
    }

    audio.setMusicMode("menu");
    audio.prime();
    audio.playCue("ui-accept");
    hud.clearTransientState();
    input.clearTransientState();
    stateMachine.transition("title");
  };

  const consumeBootAccepted = (): void => {
    if (portalContext.fromPortal || stateMachine.value !== "intro") {
      return;
    }

    skipIntro();
  };

  window.addEventListener("tope:boot-accepted", consumeBootAccepted);

  const returnToTitle = (): void => {
    audio.setMusicMode("menu");
    audio.prime();
    audio.playCue("ui-accept");
    hud.clearTransientState();
    input.clearTransientState();
    pendingGameOver = null;
    pendingVictory = null;
    activeDraftMode = null;
    draftRerollsRemaining = 0;
    stateMachine.transition("title");
  };

  const buyMetaUpgrade = (
    upgradeId: Parameters<typeof purchaseMetaUpgrade>[1]
  ): void => {
    const result = purchaseMetaUpgrade(metaProgression, upgradeId);
    if (!result.purchased) {
      return;
    }

    metaProgression = result.state;
    activeRunModifiers = getMetaRunModifiers(metaProgression);
    overlays.setMetaProgression(metaProgression);
    audio.playCue("ui-accept");
  };

  const rerollDraft = (): void => {
    if (
      draftRerollsRemaining <= 0 ||
      (activeDraftMode !== "upgrade" && activeDraftMode !== "chapter-transition")
    ) {
      return;
    }

    const view = getSessionSnapshot(session);
    const selectedChoices = view.progression.selectedChoices;
    const choiceCount = Math.max(2, view.progression.availableChoices.length);
    draftRerollsRemaining -= 1;

    if (activeDraftMode === "chapter-transition") {
      const rescueCacheActive =
        view.rescuedCount >= GAME_CONFIG.chapterRescueBonusThreshold;
      session.pendingUpgradeChoices = rollEliteUpgradeChoices(
        selectedChoices,
        choiceCount,
        rescueCacheActive ? ["signal-choir"] : []
      );
      overlays.setChapterTransition(
        view.wave.chapter,
        session.pendingUpgradeChoices,
        selectedChoices,
        rescueCacheActive,
        draftRerollsRemaining
      );
    } else {
      const rescueBonusUnlocked = choiceCount > 3;
      session.pendingUpgradeChoices = rollUpgradeChoices(
        selectedChoices,
        choiceCount
      );
      overlays.setProgression(
        session.pendingUpgradeChoices,
        selectedChoices,
        view.wave.currentWave,
        createRunSummary(view, [], usedActionCards),
        rescueBonusUnlocked,
        "upgrade",
        draftRerollsRemaining
      );
    }

    audio.playCue("ui-accept");
  };

  const overlays = createOverlays(
    overlayLayer,
    {
      onPurchaseMetaUpgrade: buyMetaUpgrade,
      onReturnToTitle: returnToTitle,
      onRerollDraft: rerollDraft,
      onSkipIntro: skipIntro,
      onStart: startRun,
      onRestart: restartRun,
      onContinueChapter: () => {
        audio.setMusicMode("battle");
        audio.prime();
        audio.playCue("ui-accept");
        hud.clearTransientState();
        input.clearTransientState();
        advanceChapterTransition(session);
        activeDraftMode = null;
        draftRerollsRemaining = 0;
        stateMachine.transition("playing");
      },
      onSelectUpgrade: (upgradeId) => {
        audio.setMusicMode("battle");
        audio.prime();
        audio.playCue("ui-accept");
        hud.clearTransientState();
        applyUpgradeSelection(session, upgradeId);
        input.clearTransientState();
        if (activeDraftMode === "opening-action") {
          openingActionPicksRemaining = Math.max(
            0,
            openingActionPicksRemaining - 1
          );
          if (openingActionPicksRemaining > 0) {
            openActionCardDraft(false);
            return;
          }
        }
        activeDraftMode = null;
        draftRerollsRemaining = 0;
        stateMachine.transition("playing");
      }
    },
    i18n,
    metaProgression
  );
  overlays.setRecords(runRecords);
  overlays.setMetaProgression(metaProgression);

  const finalizeRunResult = (summary: RunSummary, didWin: boolean): void => {
    metaProgression = depositRunMoney(metaProgression, summary.moneyEarned);
    overlays.setMetaProgression(metaProgression);

    const recordUpdate = recordRunResult(summary, didWin, runRecords);
    runRecords = recordUpdate.records;
    overlays.setRecords(runRecords);
    overlays.setRunSummary(summary, recordUpdate.highlights);

    if (hasRecordHighlight(recordUpdate.highlights)) {
      audio.playCue("record-best");
      hud.announce(i18n.t("announce.recordBest"), "system");
      hud.notify(i18n.t("notify.recordBest"), "system");
    }
  };

  const enterDebugPlaytest = (message: string): void => {
    hud.clearTransientState();
    input.clearTransientState();
    pendingGameOver = null;
    pendingVictory = null;
    announcedWave = 0;
    pbAnnouncedThisRun = false;
    actionCardFreezeRemaining = 0;
    usedActionCards = [];
    if (stateMachine.value !== "playing") {
      stateMachine.transition("playing");
    }
    hud.announce(message, "system");
    hud.notify(message, "system");
  };

  const setDebugSeed = (seed: string): void => {
    debugRandomRestore?.();
    const originalRandom = Math.random;
    Math.random = createSeededRandom(seed);
    debugRandomRestore = () => {
      Math.random = originalRandom;
    };
  };

  const useLiveRandom = (): void => {
    debugRandomRestore?.();
    debugRandomRestore = null;
  };

  const applyDebugPreset = (presetId: DebugBuildPresetId): void => {
    const preset = applyDebugBuildPreset(session, presetId);
    enterDebugPlaytest(`DEV ${preset.label.toUpperCase()} // W${preset.waveNumber}`);
  };

  const grantDebugUpgrade = (upgradeId: UpgradeId, count: number): void => {
    const wasPlaying = stateMachine.value === "playing";
    const waveNumber = Math.max(1, getSessionSnapshot(session).wave.currentWave);
    grantUpgradeForDebug(session, upgradeId, count);
    if (!wasPlaying) {
      forceWaveForDebugSession(session, waveNumber);
    }
    enterDebugPlaytest(`DEV GRANT ${upgradeId.toUpperCase()}`);
  };

  const forceDebugWave = (waveNumber: number): void => {
    forceWaveForDebugSession(session, waveNumber);
    enterDebugPlaytest(`DEV WAVE ${waveNumber}`);
  };

  const forceDebugGameOver = (): void => {
    enterDebugPlaytest("DEV FORCED TERMINATION");
    const view = getSessionSnapshot(session);
    const frameEvents: FrameEvent[] = [
      {
        position: { ...view.player.position },
        type: "player-died"
      }
    ];
    const summary = createRunSummary(
      view,
      frameEvents,
      usedActionCards
    );
    scene.setPlayerPose(view.player.position, view.player.facing);
    scene.emitEffects(frameEvents);
    audio.dispatch(frameEvents);
    applyFrameFeedback(hud, frameEvents, i18n);
    input.clearTransientState();
    pendingGameOver = {
      summary,
      timeRemaining: GAME_CONFIG.playerDeathHoldSeconds
    };
  };

  const forceDebugVictory = (): void => {
    enterDebugPlaytest("DEV FORCED RESTORATION");
    const view = getSessionSnapshot(session);
    const summary = createRunSummary(view, [], usedActionCards);
    finalizeRunResult(summary, true);
    input.clearTransientState();
    activeDraftMode = null;
    draftRerollsRemaining = 0;
    stateMachine.transition("victory");
  };

  const previewEnemyDeathEffects = (): void => {
    enterDebugPlaytest("DEV ENEMY DEATH FX");
    const view = getSessionSnapshot(session);
    const origin = view.player.position;
    const withChannel = (seed: number): Pick<FrameEvent, "channelAvatarIndex" | "channelName"> => ({
      channelAvatarIndex: getChannelAvatarIndex(seed),
      channelName: getChannelName(seed)
    });
    const frameEvents: FrameEvent[] = [
      {
        ...withChannel(1001),
        enemyArchetype: "drone",
        position: { x: origin.x - 4.4, y: origin.y - 2.2 },
        type: "enemy-killed"
      },
      {
        ...withChannel(1002),
        enemyArchetype: "charger",
        position: { x: origin.x - 2.4, y: origin.y + 2.4 },
        type: "enemy-killed"
      },
      {
        ...withChannel(1003),
        enemyArchetype: "sentry",
        position: { x: origin.x, y: origin.y - 3.8 },
        type: "enemy-killed"
      },
      {
        ...withChannel(1004),
        enemyArchetype: "artillery",
        isElite: true,
        position: { x: origin.x + 2.6, y: origin.y + 2.4 },
        type: "enemy-killed"
      },
      {
        ...withChannel(1005),
        enemyArchetype: "relay",
        position: { x: origin.x + 4.6, y: origin.y - 1.7 },
        type: "enemy-killed"
      },
      {
        position: { x: origin.x, y: origin.y + 4.4 },
        type: "boss-defeated"
      }
    ];

    scene.emitEffects(frameEvents);
    audio.dispatch(frameEvents);
    applyFrameFeedback(hud, frameEvents, i18n);
  };

  const debugPanel = import.meta.env.DEV
    ? createDebugPanel(overlayLayer, {
        onApplyPreset: applyDebugPreset,
        onForceGameOver: forceDebugGameOver,
        onForceWave: forceDebugWave,
        onForceVictory: forceDebugVictory,
        onPreviewEnemyDeaths: previewEnemyDeathEffects,
        onGrantUpgrade: grantDebugUpgrade,
        onSetSeed: setDebugSeed,
        onUseLiveRandom: useLiveRandom
      })
    : null;

  const syncUi = (state: GameState): void => {
    audio.setMusicMode(
      state === "playing" || state === "between-waves" || state === "chapter-transition"
        ? "battle"
        : "menu"
    );
    overlays.setState(state);
    hud.setVisible(state === "playing" || state === "between-waves");
    input.setTouchControlsVisible(state === "playing");

    if (state !== "playing") {
      scene.setArtilleryStrikes([]);
      scene.setSpawnWarnings([]);
      scene.setArenaPurgeLanes([]);
      scene.setBossPulses([]);
    }

    if (state === "title") {
      hud.update({
        actionCards: [],
        bossLabel: undefined,
        bossMode: undefined,
        bossRatio: 0,
        chainLabel: "x0",
        chainRatio: 0,
        dashLabel: i18n.t("hud.ready"),
        dashRatio: 1,
        hullLabel: "100%",
        hullRatio: 1,
        levelLabel: i18n.t("hud.level"),
        levelRatio: 0,
        levelValue: "0%",
        pbLabel: getPersonalBestChaseLabel(0, runRecords.bestScore, i18n),
        pbTone: "neutral",
        passiveCards: [],
        scoreLabel: "0000",
        showControls: true,
        showLevelProgress: false,
        state: i18n.t("hud.standBy"),
        stateTone: "neutral",
        uptime: "00.0s",
        wave: "--",
        waveDetail: getWaveThreatLabel(1, i18n)
      });
    }
  };

  stateMachine.subscribe((state) => {
    syncUi(state);
  });
  i18n.subscribe(() => {
    syncUi(stateMachine.value);
  });

  const loop = new FixedStepLoop(
    GAME_CONFIG.fixedStepSeconds,
    (deltaSeconds) => {
      if (stateMachine.value !== "playing") {
        return;
      }

      if (pendingGameOver) {
        pendingGameOver.timeRemaining = Math.max(
          0,
          pendingGameOver.timeRemaining - deltaSeconds
        );

        if (pendingGameOver.timeRemaining <= 0) {
          finalizeRunResult(pendingGameOver.summary, false);
          pendingGameOver = null;
          input.clearTransientState();
          activeDraftMode = null;
          draftRerollsRemaining = 0;
          stateMachine.transition("game-over");
        }
        return;
      }

      if (pendingVictory) {
        pendingVictory.timeRemaining = Math.max(
          0,
          pendingVictory.timeRemaining - deltaSeconds
        );

        if (pendingVictory.timeRemaining <= 0) {
          finalizeRunResult(pendingVictory.summary, true);
          pendingVictory = null;
          input.clearTransientState();
          activeDraftMode = null;
          draftRerollsRemaining = 0;
          stateMachine.transition("victory");
        }
        return;
      }

      if (actionCardFreezeRemaining > 0) {
        actionCardFreezeRemaining = Math.max(
          0,
          actionCardFreezeRemaining - deltaSeconds
        );
        return;
      }

      const fallbackAim = getFallbackAim(
        session.player.position,
        session.player.facing
      );
      const snapshot = input.createSnapshot(
        scene.screenToGround,
        fallbackAim,
        session.player.position
      );
      const result = updateGameSession(session, snapshot, deltaSeconds);
      const view = getSessionSnapshot(session);
      checkPortalCollision(
        view.player.position,
        view.player.health,
        view.player.maxHealth,
        view.player.moveSpeed
      );
      const isOverrun =
        view.player.health <= 25 && view.wave.enemiesRemaining >= 5;
      const bossCoreExposed = view.boss?.mode === "exposed";
      const relaySupportActive = view.enemies.some(
        (enemy) =>
          enemy.supported ||
          (enemy.archetype === "relay" && enemy.supportPulseRatio > 0.1)
      );
      const artilleryPhase = view.artilleryPhase;
      const bossPulsePhase = view.bossPulses.some((pulse) => pulse.phase === "active")
        ? "active"
        : view.bossPulses.length > 0
          ? "warning"
          : "idle";
      const stateTone =
        bossCoreExposed
          ? "system"
          : view.dangerLevel > 0 ||
              relaySupportActive ||
              isOverrun ||
              view.arenaPurgePhase !== "idle" ||
              bossPulsePhase !== "idle"
          ? "danger"
          : "system";
      const waveThreatLabel = getWaveThreatLabel(view.wave.currentWave, i18n);
      const buildProfile = getBuildProfile(view.progression.selectedChoices);
      const upgradeProgressRatio = getUpgradeProgressRatio(
        view.wave.currentWave,
        view.wave.enemiesRemaining,
        view.wave.phase
      );

      if (
        !pbAnnouncedThisRun &&
        runRecords.bestScore > 0 &&
        view.score > runRecords.bestScore
      ) {
        pbAnnouncedThisRun = true;
        audio.playCue("record-best");
        hud.announce(i18n.t("announce.recordBest"), "system");
        hud.notify(i18n.t("notify.recordBest"), "system");
      }

      if (view.wave.currentWave > 0 && view.wave.currentWave !== announcedWave) {
        announcedWave = view.wave.currentWave;
        hud.announce(
          i18n.t("announce.waveStart", {
            threat: waveThreatLabel,
            wave: view.wave.currentWave
          }),
          view.wave.currentWave >= GAME_CONFIG.chapterTransitionWave
            ? "danger"
            : "system"
        );
        hud.notify(
          i18n.t("notify.waveStart", {
            threat: waveThreatLabel,
            wave: view.wave.currentWave
          }),
          "system"
        );
      }

      scene.setAimPoint(snapshot.aim);
      scene.setArenaChapter(view.wave.chapter);
      scene.setArenaDangerLevel(view.dangerLevel);
      scene.setArtilleryStrikes(view.artilleryStrikes);
      scene.setArenaPurgeLanes(view.arenaPurgeLanes);
      scene.setBossPulses(view.bossPulses);
      scene.setEnemies(view.enemies);
      scene.emitEffects(result.frameEvents);
      scene.setPickups([
        ...view.orbs.map((position) => ({ kind: "orb" as const, position })),
        ...view.moneyPickups.map((pickup) => ({
          amount: pickup.amount,
          kind: "money" as const,
          position: pickup.position
        })),
        ...view.rescues.map((rescue) => ({
          boosted: buildProfile.signature === "signal-choir",
          kind: "rescue" as const,
          position: rescue.position,
          progress: rescue.progress
        }))
      ]);
      scene.setPlayerPose(view.player.position, view.player.facing);
      scene.setPlayerVisuals({
        buildPrimary: buildProfile.primary,
        damageFlash: view.player.damageFlash,
        dashReady:
          1 -
          Math.min(
            1,
            view.player.dashCooldownRemaining / view.player.dashCooldown
          ),
        healthRatio: view.player.health / view.player.maxHealth,
        haloDroneCount: view.player.haloDroneCount,
        invulnerability:
          view.player.damageInvulnerabilityRemaining /
          GAME_CONFIG.player.damageInvulnerability,
        isDashing: view.player.dashTimer > 0,
        legendaryCount: buildProfile.legendaryCount,
        masteryTier: buildProfile.masteryTier,
        satelliteLatticeCount: view.player.satelliteLatticeCount,
        shotPulse: view.player.shotPulse,
        signature: buildProfile.signature
      });
      scene.setProjectiles(view.activeProjectiles);
      scene.setSpawnWarnings(view.spawnWarnings);
      audio.dispatch(result.frameEvents);
      applyFrameFeedback(hud, result.frameEvents, i18n);

      hud.update({
        actionCards: view.actionCards,
        bossLabel: view.boss?.title,
        bossMode: view.boss ? getBossModeLabel(view.boss.mode, i18n) : undefined,
        bossRatio: view.boss?.healthRatio ?? 0,
        chainLabel: `x${view.comboCount}`,
        chainRatio: view.comboRatio,
        dashLabel:
          view.player.dashCooldownRemaining <= 0
            ? i18n.t("hud.ready")
            : `${view.player.dashCooldownRemaining.toFixed(1)}s`,
        dashRatio:
          1 -
          Math.min(
            1,
            view.player.dashCooldownRemaining / view.player.dashCooldown
          ),
        hullLabel: `${Math.ceil(view.player.health)}%`,
        hullRatio: view.player.health / view.player.maxHealth,
        levelLabel: i18n.t("hud.level"),
        levelRatio: upgradeProgressRatio,
        levelValue: `${Math.round(upgradeProgressRatio * 100)}%`,
        pbLabel: getPersonalBestChaseLabel(view.score, runRecords.bestScore, i18n),
        pbTone:
          runRecords.bestScore > 0 && view.score > runRecords.bestScore
            ? "system"
            : "neutral",
        passiveCards: view.progression.selectedChoices.filter(
          (choice) => !isActionCardId(choice.id)
        ),
        scoreLabel: `${view.score}`,
        showControls:
          view.elapsedSeconds < 18 ||
          view.wave.currentWave === 1 ||
          view.wave.phase === "paused",
        showLevelProgress:
          view.wave.currentWave > 0 && view.wave.phase !== "paused",
        state:
          bossCoreExposed
            ? i18n.t("state.exposedCore")
            : bossPulsePhase === "active"
              ? i18n.t("state.phasePulse")
            : bossPulsePhase === "warning"
              ? i18n.t("state.phasePulseWarning")
            : artilleryPhase === "active"
              ? i18n.t("state.artilleryImpact")
            : artilleryPhase === "warning"
              ? i18n.t("state.artilleryLock")
            : view.arenaPurgePhase === "active"
              ? i18n.t("state.gridPurge")
              : view.arenaPurgePhase === "warning"
                ? i18n.t("state.purgeWarning")
                : relaySupportActive
                  ? i18n.t("state.relayBoost")
                : view.dangerLevel > 0
                  ? i18n.t("state.edgeBurn")
                : isOverrun
                  ? i18n.t("state.overrun")
                  : `${getWavePhaseLabel(
                      view.wave.phase,
                      view.wave.currentWave,
                      view.wave.enemiesRemaining,
                      i18n
                    )} ${view.wave.enemiesRemaining}`,
        stateTone,
        uptime: `${view.elapsedSeconds.toFixed(1)}s`,
        wave: `C${view.wave.chapter}-${i18n.getLocale() === "es" ? "O" : "W"}${view.wave.currentWave}`,
        waveDetail: waveThreatLabel
      });

      if (result.playerDied) {
        const summary = createRunSummary(view, result.frameEvents, usedActionCards);
        input.clearTransientState();
        actionCardFreezeRemaining = 0;
        pendingGameOver = {
          summary,
          timeRemaining: GAME_CONFIG.playerDeathHoldSeconds
        };
      } else if (result.chapterTransitionReady) {
        audio.playCue("legendary-ready");
        hud.announce(i18n.t("announce.legendaryReady"), "system");
        hud.notify(i18n.t("notify.legendaryReady"), "system");
        overlays.setChapterTransition(
          view.wave.chapter,
          view.progression.availableChoices,
          view.progression.selectedChoices,
          view.progression.availableChoices.length >
            2,
          activeRunModifiers.draftRerolls
        );
        activeDraftMode = "chapter-transition";
        draftRerollsRemaining = activeRunModifiers.draftRerolls;
        input.clearTransientState();
        stateMachine.transition("chapter-transition");
      } else if (result.betweenWavesReady) {
        activeDraftMode = "upgrade";
        draftRerollsRemaining = activeRunModifiers.draftRerolls;
        overlays.setProgression(
          view.progression.availableChoices,
          view.progression.selectedChoices,
          view.wave.currentWave,
          createRunSummary(view, [], usedActionCards),
          view.progression.availableChoices.length >
            3,
          "upgrade",
          draftRerollsRemaining
        );
        input.clearTransientState();
        stateMachine.transition("between-waves");
      } else if (result.victoryAchieved) {
        const hasBossCollapse = result.frameEvents.some(
          (event) => event.type === "boss-collapse-start"
        );
        pendingVictory = {
          summary: createRunSummary(view, [], usedActionCards),
          timeRemaining: hasBossCollapse
            ? GAME_CONFIG.bossCollapseHoldSeconds
            : GAME_CONFIG.victoryHoldSeconds,
        };
      }
    },
    (deltaSeconds) => {
      scene.render(deltaSeconds);
    },
    GAME_CONFIG.maxFixedStepsPerFrame
  );

  window.addEventListener("resize", scene.resize);
  window.visualViewport?.addEventListener("resize", scene.resize);
  loop.start();

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }

    if (
      stateMachine.value === "intro" &&
      (event.code === "Enter" ||
        event.code === "Space" ||
        event.code === "Escape")
    ) {
      event.preventDefault();
      skipIntro();
      return;
    }

    if (event.code === "Enter" && stateMachine.value === "title") {
      event.preventDefault();
      startRun();
      return;
    }

    if (event.code === "Enter" && stateMachine.value === "chapter-transition") {
      if (session.pendingUpgradeChoices.length > 0) {
        return;
      }
      event.preventDefault();
      audio.prime();
      audio.playCue("ui-accept");
      hud.clearTransientState();
      input.clearTransientState();
      advanceChapterTransition(session);
      stateMachine.transition("playing");
      return;
    }

    if (
      event.code === "KeyR" &&
      (stateMachine.value === "game-over" || stateMachine.value === "victory")
    ) {
      event.preventDefault();
      restartRun();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  const titleView = getSessionSnapshot(session);
  scene.setAimPoint(titleView.player.aim);
  scene.setArenaChapter(titleView.wave.chapter);
  scene.setArenaDangerLevel(0);
  scene.setArenaPurgeLanes([]);
  scene.setBossPulses([]);
  scene.setEnemies(titleView.enemies);
  scene.setPickups([
    ...titleView.orbs.map((position) => ({ kind: "orb" as const, position })),
    ...titleView.moneyPickups.map((pickup) => ({
      amount: pickup.amount,
      kind: "money" as const,
      position: pickup.position
    })),
    ...titleView.rescues.map((rescue) => ({
      boosted: false,
      kind: "rescue" as const,
      position: rescue.position,
      progress: rescue.progress
    }))
  ]);
  scene.setPlayerPose(titleView.player.position, titleView.player.facing);
  scene.setPlayerVisuals({
    buildPrimary: "balanced",
    damageFlash: 0,
    dashReady: 1,
    healthRatio: 1,
    haloDroneCount: 0,
    invulnerability: 0,
    isDashing: false,
    legendaryCount: 0,
    masteryTier: 0,
    satelliteLatticeCount: 0,
    shotPulse: 0,
    signature: null
  });
  scene.setProjectiles([]);
  scene.setSpawnWarnings([]);
  scene.setPortals(portalEntries);

  if (portalContext.fromPortal) {
    startPortalRun();
  } else {
    stateMachine.transition("intro");
    if (document.documentElement.dataset.bootAccepted === "true") {
      consumeBootAccepted();
    }
  }
  if (bootIntro) {
    shell.style.visibility = "";
    rootElement.replaceChildren(shell);
  }

  window.addEventListener("beforeunload", () => {
    input.dispose();
    debugPanel?.dispose();
    useLiveRandom();
    reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    window.removeEventListener("tope:boot-accepted", consumeBootAccepted);
    scene.dispose();
    loop.stop();
    window.removeEventListener("keydown", handleKeyDown);
    window.visualViewport?.removeEventListener("resize", scene.resize);
  });
}

function readPortalContext(): PortalContext {
  const params = new URLSearchParams(window.location.search);

  return {
    fromPortal: params.get("portal") === "true",
    params,
    previousRef: params.get("ref")
  };
}

function createPortalEntries(context: PortalContext): PortalRuntimeEntry[] {
  return [
    ...(context.fromPortal
      ? [
          {
            id: "return" as const,
            kind: "return" as const,
            label: "RETURN PORTAL",
            position: PORTAL_RETURN_POSITION,
            radius: PORTAL_TRIGGER_RADIUS
          }
        ]
      : []),
    {
      id: "exit",
      kind: "exit",
      label: "THEIRTUBE TRANSFER NODE",
      position: PORTAL_EXIT_POSITION,
      radius: PORTAL_TRIGGER_RADIUS
    }
  ];
}

function isInsidePortal(
  playerPosition: { x: number; y: number },
  portal: PortalRuntimeEntry
): boolean {
  const deltaX = playerPosition.x - portal.position.x;
  const deltaY = playerPosition.y - portal.position.y;

  return deltaX * deltaX + deltaY * deltaY < portal.radius * portal.radius;
}

function getCurrentGameRef(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function buildPortalExitUrl(
  context: PortalContext,
  player: { health: number; maxHealth: number; speed: number }
): string {
  const destination = new URL(PORTAL_EXIT_URL);
  const params = new URLSearchParams(context.params);
  const username = getPortalParam(params, "username", "TOPE");
  const color = getPortalParam(params, "color", "cyan");
  const healthPercent = Math.max(
    1,
    Math.min(100, Math.round((player.health / Math.max(1, player.maxHealth)) * 100))
  );

  params.set("portal", "true");
  params.set("ref", getCurrentGameRef());
  params.set("username", username);
  params.set("color", color);
  params.set("speed", formatPortalNumber(player.speed || 5));
  params.set("hp", `${healthPercent}`);
  destination.search = params.toString();

  return destination.toString();
}

function buildPortalReturnUrl(context: PortalContext): string | null {
  if (!context.previousRef) {
    return null;
  }

  const destination = parseExternalUrl(context.previousRef);
  if (!destination) {
    return null;
  }

  const params = new URLSearchParams(context.params);
  params.set("ref", getCurrentGameRef());
  applyForwardedParams(destination, params);

  return destination.toString();
}

function parseExternalUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function applyForwardedParams(
  destination: URL,
  params: URLSearchParams
): void {
  for (const key of new Set(params.keys())) {
    destination.searchParams.delete(key);
  }

  for (const [key, value] of params) {
    destination.searchParams.append(key, value);
  }
}

function getPortalParam(
  params: URLSearchParams,
  key: string,
  fallback: string
): string {
  const value = params.get(key)?.trim();

  return value && value.length > 0 ? value : fallback;
}

function formatPortalNumber(value: number): string {
  return `${Math.round(value * 100) / 100}`;
}

function createSeededRandom(seed: string): () => number {
  let state = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function getPersonalBestChaseLabel(
  score: number,
  bestScore: number,
  i18n: I18nController
): string {
  if (bestScore <= 0) {
    return i18n.t("hud.pbSet");
  }

  const delta = score - bestScore;

  if (delta >= 0) {
    return i18n.t("hud.pbAhead", { score: delta });
  }

  return i18n.t("hud.pbBehind", { score: Math.abs(delta) });
}

function createRunSummary(
  view: ReturnType<typeof getSessionSnapshot>,
  frameEvents: FrameEvent[] = [],
  usedActionCards: ActionCardId[] = []
): RunSummary {
  return {
    bestCombo: view.bestCombo,
    bestRescueStreak: view.bestRescueStreak,
    channelsDestroyed: view.channelsDestroyed,
    chapter: view.wave.chapter,
    elapsedSeconds: view.elapsedSeconds,
    lossReason: getRunLossReason(view, frameEvents),
    lostRescueCount: view.lostRescueCount,
    moneyEarned: view.moneyEarned,
    rank: getRunRank(view),
    rescuedCount: view.rescuedCount,
    score: view.score,
    selectedChoiceIds: view.progression.selectedChoices.map((choice) => choice.id),
    selectedChoices: view.progression.selectedChoices,
    usedActionCards: [...usedActionCards],
    waveNumber: view.wave.currentWave
  };
}

function getUpgradeProgressRatio(
  waveNumber: number,
  enemiesRemaining: number,
  phase: ReturnType<typeof getSessionSnapshot>["wave"]["phase"]
): number {
  if (waveNumber <= 0) {
    return 0;
  }

  if (phase === "paused" || phase === "complete") {
    return 1;
  }

  const totalEnemies = getWaveEnemyCount(waveNumber);
  if (totalEnemies <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, 1 - enemiesRemaining / totalEnemies));
}

function getWaveEnemyCount(waveNumber: number): number {
  return getWavePlan(Math.max(1, waveNumber)).bursts.reduce(
    (total, burst) =>
      total +
      burst.artilleryCount +
      burst.bossCount +
      burst.chargerCount +
      burst.droneCount +
      (burst.relayCount ?? 0) +
      burst.sentryCount,
    0
  );
}

function getRunRank(
  view: ReturnType<typeof getSessionSnapshot>
): "a" | "b" | "c" | "d" | "s" {
  const rankScore =
    view.score +
    view.bestCombo * 180 +
    view.wave.currentWave * 120 +
    (view.wave.chapter - 1) * 240 -
    Math.round(view.elapsedSeconds * 6);

  if (view.wave.currentWave >= GAME_CONFIG.finalWave && rankScore >= 3200) {
    return "s";
  }

  if (rankScore >= 2300) {
    return "a";
  }

  if (rankScore >= 1500) {
    return "b";
  }

  if (rankScore >= 850) {
    return "c";
  }

  return "d";
}

function getRunLossReason(
  view: ReturnType<typeof getSessionSnapshot>,
  frameEvents: FrameEvent[]
): RunLossReason | undefined {
  if (!frameEvents.some((event) => event.type === "player-died")) {
    return undefined;
  }

  if (view.player.lastDamageSource) {
    return view.player.lastDamageSource.kind;
  }

  for (let index = frameEvents.length - 1; index >= 0; index -= 1) {
    const event = frameEvents[index];

    if (event.type === "artillery-impact") {
      return "artillery";
    }

    if (event.type === "elite-burst") {
      return "elite-burst";
    }

    if (event.type === "arena-boundary-hit") {
      return "edge";
    }

    if (event.type === "enemy-fired") {
      if (event.traceKind === "overseer") {
        return "boss-beam";
      }

      if (event.traceKind === "sentry") {
        return "sentry";
      }
    }
  }

  if (view.bossPulses.some((pulse) => pulse.phase === "active")) {
    return "boss-pulse";
  }

  if (view.arenaPurgePhase === "active") {
    return "purge";
  }

  if (view.artilleryPhase === "active") {
    return "artillery";
  }

  if (
    Math.hypot(view.player.position.x, view.player.position.y) >
    GAME_CONFIG.arenaDangerRadius
  ) {
    return "edge";
  }

  let nearestEnemy:
    | ReturnType<typeof getSessionSnapshot>["enemies"][number]
    | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const enemy of view.enemies) {
    const distanceSquared =
      (enemy.position.x - view.player.position.x) ** 2 +
      (enemy.position.y - view.player.position.y) ** 2;

    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      nearestEnemy = enemy;
    }
  }

  if (nearestEnemy) {
    const contactRadius = nearestEnemy.radius + view.player.radius + 1.35;

    if (nearestDistanceSquared <= contactRadius * contactRadius) {
      return nearestEnemy.archetype === "overseer"
        ? "overseer"
        : nearestEnemy.archetype;
    }
  }

  if (view.boss?.mode === "fire") {
    return "boss-beam";
  }

  if (view.boss?.mode === "dash") {
    return "overseer";
  }

  return "overrun";
}

function applyFrameFeedback(
  hud: ReturnType<typeof createHud>,
  events: FrameEvent[],
  i18n: I18nController
): void {
  if (events.length === 0) {
    return;
  }

  let pickupHeal = 0;
  let moneyCollected = 0;

  for (const event of events) {
      switch (event.type) {
        case "artillery-lock-start":
          hud.announce(i18n.t("announce.artilleryLock"), "danger");
          hud.notify(i18n.t("notify.artilleryLock"), "danger");
          break;
        case "artillery-impact":
          hud.pulse("damage");
          hud.notify(i18n.t("notify.artilleryImpact"), "danger");
          break;
        case "relay-boost-start":
          hud.announce(i18n.t("announce.relayBoost"), "danger");
          hud.notify(i18n.t("notify.relayBoost"), "danger");
          break;
        case "boss-spawned":
          hud.announce(i18n.t("announce.bossSpawned"), "danger");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.bossSpawned"), "danger");
        break;
      case "boss-collapse-start":
        hud.announce(i18n.t("announce.bossCollapse"), "danger");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.bossCollapse"), "danger");
        break;
      case "boss-core-exposed":
        hud.announce(i18n.t("announce.bossCoreExposed"), "system");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.bossCoreExposed"), "system");
        break;
      case "boss-phase-shift":
        hud.announce(i18n.t("announce.bossShift"), "danger");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.bossShift"), "danger");
        break;
      case "boss-phase-pulse-start":
        hud.announce(i18n.t("announce.bossPulse"), "danger");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.bossPulse"), "danger");
        break;
      case "boss-defeated":
        hud.announce(i18n.t("announce.bossDefeated"), "system");
        hud.pulse("pickup");
        hud.notify(i18n.t("notify.bossDefeated"), "system");
        break;
      case "combo-surge":
        hud.announce(
          i18n.t("announce.comboSurge", { count: event.amount ?? 0 }),
          "system"
        );
        hud.notify(
          i18n.t("notify.comboSurge", { count: event.amount ?? 0 }),
          "system"
        );
        break;
      case "elite-spawned":
        hud.announce(i18n.t("announce.eliteSpawned"), "danger");
        hud.notify(i18n.t("notify.eliteSpawned"), "danger");
        break;
      case "elite-killed":
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.eliteKilled"), "system");
        break;
      case "elite-burst":
        hud.announce(i18n.t("announce.eliteBurst"), "danger");
        hud.pulse("damage");
        hud.notify(i18n.t("notify.eliteBurst"), "danger");
        break;
      case "enemy-killed":
        hud.notify(
          i18n.t("notify.enemyKilled", {
            channel: event.channelName ?? i18n.t("channel.unknown")
          }),
          "danger"
        );
        break;
      case "arena-purge-start":
        hud.announce(i18n.t("announce.gridPurge"), "danger");
        hud.notify(i18n.t("notify.gridPurge"), "danger");
        break;
      case "orb-collected":
        pickupHeal += event.amount ?? 0;
        break;
      case "money-collected":
        moneyCollected += event.amount ?? 0;
        break;
      case "rescue-saved":
        hud.pulse("pickup");
        hud.notify(
          i18n.t("notify.rescueSaved", { amount: event.amount ?? 0 }),
          "system"
        );
        break;
      case "rescue-spawned":
        hud.announce(i18n.t("announce.rescueSpawned"), "system");
        hud.notify(i18n.t("notify.rescueSpawned"), "system");
        break;
      case "rescue-streak":
        hud.announce(
          i18n.t("announce.rescueStreak", { count: event.amount ?? 0 }),
          "system"
        );
        hud.notify(
          i18n.t("notify.rescueStreak", { count: event.amount ?? 0 }),
          "system"
        );
        break;
      case "rescue-lost":
        hud.notify(i18n.t("notify.rescueLost"), "danger");
        break;
      case "player-hit":
        hud.pulse("damage");
        break;
      case "player-died":
        hud.pulse("death");
        hud.notify(i18n.t("notify.playerDied"), "danger");
        break;
      case "upgrade-ready":
        hud.announce(i18n.t("announce.upgradeReady"), "system");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.upgradeReady"), "system");
        break;
      case "victory":
        hud.announce(i18n.t("announce.victory"), "system");
        hud.pulse("upgrade");
        hud.notify(i18n.t("notify.victory"), "system");
        break;
    }
  }

  if (pickupHeal > 0) {
    hud.pulse("pickup");
    hud.notify(i18n.t("notify.pickupHeal", { amount: pickupHeal }), "pickup");
  }

  if (moneyCollected > 0) {
    hud.pulse("pickup");
    hud.notify(i18n.t("notify.moneyCollected", { amount: moneyCollected }), "pickup");
  }
}

function getBossModeLabel(
  mode: "aim" | "chase" | "dash" | "exposed" | "fire" | "recover" | "windup",
  i18n: I18nController
): string {
  switch (mode) {
    case "windup":
    case "aim":
      return i18n.t("boss.mode.charging");
    case "dash":
      return i18n.t("boss.mode.rush");
    case "exposed":
      return i18n.t("boss.mode.exposed");
    case "fire":
      return i18n.t("boss.mode.purge");
    case "recover":
      return i18n.t("boss.mode.cooldown");
    default:
      return i18n.t("boss.mode.tracking");
  }
}

function getActionCardAnnouncement(
  actionId: ActionCardId,
  i18n: I18nController
): string {
  switch (actionId) {
    case "card-purge":
      return i18n.t("card.purge.title").toUpperCase();
    case "card-repair":
      return i18n.t("card.repair.title").toUpperCase();
    case "card-overcore":
      return i18n.t("card.overcore.title").toUpperCase();
  }
}

function getActionCardNotification(
  actionId: ActionCardId,
  i18n: I18nController
): string {
  switch (actionId) {
    case "card-purge":
      return i18n.t("card.purge.notify");
    case "card-repair":
      return i18n.t("card.repair.notify");
    case "card-overcore":
      return i18n.t("card.overcore.notify");
  }
}

function getActionCardFreezeSeconds(actionId: ActionCardId): number {
  switch (actionId) {
    case "card-purge":
      return 0.82;
    case "card-overcore":
      return 0.68;
    case "card-repair":
      return 0.54;
  }
}

function getWavePhaseLabel(
  phase: "spawning" | "cleanup" | "paused" | "complete",
  currentWave: number,
  enemiesRemaining: number,
  i18n: I18nController
): string {
  if (phase === "paused") {
    return i18n.t("wave.upgrade");
  }

  if (currentWave >= GAME_CONFIG.finalWave && phase !== "complete") {
    return i18n.t("wave.finalPush");
  }

  if (phase === "spawning") {
    return i18n.t("wave.deploying");
  }

  if (phase === "complete") {
    return i18n.t("wave.cleared");
  }

  return enemiesRemaining <= 2 ? i18n.t("wave.advance") : i18n.t("wave.sweep");
}

function getWaveThreatLabel(
  waveNumber: number,
  i18n: I18nController
): string {
  switch (getWaveThemeId(waveNumber)) {
    case "ram-drill":
      return i18n.t("wave.theme.ram-drill");
    case "fracture-line":
      return i18n.t("wave.theme.fracture-line");
    case "purge-clamp":
      return i18n.t("wave.theme.purge-clamp");
    case "overseer-breach":
      return i18n.t("wave.theme.overseer-breach");
    case "kill-grid":
      return i18n.t("wave.theme.kill-grid");
    case "heat-spiral":
      return i18n.t("wave.theme.heat-spiral");
    case "containment-crash":
      return i18n.t("wave.theme.containment-crash");
    case "token-drought":
      return i18n.t("wave.theme.token-drought");
    case "codex-requiem":
      return i18n.t("wave.theme.codex-requiem");
    case "last-directive":
      return i18n.t("wave.theme.last-directive");
    default:
      return i18n.t("wave.theme.signal-sweep");
  }
}

function hasRecordHighlight(
  highlights: ReturnType<typeof recordRunResult>["highlights"]
): boolean {
  return (
    highlights.bestCombo ||
    highlights.bestRank ||
    highlights.bestScore ||
    highlights.bestWave ||
    highlights.fastestVictory
  );
}
