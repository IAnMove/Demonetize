import {
  isActionCardId,
  isUpgradeId,
  type ActionCardId,
  type UpgradeId
} from "../gameplay/progression/upgrades";

export type RunRank = "a" | "b" | "c" | "d" | "s";

export interface RunSummaryRecord {
  chapter: number;
  bestCombo: number;
  elapsedSeconds: number;
  rank: RunRank;
  score: number;
  selectedChoiceIds?: UpgradeId[];
  usedActionCards?: ActionCardId[];
  waveNumber: number;
}

export interface LastRunRecord extends RunSummaryRecord {
  didWin: boolean;
}

export interface RunRecords {
  bestCombo: number;
  bestRank: RunRank;
  bestScore: number;
  bestWave: number;
  fastestVictorySeconds: number | null;
  lastRun: LastRunRecord | null;
  totalRuns: number;
  victories: number;
}

export interface RecordHighlights {
  bestCombo: boolean;
  bestRank: boolean;
  bestScore: boolean;
  bestWave: boolean;
  fastestVictory: boolean;
}

interface RecordUpdate {
  highlights: RecordHighlights;
  records: RunRecords;
}

const STORAGE_KEY = "overseer.run-records";

export function loadRunRecords(): RunRecords {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultRecords();
    }

    const parsed = JSON.parse(raw) as Partial<RunRecords>;

    return {
      bestCombo: Math.max(0, parsed.bestCombo ?? 0),
      bestRank: isRunRank(parsed.bestRank) ? parsed.bestRank : "d",
      bestScore: Math.max(0, parsed.bestScore ?? 0),
      bestWave: Math.max(0, parsed.bestWave ?? 0),
      fastestVictorySeconds:
        typeof parsed.fastestVictorySeconds === "number"
          ? Math.max(0, parsed.fastestVictorySeconds)
          : null,
      lastRun: parseLastRun(parsed.lastRun),
      totalRuns: Math.max(0, parsed.totalRuns ?? 0),
      victories: Math.max(0, parsed.victories ?? 0)
    };
  } catch {
    return createDefaultRecords();
  }
}

export function recordRunResult(
  summary: RunSummaryRecord,
  didWin: boolean,
  current: RunRecords
): RecordUpdate {
  const highlights: RecordHighlights = {
    bestCombo: summary.bestCombo > current.bestCombo,
    bestRank: compareRanks(summary.rank, current.bestRank) > 0,
    bestScore: summary.score > current.bestScore,
    bestWave: summary.waveNumber > current.bestWave,
    fastestVictory:
      didWin &&
      (current.fastestVictorySeconds === null ||
        summary.elapsedSeconds < current.fastestVictorySeconds)
  };

  const next: RunRecords = {
    bestCombo: Math.max(current.bestCombo, summary.bestCombo),
    bestRank:
      compareRanks(summary.rank, current.bestRank) > 0
        ? summary.rank
        : current.bestRank,
    bestScore: Math.max(current.bestScore, summary.score),
    bestWave: Math.max(current.bestWave, summary.waveNumber),
    fastestVictorySeconds: didWin
      ? current.fastestVictorySeconds === null
        ? summary.elapsedSeconds
        : Math.min(current.fastestVictorySeconds, summary.elapsedSeconds)
      : current.fastestVictorySeconds,
    lastRun: {
      chapter: summary.chapter,
      bestCombo: summary.bestCombo,
      didWin,
      elapsedSeconds: summary.elapsedSeconds,
      rank: summary.rank,
      score: summary.score,
      selectedChoiceIds: normalizeUpgradeIds(summary.selectedChoiceIds),
      usedActionCards: normalizeActionCardIds(summary.usedActionCards),
      waveNumber: summary.waveNumber
    },
    totalRuns: current.totalRuns + 1,
    victories: current.victories + (didWin ? 1 : 0)
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return { highlights, records: next };
}

function compareRanks(left: RunRank, right: RunRank): number {
  return getRankWeight(left) - getRankWeight(right);
}

function createDefaultRecords(): RunRecords {
  return {
    bestCombo: 0,
    bestRank: "d",
    bestScore: 0,
    bestWave: 0,
    fastestVictorySeconds: null,
    lastRun: null,
    totalRuns: 0,
    victories: 0
  };
}

function parseLastRun(value: unknown): LastRunRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const parsed = value as Partial<LastRunRecord>;
  if (
    !isRunRank(parsed.rank) ||
    typeof parsed.didWin !== "boolean" ||
    typeof parsed.chapter !== "number" ||
    typeof parsed.bestCombo !== "number" ||
    typeof parsed.elapsedSeconds !== "number" ||
    typeof parsed.score !== "number" ||
    typeof parsed.waveNumber !== "number"
  ) {
    return null;
  }

  return {
    chapter: Math.max(1, parsed.chapter),
    bestCombo: Math.max(0, parsed.bestCombo),
    didWin: parsed.didWin,
    elapsedSeconds: Math.max(0, parsed.elapsedSeconds),
    rank: parsed.rank,
    score: Math.max(0, parsed.score),
    selectedChoiceIds: normalizeUpgradeIds(parsed.selectedChoiceIds),
    usedActionCards: normalizeActionCardIds(parsed.usedActionCards),
    waveNumber: Math.max(0, parsed.waveNumber)
  };
}

function normalizeUpgradeIds(value: unknown): UpgradeId[] {
  return Array.isArray(value) ? value.filter(isUpgradeId) : [];
}

function normalizeActionCardIds(value: unknown): ActionCardId[] {
  return Array.isArray(value)
    ? value.filter((upgradeId): upgradeId is ActionCardId =>
        isUpgradeId(upgradeId) && isActionCardId(upgradeId)
      )
    : [];
}

function getRankWeight(rank: RunRank): number {
  switch (rank) {
    case "s":
      return 4;
    case "a":
      return 3;
    case "b":
      return 2;
    case "c":
      return 1;
    default:
      return 0;
  }
}

function isRunRank(value: unknown): value is RunRank {
  return (
    value === "s" || value === "a" || value === "b" || value === "c" || value === "d"
  );
}
