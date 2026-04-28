import { GAME_CONFIG } from "../../core/config";
import type { FrameEvent } from "../events";
import { add, length, lengthSquared, normalize, scale, type Vec2 } from "../math";

export interface ProjectileOptions {
  blastDamage?: number;
  blastRadius?: number;
  bouncesRemaining?: number;
  kind?: ProjectileKind;
  lifetime?: number;
  pierceRemaining?: number;
  scale?: number;
  speed?: number;
}

export type ProjectileKind = "comet" | "drone" | "player" | "satellite" | "starburst";

export interface ProjectileState {
  active: boolean;
  blastDamage: number;
  blastRadius: number;
  bouncesRemaining: number;
  damage: number;
  kind: ProjectileKind;
  lifetimeRemaining: number;
  pierceRemaining: number;
  position: Vec2;
  scale: number;
  velocity: Vec2;
}

export type ProjectilePool = ProjectileState[];
export type ProjectileSnapshot = Pick<
  ProjectileState,
  "kind" | "position" | "scale"
>;

export function createProjectilePool(): ProjectilePool {
  return Array.from({ length: GAME_CONFIG.maxProjectiles }, () => ({
    active: false,
    blastDamage: 0,
    blastRadius: 0,
    bouncesRemaining: 0,
    damage: GAME_CONFIG.player.projectileDamage,
    kind: "player",
    lifetimeRemaining: 0,
    pierceRemaining: 0,
    position: { x: 0, y: 0 },
    scale: 1,
    velocity: { x: 0, y: 0 }
  }));
}

export function getActiveProjectiles(
  projectiles: ProjectilePool
): ProjectileSnapshot[] {
  return projectiles
    .filter((projectile) => projectile.active)
    .map((projectile) => ({
      kind: projectile.kind,
      position: { ...projectile.position },
      scale: projectile.scale
    }));
}

export function resetProjectiles(projectiles: ProjectilePool): void {
  for (const projectile of projectiles) {
    projectile.active = false;
    projectile.blastDamage = 0;
    projectile.blastRadius = 0;
    projectile.bouncesRemaining = 0;
    projectile.damage = GAME_CONFIG.player.projectileDamage;
    projectile.kind = "player";
    projectile.lifetimeRemaining = 0;
    projectile.pierceRemaining = 0;
    projectile.position = { x: 0, y: 0 };
    projectile.scale = 1;
    projectile.velocity = { x: 0, y: 0 };
  }
}

export function spawnProjectile(
  projectiles: ProjectilePool,
  origin: Vec2,
  direction: Vec2,
  damage: number,
  options: ProjectileOptions = {}
): void {
  const slot = projectiles.find((projectile) => !projectile.active);

  if (!slot) {
    return;
  }

  slot.active = true;
  slot.blastDamage = options.blastDamage ?? 0;
  slot.blastRadius = options.blastRadius ?? 0;
  slot.bouncesRemaining = options.bouncesRemaining ?? 0;
  slot.damage = damage;
  slot.kind = options.kind ?? "player";
  slot.lifetimeRemaining = options.lifetime ?? GAME_CONFIG.player.projectileLifetime;
  slot.pierceRemaining = options.pierceRemaining ?? 0;
  slot.position = { ...origin };
  slot.scale = options.scale ?? (slot.kind === "comet" ? 1.95 : 1);
  slot.velocity = scale(direction, options.speed ?? GAME_CONFIG.player.projectileSpeed);
}

export function updateProjectiles(
  projectiles: ProjectilePool,
  deltaSeconds: number,
  frameEvents: FrameEvent[] = []
): void {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.lifetimeRemaining -= deltaSeconds;
    projectile.position = add(
      projectile.position,
      scale(projectile.velocity, deltaSeconds)
    );

    if (projectile.bouncesRemaining > 0) {
      const distanceFromCenter = length(projectile.position);
      if (distanceFromCenter > GAME_CONFIG.arenaCollisionRadius) {
        const normal = normalize(projectile.position);
        const dot =
          projectile.velocity.x * normal.x + projectile.velocity.y * normal.y;
        projectile.velocity = {
          x: projectile.velocity.x - 2 * dot * normal.x,
          y: projectile.velocity.y - 2 * dot * normal.y
        };
        projectile.position = scale(normal, GAME_CONFIG.arenaCollisionRadius - 0.18);
        projectile.bouncesRemaining -= 1;
        frameEvents.push({
          position: { ...projectile.position },
          type: "projectile-ricochet"
        });
      }
    }

    const isExpired = projectile.lifetimeRemaining <= 0;
    const outOfBoundsLimit = GAME_CONFIG.arenaHardLimit + 4;
    const isOutOfBounds =
      lengthSquared(projectile.position) > outOfBoundsLimit * outOfBoundsLimit;

    if (isExpired || isOutOfBounds) {
      projectile.active = false;
    }
  }
}
