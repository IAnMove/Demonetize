import type { UpgradeChoice, UpgradeId } from "./upgrades";

export type BuildArchetype =
  | "balanced"
  | "dash-killer"
  | "glass-cannon"
  | "spread-control";

export type BuildFit = "anchor" | "flex" | "pivot" | "surge" | "wildcard";

export type LegendarySignature =
  | "comet-bloom"
  | "eclipse-protocol"
  | "overseer-lens"
  | "satellite-lattice"
  | "signal-choir"
  | "zero-point-capacitor";

export interface BuildProfile {
  legendaryCount: number;
  masteryTier: 0 | 1 | 2;
  primary: BuildArchetype;
  primaryScore: number;
  secondary: BuildArchetype | null;
  signature: LegendarySignature | null;
}

export function getBuildProfile(
  selectedChoices: Array<Pick<UpgradeChoice, "id" | "tier">>
): BuildProfile {
  const scores: Record<Exclude<BuildArchetype, "balanced">, number> = {
    "dash-killer": 0,
    "glass-cannon": 0,
    "spread-control": 0
  };

  let signature: LegendarySignature | null = null;
  let legendaryCount = 0;

  for (const choice of selectedChoices) {
    if (choice.tier !== "standard") {
      legendaryCount += 1;
      signature = choice.id as LegendarySignature;
    }

    for (const [archetype, weight] of Object.entries(getArchetypeWeights(choice.id))) {
      scores[archetype as keyof typeof scores] += weight;
    }
  }

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  const [primaryId, primaryScore] = ranked[0] as [
    Exclude<BuildArchetype, "balanced">,
    number
  ];
  const [secondaryId, secondaryScore] = ranked[1] as [
    Exclude<BuildArchetype, "balanced">,
    number
  ];

  if (primaryScore <= 1) {
    return {
      legendaryCount,
      masteryTier: 0,
      primary: "balanced",
      primaryScore,
      secondary: null,
      signature
    };
  }

  return {
    legendaryCount,
    masteryTier: primaryScore >= 10 ? 2 : primaryScore >= 5 ? 1 : 0,
    primary: primaryId,
    primaryScore,
    secondary:
      secondaryScore >= Math.max(2, primaryScore - 3) ? secondaryId : null,
    signature
  };
}

export function getUpgradeArchetypeTags(upgradeId: UpgradeId): BuildArchetype[] {
  return Object.entries(getArchetypeWeights(upgradeId))
    .filter(([, weight]) => weight > 0)
    .sort((left, right) => right[1]! - left[1]!)
    .map(([archetype]) => archetype as BuildArchetype);
}

export function getUpgradeFit(
  upgradeId: UpgradeId,
  selectedChoices: Array<Pick<UpgradeChoice, "id" | "tier">>
): BuildFit {
  const profile = getBuildProfile(selectedChoices);
  const tags = getUpgradeArchetypeTags(upgradeId);

  if (profile.primary === "balanced") {
    if (tags.length === 0) {
      return "flex";
    }

    return tags.length > 1 ? "surge" : "wildcard";
  }

  if (tags.length === 0) {
    return "flex";
  }

  if (tags.includes(profile.primary)) {
    return profile.primaryScore >= 7 ? "anchor" : "surge";
  }

  if (profile.secondary && tags.includes(profile.secondary)) {
    return "flex";
  }

  return "pivot";
}

function getArchetypeWeights(
  upgradeId: UpgradeId
): Partial<Record<Exclude<BuildArchetype, "balanced">, number>> {
  switch (upgradeId) {
    case "afterburn-link":
      return { "dash-killer": 3 };
    case "afterimage-trail":
      return { "dash-killer": 3, "glass-cannon": 1 };
    case "arc-splitter":
      return { "glass-cannon": 2, "spread-control": 1 };
    case "breach-pulse":
      return { "dash-killer": 3 };
    case "burn-drive":
      return { "dash-killer": 2 };
    case "chatgpt-router":
      return { "spread-control": 3 };
    case "claude-lattice":
      return {};
    case "coil-rifling":
      return { "glass-cannon": 3 };
    case "codex-overclock":
      return { "glass-cannon": 3 };
    case "comet-bloom":
      return { "glass-cannon": 4, "spread-control": 1 };
    case "dash-capacitors":
      return { "dash-killer": 3 };
    case "echo-web":
      return { "spread-control": 3 };
    case "eclipse-protocol":
      return { "spread-control": 4 };
    case "glass-reactor":
      return { "glass-cannon": 4 };
    case "gravity-well":
      return { "spread-control": 2 };
    case "halo-drone":
      return { "spread-control": 2, "glass-cannon": 1 };
    case "heat-sink-bypass":
      return { "glass-cannon": 2 };
    case "ion-repeaters":
      return { "glass-cannon": 2 };
    case "magnet-sweep":
      return {};
    case "nova-dash":
      return { "dash-killer": 4 };
    case "overcharge-rounds":
      return { "glass-cannon": 3 };
    case "overseer-lens":
      return { "glass-cannon": 3 };
    case "phase-battery":
      return {};
    case "prism-loader":
      return { "spread-control": 3 };
    case "rail-pierce":
      return { "glass-cannon": 2, "spread-control": 2 };
    case "recovery-matrix":
      return {};
    case "ricochet-core":
      return { "spread-control": 3 };
    case "satellite-lattice":
      return { "spread-control": 4, "glass-cannon": 1 };
    case "signal-choir":
      return {};
    case "siege-gyros":
      return { "glass-cannon": 2 };
    case "shock-greaves":
      return { "dash-killer": 3 };
    case "split-lattice":
      return { "spread-control": 4 };
    case "starburst-rounds":
      return { "spread-control": 2, "glass-cannon": 2 };
    case "vector-thrusters":
      return { "dash-killer": 2 };
    case "zero-point-capacitor":
      return { "dash-killer": 5 };
    default:
      return {};
  }
}
