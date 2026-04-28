import { GAME_CONFIG } from "../../core/config";
import {
  add,
  clamp,
  clampLength,
  lengthSquared,
  normalize,
  normalizeOrZero,
  scale,
  subtract,
  type Vec2
} from "../math";

export interface PlayerInput {
  aim: Vec2;
  dashPressed: boolean;
  move: Vec2;
  primaryHeld: boolean;
}

export interface PlayerState {
  aim: Vec2;
  alive: boolean;
  arcChainDamage: number;
  arcChainRadius: number;
  afterimageDamage: number;
  afterimageRadius: number;
  cometBloomCount: number;
  cometBloomDamage: number;
  cometBloomRadius: number;
  damageFlash: number;
  damageInvulnerabilityRemaining: number;
  dashCooldown: number;
  dashCooldownRemaining: number;
  dashDirection: Vec2;
  dashPulseDamage: number;
  dashPulseRadius: number;
  dashSpeed: number;
  dashTimer: number;
  facing: Vec2;
  fireCooldown: number;
  fireCooldownRemaining: number;
  gravityWellPull: number;
  gravityWellRadius: number;
  gravityWellSeconds: number;
  haloDroneCount: number;
  hazardLevel: number;
  health: number;
  maxHealth: number;
  moveSpeed: number;
  novaDashDamage: number;
  novaDashRadius: number;
  orbHeal: number;
  orbPickupRadius: number;
  position: Vec2;
  projectileBounces: number;
  projectileCount: number;
  projectileDamage: number;
  projectilePierce: number;
  projectileSpread: number;
  radius: number;
  rescueOrbBurstBonus: number;
  rescueScoreMultiplier: number;
  satelliteLatticeCount: number;
  shotPulse: number;
  starburstDamage: number;
  starburstRadius: number;
  velocity: Vec2;
}

export interface ProjectileFireEvent {
  direction: Vec2;
  origin: Vec2;
}

export interface PlayerUpdateResult {
  boundaryHit: boolean;
  dashEnded: boolean;
  dashStarted: boolean;
  fireEvent: ProjectileFireEvent | null;
}

interface DamageOptions {
  bypassInvulnerability?: boolean;
  knockbackDistance?: number;
  knockbackSource?: Vec2;
}

export function createPlayer(): PlayerState {
  return {
    aim: { x: 0, y: -6 },
    alive: true,
    arcChainDamage: 0,
    arcChainRadius: 0,
    afterimageDamage: 0,
    afterimageRadius: 0,
    cometBloomCount: 0,
    cometBloomDamage: 0,
    cometBloomRadius: 0,
    damageFlash: 0,
    damageInvulnerabilityRemaining: 0,
    dashCooldown: GAME_CONFIG.player.dashCooldown,
    dashCooldownRemaining: 0,
    dashDirection: { x: 0, y: -1 },
    dashPulseDamage: 0,
    dashPulseRadius: 0,
    dashSpeed: GAME_CONFIG.player.dashSpeed,
    dashTimer: 0,
    facing: { x: 0, y: -1 },
    fireCooldown: GAME_CONFIG.player.fireCooldown,
    fireCooldownRemaining: 0,
    gravityWellPull: 0,
    gravityWellRadius: 0,
    gravityWellSeconds: 0,
    haloDroneCount: 0,
    hazardLevel: 0,
    health: GAME_CONFIG.player.maxHealth,
    maxHealth: GAME_CONFIG.player.maxHealth,
    moveSpeed: GAME_CONFIG.player.moveSpeed,
    novaDashDamage: 0,
    novaDashRadius: 0,
    orbHeal: 6,
    orbPickupRadius: 1.3,
    position: { x: 0, y: 0 },
    projectileBounces: 0,
    projectileCount: 1,
    projectileDamage: GAME_CONFIG.player.projectileDamage,
    projectilePierce: 0,
    projectileSpread: 0,
    radius: GAME_CONFIG.player.radius,
    rescueOrbBurstBonus: 0,
    rescueScoreMultiplier: 1,
    satelliteLatticeCount: 0,
    shotPulse: 0,
    starburstDamage: 0,
    starburstRadius: 0,
    velocity: { x: 0, y: 0 }
  };
}

export function resetPlayer(player: PlayerState): void {
  player.aim = { x: 0, y: -6 };
  player.alive = true;
  player.arcChainDamage = 0;
  player.arcChainRadius = 0;
  player.afterimageDamage = 0;
  player.afterimageRadius = 0;
  player.cometBloomCount = 0;
  player.cometBloomDamage = 0;
  player.cometBloomRadius = 0;
  player.damageFlash = 0;
  player.damageInvulnerabilityRemaining = 0;
  player.dashCooldown = GAME_CONFIG.player.dashCooldown;
  player.dashCooldownRemaining = 0;
  player.dashDirection = { x: 0, y: -1 };
  player.dashPulseDamage = 0;
  player.dashPulseRadius = 0;
  player.dashSpeed = GAME_CONFIG.player.dashSpeed;
  player.dashTimer = 0;
  player.facing = { x: 0, y: -1 };
  player.fireCooldown = GAME_CONFIG.player.fireCooldown;
  player.fireCooldownRemaining = 0;
  player.gravityWellPull = 0;
  player.gravityWellRadius = 0;
  player.gravityWellSeconds = 0;
  player.haloDroneCount = 0;
  player.hazardLevel = 0;
  player.health = GAME_CONFIG.player.maxHealth;
  player.maxHealth = GAME_CONFIG.player.maxHealth;
  player.moveSpeed = GAME_CONFIG.player.moveSpeed;
  player.novaDashDamage = 0;
  player.novaDashRadius = 0;
  player.orbHeal = 6;
  player.orbPickupRadius = 1.3;
  player.position = { x: 0, y: 0 };
  player.projectileBounces = 0;
  player.projectileCount = 1;
  player.projectileDamage = GAME_CONFIG.player.projectileDamage;
  player.projectilePierce = 0;
  player.projectileSpread = 0;
  player.rescueOrbBurstBonus = 0;
  player.rescueScoreMultiplier = 1;
  player.satelliteLatticeCount = 0;
  player.shotPulse = 0;
  player.starburstDamage = 0;
  player.starburstRadius = 0;
  player.velocity = { x: 0, y: 0 };
}

export function updatePlayer(
  player: PlayerState,
  input: PlayerInput,
  deltaSeconds: number
): PlayerUpdateResult {
  player.damageFlash = Math.max(0, player.damageFlash - deltaSeconds);
  player.damageInvulnerabilityRemaining = Math.max(
    0,
    player.damageInvulnerabilityRemaining - deltaSeconds
  );
  player.dashCooldownRemaining = Math.max(
    0,
    player.dashCooldownRemaining - deltaSeconds
  );
  player.fireCooldownRemaining = Math.max(
    0,
    player.fireCooldownRemaining - deltaSeconds
  );
  player.shotPulse = Math.max(0, player.shotPulse - deltaSeconds * 2.5);
  player.hazardLevel = Math.max(0, player.hazardLevel - deltaSeconds * 2.4);
  player.aim = input.aim;
  const previousDashTimer = player.dashTimer;

  const aimDelta = subtract(input.aim, player.position);
  if (lengthSquared(aimDelta) > 0.0001) {
    player.facing = normalize(aimDelta);
  }

  const moveDirection = normalizeOrZero(input.move);
  let dashStarted = false;
  if (input.dashPressed && player.dashCooldownRemaining <= 0) {
    player.dashDirection =
      lengthSquared(moveDirection) > 0 ? moveDirection : player.facing;
    player.dashTimer = GAME_CONFIG.player.dashDuration;
    player.dashCooldownRemaining = player.dashCooldown;
    dashStarted = true;
  }

  if (player.dashTimer > 0) {
    player.dashTimer = Math.max(0, player.dashTimer - deltaSeconds);
    player.velocity = scale(player.dashDirection, player.dashSpeed);
  } else {
    player.velocity = scale(moveDirection, player.moveSpeed);
  }
  const dashEnded = previousDashTimer > 0 && player.dashTimer <= 0;

  const nextPosition = add(player.position, scale(player.velocity, deltaSeconds));
  const clampedPosition = clampLength(
    nextPosition,
    GAME_CONFIG.arenaCollisionRadius
  );
  const boundaryHit =
    lengthSquared(subtract(nextPosition, clampedPosition)) > 0.0001;
  player.position = clampedPosition;

  if (!input.primaryHeld || player.fireCooldownRemaining > 0) {
    return {
      boundaryHit,
      dashEnded,
      dashStarted,
      fireEvent: null
    };
  }

  player.fireCooldownRemaining = player.fireCooldown;
  player.shotPulse = 1;

  return {
    boundaryHit,
    dashEnded,
    dashStarted,
    fireEvent: {
      direction: player.facing,
      origin: add(player.position, scale(player.facing, player.radius + 0.65))
    }
  };
}

export function applyDamage(
  player: PlayerState,
  damage: number,
  options: DamageOptions = {}
): boolean {
  if (
    !player.alive ||
    player.dashTimer > 0 ||
    (!options.bypassInvulnerability &&
      player.damageInvulnerabilityRemaining > 0)
  ) {
    return false;
  }

  player.health = clamp(player.health - damage, 0, player.maxHealth);
  player.damageFlash = 1;
  if (options.knockbackSource) {
    const awayFromHit = normalizeOrZero(
      subtract(player.position, options.knockbackSource)
    );
    const fallbackDirection =
      lengthSquared(awayFromHit) > 0
        ? awayFromHit
        : scale(player.facing, -1);
    player.position = clampLength(
      add(
        player.position,
        scale(
          fallbackDirection,
          options.knockbackDistance ?? GAME_CONFIG.player.damageKnockback
        )
      ),
      GAME_CONFIG.arenaCollisionRadius
    );
  }
  if (!options.bypassInvulnerability) {
    player.damageInvulnerabilityRemaining = GAME_CONFIG.player.damageInvulnerability;
  }
  player.hazardLevel = 1;
  player.alive = player.health > 0;
  return true;
}

export function applyHealing(player: PlayerState, amount: number): void {
  player.health = clamp(player.health + amount, 0, player.maxHealth);
}
