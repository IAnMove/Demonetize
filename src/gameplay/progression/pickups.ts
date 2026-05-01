import { add, clamp, distance, scale, subtract, type Vec2 } from "../math";
import { applyHealing, type PlayerState } from "../player/player";

export interface OrbPickup {
  position: Vec2;
  velocity: Vec2;
}

export interface MoneyPickup {
  amount: number;
  position: Vec2;
  velocity: Vec2;
}

export interface RescuePickup {
  duration: number;
  position: Vec2;
  timeRemaining: number;
  velocity: Vec2;
}

export function createOrbPickup(position: Vec2): OrbPickup {
  return {
    position: { ...position },
    velocity: { x: 0, y: 0 }
  };
}

export function createMoneyPickup(position: Vec2, amount: number): MoneyPickup {
  return {
    amount,
    position: { ...position },
    velocity: { x: 0, y: 0 }
  };
}

export function createRescuePickup(position: Vec2): RescuePickup {
  return {
    duration: 0,
    position: { ...position },
    timeRemaining: 0,
    velocity: { x: 0, y: 0 }
  };
}

export function getOrbPositions(orbs: OrbPickup[]): Vec2[] {
  return orbs.map((orb) => ({ ...orb.position }));
}

export function getMoneySnapshots(
  pickups: MoneyPickup[]
): Array<{ amount: number; position: Vec2 }> {
  return pickups.map((pickup) => ({
    amount: pickup.amount,
    position: { ...pickup.position }
  }));
}

export function getRescueSnapshots(
  rescues: RescuePickup[]
): Array<{ position: Vec2; progress: number }> {
  return rescues.map((rescue) => ({
    position: { ...rescue.position },
    progress:
      rescue.duration > 0
        ? 1 - rescue.timeRemaining / rescue.duration
        : 1
  }));
}

export function updateOrbPickups(
  orbs: OrbPickup[],
  player: PlayerState,
  deltaSeconds: number
): Vec2[] {
  const collectedPositions: Vec2[] = [];

  for (let index = orbs.length - 1; index >= 0; index -= 1) {
    const orb = orbs[index];
    const toPlayer = subtract(player.position, orb.position);
    const playerDistance = distance(orb.position, player.position);

    if (playerDistance < player.orbPickupRadius) {
      applyHealing(player, player.orbHeal);
      collectedPositions.push({ ...orb.position });
      orbs.splice(index, 1);
      continue;
    }

    const magnetAlpha = clamp(1 - playerDistance / 6, 0, 1);
    orb.velocity = scale(toPlayer, magnetAlpha * 2.2 * deltaSeconds);
    orb.position = add(orb.position, orb.velocity);
  }

  return collectedPositions;
}

export function updateMoneyPickups(
  pickups: MoneyPickup[],
  player: PlayerState,
  deltaSeconds: number
): Array<{ amount: number; position: Vec2 }> {
  const collected: Array<{ amount: number; position: Vec2 }> = [];

  for (let index = pickups.length - 1; index >= 0; index -= 1) {
    const pickup = pickups[index];
    const toPlayer = subtract(player.position, pickup.position);
    const playerDistance = distance(pickup.position, player.position);

    if (playerDistance < player.orbPickupRadius) {
      collected.push({
        amount: pickup.amount,
        position: { ...pickup.position }
      });
      pickups.splice(index, 1);
      continue;
    }

    const magnetAlpha = clamp(1 - playerDistance / 6.4, 0, 1);
    pickup.velocity = scale(toPlayer, magnetAlpha * 2.45 * deltaSeconds);
    pickup.position = add(pickup.position, pickup.velocity);
  }

  return collected;
}

export function updateRescuePickups(
  rescues: RescuePickup[],
  player: PlayerState,
  deltaSeconds: number
): { lostPositions: Vec2[]; savedPositions: Vec2[] } {
  const lostPositions: Vec2[] = [];
  const savedPositions: Vec2[] = [];

  for (let index = rescues.length - 1; index >= 0; index -= 1) {
    const rescue = rescues[index];
    rescue.timeRemaining = Math.max(0, rescue.timeRemaining - deltaSeconds);

    const toPlayer = subtract(player.position, rescue.position);
    const playerDistance = distance(rescue.position, player.position);

    if (playerDistance < player.orbPickupRadius + 0.18) {
      savedPositions.push({ ...rescue.position });
      rescues.splice(index, 1);
      continue;
    }

    if (rescue.timeRemaining <= 0) {
      lostPositions.push({ ...rescue.position });
      rescues.splice(index, 1);
      continue;
    }

    const urgency = clamp(
      rescue.duration > 0 ? 1 - rescue.timeRemaining / rescue.duration : 1,
      0,
      1
    );
    const magnetAlpha = clamp(1 - playerDistance / 4.6, 0, 1);
    rescue.velocity = scale(toPlayer, magnetAlpha * (1.6 + urgency * 1.2) * deltaSeconds);
    rescue.position = add(rescue.position, rescue.velocity);
  }

  return { lostPositions, savedPositions };
}
