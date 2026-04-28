import { GAME_CONFIG } from "../../core/config";

export interface WaveBurstPlan {
  artilleryCount: number;
  beatId?: EncounterBeatId;
  bossCount: number;
  chargerCount: number;
  droneCount: number;
  eliteCount: number;
  pauseAfter: number;
  relayCount?: number;
  sentryCount: number;
}

export interface WavePlan {
  bursts: WaveBurstPlan[];
  spawnInterval: number;
  themeId: WaveThemeId;
  waveNumber: number;
}

export type EncounterBeatId =
  | "artillery-zone"
  | "boss-vanguard"
  | "breather"
  | "elite-escort"
  | "lane-pressure"
  | "pickup-chase"
  | "ram-pressure"
  | "support-net"
  | "swarm";

export type WaveThemeId =
  | "signal-sweep"
  | "ram-drill"
  | "fracture-line"
  | "purge-clamp"
  | "overseer-breach"
  | "kill-grid"
  | "heat-spiral"
  | "containment-crash"
  | "last-directive"
  | "token-drought"
  | "codex-requiem";

const WAVE_PLANS: WavePlan[] = [
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 3,
        eliteCount: 0,
        pauseAfter: 0.22,
        sentryCount: 0
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0,
        sentryCount: 0
      }
    ],
    spawnInterval: 0.68,
    themeId: "signal-sweep",
    waveNumber: 1
  },
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 4,
        eliteCount: 0,
        pauseAfter: 0.24,
        sentryCount: 0
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 3,
        eliteCount: 0,
        pauseAfter: 0,
        sentryCount: 0
      }
    ],
    spawnInterval: 0.58,
    themeId: "ram-drill",
    waveNumber: 2
  },
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 4,
        eliteCount: 0,
        pauseAfter: 0.2,
        sentryCount: 1
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0.16,
        sentryCount: 1
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0,
        sentryCount: 0
      }
    ],
    spawnInterval: 0.52,
    themeId: "fracture-line",
    waveNumber: 3
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 3,
        eliteCount: 0,
        pauseAfter: 0.3,
        sentryCount: 0
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 0,
        pauseAfter: 0.18,
        sentryCount: 0
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 3,
        eliteCount: 0,
        pauseAfter: 0,
        sentryCount: 1
      }
    ],
    spawnInterval: 0.44,
    themeId: "purge-clamp",
    waveNumber: 4
  },
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 1,
        chargerCount: 0,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0.32,
        sentryCount: 0
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 0,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0.22,
        sentryCount: 2
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0,
        sentryCount: 0
      }
    ],
    spawnInterval: 0.48,
    themeId: "overseer-breach",
    waveNumber: 5
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 4,
        eliteCount: 0,
        pauseAfter: 0.22,
        relayCount: 1,
        sentryCount: 1
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 3,
        eliteCount: 1,
        pauseAfter: 0.14,
        sentryCount: 1
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 1,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.32,
    themeId: "kill-grid",
    waveNumber: 6
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 1,
        droneCount: 4,
        eliteCount: 1,
        pauseAfter: 0.2,
        relayCount: 1,
        sentryCount: 1
      },
      {
        artilleryCount: 0,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 4,
        eliteCount: 1,
        pauseAfter: 0.12,
        relayCount: 1,
        sentryCount: 1
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 4,
        eliteCount: 1,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.29,
    themeId: "heat-spiral",
    waveNumber: 7
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 4,
        eliteCount: 1,
        pauseAfter: 0.18,
        relayCount: 1,
        sentryCount: 1
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 4,
        eliteCount: 1,
        pauseAfter: 0.1,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 4,
        eliteCount: 2,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.26,
    themeId: "containment-crash",
    waveNumber: 8
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 1,
        pauseAfter: 0.18,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 2,
        pauseAfter: 0.12,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 1,
        pauseAfter: 0.08,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 1,
        eliteCount: 2,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 1
      }
    ],
    spawnInterval: 0.3,
    themeId: "token-drought",
    waveNumber: 9
  },
  {
    bursts: [
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 2,
        pauseAfter: 0.14,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 2,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 3,
        eliteCount: 2,
        pauseAfter: 0.1,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 3,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.27,
    themeId: "codex-requiem",
    waveNumber: 10
  },
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 1,
        chargerCount: 0,
        droneCount: 2,
        eliteCount: 0,
        pauseAfter: 0.24,
        sentryCount: 0
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0.12,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0.08,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 1,
        eliteCount: 2,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 1
      }
    ],
    spawnInterval: 0.28,
    themeId: "last-directive",
    waveNumber: 11
  },
  {
    bursts: [
      {
        artilleryCount: 2,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0.1,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 3,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0.08,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 2,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 2,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.25,
    themeId: "codex-requiem",
    waveNumber: 12
  },
  {
    bursts: [
      {
        artilleryCount: 0,
        bossCount: 1,
        chargerCount: 0,
        droneCount: 1,
        eliteCount: 0,
        pauseAfter: 0.18,
        sentryCount: 0
      },
      {
        artilleryCount: 2,
        bossCount: 0,
        chargerCount: 2,
        droneCount: 2,
        eliteCount: 3,
        pauseAfter: 0.1,
        relayCount: 1,
        sentryCount: 2
      },
      {
        artilleryCount: 1,
        bossCount: 0,
        chargerCount: 3,
        droneCount: 1,
        eliteCount: 3,
        pauseAfter: 0,
        relayCount: 1,
        sentryCount: 2
      }
    ],
    spawnInterval: 0.24,
    themeId: "last-directive",
    waveNumber: 13
  }
];

const WAVE_TEMPO_MULTIPLIER = 0.9;

export const ENCOUNTER_BEAT_LABELS: Record<EncounterBeatId, string> = {
  "artillery-zone": "Artillery Zone",
  "boss-vanguard": "Boss Vanguard",
  breather: "Breather",
  "elite-escort": "Elite Escort",
  "lane-pressure": "Lane Pressure",
  "pickup-chase": "Pickup Chase",
  "ram-pressure": "Ram Pressure",
  "support-net": "Support Net",
  swarm: "Swarm"
};

export function getWavePlan(waveNumber: number): WavePlan {
  const plan = WAVE_PLANS[Math.min(waveNumber, GAME_CONFIG.finalWave) - 1];

  return {
    ...plan,
    bursts: plan.bursts.map((burst) => ({
      ...burst,
      pauseAfter: burst.pauseAfter * WAVE_TEMPO_MULTIPLIER
    })),
    spawnInterval: plan.spawnInterval * WAVE_TEMPO_MULTIPLIER,
    waveNumber
  };
}

export function getWaveThemeId(waveNumber: number): WaveThemeId {
  return getWavePlan(Math.max(1, waveNumber)).themeId;
}

export function getEncounterBeatId(burst: WaveBurstPlan): EncounterBeatId {
  if (burst.beatId) {
    return burst.beatId;
  }

  if (burst.bossCount > 0) {
    return "boss-vanguard";
  }

  if (burst.eliteCount >= 2) {
    return "elite-escort";
  }

  if (burst.artilleryCount >= 2 || (burst.artilleryCount > 0 && burst.sentryCount === 0)) {
    return "artillery-zone";
  }

  if (burst.sentryCount >= 2) {
    return "lane-pressure";
  }

  if ((burst.relayCount ?? 0) > 0 && burst.eliteCount > 0) {
    return "support-net";
  }

  if (burst.chargerCount >= 2) {
    return "ram-pressure";
  }

  if (burst.droneCount >= 4) {
    return "swarm";
  }

  return burst.pauseAfter >= 0.2 ? "breather" : "pickup-chase";
}
