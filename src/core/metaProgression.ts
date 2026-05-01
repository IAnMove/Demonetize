import type { Locale } from "./i18n";
import type { PlayerState } from "../gameplay/player/player";

export type MetaUpgradeId =
  | "aggressive-audit"
  | "collection-reach"
  | "expedited-process"
  | "initial-budget"
  | "legal-armor"
  | "orbital-infra"
  | "preferred-contract"
  | "reputation-insurance";

export interface MetaUpgradeCopy {
  description: string;
  effect: string;
  title: string;
}

export interface MetaUpgradeDefinition {
  copy: Record<Locale, MetaUpgradeCopy>;
  costs: number[];
  id: MetaUpgradeId;
}

export interface MetaProgressionState {
  lifetimeEarned: number;
  totalSpent: number;
  upgrades: Record<MetaUpgradeId, number>;
  wallet: number;
}

export interface MetaRunModifiers {
  actionFreezeMultiplier: number;
  dashCooldownMultiplier: number;
  draftRerolls: number;
  fireCooldownMultiplier: number;
  maxHealthBonus: number;
  openingActionPicks: number;
  pickupRadiusBonus: number;
  projectileDamageMultiplier: number;
  startingHaloDroneCount: number;
  startingInvulnerabilitySeconds: number;
  startingSatelliteCount: number;
}

interface PurchaseResult {
  purchased: boolean;
  state: MetaProgressionState;
}

const STORAGE_KEY = "demonetized.meta-progression";

export const META_UPGRADES: readonly MetaUpgradeDefinition[] = [
  {
    id: "initial-budget",
    costs: [260],
    copy: {
      en: {
        title: "Initial Budget",
        description: "TheirTube authorizes one extra opening action-card pick.",
        effect: "+1 start card"
      },
      es: {
        title: "Presupuesto Inicial",
        description: "TheirTube autoriza una eleccion extra de carta de accion inicial.",
        effect: "+1 carta inicial"
      }
    }
  },
  {
    id: "legal-armor",
    costs: [90, 220, 440, 760],
    copy: {
      en: {
        title: "Legal Armor",
        description: "Small capped increases to process integrity.",
        effect: "+6 max signal"
      },
      es: {
        title: "Blindaje Legal",
        description: "Subidas pequenas y capadas a la integridad de proceso.",
        effect: "+6 senal max"
      }
    }
  },
  {
    id: "collection-reach",
    costs: [80, 200, 420, 700],
    copy: {
      en: {
        title: "Collection Reach",
        description: "Evidence and appeal fragments are pulled from farther away.",
        effect: "+0.28 pickup"
      },
      es: {
        title: "Alcance de Recoleccion",
        description: "Los fragmentos de evidencia y apelacion se atraen desde mas lejos.",
        effect: "+0.28 recogida"
      }
    }
  },
  {
    id: "expedited-process",
    costs: [120, 300, 620, 1000],
    copy: {
      en: {
        title: "Expedited Process",
        description: "TheirTube shortens safe process timings without breaking the run.",
        effect: "- cooldowns"
      },
      es: {
        title: "Proceso Acelerado",
        description: "TheirTube acorta tiempos de proceso sin romper la run.",
        effect: "- cooldowns"
      }
    }
  },
  {
    id: "aggressive-audit",
    costs: [140, 340, 700, 1120],
    copy: {
      en: {
        title: "Aggressive Audit",
        description: "A small capped boost to projectile damage.",
        effect: "+4% damage"
      },
      es: {
        title: "Auditoria Agresiva",
        description: "Un aumento pequeno y capado al dano de proyectiles.",
        effect: "+4% dano"
      }
    }
  },
  {
    id: "preferred-contract",
    costs: [220, 640],
    copy: {
      en: {
        title: "Preferred Contract",
        description: "Adds one draft reroll per rank for passive and elite picks.",
        effect: "+1 reroll"
      },
      es: {
        title: "Contrato Preferente",
        description: "Anade un reroll por rango para elecciones pasivas y elite.",
        effect: "+1 reroll"
      }
    }
  },
  {
    id: "orbital-infra",
    costs: [300, 900],
    copy: {
      en: {
        title: "Orbital Infrastructure",
        description: "Starts each run with limited TheirTube orbital support.",
        effect: "Drone / satellite"
      },
      es: {
        title: "Infraestructura Orbital",
        description: "Empieza cada run con apoyo orbital limitado de TheirTube.",
        effect: "Dron / satelite"
      }
    }
  },
  {
    id: "reputation-insurance",
    costs: [110, 280, 560],
    copy: {
      en: {
        title: "Reputation Insurance",
        description: "A short invulnerability buffer at the start of each contract.",
        effect: "+0.9s shield"
      },
      es: {
        title: "Seguro de Reputacion",
        description: "Un pequeno margen de invulnerabilidad al empezar cada contrato.",
        effect: "+0.9s escudo"
      }
    }
  }
];

const META_UPGRADE_IDS = META_UPGRADES.map((upgrade) => upgrade.id);

export function loadMetaProgression(): MetaProgressionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultMetaProgression();
    }

    const parsed = JSON.parse(raw) as Partial<MetaProgressionState>;
    return normalizeMetaProgression(parsed);
  } catch {
    return createDefaultMetaProgression();
  }
}

export function depositRunMoney(
  current: MetaProgressionState,
  amount: number
): MetaProgressionState {
  const payout = Math.max(0, Math.round(amount));
  if (payout <= 0) {
    return current;
  }

  const next: MetaProgressionState = {
    ...current,
    lifetimeEarned: current.lifetimeEarned + payout,
    wallet: current.wallet + payout
  };
  saveMetaProgression(next);
  return next;
}

export function purchaseMetaUpgrade(
  current: MetaProgressionState,
  upgradeId: MetaUpgradeId
): PurchaseResult {
  const cost = getNextMetaUpgradeCost(current, upgradeId);

  if (cost === null || current.wallet < cost) {
    return {
      purchased: false,
      state: current
    };
  }

  const next: MetaProgressionState = {
    ...current,
    totalSpent: current.totalSpent + cost,
    upgrades: {
      ...current.upgrades,
      [upgradeId]: current.upgrades[upgradeId] + 1
    },
    wallet: current.wallet - cost
  };
  saveMetaProgression(next);
  return {
    purchased: true,
    state: next
  };
}

export function getNextMetaUpgradeCost(
  state: MetaProgressionState,
  upgradeId: MetaUpgradeId
): number | null {
  const definition = getMetaUpgradeDefinition(upgradeId);
  const rank = getMetaUpgradeRank(state, upgradeId);
  return definition.costs[rank] ?? null;
}

export function getMetaUpgradeDefinition(
  upgradeId: MetaUpgradeId
): MetaUpgradeDefinition {
  const definition = META_UPGRADES.find((upgrade) => upgrade.id === upgradeId);

  if (!definition) {
    throw new Error(`Unknown meta upgrade: ${upgradeId}`);
  }

  return definition;
}

export function getMetaUpgradeRank(
  state: MetaProgressionState,
  upgradeId: MetaUpgradeId
): number {
  return state.upgrades[upgradeId] ?? 0;
}

export function getMetaRunModifiers(
  state: MetaProgressionState
): MetaRunModifiers {
  const legalArmor = getMetaUpgradeRank(state, "legal-armor");
  const collectionReach = getMetaUpgradeRank(state, "collection-reach");
  const expeditedProcess = getMetaUpgradeRank(state, "expedited-process");
  const aggressiveAudit = getMetaUpgradeRank(state, "aggressive-audit");
  const initialBudget = getMetaUpgradeRank(state, "initial-budget");
  const preferredContract = getMetaUpgradeRank(state, "preferred-contract");
  const orbitalInfra = getMetaUpgradeRank(state, "orbital-infra");
  const reputationInsurance = getMetaUpgradeRank(state, "reputation-insurance");

  return {
    actionFreezeMultiplier: 1 - expeditedProcess * 0.05,
    dashCooldownMultiplier: 1 - expeditedProcess * 0.04,
    draftRerolls: preferredContract,
    fireCooldownMultiplier: 1 - expeditedProcess * 0.025,
    maxHealthBonus: legalArmor * 6,
    openingActionPicks: 1 + Math.min(1, initialBudget),
    pickupRadiusBonus: collectionReach * 0.28,
    projectileDamageMultiplier: 1 + aggressiveAudit * 0.04,
    startingHaloDroneCount: orbitalInfra >= 1 ? 1 : 0,
    startingInvulnerabilitySeconds: reputationInsurance * 0.9,
    startingSatelliteCount: orbitalInfra >= 2 ? 1 : 0
  };
}

export function applyMetaRunModifiersToPlayer(
  player: PlayerState,
  modifiers: MetaRunModifiers
): void {
  if (modifiers.maxHealthBonus > 0) {
    player.maxHealth += modifiers.maxHealthBonus;
    player.health += modifiers.maxHealthBonus;
  }

  player.orbPickupRadius += modifiers.pickupRadiusBonus;
  player.projectileDamage *= modifiers.projectileDamageMultiplier;
  player.fireCooldown *= modifiers.fireCooldownMultiplier;
  player.dashCooldown *= modifiers.dashCooldownMultiplier;
  player.dashCooldownRemaining = Math.min(
    player.dashCooldownRemaining,
    player.dashCooldown
  );
  player.haloDroneCount = Math.max(
    player.haloDroneCount,
    modifiers.startingHaloDroneCount
  );
  player.satelliteLatticeCount = Math.max(
    player.satelliteLatticeCount,
    modifiers.startingSatelliteCount
  );
  player.damageInvulnerabilityRemaining = Math.max(
    player.damageInvulnerabilityRemaining,
    modifiers.startingInvulnerabilitySeconds
  );
}

export function formatMoney(amount: number): string {
  return `$${Math.max(0, Math.round(amount)).toLocaleString("en-US")}`;
}

function normalizeMetaProgression(
  parsed: Partial<MetaProgressionState>
): MetaProgressionState {
  const upgrades = createDefaultUpgradeRanks();

  if (parsed.upgrades && typeof parsed.upgrades === "object") {
    for (const upgradeId of META_UPGRADE_IDS) {
      const definition = getMetaUpgradeDefinition(upgradeId);
      const rawRank = parsed.upgrades[upgradeId];
      upgrades[upgradeId] =
        typeof rawRank === "number"
          ? Math.max(0, Math.min(definition.costs.length, Math.floor(rawRank)))
          : 0;
    }
  }

  return {
    lifetimeEarned: Math.max(0, Math.round(parsed.lifetimeEarned ?? 0)),
    totalSpent: Math.max(0, Math.round(parsed.totalSpent ?? 0)),
    upgrades,
    wallet: Math.max(0, Math.round(parsed.wallet ?? 0))
  };
}

function saveMetaProgression(state: MetaProgressionState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createDefaultMetaProgression(): MetaProgressionState {
  return {
    lifetimeEarned: 0,
    totalSpent: 0,
    upgrades: createDefaultUpgradeRanks(),
    wallet: 0
  };
}

function createDefaultUpgradeRanks(): Record<MetaUpgradeId, number> {
  return {
    "aggressive-audit": 0,
    "collection-reach": 0,
    "expedited-process": 0,
    "initial-budget": 0,
    "legal-armor": 0,
    "orbital-infra": 0,
    "preferred-contract": 0,
    "reputation-insurance": 0
  };
}
