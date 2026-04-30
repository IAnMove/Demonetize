import { clamp } from "../math";
import type { PlayerState } from "../player/player";
import {
  getBuildProfile,
  getUpgradeArchetypeTags,
  type BuildArchetype
} from "./builds";
import { UPGRADE_POOL } from "./upgradeConfig";

export type UpgradeId =
  | "afterburn-link"
  | "afterimage-trail"
  | "arc-splitter"
  | "breach-pulse"
  | "burn-drive"
  | "card-overcore"
  | "card-purge"
  | "card-repair"
  | "chatgpt-router"
  | "claude-lattice"
  | "coil-rifling"
  | "codex-overclock"
  | "comet-bloom"
  | "dash-capacitors"
  | "echo-web"
  | "eclipse-protocol"
  | "fortress-frame"
  | "glass-reactor"
  | "gravity-well"
  | "halo-drone"
  | "heat-sink-bypass"
  | "ion-repeaters"
  | "magnet-sweep"
  | "nova-dash"
  | "overseer-lens"
  | "overcharge-rounds"
  | "phase-battery"
  | "prism-loader"
  | "rail-pierce"
  | "ricochet-core"
  | "satellite-lattice"
  | "recovery-matrix"
  | "siege-gyros"
  | "signal-choir"
  | "shock-greaves"
  | "split-lattice"
  | "starburst-rounds"
  | "zero-point-capacitor"
  | "vector-thrusters";

export const ACTION_CARD_LIMIT = 4;
export const ACTION_CARD_IDS = [
  "card-overcore",
  "card-purge",
  "card-repair"
] as const satisfies readonly UpgradeId[];

export type ActionCardId = (typeof ACTION_CARD_IDS)[number];

const STACK_LIMITS: Partial<Record<UpgradeId, number>> = {
  "afterimage-trail": 3,
  "arc-splitter": 3,
  "gravity-well": 2,
  "halo-drone": 2,
  "nova-dash": 3,
  "rail-pierce": 2,
  "ricochet-core": 2,
  "starburst-rounds": 3
};

const VISUAL_BOOST_IDS = new Set<UpgradeId>([
  "afterimage-trail",
  "arc-splitter",
  "comet-bloom",
  "gravity-well",
  "halo-drone",
  "nova-dash",
  "rail-pierce",
  "ricochet-core",
  "satellite-lattice",
  "starburst-rounds"
]);

const AFTERIMAGE_DAMAGE_STACKS = [12, 9, 6] as const;
const ARC_CHAIN_DAMAGE_STACKS = [12, 9, 7] as const;
const GRAVITY_WELL_PULL_STACKS = [8.5, 5] as const;
const NOVA_DASH_DAMAGE_STACKS = [30, 22, 16] as const;
const STARBURST_DAMAGE_STACKS = [15, 11, 8] as const;

export interface HeldActionCard {
  id: ActionCardId;
  instanceId: string;
}

export interface UpgradeChoice {
  description: string;
  id: UpgradeId;
  tier: "elite" | "standard";
  title: string;
}

export function isActionCardId(upgradeId: UpgradeId): upgradeId is ActionCardId {
  return (ACTION_CARD_IDS as readonly string[]).includes(upgradeId);
}

export function isUpgradeId(value: unknown): value is UpgradeId {
  return (
    typeof value === "string" &&
    UPGRADE_POOL.some((choice) => choice.id === value)
  );
}

export function getUpgradeStackLimit(upgradeId: UpgradeId): number {
  return STACK_LIMITS[upgradeId] ?? 1;
}

export function getUpgradeChoice(id: UpgradeId): UpgradeChoice {
  const choice = UPGRADE_POOL.find((entry) => entry.id === id);

  if (!choice) {
    throw new Error(`Unknown upgrade: ${id}`);
  }

  return choice;
}

export function rollUpgradeChoices(
  selectedChoices: UpgradeChoice[] = [],
  count = 3
): UpgradeChoice[] {
  return rollFromPool(
    UPGRADE_POOL.filter((choice) => choice.tier === "standard"),
    selectedChoices,
    count,
    false
  );
}

export function rollEliteUpgradeChoices(
  selectedChoices: UpgradeChoice[] = [],
  count = 2,
  guaranteedIds: UpgradeId[] = []
): UpgradeChoice[] {
  return rollFromPool(
    UPGRADE_POOL.filter((choice) => choice.tier === "elite"),
    selectedChoices,
    count,
    true,
    guaranteedIds
  );
}

function rollFromPool(
  sourcePool: UpgradeChoice[],
  selectedChoices: UpgradeChoice[],
  count: number,
  legendaryOnly: boolean,
  guaranteedIds: UpgradeId[] = []
): UpgradeChoice[] {
  const selectedCounts = new Map<UpgradeId, number>();
  for (const choice of selectedChoices) {
    selectedCounts.set(choice.id, (selectedCounts.get(choice.id) ?? 0) + 1);
  }
  const filteredPool = sourcePool.filter(
    (choice) => (selectedCounts.get(choice.id) ?? 0) < getUpgradeStackLimit(choice.id)
  );
  const pool = [
    ...(filteredPool.length >= count || filteredPool.length > 0
      ? filteredPool
      : sourcePool)
  ];
  shuffle(pool);

  const buildProfile = getBuildProfile(selectedChoices);
  const picks: UpgradeChoice[] = [];
  const desiredArchetypes = getDesiredArchetypes(buildProfile, legendaryOnly, count);

  for (const guaranteedId of guaranteedIds) {
    if (picks.length >= count) {
      break;
    }

    const guaranteedChoice = pullSpecificUpgrade(pool, guaranteedId);
    if (guaranteedChoice && !picks.some((picked) => picked.id === guaranteedChoice.id)) {
      picks.push(guaranteedChoice);
    }
  }

  for (let slotIndex = 0; slotIndex < desiredArchetypes.length; slotIndex += 1) {
    if (picks.length >= count) {
      break;
    }

    const match = pullMatchingUpgrade(
      pool,
      buildProfile,
      desiredArchetypes[slotIndex],
      slotIndex,
      legendaryOnly
    );

    if (match) {
      picks.push(match);
    }
  }

  for (let index = pool.length - 1; index >= 0; index -= 1) {
    if (picks.length >= count) {
      break;
    }

    const choice = pool[index];
    if (!picks.some((picked) => picked.id === choice.id)) {
      picks.push(choice);
    }
  }

  return picks.slice(0, count);
}

export function applyUpgrade(player: PlayerState, upgradeId: UpgradeId): void {
  switch (upgradeId) {
    case "afterburn-link":
      player.dashCooldown *= 0.68;
      player.dashCooldownRemaining = clamp(
        player.dashCooldownRemaining,
        0,
        player.dashCooldown
      );
      break;
    case "afterimage-trail":
      player.afterimageDamage = addStackedBonus(
        player.afterimageDamage,
        AFTERIMAGE_DAMAGE_STACKS
      );
      player.afterimageRadius = Math.max(player.afterimageRadius, 1.08);
      break;
    case "arc-splitter":
      player.arcChainDamage = addStackedBonus(
        player.arcChainDamage,
        ARC_CHAIN_DAMAGE_STACKS
      );
      player.arcChainRadius = Math.max(player.arcChainRadius, 4.9);
      break;
    case "breach-pulse":
      player.dashPulseDamage += 34;
      player.dashPulseRadius = Math.max(player.dashPulseRadius, 2.7);
      break;
    case "burn-drive":
      player.moveSpeed *= 1.24;
      break;
    case "card-overcore":
    case "card-purge":
    case "card-repair":
      break;
    case "chatgpt-router":
      player.projectileCount = Math.min(6, player.projectileCount + 1);
      player.projectileSpread = Math.max(player.projectileSpread, 0.17);
      break;
    case "claude-lattice":
      player.orbHeal += 3;
      break;
    case "coil-rifling":
      player.projectileDamage *= 1.3;
      break;
    case "codex-overclock":
      player.fireCooldown *= 0.58;
      break;
    case "comet-bloom":
      player.cometBloomCount = Math.max(player.cometBloomCount, 1);
      player.cometBloomDamage += 42;
      player.cometBloomRadius = Math.max(player.cometBloomRadius, 2.45);
      break;
    case "dash-capacitors":
      player.dashCooldown *= 0.64;
      player.dashCooldownRemaining = clamp(
        player.dashCooldownRemaining,
        0,
        player.dashCooldown
      );
      break;
    case "echo-web":
      player.projectileCount = Math.min(6, player.projectileCount + 1);
      player.projectileSpread = Math.max(player.projectileSpread, 0.18);
      break;
    case "eclipse-protocol":
      player.projectileCount = Math.min(6, player.projectileCount + 2);
      player.projectileSpread = Math.max(player.projectileSpread, 0.24);
      break;
    case "fortress-frame":
      player.maxHealth += 36;
      break;
    case "glass-reactor":
      player.projectileDamage *= 1.72;
      break;
    case "gravity-well":
      player.gravityWellPull = addStackedBonus(
        player.gravityWellPull,
        GRAVITY_WELL_PULL_STACKS
      );
      player.gravityWellRadius = Math.max(player.gravityWellRadius, 3.95);
      player.gravityWellSeconds = Math.max(player.gravityWellSeconds, 1.25);
      break;
    case "halo-drone":
      player.haloDroneCount = Math.min(2, player.haloDroneCount + 1);
      break;
    case "heat-sink-bypass":
      player.fireCooldown *= 0.64;
      break;
    case "ion-repeaters":
      player.fireCooldown *= 0.74;
      break;
    case "magnet-sweep":
      player.orbPickupRadius += 0.65;
      break;
    case "nova-dash":
      player.novaDashDamage = addStackedBonus(
        player.novaDashDamage,
        NOVA_DASH_DAMAGE_STACKS
      );
      player.novaDashRadius = Math.max(player.novaDashRadius, 2.45);
      break;
    case "overcharge-rounds":
      player.projectileDamage *= 1.42;
      break;
    case "overseer-lens":
      player.projectileDamage *= 1.32;
      break;
    case "phase-battery":
      player.maxHealth += 20;
      break;
    case "prism-loader":
      player.projectileCount = Math.min(6, player.projectileCount + 1);
      player.projectileSpread = Math.max(player.projectileSpread, 0.16);
      break;
    case "rail-pierce":
      player.projectilePierce = Math.min(2, player.projectilePierce + 1);
      break;
    case "recovery-matrix":
      player.health = clamp(player.health + 24, 0, player.maxHealth);
      break;
    case "ricochet-core":
      player.projectileBounces = Math.min(2, player.projectileBounces + 1);
      break;
    case "satellite-lattice":
      player.satelliteLatticeCount = Math.max(player.satelliteLatticeCount, 1);
      break;
    case "signal-choir":
      player.rescueOrbBurstBonus += 3;
      break;
    case "siege-gyros":
      player.projectileDamage *= 1.22;
      break;
    case "shock-greaves":
      player.dashPulseDamage += 22;
      player.dashPulseRadius = Math.max(player.dashPulseRadius, 2.2);
      break;
    case "split-lattice":
      player.projectileCount = Math.min(5, player.projectileCount + 2);
      player.projectileSpread = Math.max(player.projectileSpread, 0.2);
      break;
    case "starburst-rounds":
      player.starburstDamage = addStackedBonus(
        player.starburstDamage,
        STARBURST_DAMAGE_STACKS
      );
      player.starburstRadius = Math.max(player.starburstRadius, 2.12);
      break;
    case "vector-thrusters":
      player.dashSpeed *= 1.16;
      break;
    case "zero-point-capacitor":
      player.dashPulseDamage += 56;
      player.dashPulseRadius = Math.max(player.dashPulseRadius, 3.4);
      break;
  }
}

function addStackedBonus(
  currentValue: number,
  stackValues: readonly number[]
): number {
  let nextValue = 0;

  for (const stackValue of stackValues) {
    nextValue += stackValue;
    if (currentValue < nextValue - 0.001) {
      return nextValue;
    }
  }

  return nextValue;
}

function getDesiredArchetypes(
  buildProfile: ReturnType<typeof getBuildProfile>,
  legendaryOnly: boolean,
  count: number
): BuildArchetype[] {
  if (buildProfile.primary === "balanced") {
    return legendaryOnly
      ? ["dash-killer", "glass-cannon"].slice(0, count) as BuildArchetype[]
      : ([
          "dash-killer",
          "glass-cannon",
          "spread-control"
        ] as BuildArchetype[]).slice(0, count);
  }

  const archetypes: BuildArchetype[] = [buildProfile.primary];

  if (buildProfile.secondary) {
    archetypes.push(buildProfile.secondary);
  } else {
    archetypes.push(buildProfile.primary);
  }

  if (!legendaryOnly) {
    archetypes.push("balanced");
  }

  return archetypes.slice(0, count);
}

function pullMatchingUpgrade(
  pool: UpgradeChoice[],
  buildProfile: ReturnType<typeof getBuildProfile>,
  desiredArchetype: BuildArchetype,
  slotIndex: number,
  legendaryOnly: boolean
): UpgradeChoice | null {
  let bestChoice: UpgradeChoice | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const choice of pool) {
    const score = scoreUpgradeChoice(
      choice,
      getUpgradeArchetypeTags(choice.id),
      buildProfile,
      desiredArchetype,
      slotIndex,
      legendaryOnly
    );

    if (score > bestScore) {
      bestScore = score;
      bestChoice = choice;
    }
  }

  if (!bestChoice) {
    return null;
  }

  const bestIndex = pool.findIndex((choice) => choice.id === bestChoice!.id);
  if (bestIndex >= 0) {
    pool.splice(bestIndex, 1);
  }

  return bestChoice;
}

function pullSpecificUpgrade(
  pool: UpgradeChoice[],
  upgradeId: UpgradeId
): UpgradeChoice | null {
  const targetIndex = pool.findIndex((choice) => choice.id === upgradeId);

  if (targetIndex < 0) {
    return null;
  }

  const [choice] = pool.splice(targetIndex, 1);
  return choice ?? null;
}

function scoreUpgradeChoice(
  choice: UpgradeChoice,
  tags: BuildArchetype[],
  buildProfile: ReturnType<typeof getBuildProfile>,
  desiredArchetype: BuildArchetype,
  slotIndex: number,
  legendaryOnly: boolean
): number {
  const isSupport = tags.length === 0;
  let score = Math.random() * 0.2;

  if (VISUAL_BOOST_IDS.has(choice.id)) {
    score += legendaryOnly ? 0.8 : 0.65;
  }

  if (buildProfile.primary === "balanced") {
    if (desiredArchetype !== "balanced" && tags.includes(desiredArchetype)) {
      score += 3.2;
    }

    if (tags.length > 1) {
      score += 0.9;
    }

    if (isSupport) {
      score += slotIndex >= 2 ? 1.4 : 0.35;
    }

    return score;
  }

  if (tags.includes(buildProfile.primary)) {
    score += slotIndex === 0 ? 4.8 : 3.8;
  }

  if (desiredArchetype !== "balanced" && tags.includes(desiredArchetype)) {
    score += 2.5;
  }

  if (buildProfile.secondary && tags.includes(buildProfile.secondary)) {
    score += 1.7;
  }

  if (isSupport) {
    score += slotIndex >= 2 ? 1.8 : 0.55;
  } else if (
    buildProfile.primaryScore >= 6 &&
    !tags.includes(buildProfile.primary)
  ) {
    score -= 1.45;
  }

  if (buildProfile.primaryScore >= 8 && tags.includes(buildProfile.primary)) {
    score += 0.8;
  }

  if (legendaryOnly && tags.includes(buildProfile.primary)) {
    score += 2.4;
  }

  if (
    buildProfile.signature === "zero-point-capacitor" &&
    choice.id === "shock-greaves"
  ) {
    score += 1.25;
  }

  if (
    buildProfile.signature === "overseer-lens" &&
    choice.id === "coil-rifling"
  ) {
    score += 1.1;
  }

  if (
    buildProfile.signature === "eclipse-protocol" &&
    choice.id === "prism-loader"
  ) {
    score += 1.25;
  }

  if (
    buildProfile.signature === "signal-choir" &&
    (choice.id === "magnet-sweep" || choice.id === "recovery-matrix")
  ) {
    score += 1.2;
  }

  return score;
}

function shuffle<T>(items: T[]): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = items[index];
    items[index] = items[nextIndex];
    items[nextIndex] = currentItem;
  }
}
