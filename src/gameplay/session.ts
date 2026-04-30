import { GAME_CONFIG } from "../core/config";
import {
  createProjectilePool,
  getActiveProjectiles,
  resetProjectiles,
  spawnProjectile,
  updateProjectiles,
  type ProjectilePool,
  type ProjectileSnapshot,
  type ProjectileState
} from "./combat/projectiles";
import {
  createEnemy,
  damageEnemy,
  getEnemyVisuals,
  updateEnemies,
  type EnemyState,
  type EnemyVisualSnapshot
} from "./enemies/enemies";
import type { FrameEvent } from "./events";
import {
  add,
  clamp,
  distance,
  distanceSquared,
  lengthSquared,
  normalize,
  scale,
  type Vec2
} from "./math";
import {
  createOrbPickup,
  createRescuePickup,
  getOrbPositions,
  getRescueSnapshots,
  updateOrbPickups,
  updateRescuePickups,
  type OrbPickup,
  type RescuePickup
} from "./progression/pickups";
import {
  applyUpgrade,
  ACTION_CARD_LIMIT,
  getUpgradeChoice,
  isActionCardId,
  rollEliteUpgradeChoices,
  rollUpgradeChoices,
  type ActionCardId,
  type HeldActionCard,
  type UpgradeChoice,
  type UpgradeId
} from "./progression/upgrades";
import {
  applyDamage,
  applyHealing,
  createPlayer,
  resetPlayer,
  updatePlayer,
  type PlayerInput,
  type PlayerState
} from "./player/player";
import {
  advanceToNextWave,
  createWaveDirector,
  forceWaveForDebug,
  getWaveSnapshot,
  resetWaveDirector,
  resolveWaveProgress,
  updateWaveDirector,
  type WaveDirectorState,
  type WaveSnapshot
} from "./waves/waves";

export interface GameSession {
  actionCards: HeldActionCard[];
  artilleryStrikes: ArtilleryStrikeState[];
  afterimageTrailCooldown: number;
  arenaPurgeCooldown: number;
  arenaPurgeLanes: ArenaPurgeLaneState[];
  boundaryHitCooldown: number;
  bestCombo: number;
  bestRescueStreak: number;
  bossPulseCooldown: number;
  bossPulses: BossPulseState[];
  cometBloomCooldown: number;
  comboCount: number;
  comboTimer: number;
  dangerLevel: number;
  enemies: EnemyState[];
  elapsedSeconds: number;
  gravityWells: GravityWellState[];
  haloDroneCooldown: number;
  lostRescueCount: number;
  nextActionCardInstance: number;
  nextEnemyId: number;
  orbs: OrbPickup[];
  pendingSpawns: PendingSpawn[];
  pendingUpgradeChoices: UpgradeChoice[];
  player: PlayerState;
  projectiles: ProjectilePool;
  rescuedCount: number;
  rescueDraftCharges: number;
  rescueCharge: number;
  rescueStreak: number;
  rescues: RescuePickup[];
  score: number;
  selectedUpgradeIds: UpgradeId[];
  satelliteLatticeCooldown: number;
  waveDirector: WaveDirectorState;
}

export interface ProgressionSnapshot {
  availableChoices: UpgradeChoice[];
  selectedChoices: UpgradeChoice[];
}

export interface BossSnapshot {
  healthRatio: number;
  mode: EnemyVisualSnapshot["mode"];
  phase: number;
  title: string;
}

export interface ArenaPurgeSnapshot {
  laneIndex: number;
  phase: "warning" | "active";
  progress: number;
}

export interface BossPulseSnapshot {
  origin: Vec2;
  phase: "warning" | "active";
  progress: number;
  radius: number;
}

export interface ArtilleryStrikeSnapshot {
  phase: "warning" | "active";
  position: Vec2;
  progress: number;
  radius: number;
}

export interface SpawnWarningSnapshot {
  archetype: EnemyState["archetype"];
  isElite: boolean;
  mutation: EnemyVisualSnapshot["mutation"];
  position: Vec2;
  progress: number;
}

export interface SessionSnapshot {
  actionCards: HeldActionCard[];
  activeProjectiles: ProjectileSnapshot[];
  artilleryPhase: "active" | "idle" | "warning";
  artilleryStrikes: ArtilleryStrikeSnapshot[];
  arenaPurgeLanes: ArenaPurgeSnapshot[];
  arenaPurgePhase: "active" | "idle" | "warning";
  bestCombo: number;
  bestRescueStreak: number;
  boss: BossSnapshot | null;
  bossPulses: BossPulseSnapshot[];
  comboCount: number;
  comboRatio: number;
  dangerLevel: number;
  enemies: EnemyVisualSnapshot[];
  elapsedSeconds: number;
  lostRescueCount: number;
  orbs: Vec2[];
  player: PlayerState;
  progression: ProgressionSnapshot;
  rescuedCount: number;
  rescues: Array<{ position: Vec2; progress: number }>;
  score: number;
  spawnWarnings: SpawnWarningSnapshot[];
  wave: WaveSnapshot;
}

export interface SessionUpdateResult {
  betweenWavesReady: boolean;
  chapterTransitionReady: boolean;
  frameEvents: FrameEvent[];
  playerDied: boolean;
  victoryAchieved: boolean;
}

interface PendingSpawn {
  archetype: EnemyState["archetype"];
  isElite: boolean;
  mutation: EnemyState["mutation"];
  position: Vec2;
  timeRemaining: number;
  warningDuration: number;
  waveLevel: number;
}

interface ArtilleryStrikeState {
  damage: number;
  duration: number;
  phase: "warning" | "active";
  position: Vec2;
  radius: number;
  timeRemaining: number;
}

interface ArenaPurgeLaneState {
  duration: number;
  laneIndex: number;
  phase: "warning" | "active";
  timeRemaining: number;
}

interface BossPulseState {
  duration: number;
  origin: Vec2;
  phase: "warning" | "active";
  timeRemaining: number;
}

interface GravityWellState {
  duration: number;
  position: Vec2;
  pull: number;
  radius: number;
  timeRemaining: number;
}

const COMBO_WINDOW_SECONDS = 3.6;
const COMBO_MILESTONES = [3, 5, 8, 12];
const RESCUE_STREAK_MILESTONES = [2, 4, 6];
const HALO_DRONE_FIRE_SECONDS = 0.72;
const SATELLITE_LATTICE_FIRE_SECONDS = 2.35;
const COMET_BLOOM_FIRE_SECONDS = 3.8;
const AFTERIMAGE_TRAIL_SECONDS = 0.09;

export type DebugBuildPresetId =
  | "baseline"
  | "projectile-heavy"
  | "dash-heavy"
  | "drone-satellite"
  | "boss-test";

export interface DebugBuildPreset {
  description: string;
  id: DebugBuildPresetId;
  label: string;
  seed: string;
  upgrades: UpgradeId[];
  waveNumber: number;
}

export interface DebugWavePreset {
  id: "early" | "mid" | "late" | "elite" | "boss";
  label: string;
  waveNumber: number;
}

export const DEBUG_BUILD_PRESETS: DebugBuildPreset[] = [
  {
    description: "Wave 1, no upgrades; clean control baseline.",
    id: "baseline",
    label: "Baseline",
    seed: "qa-baseline-001",
    upgrades: [],
    waveNumber: 1
  },
  {
    description: "Late claim chaos for pierce, chains, bounces, and viral bursts.",
    id: "projectile-heavy",
    label: "Claim Storm",
    seed: "qa-projectiles-008",
    upgrades: [
      "split-lattice",
      "prism-loader",
      "codex-overclock",
      "arc-splitter",
      "arc-splitter",
      "arc-splitter",
      "rail-pierce",
      "rail-pierce",
      "ricochet-core",
      "starburst-rounds",
      "starburst-rounds"
    ],
    waveNumber: 8
  },
  {
    description: "Dash build for appeal pulses, echoes, and callback novas.",
    id: "dash-heavy",
    label: "Appeal Dash",
    seed: "qa-dash-008",
    upgrades: [
      "nova-dash",
      "nova-dash",
      "nova-dash",
      "afterimage-trail",
      "afterimage-trail",
      "afterimage-trail",
      "afterburn-link",
      "dash-capacitors",
      "shock-greaves",
      "zero-point-capacitor"
    ],
    waveNumber: 8
  },
  {
    description: "Trust orbitals and automatic fire for drone/satellite readability.",
    id: "drone-satellite",
    label: "Trust Orbitals",
    seed: "qa-orbitals-010",
    upgrades: [
      "halo-drone",
      "halo-drone",
      "satellite-lattice",
      "comet-bloom",
      "arc-splitter",
      "rail-pierce",
      "overseer-lens"
    ],
    waveNumber: 10
  },
  {
    description: "Final wave with a strong mixed build for Algorithm readability.",
    id: "boss-test",
    label: "Algorithm Test",
    seed: "qa-boss-013",
    upgrades: [
      "comet-bloom",
      "satellite-lattice",
      "halo-drone",
      "halo-drone",
      "rail-pierce",
      "starburst-rounds",
      "nova-dash",
      "afterimage-trail",
      "fortress-frame",
      "card-repair"
    ],
    waveNumber: 13
  }
];

export const DEBUG_WAVE_PRESETS: DebugWavePreset[] = [
  {
    id: "early",
    label: "Early W1",
    waveNumber: 1
  },
  {
    id: "mid",
    label: "Mid W6",
    waveNumber: 6
  },
  {
    id: "late",
    label: "Late W10",
    waveNumber: 10
  },
  {
    id: "elite",
    label: "Elite W12",
    waveNumber: 12
  },
  {
    id: "boss",
    label: "Algorithm W13",
    waveNumber: 13
  }
];

export function applyUpgradeSelection(
  session: GameSession,
  upgradeId: UpgradeId
): void {
  if (isActionCardId(upgradeId)) {
    addActionCard(session, upgradeId);
  } else {
    applyUpgrade(session.player, upgradeId);
  }

  session.selectedUpgradeIds.push(upgradeId);
  session.pendingUpgradeChoices = [];
  advanceToNextWave(session.waveDirector);
}

export function grantUpgradeForDebug(
  session: GameSession,
  upgradeId: UpgradeId,
  count = 1
): void {
  const grantCount = Math.max(1, Math.min(6, Math.round(count)));

  for (let index = 0; index < grantCount; index += 1) {
    if (isActionCardId(upgradeId)) {
      addActionCard(session, upgradeId);
    } else {
      applyUpgrade(session.player, upgradeId);
    }

    session.selectedUpgradeIds.push(upgradeId);
  }

  session.pendingUpgradeChoices = [];
}

export function applyDebugBuildPreset(
  session: GameSession,
  presetId: DebugBuildPresetId
): DebugBuildPreset {
  const preset =
    DEBUG_BUILD_PRESETS.find((candidate) => candidate.id === presetId) ??
    DEBUG_BUILD_PRESETS[0];

  resetGameSession(session);
  for (const upgradeId of preset.upgrades) {
    grantUpgradeForDebug(session, upgradeId);
  }
  forceWaveForDebugSession(session, preset.waveNumber);

  return preset;
}

export function forceWaveForDebugSession(
  session: GameSession,
  waveNumber: number
): void {
  clearCombatForDebug(session);
  session.pendingUpgradeChoices = [];
  session.player.alive = true;
  session.player.health = session.player.maxHealth;
  session.player.lastDamageSource = null;
  session.player.damageInvulnerabilityRemaining = 0;
  session.player.dashCooldownRemaining = 0;
  session.player.fireCooldownRemaining = 0;
  session.player.position = { x: 0, y: 0 };
  session.player.velocity = { x: 0, y: 0 };
  if (waveNumber > 1) {
    session.elapsedSeconds = Math.max(session.elapsedSeconds, 18.1);
  }
  forceWaveForDebug(session.waveDirector, waveNumber);
}

export function advanceChapterTransition(session: GameSession): void {
  session.pendingUpgradeChoices = [];
  advanceToNextWave(session.waveDirector);
}

export interface ActionCardUseResult {
  actionId?: ActionCardId;
  applied: boolean;
  frameEvents: FrameEvent[];
}

export function useActionCard(
  session: GameSession,
  instanceId: string
): ActionCardUseResult {
  const cardIndex = session.actionCards.findIndex(
    (card) => card.instanceId === instanceId
  );

  if (cardIndex < 0) {
    return {
      applied: false,
      frameEvents: []
    };
  }

  const card = session.actionCards[cardIndex];
  const frameEvents: FrameEvent[] = [];
  let applied = false;

  switch (card.id) {
    case "card-purge":
      applied = applyPurgeCard(session, frameEvents) > 0;
      break;
    case "card-repair":
      applied = applyRepairCard(session, frameEvents);
      break;
    case "card-overcore":
      applied = applyOvercoreCard(session, frameEvents);
      break;
  }

  if (!applied) {
    return {
      actionId: card.id,
      applied: false,
      frameEvents
    };
  }

  frameEvents.unshift({
    position: { ...session.player.position },
    type: getActionCardCastEvent(card.id)
  });
  session.actionCards.splice(cardIndex, 1);
  return {
    actionId: card.id,
    applied: true,
    frameEvents
  };
}

function getActionCardCastEvent(
  actionId: ActionCardId
): "card-overcore-cast" | "card-purge-cast" | "card-repair-cast" {
  switch (actionId) {
    case "card-purge":
      return "card-purge-cast";
    case "card-repair":
      return "card-repair-cast";
    case "card-overcore":
      return "card-overcore-cast";
  }
}

export function createGameSession(): GameSession {
  return {
    actionCards: [],
    artilleryStrikes: [],
    afterimageTrailCooldown: 0,
    arenaPurgeCooldown: 0,
    arenaPurgeLanes: [],
    boundaryHitCooldown: 0,
    bestCombo: 0,
    bestRescueStreak: 0,
    bossPulseCooldown: 0,
    bossPulses: [],
    cometBloomCooldown: COMET_BLOOM_FIRE_SECONDS,
    comboCount: 0,
    comboTimer: 0,
    dangerLevel: 0,
    enemies: [],
    elapsedSeconds: 0,
    gravityWells: [],
    haloDroneCooldown: HALO_DRONE_FIRE_SECONDS * 0.45,
    lostRescueCount: 0,
    nextActionCardInstance: 1,
    nextEnemyId: 1,
    orbs: [],
    pendingSpawns: [],
    pendingUpgradeChoices: [],
    player: createPlayer(),
    projectiles: createProjectilePool(),
    rescueStreak: 0,
    rescuedCount: 0,
    rescueDraftCharges: 0,
    rescueCharge: 0,
    rescues: [],
    score: 0,
    selectedUpgradeIds: [],
    satelliteLatticeCooldown: SATELLITE_LATTICE_FIRE_SECONDS,
    waveDirector: createWaveDirector()
  };
}

export function getSessionSnapshot(session: GameSession): SessionSnapshot {
  const boss = session.enemies.find((enemy) => enemy.archetype === "overseer");

  return {
    actionCards: session.actionCards.map((card) => ({ ...card })),
    activeProjectiles: getActiveProjectiles(session.projectiles),
    artilleryPhase: session.artilleryStrikes.some((strike) => strike.phase === "active")
      ? "active"
      : session.artilleryStrikes.length > 0
        ? "warning"
        : "idle",
    artilleryStrikes: session.artilleryStrikes.map((strike) => ({
      phase: strike.phase,
      position: { ...strike.position },
      progress: 1 - strike.timeRemaining / strike.duration,
      radius: strike.radius
    })),
    arenaPurgeLanes: session.arenaPurgeLanes.map((lane) => ({
      laneIndex: lane.laneIndex,
      phase: lane.phase,
      progress: 1 - lane.timeRemaining / lane.duration
    })),
    arenaPurgePhase: session.arenaPurgeLanes.some((lane) => lane.phase === "active")
      ? "active"
      : session.arenaPurgeLanes.length > 0
        ? "warning"
        : "idle",
    bestCombo: session.bestCombo,
    bestRescueStreak: session.bestRescueStreak,
    boss: boss
      ? {
          healthRatio: boss.health / boss.maxHealth,
          mode: boss.mode,
          phase: boss.phase,
          title:
            boss.mode === "exposed"
              ? "THE ALGORITHM // CORE OPEN"
              : boss.phase > 1
                ? "THE ALGORITHM // PHASE 2"
                : "THE ALGORITHM"
        }
      : null,
    bossPulses: session.bossPulses.map((pulse) => ({
      origin: { ...pulse.origin },
      phase: pulse.phase,
      progress: 1 - pulse.timeRemaining / pulse.duration,
      radius: getBossPulseRadius(pulse)
    })),
    comboCount: session.comboCount,
    comboRatio: clamp(session.comboTimer / COMBO_WINDOW_SECONDS, 0, 1),
    dangerLevel: session.dangerLevel,
    enemies: getEnemyVisuals(session.enemies),
    elapsedSeconds: session.elapsedSeconds,
    lostRescueCount: session.lostRescueCount,
    orbs: getOrbPositions(session.orbs),
    player: session.player,
    progression: {
      availableChoices: session.pendingUpgradeChoices,
      selectedChoices: session.selectedUpgradeIds.map((id) => getUpgradeChoice(id))
    },
    rescuedCount: session.rescuedCount,
    rescues: getRescueSnapshots(session.rescues),
    score: session.score,
    spawnWarnings: session.pendingSpawns.map((pendingSpawn) => ({
      archetype: pendingSpawn.archetype,
      isElite: pendingSpawn.isElite,
      mutation: pendingSpawn.mutation,
      position: { ...pendingSpawn.position },
      progress:
        1 - pendingSpawn.timeRemaining / pendingSpawn.warningDuration
    })),
    wave: getWaveSnapshot(
      session.waveDirector,
      session.enemies.length + session.pendingSpawns.length
    )
  };
}

export function getFallbackAim(position: Vec2, facing: Vec2): Vec2 {
  return add(position, scale(facing, 6));
}

export function resetGameSession(session: GameSession): void {
  session.actionCards.length = 0;
  session.artilleryStrikes.length = 0;
  session.afterimageTrailCooldown = 0;
  session.arenaPurgeCooldown = 0;
  session.arenaPurgeLanes.length = 0;
  session.boundaryHitCooldown = 0;
  session.bestCombo = 0;
  session.bestRescueStreak = 0;
  session.bossPulseCooldown = 0;
  session.bossPulses.length = 0;
  session.cometBloomCooldown = COMET_BLOOM_FIRE_SECONDS;
  session.comboCount = 0;
  session.comboTimer = 0;
  session.dangerLevel = 0;
  session.enemies.length = 0;
  session.elapsedSeconds = 0;
  session.gravityWells.length = 0;
  session.haloDroneCooldown = HALO_DRONE_FIRE_SECONDS * 0.45;
  session.lostRescueCount = 0;
  session.nextActionCardInstance = 1;
  session.nextEnemyId = 1;
  session.orbs.length = 0;
  session.pendingSpawns.length = 0;
  session.pendingUpgradeChoices = [];
  resetPlayer(session.player);
  resetProjectiles(session.projectiles);
  session.rescueStreak = 0;
  session.rescuedCount = 0;
  session.rescueDraftCharges = 0;
  session.rescueCharge = 0;
  session.rescues.length = 0;
  session.score = 0;
  session.selectedUpgradeIds = [];
  session.satelliteLatticeCooldown = SATELLITE_LATTICE_FIRE_SECONDS;
  resetWaveDirector(session.waveDirector);
}

function clearCombatForDebug(session: GameSession): void {
  session.artilleryStrikes.length = 0;
  session.arenaPurgeLanes.length = 0;
  session.bossPulses.length = 0;
  session.enemies.length = 0;
  session.gravityWells.length = 0;
  session.orbs.length = 0;
  session.pendingSpawns.length = 0;
  resetProjectiles(session.projectiles);
  session.rescues.length = 0;
}

function addActionCard(session: GameSession, actionId: ActionCardId): void {
  if (session.actionCards.length >= ACTION_CARD_LIMIT) {
    return;
  }

  session.actionCards.push({
    id: actionId,
    instanceId: `card-${session.nextActionCardInstance}`
  });
  session.nextActionCardInstance += 1;
}

function applyPurgeCard(
  session: GameSession,
  frameEvents: FrameEvent[]
): number {
  let affectedCount = 0;

  for (let enemyIndex = session.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
    const enemy = session.enemies[enemyIndex];

    if (enemy.archetype === "overseer") {
      const bossDamage = Math.max(80, enemy.maxHealth * 0.2);
      if (damageEnemy(enemy, bossDamage)) {
        emitEnemyDeathEvents(session, enemy, frameEvents);
        registerKill(session, enemy, frameEvents);
        session.enemies.splice(enemyIndex, 1);
      } else {
        frameEvents.push({
          ...getEnemyEventMeta(enemy),
          position: { ...enemy.position },
          type: "enemy-hit"
        });
      }
      affectedCount += 1;
      continue;
    }

    emitEnemyDeathEvents(session, enemy, frameEvents);
    if (enemy.isElite) {
      frameEvents.push({
        ...getEnemyEventMeta(enemy),
        position: { ...enemy.position },
        type: "elite-killed"
      });
    }
    registerKill(session, enemy, frameEvents);
    dropEnemyRewards(session, enemy, frameEvents);
    session.enemies.splice(enemyIndex, 1);
    affectedCount += 1;
  }

  if (affectedCount > 0) {
    frameEvents.push({
      position: { ...session.player.position },
      span: 5.8,
      type: "artillery-impact"
    });
  }

  return affectedCount;
}

function applyRepairCard(
  session: GameSession,
  frameEvents: FrameEvent[]
): boolean {
  if (session.player.health >= session.player.maxHealth) {
    return false;
  }

  const previousHealth = session.player.health;
  const repairAmount = Math.round(session.player.maxHealth * 0.45);
  applyHealing(session.player, repairAmount);
  const healedAmount = Math.round(session.player.health - previousHealth);

  frameEvents.push({
    amount: healedAmount,
    position: { ...session.player.position },
    type: "orb-collected"
  });

  return healedAmount > 0;
}

function applyOvercoreCard(
  session: GameSession,
  frameEvents: FrameEvent[]
): boolean {
  const hullBonus = 24;
  session.player.maxHealth += hullBonus;
  applyHealing(session.player, hullBonus);
  frameEvents.push({
    amount: hullBonus,
    position: { ...session.player.position },
    type: "orb-collected"
  });
  frameEvents.push({
    position: { ...session.player.position },
    type: "upgrade-ready"
  });
  return true;
}

export function updateGameSession(
  session: GameSession,
  input: PlayerInput,
  deltaSeconds: number
): SessionUpdateResult {
  session.elapsedSeconds += deltaSeconds;
  const frameEvents: FrameEvent[] = [];
  const previousHealth = session.player.health;
  session.boundaryHitCooldown = Math.max(
    0,
    session.boundaryHitCooldown - deltaSeconds
  );
  updateComboTimer(session, deltaSeconds);

  updateWaveDirector(
    session.waveDirector,
    (definition) => {
      if (
        session.enemies.length + session.pendingSpawns.length <
        GAME_CONFIG.maxEnemies
      ) {
        session.pendingSpawns.push({
          archetype: definition.archetype,
          isElite: Boolean(definition.mutation),
          mutation: definition.mutation ?? null,
          position: { ...definition.position },
          timeRemaining: GAME_CONFIG.spawnWarningSeconds,
          warningDuration: GAME_CONFIG.spawnWarningSeconds,
          waveLevel: definition.level
        });
      }
    },
    deltaSeconds
  );

  resolvePendingSpawns(session, frameEvents, deltaSeconds);

  const playerUpdate = updatePlayer(session.player, input, deltaSeconds);
  if (playerUpdate.dashStarted) {
    frameEvents.push({
      position: { ...session.player.position },
      type: "dash"
    });
    applyDashPulse(session, frameEvents);
  }
  if (playerUpdate.dashEnded) {
    applyNovaDash(session, frameEvents);
  }
  updateAfterimageTrail(session, frameEvents, deltaSeconds);

  if (playerUpdate.boundaryHit && session.boundaryHitCooldown <= 0) {
    session.boundaryHitCooldown = 0.16;
    frameEvents.push({
      position: { ...session.player.position },
      type: "arena-boundary-hit"
    });
  }

  if (playerUpdate.fireEvent) {
    frameEvents.push({
      position: { ...playerUpdate.fireEvent.origin },
      type: "shot-fired"
    });
    spawnPlayerVolley(
      session,
      playerUpdate.fireEvent.origin,
      playerUpdate.fireEvent.direction
    );
  }

  updateAutomatedBoosts(session, frameEvents, deltaSeconds);
  updateProjectiles(session.projectiles, deltaSeconds, frameEvents);
  updateEnemies(session.enemies, session.player, deltaSeconds, frameEvents);
  updateGravityWells(session, frameEvents, deltaSeconds);
  resolveArtilleryLocks(session, frameEvents);
  if (session.enemies.some((enemy) => enemy.isElite)) {
    session.dangerLevel = Math.max(session.dangerLevel, 0.45);
  }
  if (
    session.enemies.some(
      (enemy) =>
        enemy.supported ||
        (enemy.archetype === "relay" && enemy.supportPulseRemaining > 0)
    )
  ) {
    session.dangerLevel = Math.max(session.dangerLevel, 0.34);
  }
  resolveProjectileHits(session, frameEvents);

  const collectedOrbPositions = updateOrbPickups(
    session.orbs,
    session.player,
    deltaSeconds
  );
  for (const position of collectedOrbPositions) {
    createGravityWell(session, position, frameEvents);
    frameEvents.push({
      amount: session.player.orbHeal,
      position,
      type: "orb-collected"
    });
  }

  const rescueUpdate = updateRescuePickups(
    session.rescues,
    session.player,
    deltaSeconds
  );
  for (const position of rescueUpdate.savedPositions) {
    createGravityWell(session, position, frameEvents);
    session.rescuedCount += 1;
    if (session.rescuedCount % GAME_CONFIG.rescueDraftChargeThreshold === 0) {
      session.rescueDraftCharges += 1;
    }
    session.rescueStreak += 1;
    session.bestRescueStreak = Math.max(
      session.bestRescueStreak,
      session.rescueStreak
    );
    const rescueScoreBonus = Math.round(
      GAME_CONFIG.rescueSaveScoreBonus * session.player.rescueScoreMultiplier
    );
    session.score += rescueScoreBonus;
    session.comboTimer = Math.max(session.comboTimer, COMBO_WINDOW_SECONDS);
    spawnRescueBurstOrbs(session, position);
    frameEvents.push({
      amount: rescueScoreBonus,
      position,
      type: "rescue-saved"
    });
    if (RESCUE_STREAK_MILESTONES.includes(session.rescueStreak)) {
      frameEvents.push({
        amount: session.rescueStreak,
        position,
        type: "rescue-streak"
      });
    }
  }
  for (const position of rescueUpdate.lostPositions) {
    session.lostRescueCount += 1;
    session.rescueStreak = 0;
    frameEvents.push({
      position,
      type: "rescue-lost"
    });
  }

  const distanceFromCenter = Math.sqrt(lengthSquared(session.player.position));
  if (distanceFromCenter > GAME_CONFIG.arenaDangerRadius) {
    const overflow = distanceFromCenter - GAME_CONFIG.arenaDangerRadius;
    const hazardStrength = clamp(
      overflow / (GAME_CONFIG.arenaHardLimit - GAME_CONFIG.arenaDangerRadius),
      0.15,
      1
    );

    applyDamage(
      session.player,
      GAME_CONFIG.edgeDamagePerSecond * hazardStrength * deltaSeconds,
      {
        bypassInvulnerability: true,
        source: "edge"
      }
    );
    session.dangerLevel = 1;
  } else {
    session.dangerLevel = Math.max(0, session.dangerLevel - deltaSeconds * 2);
  }

  session.dangerLevel = Math.max(
    session.dangerLevel,
    updateArenaPurge(session, frameEvents, deltaSeconds)
  );
  session.dangerLevel = Math.max(
    session.dangerLevel,
    updateBossPulses(session, frameEvents, deltaSeconds)
  );
  session.dangerLevel = Math.max(
    session.dangerLevel,
    updateArtilleryStrikes(session, frameEvents, deltaSeconds)
  );

  if (session.player.health < previousHealth) {
    frameEvents.push({
      position: { ...session.player.position },
      type: session.player.alive ? "player-hit" : "player-died"
    });
  }

  if (!session.player.alive) {
    return {
      betweenWavesReady: false,
      chapterTransitionReady: false,
      frameEvents,
      playerDied: true,
      victoryAchieved: false
    };
  }

  const resolution = resolveWaveProgress(
    session.waveDirector,
    session.enemies.length + session.pendingSpawns.length
  );

  if (resolution === "between-waves") {
    const selectedChoices = session.selectedUpgradeIds.map((id) =>
      getUpgradeChoice(id)
    );
    const standardChoiceCount =
      session.rescueDraftCharges > 0 ? GAME_CONFIG.rescueDraftBonusChoices : 3;
    session.pendingUpgradeChoices = rollUpgradeChoices(
      selectedChoices,
      standardChoiceCount
    );
    if (session.rescueDraftCharges > 0) {
      session.rescueDraftCharges -= 1;
    }
    frameEvents.push({
      position: { ...session.player.position },
      type: "upgrade-ready"
    });
  } else if (resolution === "chapter-transition") {
    const selectedChoices = session.selectedUpgradeIds.map((id) =>
      getUpgradeChoice(id)
    );
    const rescueCacheActive =
      session.rescuedCount >= GAME_CONFIG.chapterRescueBonusThreshold;
    const eliteChoiceCount = rescueCacheActive
      ? GAME_CONFIG.chapterRescueBonusChoices
      : 2;
    session.pendingUpgradeChoices = rollEliteUpgradeChoices(
      selectedChoices,
      eliteChoiceCount,
      rescueCacheActive ? ["signal-choir"] : []
    );
    frameEvents.push({
      position: { ...session.player.position },
      type: "upgrade-ready"
    });
  }

  return {
    betweenWavesReady: resolution === "between-waves",
    chapterTransitionReady: resolution === "chapter-transition",
    frameEvents:
      resolution === "victory"
        ? [
            ...frameEvents,
            {
              position: { ...session.player.position },
              type: "victory"
            }
          ]
        : frameEvents,
    playerDied: false,
    victoryAchieved: resolution === "victory"
  };
}

function resolveArtilleryLocks(
  session: GameSession,
  frameEvents: FrameEvent[]
): void {
  for (const event of frameEvents) {
    if (event.type !== "artillery-lock-start") {
      continue;
    }

    session.artilleryStrikes.push({
      damage: event.amount ?? GAME_CONFIG.artilleryBaseDamage,
      duration: GAME_CONFIG.artilleryWarningSeconds,
      phase: "warning",
      position: { ...event.position },
      radius: event.span ?? GAME_CONFIG.artilleryBaseRadius,
      timeRemaining: GAME_CONFIG.artilleryWarningSeconds
    });
  }
}

function resolvePendingSpawns(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  for (
    let pendingIndex = session.pendingSpawns.length - 1;
    pendingIndex >= 0;
    pendingIndex -= 1
  ) {
    const pendingSpawn = session.pendingSpawns[pendingIndex];
    pendingSpawn.timeRemaining = Math.max(
      0,
      pendingSpawn.timeRemaining - deltaSeconds
    );

    if (pendingSpawn.timeRemaining > 0) {
      continue;
    }

    session.enemies.push(
      createEnemy({
        archetype: pendingSpawn.archetype,
        id: session.nextEnemyId,
        level: pendingSpawn.waveLevel,
        mutation: pendingSpawn.mutation,
        position: pendingSpawn.position
      })
    );
    session.nextEnemyId += 1;

    frameEvents.push({
      position: { ...pendingSpawn.position },
      type: "enemy-spawned"
    });
    if (pendingSpawn.isElite) {
      frameEvents.push({
        position: { ...pendingSpawn.position },
        type: "elite-spawned"
      });
    }

    if (pendingSpawn.archetype === "overseer") {
      frameEvents.push({
        position: { ...pendingSpawn.position },
        type: "boss-spawned"
      });
    }

    session.pendingSpawns.splice(pendingIndex, 1);
  }
}

function resolveProjectileHits(
  session: GameSession,
  frameEvents: FrameEvent[]
): void {
  for (const projectile of session.projectiles) {
    if (!projectile.active) {
      continue;
    }

    for (
      let enemyIndex = session.enemies.length - 1;
      enemyIndex >= 0;
      enemyIndex -= 1
    ) {
      const enemy = session.enemies[enemyIndex];

      const hitRadius = enemy.radius + 0.26;
      if (
        distanceSquared(projectile.position, enemy.position) >
        hitRadius * hitRadius
      ) {
        continue;
      }

      const arcSource = { ...enemy.position };
      const arcTarget = findArcChainTarget(session, enemy);
      const hasPierce = projectile.pierceRemaining > 0;

      if (hasPierce) {
        projectile.pierceRemaining -= 1;
        frameEvents.push({
          direction: normalize(projectile.velocity),
          position: { ...projectile.position },
          span: 1.8,
          type: "rail-pierce"
        });
      } else {
        projectile.active = false;
      }

      damageEnemyAtIndex(session, enemyIndex, projectile.damage, frameEvents, {
        hitPosition: projectile.position
      });
      applyArcChain(session, arcSource, arcTarget, frameEvents);
      detonateProjectileBlast(session, projectile, arcSource, enemy.id, frameEvents);

      if (!hasPierce) {
        break;
      }
    }
  }
}

function damageEnemyAtIndex(
  session: GameSession,
  enemyIndex: number,
  damage: number,
  frameEvents: FrameEvent[],
  options: {
    allowStarburst?: boolean;
    hitPosition?: Vec2;
  } = {}
): boolean {
  const enemy = session.enemies[enemyIndex];

  if (!enemy) {
    return false;
  }

  if (damageEnemy(enemy, damage)) {
    resolveEnemyDeath(session, enemy, frameEvents, {
      allowStarburst: options.allowStarburst ?? true
    });
    return true;
  }

  frameEvents.push({
    ...getEnemyEventMeta(enemy),
    position: { ...(options.hitPosition ?? enemy.position) },
    type: "enemy-hit"
  });
  return false;
}

function resolveEnemyDeath(
  session: GameSession,
  enemy: EnemyState,
  frameEvents: FrameEvent[],
  options: { allowStarburst: boolean }
): void {
  emitEnemyDeathEvents(session, enemy, frameEvents);
  if (enemy.isElite) {
    frameEvents.push({
      ...getEnemyEventMeta(enemy),
      position: { ...enemy.position },
      type: "elite-killed"
    });
  }
  registerKill(session, enemy, frameEvents);
  if (options.allowStarburst) {
    applyStarburstRounds(session, enemy.position, enemy.id, frameEvents);
  }
  applyEliteDeathBurst(session, enemy, frameEvents);
  dropEnemyRewards(session, enemy, frameEvents);
  const removalIndex = session.enemies.findIndex(
    (candidate) => candidate.id === enemy.id
  );
  if (removalIndex >= 0) {
    session.enemies.splice(removalIndex, 1);
  }
}

function detonateProjectileBlast(
  session: GameSession,
  projectile: ProjectileState,
  position: Vec2,
  directHitEnemyId: number,
  frameEvents: FrameEvent[]
): void {
  if (projectile.blastDamage <= 0 || projectile.blastRadius <= 0) {
    return;
  }

  frameEvents.push({
    position: { ...position },
    span: projectile.blastRadius,
    type: projectile.kind === "comet" ? "comet-bloom-impact" : "artillery-impact"
  });

  for (
    let enemyIndex = session.enemies.length - 1;
    enemyIndex >= 0;
    enemyIndex -= 1
  ) {
    const enemy = session.enemies[enemyIndex];
    if (enemy.id === directHitEnemyId) {
      continue;
    }

    if (
      distanceSquared(position, enemy.position) >
      (projectile.blastRadius + enemy.radius) *
        (projectile.blastRadius + enemy.radius)
    ) {
      continue;
    }

    damageEnemyAtIndex(session, enemyIndex, projectile.blastDamage, frameEvents, {
      allowStarburst: true,
      hitPosition: enemy.position
    });
  }
}

function findArcChainTarget(
  session: GameSession,
  sourceEnemy: EnemyState
): EnemyState | null {
  if (session.player.arcChainDamage <= 0 || session.player.arcChainRadius <= 0) {
    return null;
  }

  let bestTarget: EnemyState | null = null;
  let bestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const enemy of session.enemies) {
    if (enemy.id === sourceEnemy.id) {
      continue;
    }

    const maxDistance = session.player.arcChainRadius + enemy.radius;
    const candidateDistanceSquared = distanceSquared(sourceEnemy.position, enemy.position);
    if (
      candidateDistanceSquared > maxDistance * maxDistance ||
      candidateDistanceSquared >= bestDistanceSquared
    ) {
      continue;
    }

    bestTarget = enemy;
    bestDistanceSquared = candidateDistanceSquared;
  }

  return bestTarget;
}

function applyArcChain(
  session: GameSession,
  sourcePosition: Vec2,
  targetEnemy: EnemyState | null,
  frameEvents: FrameEvent[]
): void {
  if (!targetEnemy || session.player.arcChainDamage <= 0) {
    return;
  }

  const targetIndex = session.enemies.findIndex(
    (enemy) => enemy.id === targetEnemy.id
  );
  if (targetIndex < 0) {
    return;
  }

  const target = session.enemies[targetIndex];
  const arcVector = {
    x: target.position.x - sourcePosition.x,
    y: target.position.y - sourcePosition.y
  };

  frameEvents.push({
    direction: normalize(arcVector),
    position: { ...sourcePosition },
    span: distance(sourcePosition, target.position),
    type: "arc-chain"
  });

  damageEnemyAtIndex(session, targetIndex, session.player.arcChainDamage, frameEvents, {
    hitPosition: target.position
  });
}

function applyDashPulse(session: GameSession, frameEvents: FrameEvent[]): void {
  if (session.player.dashPulseDamage <= 0 || session.player.dashPulseRadius <= 0) {
    return;
  }

  for (
    let enemyIndex = session.enemies.length - 1;
    enemyIndex >= 0;
    enemyIndex -= 1
  ) {
    const enemy = session.enemies[enemyIndex];

    if (
      distanceSquared(session.player.position, enemy.position) >
      (session.player.dashPulseRadius + enemy.radius) *
        (session.player.dashPulseRadius + enemy.radius)
    ) {
      continue;
    }

    damageEnemyAtIndex(session, enemyIndex, session.player.dashPulseDamage, frameEvents, {
      hitPosition: enemy.position
    });
  }
}

function applyNovaDash(session: GameSession, frameEvents: FrameEvent[]): void {
  if (session.player.novaDashDamage <= 0 || session.player.novaDashRadius <= 0) {
    return;
  }

  const position = { ...session.player.position };
  frameEvents.push({
    position,
    span: session.player.novaDashRadius,
    type: "nova-dash"
  });
  damageEnemiesInRadius(
    session,
    position,
    session.player.novaDashRadius,
    session.player.novaDashDamage,
    frameEvents
  );
}

function updateAfterimageTrail(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  session.afterimageTrailCooldown = Math.max(
    0,
    session.afterimageTrailCooldown - deltaSeconds
  );

  if (
    session.player.dashTimer <= 0 ||
    session.player.afterimageDamage <= 0 ||
    session.player.afterimageRadius <= 0 ||
    session.afterimageTrailCooldown > 0
  ) {
    return;
  }

  const position = { ...session.player.position };
  frameEvents.push({
    position,
    span: session.player.afterimageRadius,
    type: "afterimage-trail"
  });
  damageEnemiesInRadius(
    session,
    position,
    session.player.afterimageRadius,
    session.player.afterimageDamage,
    frameEvents
  );
  session.afterimageTrailCooldown = AFTERIMAGE_TRAIL_SECONDS;
}

function updateAutomatedBoosts(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  updateHaloDrones(session, frameEvents, deltaSeconds);
  updateSatelliteLattice(session, frameEvents, deltaSeconds);
  updateCometBloom(session, frameEvents, deltaSeconds);
}

function updateHaloDrones(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  const droneCount = session.player.haloDroneCount;
  if (droneCount <= 0) {
    session.haloDroneCooldown = HALO_DRONE_FIRE_SECONDS;
    return;
  }

  session.haloDroneCooldown = Math.max(0, session.haloDroneCooldown - deltaSeconds);
  if (session.haloDroneCooldown > 0) {
    return;
  }

  const shotsToFire = Math.max(1, Math.min(2, droneCount));
  for (let index = 0; index < shotsToFire; index += 1) {
    const origin = getOrbitPosition(
      session.player.position,
      1.35,
      index,
      shotsToFire,
      session.elapsedSeconds,
      2.4
    );
    const target = findNearestEnemy(session, origin, 14.5);
    if (!target) {
      continue;
    }

    const direction = normalize({
      x: target.position.x - origin.x,
      y: target.position.y - origin.y
    });
    spawnProjectile(
      session.projectiles,
      origin,
      direction,
      Math.max(10, session.player.projectileDamage * 0.42),
      {
        ...getPlayerProjectileOptions(session, "drone"),
        lifetime: 0.85,
        speed: GAME_CONFIG.player.projectileSpeed * 0.88
      }
    );
    frameEvents.push({
      direction,
      position: origin,
      span: distance(origin, target.position),
      type: "halo-drone-fired"
    });
  }

  session.haloDroneCooldown = HALO_DRONE_FIRE_SECONDS / Math.sqrt(droneCount);
}

function updateSatelliteLattice(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  if (session.player.satelliteLatticeCount <= 0) {
    session.satelliteLatticeCooldown = SATELLITE_LATTICE_FIRE_SECONDS;
    return;
  }

  session.satelliteLatticeCooldown = Math.max(
    0,
    session.satelliteLatticeCooldown - deltaSeconds
  );
  if (session.satelliteLatticeCooldown > 0 || session.enemies.length === 0) {
    return;
  }

  const rotation = session.elapsedSeconds * 0.62;
  for (let index = 0; index < 4; index += 1) {
    const angle = rotation + (Math.PI * 0.5 * index);
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    spawnProjectile(
      session.projectiles,
      { ...session.player.position },
      direction,
      Math.max(14, session.player.projectileDamage * 0.58),
      {
        ...getPlayerProjectileOptions(session, "satellite"),
        lifetime: 0.72,
        pierceRemaining: Math.max(1, session.player.projectilePierce),
        speed: GAME_CONFIG.player.projectileSpeed * 0.82
      }
    );
    frameEvents.push({
      direction,
      position: { ...session.player.position },
      span: 7.6,
      type: "satellite-lattice-fired"
    });
  }

  session.satelliteLatticeCooldown = SATELLITE_LATTICE_FIRE_SECONDS;
}

function updateCometBloom(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  if (session.player.cometBloomCount <= 0) {
    session.cometBloomCooldown = COMET_BLOOM_FIRE_SECONDS;
    return;
  }

  session.cometBloomCooldown = Math.max(0, session.cometBloomCooldown - deltaSeconds);
  if (session.cometBloomCooldown > 0) {
    return;
  }

  const target = findNearestEnemy(session, session.player.position, 18);
  if (!target) {
    session.cometBloomCooldown = Math.min(session.cometBloomCooldown + 0.35, 0.35);
    return;
  }

  const origin = add(
    session.player.position,
    scale(session.player.facing, session.player.radius + 0.82)
  );
  const direction = normalize({
    x: target.position.x - origin.x,
    y: target.position.y - origin.y
  });
  spawnProjectile(
    session.projectiles,
    origin,
    direction,
    Math.max(36, session.player.projectileDamage * 0.9 + session.player.cometBloomDamage),
    {
      blastDamage: Math.max(34, session.player.cometBloomDamage),
      blastRadius: session.player.cometBloomRadius,
      bouncesRemaining: 0,
      kind: "comet",
      lifetime: 2.1,
      pierceRemaining: 0,
      scale: 2.05,
      speed: GAME_CONFIG.player.projectileSpeed * 0.46
    }
  );
  frameEvents.push({
    direction,
    position: origin,
    span: distance(origin, target.position),
    type: "comet-bloom-fired"
  });
  session.cometBloomCooldown = COMET_BLOOM_FIRE_SECONDS;
}

function updateGravityWells(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): void {
  for (let wellIndex = session.gravityWells.length - 1; wellIndex >= 0; wellIndex -= 1) {
    const well = session.gravityWells[wellIndex];
    well.timeRemaining = Math.max(0, well.timeRemaining - deltaSeconds);

    for (const enemy of session.enemies) {
      const pullRadius = well.radius + enemy.radius;
      const enemyDistance = distance(well.position, enemy.position);
      if (enemyDistance <= 0.001 || enemyDistance > pullRadius) {
        continue;
      }

      const pullRatio = clamp(1 - enemyDistance / pullRadius, 0, 1);
      const direction = normalize({
        x: well.position.x - enemy.position.x,
        y: well.position.y - enemy.position.y
      });
      enemy.position = add(
        enemy.position,
        scale(direction, well.pull * pullRatio * deltaSeconds)
      );
      enemy.velocity = add(
        enemy.velocity,
        scale(direction, well.pull * pullRatio * 0.28)
      );
    }

    if (well.timeRemaining <= 0) {
      session.gravityWells.splice(wellIndex, 1);
    }
  }

  if (
    session.gravityWells.length > 0 &&
    frameEvents.every((event) => event.type !== "gravity-well")
  ) {
    session.dangerLevel = Math.max(session.dangerLevel, 0.18);
  }
}

function createGravityWell(
  session: GameSession,
  position: Vec2,
  frameEvents: FrameEvent[]
): void {
  if (
    session.player.gravityWellRadius <= 0 ||
    session.player.gravityWellPull <= 0 ||
    session.player.gravityWellSeconds <= 0
  ) {
    return;
  }

  session.gravityWells.push({
    duration: session.player.gravityWellSeconds,
    position: { ...position },
    pull: session.player.gravityWellPull,
    radius: session.player.gravityWellRadius,
    timeRemaining: session.player.gravityWellSeconds
  });
  frameEvents.push({
    position: { ...position },
    span: session.player.gravityWellRadius,
    type: "gravity-well"
  });
}

function applyStarburstRounds(
  session: GameSession,
  position: Vec2,
  sourceEnemyId: number,
  frameEvents: FrameEvent[]
): void {
  if (session.player.starburstDamage <= 0 || session.player.starburstRadius <= 0) {
    return;
  }

  frameEvents.push({
    position: { ...position },
    span: session.player.starburstRadius,
    type: "starburst-rounds"
  });
  damageEnemiesInRadius(
    session,
    position,
    session.player.starburstRadius,
    session.player.starburstDamage,
    frameEvents,
    {
      allowStarburst: false,
      excludeEnemyId: sourceEnemyId
    }
  );
}

function damageEnemiesInRadius(
  session: GameSession,
  position: Vec2,
  radius: number,
  damage: number,
  frameEvents: FrameEvent[],
  options: {
    allowStarburst?: boolean;
    excludeEnemyId?: number;
  } = {}
): void {
  for (
    let enemyIndex = session.enemies.length - 1;
    enemyIndex >= 0;
    enemyIndex -= 1
  ) {
    const enemy = session.enemies[enemyIndex];
    if (options.excludeEnemyId === enemy.id) {
      continue;
    }

    if (
      distanceSquared(position, enemy.position) >
      (radius + enemy.radius) * (radius + enemy.radius)
    ) {
      continue;
    }

    damageEnemyAtIndex(session, enemyIndex, damage, frameEvents, {
      allowStarburst: options.allowStarburst ?? true,
      hitPosition: enemy.position
    });
  }
}

function findNearestEnemy(
  session: GameSession,
  origin: Vec2,
  maxRange: number
): EnemyState | null {
  let bestEnemy: EnemyState | null = null;
  let bestDistanceSquared = maxRange * maxRange;

  for (const enemy of session.enemies) {
    const candidateDistanceSquared = distanceSquared(origin, enemy.position);
    if (candidateDistanceSquared >= bestDistanceSquared) {
      continue;
    }

    bestEnemy = enemy;
    bestDistanceSquared = candidateDistanceSquared;
  }

  return bestEnemy;
}

function getOrbitPosition(
  center: Vec2,
  radius: number,
  index: number,
  count: number,
  elapsedSeconds: number,
  spinSpeed: number
): Vec2 {
  const angle = elapsedSeconds * spinSpeed + (Math.PI * 2 * index) / count;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function getPlayerProjectileOptions(
  session: GameSession,
  kind: ProjectileState["kind"]
): {
  bouncesRemaining: number;
  kind: ProjectileState["kind"];
  pierceRemaining: number;
} {
  return {
    bouncesRemaining: session.player.projectileBounces,
    kind,
    pierceRemaining: session.player.projectilePierce
  };
}

function updateComboTimer(session: GameSession, deltaSeconds: number): void {
  if (session.comboCount <= 0) {
    session.comboTimer = 0;
    return;
  }

  session.comboTimer = Math.max(0, session.comboTimer - deltaSeconds);

  if (session.comboTimer <= 0) {
    session.comboCount = 0;
  }
}

function registerKill(
  session: GameSession,
  enemy: EnemyState,
  frameEvents: FrameEvent[]
): void {
  session.comboCount += 1;
  session.comboTimer = COMBO_WINDOW_SECONDS;
  session.bestCombo = Math.max(session.bestCombo, session.comboCount);
  session.score += Math.round(
    enemy.rewardScore * (1 + Math.min(session.comboCount - 1, 8) * 0.16)
  );

  if (COMBO_MILESTONES.includes(session.comboCount)) {
    frameEvents.push({
      amount: session.comboCount,
      position: { ...enemy.position },
      type: "combo-surge"
    });
  }
}

function emitEnemyDeathEvents(
  session: GameSession,
  enemy: EnemyState,
  frameEvents: FrameEvent[]
): void {
  if (enemy.archetype === "overseer") {
    if (session.waveDirector.currentWave >= GAME_CONFIG.finalWave) {
      frameEvents.push({
        position: { ...enemy.position },
        type: "boss-collapse-start"
      });
    }

    frameEvents.push({
      position: { ...enemy.position },
      type: "boss-defeated"
    });
    return;
  }

  frameEvents.push({
    ...getEnemyEventMeta(enemy),
    position: { ...enemy.position },
    type: "enemy-killed"
  });
}

function getEnemyEventMeta(
  enemy: EnemyState
): Pick<FrameEvent, "enemyArchetype" | "enemyMutation" | "isElite"> {
  return {
    enemyArchetype: enemy.archetype,
    enemyMutation: enemy.mutation,
    isElite: enemy.isElite
  };
}

function dropEnemyRewards(
  session: GameSession,
  enemy: EnemyState,
  frameEvents: FrameEvent[]
): void {
  if (enemy.archetype === "overseer") {
    return;
  }

  session.rescueCharge += enemy.rewardScore * (enemy.isElite ? 1.35 : 1);

  for (let orbIndex = 0; orbIndex < enemy.rewardOrbCount; orbIndex += 1) {
    session.orbs.push(createOrbPickup(enemy.position));
  }

  if (
    session.rescues.length >= GAME_CONFIG.rescueDropLimit ||
    session.rescueCharge < GAME_CONFIG.rescueDropScoreThreshold
  ) {
    return;
  }

  const rescue = createRescuePickup(enemy.position);
  rescue.duration = GAME_CONFIG.rescueDropSeconds;
  rescue.timeRemaining = GAME_CONFIG.rescueDropSeconds;
  session.rescues.push(rescue);
  frameEvents.push({
    position: { ...rescue.position },
    type: "rescue-spawned"
  });
  session.rescueCharge = Math.max(
    0,
    session.rescueCharge - GAME_CONFIG.rescueDropScoreThreshold
  );
}

function spawnRescueBurstOrbs(session: GameSession, position: Vec2): void {
  const orbCount =
    GAME_CONFIG.rescueSaveOrbBurst + session.player.rescueOrbBurstBonus;

  for (let orbIndex = 0; orbIndex < orbCount; orbIndex += 1) {
    const angle = (Math.PI * 2 * orbIndex) / orbCount;
    session.orbs.push(
      createOrbPickup({
        x: position.x + Math.cos(angle) * 0.32,
        y: position.y + Math.sin(angle) * 0.32
      })
    );
  }
}

function applyEliteDeathBurst(
  session: GameSession,
  enemy: EnemyState,
  frameEvents: FrameEvent[]
): void {
  if (!enemy.isElite || enemy.deathBurstRadius <= 0 || enemy.deathBurstDamage <= 0) {
    return;
  }

  frameEvents.push({
    ...getEnemyEventMeta(enemy),
    position: { ...enemy.position },
    span: enemy.deathBurstRadius,
    type: "elite-burst"
  });
  session.dangerLevel = Math.max(session.dangerLevel, 0.85);

  if (
    distanceSquared(session.player.position, enemy.position) >
    (enemy.deathBurstRadius + session.player.radius) *
      (enemy.deathBurstRadius + session.player.radius)
  ) {
    return;
  }

  applyDamage(session.player, enemy.deathBurstDamage, {
    knockbackSource: enemy.position,
    knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.2,
    source: "elite-burst"
  });
}

function rotateVector(direction: Vec2, angleRadians: number): Vec2 {
  const cosine = Math.cos(angleRadians);
  const sine = Math.sin(angleRadians);

  return {
    x: direction.x * cosine - direction.y * sine,
    y: direction.x * sine + direction.y * cosine
  };
}

function updateArenaPurge(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): number {
  session.arenaPurgeCooldown = Math.max(0, session.arenaPurgeCooldown - deltaSeconds);

  const boss = session.enemies.find((enemy) => enemy.archetype === "overseer");
  const isBossPhaseTwo = boss?.phase === 2;
  const ambientChapterTwo =
    session.waveDirector.chapter >= 2 &&
    session.waveDirector.currentWave > GAME_CONFIG.chapterTransitionWave;

  if (session.arenaPurgeLanes.length === 0 && session.arenaPurgeCooldown <= 0) {
    if (isBossPhaseTwo) {
      scheduleArenaPurge(
        session,
        Math.random() < 0.5 ? [0, 2] : [1, 3],
        GAME_CONFIG.bossPurgeCooldown,
        frameEvents
      );
    } else if (ambientChapterTwo) {
      scheduleArenaPurge(
        session,
        [Math.floor(Math.random() * 4)],
        GAME_CONFIG.chapterTwoPurgeCooldown,
        frameEvents
      );
    }
  }

  let purgeDanger = 0;
  for (let laneIndex = session.arenaPurgeLanes.length - 1; laneIndex >= 0; laneIndex -= 1) {
    const lane = session.arenaPurgeLanes[laneIndex];
    lane.timeRemaining = Math.max(0, lane.timeRemaining - deltaSeconds);

    if (lane.phase === "warning") {
      purgeDanger = Math.max(purgeDanger, 0.45);
      if (lane.timeRemaining <= 0) {
        lane.phase = "active";
        lane.duration = GAME_CONFIG.arenaPurgeActiveSeconds;
        lane.timeRemaining = GAME_CONFIG.arenaPurgeActiveSeconds;
      }
      continue;
    }

    purgeDanger = Math.max(purgeDanger, 1);
    applyArenaPurgeDamage(session.player, lane, deltaSeconds);

    if (lane.timeRemaining <= 0) {
      session.arenaPurgeLanes.splice(laneIndex, 1);
    }
  }

  return purgeDanger;
}

function updateBossPulses(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): number {
  session.bossPulseCooldown = Math.max(0, session.bossPulseCooldown - deltaSeconds);

  const boss = session.enemies.find((enemy) => enemy.archetype === "overseer");
  const isFinalBossPhaseTwo =
    boss &&
    boss.phase === 2 &&
    session.waveDirector.currentWave >= GAME_CONFIG.finalWave &&
    boss.mode !== "exposed";

  if (
    isFinalBossPhaseTwo &&
    session.bossPulses.length === 0 &&
    session.bossPulseCooldown <= 0
  ) {
    scheduleBossPulse(session, boss, frameEvents);
  }

  let pulseDanger = 0;
  for (let pulseIndex = session.bossPulses.length - 1; pulseIndex >= 0; pulseIndex -= 1) {
    const pulse = session.bossPulses[pulseIndex];
    pulse.timeRemaining = Math.max(0, pulse.timeRemaining - deltaSeconds);

    if (pulse.phase === "warning") {
      pulseDanger = Math.max(pulseDanger, 0.55);

      if (pulse.timeRemaining <= 0) {
        pulse.phase = "active";
        pulse.duration = GAME_CONFIG.bossPulseActiveSeconds;
        pulse.timeRemaining = GAME_CONFIG.bossPulseActiveSeconds;
      }
      continue;
    }

    pulseDanger = Math.max(pulseDanger, 1);
    applyBossPulseDamage(session.player, pulse);

    if (pulse.timeRemaining <= 0) {
      if (boss && session.waveDirector.currentWave >= GAME_CONFIG.finalWave) {
        triggerBossExposeWindow(boss, frameEvents);
      }
      session.bossPulses.splice(pulseIndex, 1);
    }
  }

  return pulseDanger;
}

function updateArtilleryStrikes(
  session: GameSession,
  frameEvents: FrameEvent[],
  deltaSeconds: number
): number {
  let strikeDanger = 0;

  for (
    let strikeIndex = session.artilleryStrikes.length - 1;
    strikeIndex >= 0;
    strikeIndex -= 1
  ) {
    const strike = session.artilleryStrikes[strikeIndex];
    strike.timeRemaining = Math.max(0, strike.timeRemaining - deltaSeconds);

    if (strike.phase === "warning") {
      strikeDanger = Math.max(strikeDanger, 0.62);

      if (strike.timeRemaining <= 0) {
        strike.phase = "active";
        strike.duration = GAME_CONFIG.artilleryImpactSeconds;
        strike.timeRemaining = GAME_CONFIG.artilleryImpactSeconds;
        detonateArtilleryStrike(session.player, strike);
        frameEvents.push({
          amount: strike.damage,
          position: { ...strike.position },
          span: strike.radius,
          type: "artillery-impact"
        });
      }

      continue;
    }

    strikeDanger = Math.max(strikeDanger, 0.95);

    if (strike.timeRemaining <= 0) {
      session.artilleryStrikes.splice(strikeIndex, 1);
    }
  }

  return strikeDanger;
}

function scheduleArenaPurge(
  session: GameSession,
  laneIndexes: number[],
  cooldown: number,
  frameEvents: FrameEvent[]
): void {
  session.arenaPurgeCooldown = cooldown;
  session.arenaPurgeLanes = laneIndexes.map((laneIndex) => ({
    duration: GAME_CONFIG.arenaPurgeWarningSeconds,
    laneIndex,
    phase: "warning" as const,
    timeRemaining: GAME_CONFIG.arenaPurgeWarningSeconds
  }));

  frameEvents.push({
    position: { x: 0, y: 0 },
    type: "arena-purge-start"
  });
}

function scheduleBossPulse(
  session: GameSession,
  boss: EnemyState,
  frameEvents: FrameEvent[]
): void {
  const healthRatio = boss.health / boss.maxHealth;
  session.bossPulseCooldown =
    GAME_CONFIG.bossPulseCooldown *
    (healthRatio < 0.35 ? 0.76 : healthRatio < 0.55 ? 0.88 : 1);
  session.bossPulses = [
    {
      duration: GAME_CONFIG.bossPulseWarningSeconds,
      origin: { ...boss.position },
      phase: "warning",
      timeRemaining: GAME_CONFIG.bossPulseWarningSeconds
    }
  ];

  frameEvents.push({
    position: { ...boss.position },
    type: "boss-phase-pulse-start"
  });
}

function triggerBossExposeWindow(
  boss: EnemyState,
  frameEvents: FrameEvent[]
): void {
  if (boss.archetype !== "overseer" || boss.phase !== 2 || boss.health <= 0) {
    return;
  }

  boss.mode = "exposed";
  boss.modeTimer = GAME_CONFIG.bossExposeSeconds;
  boss.velocity = { x: 0, y: 0 };
  boss.attackCooldownRemaining = Math.max(boss.attackCooldownRemaining, 0.55);
  boss.chargeCooldownRemaining = Math.max(
    boss.chargeCooldownRemaining,
    GAME_CONFIG.bossExposeSeconds + 0.4
  );
  boss.patternSign = -1;

  frameEvents.push({
    position: { ...boss.position },
    span: boss.radius + 1.35,
    type: "boss-core-exposed"
  });
}

function applyArenaPurgeDamage(
  player: PlayerState,
  lane: ArenaPurgeLaneState,
  deltaSeconds: number
): void {
  const angle = (Math.PI / 4) * lane.laneIndex;
  const lineNormal = {
    x: -Math.sin(angle),
    y: Math.cos(angle)
  };
  const distanceToLane = Math.abs(
    player.position.x * lineNormal.x + player.position.y * lineNormal.y
  );

  if (distanceToLane > GAME_CONFIG.arenaPurgeLaneWidth * 0.5) {
    return;
  }

  applyDamage(player, GAME_CONFIG.arenaPurgeDamagePerSecond * deltaSeconds, {
    bypassInvulnerability: true,
    source: "purge"
  });
}

function detonateArtilleryStrike(
  player: PlayerState,
  strike: ArtilleryStrikeState
): void {
  const strikeHitRadius = strike.radius + player.radius;
  if (
    distanceSquared(player.position, strike.position) >
    strikeHitRadius * strikeHitRadius
  ) {
    return;
  }

  applyDamage(player, strike.damage, {
    knockbackSource: strike.position,
    knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.3,
    source: "artillery"
  });
}

function applyBossPulseDamage(
  player: PlayerState,
  pulse: BossPulseState
): void {
  const radius = getBossPulseRadius(pulse);
  const distanceToPulse = Math.abs(distance(player.position, pulse.origin) - radius);

  if (distanceToPulse > GAME_CONFIG.bossPulseBandWidth * 0.5) {
    return;
  }

  applyDamage(player, GAME_CONFIG.bossPulseDamage, {
    knockbackSource: pulse.origin,
    knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.35,
    source: "boss-pulse"
  });
}

function getBossPulseRadius(pulse: BossPulseState): number {
  if (pulse.phase === "warning") {
    return GAME_CONFIG.bossPulseStartRadius;
  }

  const progress = 1 - pulse.timeRemaining / pulse.duration;
  return (
    GAME_CONFIG.bossPulseStartRadius +
    (GAME_CONFIG.bossPulseEndRadius - GAME_CONFIG.bossPulseStartRadius) * progress
  );
}

function spawnPlayerVolley(
  session: GameSession,
  origin: Vec2,
  direction: Vec2
): void {
  const projectileCount = session.player.projectileCount;

  if (projectileCount <= 1) {
    spawnProjectile(
      session.projectiles,
      origin,
      direction,
      session.player.projectileDamage,
      getPlayerProjectileOptions(session, "player")
    );
    return;
  }

  const middleIndex = (projectileCount - 1) / 2;

  for (let index = 0; index < projectileCount; index += 1) {
    const spreadOffset = (index - middleIndex) * session.player.projectileSpread;
    spawnProjectile(
      session.projectiles,
      origin,
      normalize(rotateVector(direction, spreadOffset)),
      session.player.projectileDamage,
      getPlayerProjectileOptions(session, "player")
    );
  }
}
