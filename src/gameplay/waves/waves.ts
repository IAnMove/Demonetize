import { GAME_CONFIG } from "../../core/config";
import type {
  EnemyArchetype,
  EnemyMutation,
  EnemySpawnDefinition
} from "../enemies/enemies";
import type { Vec2 } from "../math";
import {
  getEncounterBeatId,
  getWavePlan,
  type EncounterBeatId,
  type WaveBurstPlan
} from "./waveConfig";

export type WavePhase = "spawning" | "cleanup" | "paused" | "complete";
export type WaveResolution =
  | "between-waves"
  | "chapter-transition"
  | "victory"
  | null;

export interface WaveDirectorState {
  chapter: number;
  currentWave: number;
  phase: WavePhase;
  spawnCooldown: number;
  spawnInterval: number;
  spawnQueue: QueuedEnemySpawn[];
}

export interface WaveSnapshot {
  chapter: number;
  currentWave: number;
  enemiesRemaining: number;
  phase: WavePhase;
  phaseLabel: string;
}

interface QueuedEnemySpawn {
  archetype: EnemyArchetype;
  beatId: EncounterBeatId;
  cooldownAfter: number;
  mutation: EnemyMutation | null;
}

export function createWaveDirector(): WaveDirectorState {
  const director: WaveDirectorState = {
    chapter: 1,
    currentWave: 0,
    phase: "spawning",
    spawnCooldown: 0,
    spawnInterval: 0.65,
    spawnQueue: []
  };

  resetWaveDirector(director);
  return director;
}

export function advanceToNextWave(director: WaveDirectorState): void {
  if (director.phase === "complete") {
    return;
  }

  startNextWave(director);
}

export function getWaveSnapshot(
  director: WaveDirectorState,
  activeEnemyCount: number
): WaveSnapshot {
  const enemiesRemaining = activeEnemyCount + director.spawnQueue.length;
  let phaseLabel = "Sweep";

  if (director.phase === "paused") {
    phaseLabel = "Upgrade";
  } else if (
    director.currentWave >= GAME_CONFIG.finalWave &&
    director.phase !== "complete"
  ) {
    phaseLabel = "Final Push";
  } else if (director.phase === "spawning") {
    phaseLabel = "Deploying";
  } else if (director.phase === "complete") {
    phaseLabel = "Cleared";
  } else if (enemiesRemaining <= 2) {
    phaseLabel = "Advance";
  }

  return {
    chapter: director.chapter,
    currentWave: director.currentWave,
    enemiesRemaining,
    phase: director.phase,
    phaseLabel
  };
}

export function resetWaveDirector(director: WaveDirectorState): void {
  director.chapter = 1;
  director.currentWave = 0;
  director.phase = "spawning";
  director.spawnCooldown = 0;
  director.spawnInterval = 0.65;
  director.spawnQueue = [];

  startNextWave(director);
}

export function forceWaveForDebug(
  director: WaveDirectorState,
  waveNumber: number
): void {
  const targetWave = Math.max(
    1,
    Math.min(GAME_CONFIG.finalWave, Math.round(waveNumber))
  );
  director.chapter =
    targetWave > GAME_CONFIG.chapterTransitionWave ? 2 : 1;
  director.currentWave = targetWave - 1;
  director.phase = "spawning";
  director.spawnCooldown = 0;
  director.spawnInterval = 0.65;
  director.spawnQueue = [];

  startNextWave(director);
}

export function resolveWaveProgress(
  director: WaveDirectorState,
  activeEnemyCount: number
): WaveResolution {
  if (director.phase !== "cleanup" || activeEnemyCount > 0) {
    return null;
  }

  if (director.currentWave >= GAME_CONFIG.finalWave) {
    director.phase = "complete";
    return "victory";
  }

  if (
    director.chapter === 1 &&
    director.currentWave === GAME_CONFIG.chapterTransitionWave
  ) {
    director.chapter = 2;
    director.phase = "paused";
    return "chapter-transition";
  }

  if (!shouldOfferStandardUpgrade(director.currentWave)) {
    startNextWave(director);
    return null;
  }

  director.phase = "paused";
  return "between-waves";
}

export function updateWaveDirector(
  director: WaveDirectorState,
  spawnEnemy: (definition: EnemySpawnDefinition) => void,
  deltaSeconds: number
): void {
  if (director.phase !== "spawning") {
    return;
  }

  director.spawnCooldown -= deltaSeconds;

  while (director.spawnQueue.length > 0 && director.spawnCooldown <= 0) {
    const queuedSpawn = director.spawnQueue.shift()!;
    spawnEnemy({
      archetype: queuedSpawn.archetype,
      level: director.currentWave,
      mutation: queuedSpawn.mutation,
      position: createSpawnPosition(
        queuedSpawn.archetype,
        director.chapter,
        queuedSpawn.beatId
      )
    });
    director.spawnCooldown += queuedSpawn.cooldownAfter;
  }

  if (director.spawnQueue.length === 0) {
    director.phase = "cleanup";
  }
}

function createSpawnPosition(
  archetype: EnemyArchetype,
  chapter: number,
  beatId: EncounterBeatId = "swarm"
): Vec2 {
  if (archetype === "overseer") {
    return {
      x: chapter === 1 ? 0 : 4.5,
      y: GAME_CONFIG.arenaRadius + 2.6
    };
  }

  const angle =
    beatId === "lane-pressure"
      ? snapAngleToLane(Math.random() * Math.PI * 2, 4)
      : beatId === "ram-pressure"
        ? snapAngleToLane(Math.random() * Math.PI * 2, 6)
        : Math.random() * Math.PI * 2;
  const radius =
    GAME_CONFIG.arenaRadius +
    (archetype === "artillery"
      ? 1.6
      : archetype === "sentry"
        ? 0.8
        : archetype === "relay"
          ? 1.05
          : 1.5) +
    (beatId === "artillery-zone" && archetype === "artillery" ? 1.15 : 0) +
    (beatId === "support-net" && archetype === "relay" ? 0.55 : 0) +
    Math.random() *
      (archetype === "artillery"
        ? 2.6
        : archetype === "sentry"
          ? 1.4
          : archetype === "relay"
            ? 1.9
            : 2.25) +
    (chapter - 1) * 0.35;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function snapAngleToLane(angle: number, laneCount: number): number {
  const laneStep = (Math.PI * 2) / laneCount;
  const laneIndex = Math.round(angle / laneStep);
  return laneIndex * laneStep + (Math.random() - 0.5) * laneStep * 0.28;
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = items[index];
    items[index] = items[nextIndex];
    items[nextIndex] = currentItem;
  }

  return items;
}

function startNextWave(director: WaveDirectorState): void {
  const plan = getWavePlan(director.currentWave + 1);
  const spawnQueue = buildWaveQueue(plan);

  director.currentWave = plan.waveNumber;
  director.phase = "spawning";
  director.spawnCooldown =
    director.chapter === 1
      ? plan.bursts.some((burst) => burst.bossCount > 0)
        ? 0.1
        : 0.15
      : plan.bursts.some((burst) => burst.bossCount > 0)
        ? 0.06
        : 0.04;
  director.spawnInterval = plan.spawnInterval;
  director.spawnQueue = spawnQueue;
}

function buildWaveQueue(
  plan: ReturnType<typeof getWavePlan>
): QueuedEnemySpawn[] {
  const queue: QueuedEnemySpawn[] = [];
  let previousBeatId: EncounterBeatId | null = null;

  for (const burst of plan.bursts) {
    const beatId = getEncounterBeatId(burst);
    const transitionPause = getBeatTransitionPause(
      previousBeatId,
      beatId,
      plan.spawnInterval,
      plan.waveNumber
    );

    if (queue.length > 0 && transitionPause > 0) {
      queue[queue.length - 1].cooldownAfter += transitionPause;
    }

    const burstQueue = buildBurstQueue(burst, plan.spawnInterval, beatId);
    applyEliteBudget(burstQueue, burst.eliteCount, plan.waveNumber, beatId);

    if (burst.pauseAfter > 0 && burstQueue.length > 0) {
      burstQueue[burstQueue.length - 1].cooldownAfter += Math.max(
        burst.pauseAfter,
        getBeatRecoveryPause(beatId, plan.waveNumber)
      );
    }

    queue.push(...burstQueue);
    previousBeatId = beatId;
  }

  return queue;
}

function buildBurstQueue(
  burst: WaveBurstPlan,
  spawnInterval: number,
  beatId: EncounterBeatId
): QueuedEnemySpawn[] {
  const groups: Record<Exclude<EnemyArchetype, "overseer">, QueuedEnemySpawn[]> = {
    artillery: createSpawnGroup("artillery", burst.artilleryCount, spawnInterval, beatId),
    charger: createSpawnGroup("charger", burst.chargerCount, spawnInterval, beatId),
    drone: createSpawnGroup("drone", burst.droneCount, spawnInterval, beatId),
    relay: createSpawnGroup("relay", burst.relayCount ?? 0, spawnInterval, beatId),
    sentry: createSpawnGroup("sentry", burst.sentryCount, spawnInterval, beatId)
  };
  const escortQueue = orderBeatGroups(groups, beatId);

  return [
    ...Array.from({ length: burst.bossCount }, () =>
      createQueuedSpawn("overseer", spawnInterval, beatId)
    ),
    ...escortQueue
  ];
}

function createQueuedSpawn(
  archetype: EnemyArchetype,
  spawnInterval: number,
  beatId: EncounterBeatId
): QueuedEnemySpawn {
  return {
    archetype,
    beatId,
    cooldownAfter: spawnInterval,
    mutation: null
  };
}

function createSpawnGroup(
  archetype: Exclude<EnemyArchetype, "overseer">,
  count: number,
  spawnInterval: number,
  beatId: EncounterBeatId
): QueuedEnemySpawn[] {
  return Array.from({ length: count }, () =>
    createQueuedSpawn(archetype, spawnInterval, beatId)
  );
}

function orderBeatGroups(
  groups: Record<Exclude<EnemyArchetype, "overseer">, QueuedEnemySpawn[]>,
  beatId: EncounterBeatId
): QueuedEnemySpawn[] {
  switch (beatId) {
    case "artillery-zone":
      return [...groups.artillery, ...shuffle([...groups.relay, ...groups.drone, ...groups.charger, ...groups.sentry])];
    case "elite-escort":
      return [...groups.relay, ...shuffle([...groups.sentry, ...groups.artillery, ...groups.charger]), ...groups.drone];
    case "lane-pressure":
      return [...groups.sentry, ...groups.artillery, ...shuffle([...groups.drone, ...groups.charger, ...groups.relay])];
    case "ram-pressure":
      return [...groups.charger, ...shuffle([...groups.drone, ...groups.sentry, ...groups.relay, ...groups.artillery])];
    case "support-net":
      return [...groups.relay, ...shuffle([...groups.artillery, ...groups.sentry, ...groups.drone, ...groups.charger])];
    case "swarm":
      return [...groups.drone, ...shuffle([...groups.charger, ...groups.sentry, ...groups.relay, ...groups.artillery])];
    case "boss-vanguard":
      return [...shuffle([...groups.drone, ...groups.charger]), ...groups.sentry, ...groups.artillery, ...groups.relay];
    case "breather":
    case "pickup-chase":
    default:
      return shuffle([
        ...groups.drone,
        ...groups.charger,
        ...groups.sentry,
        ...groups.artillery,
        ...groups.relay
      ]);
  }
}

function getBeatTransitionPause(
  previousBeatId: EncounterBeatId | null,
  nextBeatId: EncounterBeatId,
  spawnInterval: number,
  waveNumber: number
): number {
  if (!previousBeatId) {
    return 0;
  }

  if (previousBeatId === nextBeatId) {
    return spawnInterval * (waveNumber >= 9 ? 2.2 : 1.8);
  }

  if (isPressureBeat(previousBeatId) && !isPressureBeat(nextBeatId)) {
    return spawnInterval * 1.35;
  }

  if (isPressureBeat(previousBeatId) && isPressureBeat(nextBeatId)) {
    return spawnInterval * 0.72;
  }

  return 0;
}

function getBeatRecoveryPause(
  beatId: EncounterBeatId,
  waveNumber: number
): number {
  if (!isPressureBeat(beatId)) {
    return 0;
  }

  return waveNumber >= 9 ? 0.22 : 0.16;
}

function isPressureBeat(beatId: EncounterBeatId): boolean {
  return (
    beatId === "artillery-zone" ||
    beatId === "boss-vanguard" ||
    beatId === "elite-escort" ||
    beatId === "lane-pressure" ||
    beatId === "ram-pressure" ||
    beatId === "support-net"
  );
}

function applyEliteBudget(
  queue: QueuedEnemySpawn[],
  eliteCount: number,
  waveNumber: number,
  beatId: EncounterBeatId
): void {
  let remaining = eliteCount;

  for (const archetype of getElitePriority(beatId)) {
    if (remaining <= 0) {
      break;
    }

    const candidateIndexes = shuffle(
      queue
        .map((entry, index) => (entry.archetype === archetype ? index : -1))
        .filter((index) => index >= 0)
    );

    while (remaining > 0 && candidateIndexes.length > 0) {
      const nextIndex = candidateIndexes.shift()!;
      queue[nextIndex].mutation = pickEliteMutation(archetype, waveNumber);
      remaining -= 1;
    }
  }
}

function getElitePriority(
  beatId: EncounterBeatId
): readonly Exclude<EnemyArchetype, "overseer">[] {
  switch (beatId) {
    case "artillery-zone":
      return ["artillery", "relay", "sentry", "charger", "drone"];
    case "lane-pressure":
      return ["sentry", "artillery", "charger", "relay", "drone"];
    case "ram-pressure":
      return ["charger", "drone", "sentry", "relay", "artillery"];
    case "support-net":
    case "elite-escort":
      return ["relay", "sentry", "charger", "artillery", "drone"];
    case "swarm":
      return ["drone", "charger", "sentry", "relay", "artillery"];
    default:
      return ["artillery", "relay", "sentry", "charger", "drone"];
  }
}

function pickEliteMutation(
  archetype: Exclude<EnemyArchetype, "overseer">,
  waveNumber: number
): EnemyMutation {
  const lateWave = waveNumber >= GAME_CONFIG.finalWave - 1;

  switch (archetype) {
    case "artillery":
      return lateWave || Math.random() < 0.62 ? "overclocked" : "volatile";
    case "relay":
      return lateWave || Math.random() < 0.55 ? "bulwark" : "overclocked";
    case "sentry":
      return lateWave || Math.random() < 0.6 ? "overclocked" : "bulwark";
    case "charger":
      if (lateWave) {
        return Math.random() < 0.55 ? "volatile" : "bulwark";
      }
      return Math.random() < 0.5 ? "bulwark" : "overclocked";
    default:
      return lateWave || Math.random() < 0.58 ? "volatile" : "overclocked";
  }
}

function shouldOfferStandardUpgrade(waveNumber: number): boolean {
  return (
    waveNumber === 3 ||
    waveNumber === 6 ||
    waveNumber === 8 ||
    waveNumber === 10 ||
    waveNumber === 12
  );
}
