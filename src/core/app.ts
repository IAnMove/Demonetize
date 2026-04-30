import { createAudioBus } from "./audio";
import { GAME_CONFIG } from "./config";
import { createInputController } from "./input";
import { createI18n, type I18nController } from "./i18n";
import { FixedStepLoop } from "./loop";
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
import { isActionCardId } from "../gameplay/progression/upgrades";
import { getBuildProfile } from "../gameplay/progression/builds";
import { getWaveThemeId } from "../gameplay/waves/waveConfig";
import type { PlayerDamageSourceKind } from "../gameplay/player/player";
import { createGameScene, type EnemyAvatarMode } from "../render/scene";
import { createDebugPanel } from "../ui/debugPanel";
import { createHud } from "../ui/hud";
import { createOverlays } from "../ui/overlays";

type RunLossReason = PlayerDamageSourceKind | "overrun";

interface RunSummary {
  bestCombo: number;
  bestRescueStreak: number;
  chapter: number;
  elapsedSeconds: number;
  lossReason?: RunLossReason;
  lostRescueCount: number;
  rank: "a" | "b" | "c" | "d" | "s";
  rescuedCount: number;
  score: number;
  selectedChoiceIds: UpgradeId[];
  selectedChoices: ReturnType<typeof getSessionSnapshot>["progression"]["selectedChoices"];
  usedActionCards: ActionCardId[];
  waveNumber: number;
}

export function createApp(rootElement: HTMLDivElement): void {
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
  let runRecords = loadRunRecords();
  let announcedWave = 0;
  let actionCardFreezeRemaining = 0;
  let debugRandomRestore: (() => void) | null = null;
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
    audio.prime();
    audio.playCue("ui-accept");
    hud.clearTransientState();
    input.clearTransientState();
    pendingGameOver = null;
    pendingVictory = null;
    announcedWave = 0;
    pbAnnouncedThisRun = false;
    actionCardFreezeRemaining = 0;
    usedActionCards = [];
    resetGameSession(session);
    stateMachine.transition("playing");
  };

  const restartRun = (): void => {
    audio.prime();
    audio.playCue("ui-accept");
    hud.clearTransientState();
    input.clearTransientState();
    pendingGameOver = null;
    pendingVictory = null;
    announcedWave = 0;
    pbAnnouncedThisRun = false;
    actionCardFreezeRemaining = 0;
    usedActionCards = [];
    resetGameSession(session);
    stateMachine.transition("playing");
  };

  const skipIntro = (): void => {
    if (stateMachine.value !== "intro") {
      return;
    }

    audio.prime();
    audio.playCue("ui-accept");
    hud.clearTransientState();
    input.clearTransientState();
    stateMachine.transition("title");
  };

  const overlays = createOverlays(
    overlayLayer,
    {
      onSkipIntro: skipIntro,
      onStart: startRun,
      onRestart: restartRun,
      onContinueChapter: () => {
        audio.prime();
        audio.playCue("ui-accept");
        hud.clearTransientState();
        input.clearTransientState();
        advanceChapterTransition(session);
        stateMachine.transition("playing");
      },
      onSelectUpgrade: (upgradeId) => {
        audio.prime();
        audio.playCue("ui-accept");
        hud.clearTransientState();
        applyUpgradeSelection(session, upgradeId);
        input.clearTransientState();
        stateMachine.transition("playing");
      }
    },
    i18n
  );
  overlays.setRecords(runRecords);

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
    const recordUpdate = recordRunResult(summary, true, runRecords);
    runRecords = recordUpdate.records;
    overlays.setRecords(runRecords);
    overlays.setRunSummary(summary, recordUpdate.highlights);
    input.clearTransientState();
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

  const setEnemyAvatarMode = (mode: EnemyAvatarMode): void => {
    scene.setEnemyAvatarMode(mode);
    hud.notify(`Channel avatars: ${mode}`, "system");
  };

  const debugPanel = import.meta.env.DEV
    ? createDebugPanel(overlayLayer, {
        onApplyPreset: applyDebugPreset,
        onForceGameOver: forceDebugGameOver,
        onForceWave: forceDebugWave,
        onForceVictory: forceDebugVictory,
        onPreviewEnemyDeaths: previewEnemyDeathEffects,
        onGrantUpgrade: grantDebugUpgrade,
        onSetEnemyAvatarMode: setEnemyAvatarMode,
        onSetSeed: setDebugSeed,
        onUseLiveRandom: useLiveRandom
      })
    : null;

  const syncUi = (state: GameState): void => {
    overlays.setState(state);
    hud.setVisible(state === "playing" || state === "between-waves");

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
        pbLabel: getPersonalBestChaseLabel(0, runRecords.bestScore, i18n),
        pbTone: "neutral",
        passiveCards: [],
        scoreLabel: "0000",
        showControls: true,
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
          const recordUpdate = recordRunResult(
            pendingGameOver.summary,
            false,
            runRecords
          );
          runRecords = recordUpdate.records;
          overlays.setRecords(runRecords);
          overlays.setRunSummary(
            pendingGameOver.summary,
            recordUpdate.highlights
          );
          if (hasRecordHighlight(recordUpdate.highlights)) {
            audio.playCue("record-best");
            hud.announce(i18n.t("announce.recordBest"), "system");
            hud.notify(i18n.t("notify.recordBest"), "system");
          }
          pendingGameOver = null;
          input.clearTransientState();
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
          const recordUpdate = recordRunResult(
            pendingVictory.summary,
            true,
            runRecords
          );
          runRecords = recordUpdate.records;
          overlays.setRecords(runRecords);
          overlays.setRunSummary(
            pendingVictory.summary,
            recordUpdate.highlights
          );
          if (hasRecordHighlight(recordUpdate.highlights)) {
            audio.playCue("record-best");
            hud.announce(i18n.t("announce.recordBest"), "system");
            hud.notify(i18n.t("notify.recordBest"), "system");
          }
          pendingVictory = null;
          input.clearTransientState();
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
      const snapshot = input.createSnapshot(scene.screenToGround, fallbackAim);
      const result = updateGameSession(session, snapshot, deltaSeconds);
      const view = getSessionSnapshot(session);
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
            2
        );
        input.clearTransientState();
        stateMachine.transition("chapter-transition");
      } else if (result.betweenWavesReady) {
        overlays.setProgression(
          view.progression.availableChoices,
          view.progression.selectedChoices,
          view.wave.currentWave,
          createRunSummary(view, [], usedActionCards),
          view.progression.availableChoices.length >
            3
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

  stateMachine.transition("intro");
  if (bootIntro) {
    shell.style.visibility = "";
    rootElement.replaceChildren(shell);
  }

  window.addEventListener("beforeunload", () => {
    input.dispose();
    debugPanel?.dispose();
    useLiveRandom();
    reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    scene.dispose();
    loop.stop();
    window.removeEventListener("keydown", handleKeyDown);
  });
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
    chapter: view.wave.chapter,
    elapsedSeconds: view.elapsedSeconds,
    lossReason: getRunLossReason(view, frameEvents),
    lostRescueCount: view.lostRescueCount,
    rank: getRunRank(view),
    rescuedCount: view.rescuedCount,
    score: view.score,
    selectedChoiceIds: view.progression.selectedChoices.map((choice) => choice.id),
    selectedChoices: view.progression.selectedChoices,
    usedActionCards: [...usedActionCards],
    waveNumber: view.wave.currentWave
  };
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
