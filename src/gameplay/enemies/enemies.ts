import { GAME_CONFIG } from "../../core/config";
import type { FrameEvent } from "../events";
import {
  add,
  clamp,
  clampLength,
  distance,
  lengthSquared,
  normalizeOrZero,
  scale,
  subtract,
  type Vec2
} from "../math";
import { applyDamage, type PlayerState } from "../player/player";

export type EnemyArchetype =
  | "drone"
  | "charger"
  | "sentry"
  | "artillery"
  | "relay"
  | "overseer";
export type EnemyMutation = "bulwark" | "overclocked" | "volatile";
export type EnemyMode =
  | "chase"
  | "windup"
  | "dash"
  | "recover"
  | "aim"
  | "fire"
  | "exposed";

export interface EnemySpawnDefinition {
  archetype: EnemyArchetype;
  id?: number;
  level: number;
  mutation?: EnemyMutation | null;
  position: Vec2;
}

export interface EnemyState {
  archetype: EnemyArchetype;
  attackCooldownRemaining: number;
  damageResistance: number;
  chargeCooldownRemaining: number;
  chargeDirection: Vec2;
  chaseSpeed: number;
  contactDamage: number;
  dashChargesRemaining: number;
  damageFlash: number;
  dashSpeed: number;
  deathBurstDamage: number;
  deathBurstRadius: number;
  facing: Vec2;
  health: number;
  id: number;
  isElite: boolean;
  lockTarget: Vec2;
  maxHealth: number;
  mode: EnemyMode;
  modeTimer: number;
  mutation: EnemyMutation | null;
  phase: number;
  patternSign: number;
  position: Vec2;
  radius: number;
  rewardOrbCount: number;
  rewardScore: number;
  spawnGraceRemaining: number;
  supportPulseRemaining: number;
  supportRadius: number;
  supported: boolean;
  velocity: Vec2;
}

export interface EnemyVisualSnapshot {
  archetype: EnemyArchetype;
  damageFlash: number;
  facing: Vec2;
  healthRatio: number;
  id: number;
  isElite: boolean;
  lockTarget: Vec2;
  mode: EnemyMode;
  mutation: EnemyMutation | null;
  phase: number;
  position: Vec2;
  radius: number;
  spawnRatio: number;
  supportPulseRatio: number;
  supported: boolean;
}

export function createEnemy(definition: EnemySpawnDefinition): EnemyState {
  const enemy = (() => {
    switch (definition.archetype) {
      case "charger":
        return createCharger(definition.level, definition.position);
      case "sentry":
        return createSentry(definition.level, definition.position);
      case "artillery":
        return createArtillery(definition.level, definition.position);
      case "relay":
        return createRelay(definition.level, definition.position);
      case "overseer":
        return createOverseer(definition.level, definition.position);
      default:
        return createDrone(definition.level, definition.position);
    }
  })();

  if (definition.mutation && definition.archetype !== "overseer") {
    applyEliteMutation(enemy, definition.mutation, definition.level);
  }

  enemy.id = definition.id ?? -1;
  return enemy;
}

export function damageEnemy(enemy: EnemyState, damage: number): boolean {
  const damageMultiplier =
    enemy.archetype === "overseer" && enemy.mode === "exposed"
      ? GAME_CONFIG.bossExposeDamageMultiplier
      : 1 - enemy.damageResistance;
  enemy.health = clamp(enemy.health - damage * damageMultiplier, 0, enemy.maxHealth);
  enemy.damageFlash = 1;
  return enemy.health <= 0;
}

export function getEnemyVisuals(enemies: EnemyState[]): EnemyVisualSnapshot[] {
  return enemies.map((enemy) => ({
    archetype: enemy.archetype,
    damageFlash: enemy.damageFlash,
    facing: enemy.facing,
    healthRatio: enemy.health / enemy.maxHealth,
    id: enemy.id,
    isElite: enemy.isElite,
    lockTarget: { ...enemy.lockTarget },
    mode: enemy.mode,
    mutation: enemy.mutation,
    phase: enemy.phase,
    position: enemy.position,
    radius: enemy.radius,
    spawnRatio:
      1 -
      enemy.spawnGraceRemaining / GAME_CONFIG.spawnGraceSeconds,
    supportPulseRatio:
      enemy.archetype === "relay"
        ? enemy.supportPulseRemaining / GAME_CONFIG.relayPulseSeconds
        : enemy.supported
          ? 1
          : 0,
    supported: enemy.supported
  }));
}

export function updateEnemies(
  enemies: EnemyState[],
  player: PlayerState,
  deltaSeconds: number,
  frameEvents: FrameEvent[]
): void {
  for (const enemy of enemies) {
    enemy.attackCooldownRemaining = Math.max(
      0,
      enemy.attackCooldownRemaining - deltaSeconds
    );
    enemy.damageResistance = 0;
    enemy.chargeCooldownRemaining = Math.max(
      0,
      enemy.chargeCooldownRemaining - deltaSeconds
    );
    enemy.damageFlash = Math.max(0, enemy.damageFlash - deltaSeconds * 3);
    enemy.modeTimer = Math.max(0, enemy.modeTimer - deltaSeconds);
    enemy.spawnGraceRemaining = Math.max(
      0,
      enemy.spawnGraceRemaining - deltaSeconds
    );
    enemy.supportPulseRemaining = Math.max(
      0,
      enemy.supportPulseRemaining - deltaSeconds
    );
    enemy.supported = false;

    switch (enemy.archetype) {
      case "charger":
        updateCharger(enemy, player);
        break;
      case "sentry":
        updateSentry(enemy, player, frameEvents);
        break;
      case "artillery":
        updateArtillery(enemy, player, frameEvents);
        break;
      case "relay":
        updateRelay(enemy, player, frameEvents);
        break;
      case "overseer":
        updateOverseer(enemy, player, frameEvents);
        break;
      default:
        updateDrone(enemy, player);
        break;
    }

    enemy.position = clampLength(
      add(enemy.position, scale(enemy.velocity, deltaSeconds)),
      GAME_CONFIG.arenaHardLimit + 2.5
    );
  }

  applyRelaySupport(enemies);
}

function createDrone(level: number, position: Vec2): EnemyState {
  return {
    archetype: "drone",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 0,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 2.9 + level * 0.16,
    contactDamage: 10 + level * 1.2,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 0,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 28 + level * 8,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 28 + level * 8,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: 0,
    position: { ...position },
    radius: 0.68,
    rewardOrbCount: 1,
    rewardScore: 25,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: 0,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function createCharger(level: number, position: Vec2): EnemyState {
  return {
    archetype: "charger",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 1.2,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 2.15 + level * 0.12,
    contactDamage: 18 + level * 2.4,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 12.5 + level * 0.65,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 56 + level * 14,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 56 + level * 14,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: 0,
    position: { ...position },
    radius: 0.88,
    rewardOrbCount: 1,
    rewardScore: 45,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: 0,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function createSentry(level: number, position: Vec2): EnemyState {
  return {
    archetype: "sentry",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 1.4,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 2.45 + level * 0.1,
    contactDamage: 8 + level * 0.9,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 0,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 34 + level * 10,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 34 + level * 10,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: Math.random() < 0.5 ? -1 : 1,
    position: { ...position },
    radius: 0.74,
    rewardOrbCount: 1,
    rewardScore: 55,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: 0,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function createArtillery(level: number, position: Vec2): EnemyState {
  return {
    archetype: "artillery",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 1.25,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 2.1 + level * 0.09,
    contactDamage: 9 + level * 1.05,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 0,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 44 + level * 12,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 44 + level * 12,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: Math.random() < 0.5 ? -1 : 1,
    position: { ...position },
    radius: 0.82,
    rewardOrbCount: 1,
    rewardScore: 62,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: 0,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function createRelay(level: number, position: Vec2): EnemyState {
  return {
    archetype: "relay",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 1.8,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 2.35 + level * 0.08,
    contactDamage: 7 + level * 0.7,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 0,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 52 + level * 13,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 52 + level * 13,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: Math.random() < 0.5 ? -1 : 1,
    position: { ...position },
    radius: 0.86,
    rewardOrbCount: 2,
    rewardScore: 70,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: GAME_CONFIG.relaySupportRadius,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function createOverseer(level: number, position: Vec2): EnemyState {
  return {
    archetype: "overseer",
    attackCooldownRemaining: 0,
    damageResistance: 0,
    chargeCooldownRemaining: 2.4,
    chargeDirection: { x: 0, y: 1 },
    chaseSpeed: 1.85 + level * 0.08,
    contactDamage: 34 + level * 3.4,
    dashChargesRemaining: 0,
    damageFlash: 0,
    dashSpeed: 15.2 + level * 0.6,
    deathBurstDamage: 0,
    deathBurstRadius: 0,
    facing: { x: 0, y: 1 },
    health: 360 + level * 46,
    id: -1,
    isElite: false,
    lockTarget: { ...position },
    maxHealth: 360 + level * 46,
    mode: "chase",
    modeTimer: 0,
    mutation: null,
    phase: 1,
    patternSign: -1,
    position: { ...position },
    radius: 1.45,
    rewardOrbCount: 0,
    rewardScore: 250,
    spawnGraceRemaining: GAME_CONFIG.spawnGraceSeconds,
    supportPulseRemaining: 0,
    supportRadius: 0,
    supported: false,
    velocity: { x: 0, y: 0 }
  };
}

function applyEliteMutation(
  enemy: EnemyState,
  mutation: EnemyMutation,
  level: number
): void {
  enemy.isElite = true;
  enemy.mutation = mutation;
  enemy.rewardOrbCount += GAME_CONFIG.eliteBonusOrbs;
  enemy.rewardScore = Math.round(
    enemy.rewardScore * GAME_CONFIG.eliteScoreMultiplier
  );

  switch (mutation) {
    case "overclocked":
      enemy.chaseSpeed *= 1.22;
      enemy.dashSpeed *= enemy.dashSpeed > 0 ? 1.18 : 1;
      enemy.contactDamage *= 1.16;
      enemy.health *= 1.14;
      enemy.maxHealth *= 1.14;
      if (enemy.archetype === "relay") {
        enemy.supportRadius *= 1.12;
      }
      break;
    case "bulwark":
      enemy.chaseSpeed *= 0.92;
      enemy.contactDamage *= 1.24;
      enemy.health *= 1.72;
      enemy.maxHealth *= 1.72;
      enemy.radius *= 1.14;
      if (enemy.archetype === "relay") {
        enemy.supportRadius *= 1.2;
      }
      break;
    case "volatile":
      enemy.chaseSpeed *= 1.08;
      enemy.dashSpeed *= enemy.dashSpeed > 0 ? 1.08 : 1;
      enemy.contactDamage *= 1.1;
      enemy.health *= 1.26;
      enemy.maxHealth *= 1.26;
      enemy.deathBurstDamage =
        GAME_CONFIG.eliteVolatileBurstDamage + level * 1.6;
      enemy.deathBurstRadius = GAME_CONFIG.eliteVolatileBurstRadius;
      if (enemy.archetype === "relay") {
        enemy.supportRadius *= 1.08;
      }
      break;
  }
}

function getEffectiveChaseSpeed(enemy: EnemyState): number {
  return enemy.chaseSpeed * (enemy.supported ? 1 + GAME_CONFIG.relaySpeedBoost : 1);
}

function updateDrone(enemy: EnemyState, player: PlayerState): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const chaseSpeed = getEffectiveChaseSpeed(enemy);

  if (lengthSquared(direction) > 0) {
    enemy.facing = direction;
  }

  enemy.mode = "chase";
  enemy.velocity = scale(
    direction,
    chaseSpeed * (enemy.spawnGraceRemaining > 0 ? 0.28 : 1)
  );

  if (enemy.spawnGraceRemaining > 0) {
    return;
  }

  if (
    distance(enemy.position, player.position) <=
      enemy.radius + player.radius + 0.14 &&
      enemy.attackCooldownRemaining <= 0
  ) {
    if (
      applyDamage(player, enemy.contactDamage, {
        knockbackSource: enemy.position,
        source: enemy.archetype
      })
    ) {
      enemy.attackCooldownRemaining = 0.72;
    }
  }
}

function updateCharger(enemy: EnemyState, player: PlayerState): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const playerDistance = distance(enemy.position, player.position);
  const chaseSpeed = getEffectiveChaseSpeed(enemy);

  if (lengthSquared(direction) > 0) {
    enemy.facing = direction;
  }

  if (enemy.spawnGraceRemaining > 0) {
    enemy.mode = "recover";
    enemy.velocity = scale(direction, chaseSpeed * 0.16);
    return;
  }

  switch (enemy.mode) {
    case "chase": {
      enemy.velocity = scale(direction, chaseSpeed);

      if (
        playerDistance <= enemy.radius + player.radius + 0.18 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage * 0.35, {
            knockbackSource: enemy.position,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 1.1;
        }
      }

      if (enemy.chargeCooldownRemaining <= 0 && playerDistance < 9.5) {
        enemy.mode = "windup";
        enemy.modeTimer = 0.45;
        enemy.dashChargesRemaining =
          enemy.isElite && enemy.mutation === "overclocked"
            ? 2
            : enemy.isElite
              ? 1
              : 0;
        enemy.chargeDirection =
          lengthSquared(direction) > 0 ? direction : enemy.facing;
        enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.18);
      }
      break;
    }

    case "windup": {
      enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.12);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "dash";
        enemy.modeTimer = 0.34;
        enemy.velocity = scale(enemy.chargeDirection, enemy.dashSpeed);
      }
      break;
    }

    case "dash": {
      enemy.velocity = scale(enemy.chargeDirection, enemy.dashSpeed);

      if (
        playerDistance <= enemy.radius + player.radius + 0.22 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage, {
            knockbackSource: enemy.position,
            knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.2,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 1.25;
          enemy.chargeCooldownRemaining = 2.7;
          enemy.mode = "recover";
          enemy.modeTimer = 0.4;
          enemy.velocity = { x: 0, y: 0 };
          return;
        }
      }

      if (enemy.modeTimer <= 0) {
        if (enemy.dashChargesRemaining > 0) {
          enemy.dashChargesRemaining = Math.max(0, enemy.dashChargesRemaining - 1);
          enemy.mode = "windup";
          enemy.modeTimer = enemy.isElite ? 0.22 : 0.3;
          enemy.chargeDirection =
            lengthSquared(direction) > 0 ? direction : enemy.facing;
          enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.1);
          break;
        }

        enemy.chargeCooldownRemaining = 2.7;
        enemy.mode = "recover";
        enemy.modeTimer = 0.4;
        enemy.velocity = { x: 0, y: 0 };
      }
      break;
    }

    case "recover": {
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.mode = "chase";
      }
      break;
    }

    case "exposed": {
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.mode = "recover";
        enemy.modeTimer = 0.52;
        enemy.chargeCooldownRemaining = Math.max(enemy.chargeCooldownRemaining, 1.2);
        enemy.attackCooldownRemaining = Math.max(enemy.attackCooldownRemaining, 0.5);
        enemy.patternSign = -1;
      }
      break;
    }
  }
}

function updateSentry(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const playerDistance = distance(enemy.position, player.position);
  const chaseSpeed = getEffectiveChaseSpeed(enemy);
  const strafeDirection = {
    x: -direction.y * (enemy.patternSign || 1),
    y: direction.x * (enemy.patternSign || 1)
  };

  if (lengthSquared(direction) > 0 && enemy.mode !== "aim" && enemy.mode !== "fire") {
    enemy.facing = direction;
  }

  if (enemy.spawnGraceRemaining > 0) {
    enemy.mode = "recover";
    enemy.velocity = scale(direction, chaseSpeed * 0.12);
    return;
  }

  switch (enemy.mode) {
    case "chase": {
      if (
        playerDistance <= enemy.radius + player.radius + 0.08 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage, {
            knockbackSource: enemy.position,
            knockbackDistance: GAME_CONFIG.player.damageKnockback * 0.7,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 0.72;
        }
      }

      if (playerDistance < 5.6) {
        enemy.velocity = add(
          scale(direction, -chaseSpeed * 0.92),
          scale(strafeDirection, chaseSpeed * 0.42)
        );
      } else if (playerDistance > 10.8) {
        enemy.velocity = scale(direction, chaseSpeed * 0.82);
      } else {
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.74);
      }

      if (lengthSquared(direction) > 0) {
        enemy.facing = normalizeOrZero(
          add(scale(direction, 0.72), scale(strafeDirection, 0.28))
        );
      }

      if (
        enemy.chargeCooldownRemaining <= 0 &&
        playerDistance >= 4.8 &&
        playerDistance <= 13.8
      ) {
        enemy.mode = "aim";
        enemy.modeTimer = 0.72;
        enemy.chargeDirection =
          lengthSquared(direction) > 0 ? direction : enemy.facing;
        enemy.facing = enemy.chargeDirection;
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.16);
      }
      break;
    }

    case "aim": {
      if (lengthSquared(direction) > 0) {
        enemy.chargeDirection = normalizeOrZero(
          add(scale(enemy.chargeDirection, 0.7), scale(direction, 0.3))
        );
        enemy.facing = enemy.chargeDirection;
      }

      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.14);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "fire";
        enemy.modeTimer = 0.12;
        enemy.chargeCooldownRemaining = 1.85;
        enemy.velocity = { x: 0, y: 0 };
        fireSentryShot(enemy, player, frameEvents);
      }
      break;
    }

    case "fire": {
      enemy.facing = enemy.chargeDirection;
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.mode = "recover";
        enemy.modeTimer = 0.34;
      }
      break;
    }

    case "recover": {
      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.22);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "chase";
      }
      break;
    }
  }
}

function updateArtillery(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const playerDistance = distance(enemy.position, player.position);
  const chaseSpeed = getEffectiveChaseSpeed(enemy);
  const strafeDirection = {
    x: -direction.y * (enemy.patternSign || 1),
    y: direction.x * (enemy.patternSign || 1)
  };

  if (
    lengthSquared(direction) > 0 &&
    enemy.mode !== "aim" &&
    enemy.mode !== "fire"
  ) {
    enemy.facing = direction;
  }

  if (enemy.spawnGraceRemaining > 0) {
    enemy.mode = "recover";
    enemy.velocity = scale(direction, chaseSpeed * 0.1);
    return;
  }

  switch (enemy.mode) {
    case "chase": {
      if (
        playerDistance <= enemy.radius + player.radius + 0.08 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage, {
            knockbackSource: enemy.position,
            knockbackDistance: GAME_CONFIG.player.damageKnockback * 0.82,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 0.82;
        }
      }

      if (playerDistance < 7.6) {
        enemy.velocity = add(
          scale(direction, -chaseSpeed * 1.02),
          scale(strafeDirection, chaseSpeed * 0.5)
        );
      } else if (playerDistance > 14.8) {
        enemy.velocity = add(
          scale(direction, chaseSpeed * 0.78),
          scale(strafeDirection, chaseSpeed * 0.24)
        );
      } else {
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.78);
      }

      if (lengthSquared(direction) > 0) {
        enemy.facing = normalizeOrZero(
          add(scale(direction, 0.8), scale(strafeDirection, 0.2))
        );
      }

      if (
        enemy.chargeCooldownRemaining <= 0 &&
        playerDistance >= 5.8 &&
        playerDistance <= 16.6
      ) {
        enemy.mode = "aim";
        enemy.modeTimer =
          enemy.isElite && enemy.mutation === "overclocked" ? 0.58 : 0.76;
        enemy.chargeDirection = lengthSquared(direction) > 0 ? direction : enemy.facing;
        enemy.lockTarget = clampLength(
          add(player.position, scale(player.velocity, 0.3)),
          GAME_CONFIG.arenaRadius - 0.8
        );
        enemy.facing = normalizeOrZero(subtract(enemy.lockTarget, enemy.position));
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.12);
      }
      break;
    }

    case "aim": {
      const predictedTarget = clampLength(
        add(
          player.position,
          scale(player.velocity, enemy.isElite ? 0.42 : 0.28)
        ),
        GAME_CONFIG.arenaRadius - 0.8
      );
      enemy.lockTarget = {
        x: enemy.lockTarget.x + (predictedTarget.x - enemy.lockTarget.x) * 0.18,
        y: enemy.lockTarget.y + (predictedTarget.y - enemy.lockTarget.y) * 0.18
      };
      enemy.chargeDirection = normalizeOrZero(
        subtract(enemy.lockTarget, enemy.position)
      );
      if (lengthSquared(enemy.chargeDirection) > 0) {
        enemy.facing = enemy.chargeDirection;
      }
      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.1);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "fire";
        enemy.modeTimer = 0.16;
        enemy.velocity = { x: 0, y: 0 };
        enemy.chargeCooldownRemaining =
          enemy.isElite && enemy.mutation === "overclocked" ? 2.2 : 2.75;
        fireArtilleryLock(enemy, frameEvents);
      }
      break;
    }

    case "fire": {
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.mode = "recover";
        enemy.modeTimer = 0.32;
        enemy.patternSign *= -1;
      }
      break;
    }

    case "recover": {
      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.18);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "chase";
      }
      break;
    }
  }
}

function updateRelay(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const playerDistance = distance(enemy.position, player.position);
  const chaseSpeed = getEffectiveChaseSpeed(enemy);
  const strafeDirection = {
    x: -direction.y * (enemy.patternSign || 1),
    y: direction.x * (enemy.patternSign || 1)
  };

  if (lengthSquared(direction) > 0 && enemy.mode !== "aim" && enemy.mode !== "fire") {
    enemy.facing = direction;
  }

  if (enemy.spawnGraceRemaining > 0) {
    enemy.mode = "recover";
    enemy.velocity = scale(direction, chaseSpeed * 0.12);
    return;
  }

  switch (enemy.mode) {
    case "chase": {
      if (
        playerDistance <= enemy.radius + player.radius + 0.08 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage * 0.85, {
            knockbackSource: enemy.position,
            knockbackDistance: GAME_CONFIG.player.damageKnockback * 0.75,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 0.88;
        }
      }

      if (playerDistance < 6.4) {
        enemy.velocity = add(
          scale(direction, -chaseSpeed * 0.94),
          scale(strafeDirection, chaseSpeed * 0.42)
        );
      } else if (playerDistance > 12.8) {
        enemy.velocity = add(
          scale(direction, chaseSpeed * 0.72),
          scale(strafeDirection, chaseSpeed * 0.18)
        );
      } else {
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.68);
      }

      if (lengthSquared(direction) > 0) {
        enemy.facing = normalizeOrZero(
          add(scale(direction, 0.62), scale(strafeDirection, 0.38))
        );
      }

      if (
        enemy.chargeCooldownRemaining <= 0 &&
        playerDistance >= 4.6 &&
        playerDistance <= 15.2
      ) {
        enemy.mode = "aim";
        enemy.modeTimer =
          enemy.isElite && enemy.mutation === "overclocked" ? 0.46 : 0.58;
        enemy.chargeDirection =
          lengthSquared(direction) > 0 ? direction : enemy.facing;
        enemy.facing = enemy.chargeDirection;
        enemy.velocity = scale(strafeDirection, chaseSpeed * 0.16);
      }
      break;
    }

    case "aim": {
      if (lengthSquared(direction) > 0) {
        enemy.chargeDirection = normalizeOrZero(
          add(scale(enemy.chargeDirection, 0.64), scale(direction, 0.36))
        );
        enemy.facing = enemy.chargeDirection;
      }

      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.18);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "fire";
        enemy.modeTimer = 0.18;
        enemy.velocity = { x: 0, y: 0 };
        enemy.supportPulseRemaining =
          GAME_CONFIG.relayPulseSeconds *
          (enemy.isElite && enemy.mutation === "overclocked" ? 1.15 : 1);
        enemy.chargeCooldownRemaining =
          enemy.isElite && enemy.mutation === "overclocked" ? 3.2 : 4.1;
        frameEvents.push({
          position: { ...enemy.position },
          span: enemy.supportRadius,
          type: "relay-boost-start"
        });
      }
      break;
    }

    case "fire": {
      enemy.facing = enemy.chargeDirection;
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.mode = "recover";
        enemy.modeTimer = 0.34;
        enemy.patternSign *= -1;
      }
      break;
    }

    case "recover": {
      enemy.velocity = scale(strafeDirection, chaseSpeed * 0.2);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "chase";
      }
      break;
    }
  }
}

function updateOverseer(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const toPlayer = subtract(player.position, enemy.position);
  const direction = normalizeOrZero(toPlayer);
  const playerDistance = distance(enemy.position, player.position);
  const healthRatio = enemy.health / enemy.maxHealth;
  const chaseSpeed = getEffectiveChaseSpeed(enemy);

  if (enemy.phase === 1 && healthRatio <= 0.5) {
    enemy.phase = 2;
    enemy.mode = "recover";
    enemy.modeTimer = 0.9;
    enemy.chargeCooldownRemaining = 0.95;
    enemy.attackCooldownRemaining = 0.55;
    enemy.patternSign = 1;
    enemy.velocity = { x: 0, y: 0 };
    frameEvents.push({
      position: { ...enemy.position },
      type: "boss-phase-shift"
    });
  }

  const chargesPerBurst =
    enemy.phase === 2
      ? healthRatio < 0.32
        ? 5
        : 4
      : healthRatio < 0.55
        ? 4
        : 3;

  if (lengthSquared(direction) > 0) {
    enemy.facing = direction;
  }

  if (enemy.spawnGraceRemaining > 0) {
    enemy.mode = "recover";
    enemy.velocity = scale(direction, chaseSpeed * 0.12);
    return;
  }

  switch (enemy.mode) {
    case "chase": {
      enemy.velocity = scale(
        direction,
        chaseSpeed * (enemy.phase === 2 ? 1.16 : 1)
      );

      if (
        playerDistance <= enemy.radius + player.radius + 0.24 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage * (enemy.phase === 2 ? 0.55 : 0.45), {
            knockbackSource: enemy.position,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 1;
        }
      }

      if (
        enemy.chargeCooldownRemaining <= 0 &&
        playerDistance < (enemy.phase === 2 ? 14.6 : 12.5)
      ) {
        if (enemy.phase === 2 && enemy.patternSign > 0) {
          enemy.mode = "aim";
          enemy.modeTimer = 0.62;
          enemy.dashChargesRemaining = healthRatio < 0.28 ? 4 : 3;
          enemy.chargeDirection =
            lengthSquared(direction) > 0 ? direction : enemy.facing;
          enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.05);
        } else {
          enemy.mode = "windup";
          enemy.modeTimer =
            enemy.phase === 2
              ? healthRatio < 0.42
                ? 0.38
                : 0.44
              : healthRatio < 0.55
                ? 0.46
                : 0.58;
          enemy.dashChargesRemaining = chargesPerBurst;
          enemy.chargeDirection =
            lengthSquared(direction) > 0 ? direction : enemy.facing;
          enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.08);
        }
      }
      break;
    }

    case "aim": {
      if (lengthSquared(direction) > 0) {
        enemy.chargeDirection = normalizeOrZero(
          add(scale(enemy.chargeDirection, 0.68), scale(direction, 0.32))
        );
        enemy.facing = enemy.chargeDirection;
      }

      enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.04);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "fire";
        enemy.modeTimer = 0.16;
        enemy.velocity = { x: 0, y: 0 };
        fireOverseerBeam(enemy, player, frameEvents);
      }
      break;
    }

    case "fire": {
      enemy.velocity = { x: 0, y: 0 };

      if (enemy.modeTimer <= 0) {
        enemy.dashChargesRemaining = Math.max(0, enemy.dashChargesRemaining - 1);

        if (enemy.dashChargesRemaining > 0) {
          enemy.mode = "aim";
          enemy.modeTimer = 0.18;
          enemy.chargeDirection =
            lengthSquared(direction) > 0 ? direction : enemy.facing;
        } else {
          enemy.chargeCooldownRemaining = 1.28;
          enemy.mode = "recover";
          enemy.modeTimer = 0.62;
          enemy.patternSign = -1;
        }
      }
      break;
    }

    case "windup": {
      if (lengthSquared(direction) > 0) {
        enemy.chargeDirection = direction;
      }

      enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.06);

      if (enemy.modeTimer <= 0) {
        enemy.mode = "dash";
        enemy.modeTimer = 0.5;
        enemy.velocity = scale(enemy.chargeDirection, enemy.dashSpeed);
      }
      break;
    }

    case "dash": {
      enemy.velocity = scale(enemy.chargeDirection, enemy.dashSpeed);

      if (
        playerDistance <= enemy.radius + player.radius + 0.28 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage, {
            knockbackSource: enemy.position,
            knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.45,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 1.2;
        }
      }

      if (enemy.modeTimer <= 0) {
        enemy.dashChargesRemaining = Math.max(0, enemy.dashChargesRemaining - 1);

        if (enemy.dashChargesRemaining > 0) {
          enemy.mode = "windup";
          enemy.modeTimer = 0.24;
          enemy.chargeDirection =
            lengthSquared(direction) > 0 ? direction : enemy.facing;
          enemy.velocity = scale(enemy.chargeDirection, chaseSpeed * 0.05);
        } else {
          enemy.chargeCooldownRemaining = healthRatio < 0.55 ? 1.15 : 1.7;
          enemy.mode = "recover";
          enemy.modeTimer = 0.55;
          enemy.patternSign = enemy.phase === 2 ? 1 : enemy.patternSign;
          enemy.velocity = { x: 0, y: 0 };
        }
      }
      break;
    }

    case "recover": {
      enemy.velocity = { x: 0, y: 0 };

      if (
        playerDistance <= enemy.radius + player.radius + 0.18 &&
        enemy.attackCooldownRemaining <= 0
      ) {
        if (
          applyDamage(player, enemy.contactDamage * 0.25, {
            knockbackSource: enemy.position,
            source: enemy.archetype
          })
        ) {
          enemy.attackCooldownRemaining = 0.9;
        }
      }

      if (enemy.modeTimer <= 0) {
        enemy.mode = "chase";
      }
      break;
    }
  }
}

function applyRelaySupport(enemies: EnemyState[]): void {
  const activeRelays = enemies.filter(
    (enemy) =>
      enemy.archetype === "relay" &&
      enemy.spawnGraceRemaining <= 0 &&
      enemy.supportPulseRemaining > 0
  );

  if (activeRelays.length === 0) {
    return;
  }

  for (const enemy of enemies) {
    if (enemy.archetype === "relay" || enemy.archetype === "overseer") {
      continue;
    }

    for (const relay of activeRelays) {
      if (
        distance(enemy.position, relay.position) <=
        relay.supportRadius + enemy.radius
      ) {
        enemy.supported = true;
        enemy.damageResistance = Math.max(
          enemy.damageResistance,
          GAME_CONFIG.relayDamageReduction
        );
        break;
      }
    }
  }
}

function fireArtilleryLock(enemy: EnemyState, frameEvents: FrameEvent[]): void {
  const shotDirection = normalizeOrZero(subtract(enemy.lockTarget, enemy.position));
  const strikeRadius =
    GAME_CONFIG.artilleryBaseRadius *
    (enemy.isElite && enemy.mutation === "bulwark" ? 1.18 : 1);
  const strikeDamage =
    GAME_CONFIG.artilleryBaseDamage *
    (enemy.isElite && enemy.mutation === "volatile" ? 1.18 : 1) *
    (enemy.isElite ? 1.08 : 1);

  frameEvents.push({
    direction: shotDirection,
    position: { ...enemy.position },
    span: distance(enemy.position, enemy.lockTarget),
    traceKind: "artillery",
    type: "enemy-fired"
  });
  frameEvents.push({
    amount: strikeDamage,
    position: { ...enemy.lockTarget },
    span: strikeRadius,
    type: "artillery-lock-start"
  });
}

function fireSentryShot(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const shotDirection =
    lengthSquared(enemy.chargeDirection) > 0
      ? normalizeOrZero(enemy.chargeDirection)
      : enemy.facing;
  const toPlayer = subtract(player.position, enemy.position);
  const forward = toPlayer.x * shotDirection.x + toPlayer.y * shotDirection.y;
  const lateral = Math.abs(
    toPlayer.x * -shotDirection.y + toPlayer.y * shotDirection.x
  );
  const forwardLimit = enemy.isElite ? 15.4 : 13.6;
  const lateralLimit =
    enemy.isElite && enemy.mutation === "bulwark"
      ? player.radius + 0.96
      : enemy.isElite
        ? player.radius + 1.08
        : player.radius + 0.62;

  frameEvents.push({
    direction: shotDirection,
    position: { ...enemy.position },
    span: forwardLimit,
    traceKind: "sentry",
    type: "enemy-fired"
  });

  if (
    forward <= 0 ||
    forward >= forwardLimit ||
    lateral > lateralLimit
  ) {
    return;
  }

  applyDamage(player, (16 + enemy.maxHealth * 0.06) * (enemy.isElite ? 1.12 : 1), {
    knockbackSource: enemy.position,
    knockbackDistance: GAME_CONFIG.player.damageKnockback * 0.95,
    source: "sentry"
  });
}

function fireOverseerBeam(
  enemy: EnemyState,
  player: PlayerState,
  frameEvents: FrameEvent[]
): void {
  const shotDirection =
    lengthSquared(enemy.chargeDirection) > 0
      ? normalizeOrZero(enemy.chargeDirection)
      : enemy.facing;
  const toPlayer = subtract(player.position, enemy.position);
  const forward = toPlayer.x * shotDirection.x + toPlayer.y * shotDirection.y;
  const lateral = Math.abs(
    toPlayer.x * -shotDirection.y + toPlayer.y * shotDirection.x
  );
  const forwardLimit = enemy.phase === 2 ? 18.2 : 16.5;

  frameEvents.push({
    direction: shotDirection,
    position: { ...enemy.position },
    span: forwardLimit,
    traceKind: "overseer",
    type: "enemy-fired"
  });

  if (
    forward <= 0 ||
    forward >= forwardLimit ||
    lateral > player.radius + 0.95
  ) {
    return;
  }

  applyDamage(player, enemy.contactDamage * 0.9, {
    knockbackSource: enemy.position,
    knockbackDistance: GAME_CONFIG.player.damageKnockback * 1.25,
    source: "boss-beam"
  });
}
