import type { I18nController, Locale } from "../core/i18n";
import type { GameState } from "../core/stateMachine";
import type { LastRunRecord, RecordHighlights, RunRecords } from "../core/runRecords";
import {
  getBuildProfile,
  getUpgradeFit,
  getUpgradeArchetypeTags,
  type BuildArchetype
} from "../gameplay/progression/builds";
import {
  isActionCardId,
  type ActionCardId,
  type UpgradeChoice,
  type UpgradeId
} from "../gameplay/progression/upgrades";
import { createBoostCardFace } from "./boostCards";

interface OverlayHandlers {
  onContinueChapter: () => void;
  onRestart: () => void;
  onSelectUpgrade: (upgradeId: UpgradeId) => void;
  onStart: () => void;
}

interface RunSummary {
  bestCombo: number;
  bestRescueStreak: number;
  chapter: number;
  elapsedSeconds: number;
  lossReason?:
    | "artillery"
    | "boss-beam"
    | "boss-pulse"
    | "charger"
    | "drone"
    | "edge"
    | "elite-burst"
    | "overrun"
    | "overseer"
    | "purge"
    | "relay"
    | "sentry";
  lostRescueCount: number;
  rank: "a" | "b" | "c" | "d" | "s";
  rescuedCount: number;
  score: number;
  selectedChoices: UpgradeChoice[];
  usedActionCards: ActionCardId[];
  waveNumber: number;
}

export interface OverlayController {
  setRecords: (records: RunRecords) => void;
  setChapterTransition: (
    chapter: number,
    availableChoices: UpgradeChoice[],
    selectedChoices: UpgradeChoice[],
    rescueBonusUnlocked: boolean
  ) => void;
  setProgression: (
    choices: UpgradeChoice[],
    selectedChoices: UpgradeChoice[],
    waveNumber: number,
    summary: RunSummary,
    rescueBonusUnlocked: boolean
  ) => void;
  setRunSummary: (summary: RunSummary, highlights?: RecordHighlights) => void;
  setState: (state: GameState) => void;
}

export function createOverlays(
  container: HTMLDivElement,
  handlers: OverlayHandlers,
  i18n: I18nController
): OverlayController {
  let progressionChoices: UpgradeChoice[] = [];
  let progressionBonusUnlocked = false;
  let progressionSelected: UpgradeChoice[] = [];
  let progressionWave = 0;
  let records: RunRecords = {
    bestCombo: 0,
    bestRank: "d",
    bestScore: 0,
    bestWave: 0,
    fastestVictorySeconds: null,
    lastRun: null,
    totalRuns: 0,
    victories: 0
  };
  let chapterTransitionNumber = 2;
  let chapterTransitionAvailable: UpgradeChoice[] = [];
  let chapterTransitionBonusUnlocked = false;
  let chapterTransitionChoices: UpgradeChoice[] = [];
  let progressionSummary: RunSummary = {
    bestCombo: 0,
    bestRescueStreak: 0,
    chapter: 1,
    elapsedSeconds: 0,
    lostRescueCount: 0,
    rank: "d",
    rescuedCount: 0,
    score: 0,
    selectedChoices: [],
    usedActionCards: [],
    waveNumber: 0
  };
  let runSummary: RunSummary = {
    bestCombo: 0,
    bestRescueStreak: 0,
    chapter: 1,
    elapsedSeconds: 0,
    lostRescueCount: 0,
    rank: "d",
    rescuedCount: 0,
    score: 0,
    selectedChoices: [],
    usedActionCards: [],
    waveNumber: 0
  };
  let runHighlights: RecordHighlights = {
    bestCombo: false,
    bestRank: false,
    bestScore: false,
    bestWave: false,
    fastestVictory: false
  };

  const localeSwitch = document.createElement("div");
  localeSwitch.className = "locale-switch";

  const localeLabel = document.createElement("span");
  localeLabel.className = "locale-label";

  const localeOptions = document.createElement("div");
  localeOptions.className = "locale-options";

  const spanishButton = document.createElement("button");
  spanishButton.className = "locale-option";
  spanishButton.type = "button";
  spanishButton.textContent = "ES";
  spanishButton.addEventListener("click", () => {
    i18n.setLocale("es");
  });

  const englishButton = document.createElement("button");
  englishButton.className = "locale-option";
  englishButton.type = "button";
  englishButton.textContent = "EN";
  englishButton.addEventListener("click", () => {
    i18n.setLocale("en");
  });

  localeOptions.append(spanishButton, englishButton);
  localeSwitch.append(localeLabel, localeOptions);

  const titleScreen = document.createElement("section");
  titleScreen.className = "screen";

  const titlePanel = document.createElement("div");
  titlePanel.className = "screen-panel";

  const titleEyebrow = document.createElement("span");
  titleEyebrow.className = "eyebrow";

  const titleHeading = createSplitHeading();
  const titleCopy = document.createElement("p");
  titleCopy.className = "screen-copy";
  const titleReadout = document.createElement("div");
  titleReadout.className = "readout-strip";
  const titlePlayerTag = document.createElement("span");
  titlePlayerTag.className = "readout-pill";
  const titleEnemyTag = document.createElement("span");
  titleEnemyTag.className = "readout-pill";
  const titleDraftTag = document.createElement("span");
  titleDraftTag.className = "readout-pill";
  const titleRecordsLabel = document.createElement("p");
  titleRecordsLabel.className = "micro-copy";
  const titleRecords = document.createElement("p");
  titleRecords.className = "micro-copy";
  const titleLastRunLabel = document.createElement("p");
  titleLastRunLabel.className = "micro-copy";
  const titleLastRun = document.createElement("p");
  titleLastRun.className = "micro-copy";
  const titleStats = document.createElement("div");
  titleStats.className = "run-metric-grid is-title";
  const titleRunsCard = createRunMetricCard();
  const titleWinsCard = createRunMetricCard();
  const titleWinRateCard = createRunMetricCard();
  titleStats.append(titleRunsCard.root, titleWinsCard.root, titleWinRateCard.root);
  const titleGoalLabel = document.createElement("p");
  titleGoalLabel.className = "micro-copy";
  const titleGoal = document.createElement("p");
  titleGoal.className = "goal-banner";
  const titleGoalSupport = document.createElement("p");
  titleGoalSupport.className = "goal-support";
  const titleTagline = createTagline();

  const titleActions = document.createElement("div");
  titleActions.className = "screen-actions";

  const startButton = document.createElement("button");
  startButton.addEventListener("click", handlers.onStart);

  const startHint = document.createElement("span");
  startHint.className = "micro-copy";

  titleActions.append(startButton, startHint);
  titleReadout.append(titlePlayerTag, titleEnemyTag, titleDraftTag);
  titlePanel.append(
    titleEyebrow,
    titleHeading.root,
    titleCopy,
    titleStats,
    titleGoal,
    titleActions
  );
  titleScreen.appendChild(titlePanel);

  const chapterScreen = document.createElement("section");
  chapterScreen.className = "screen";
  chapterScreen.hidden = true;

  const chapterPanel = document.createElement("div");
  chapterPanel.className = "screen-panel is-upgrade-panel";

  const chapterEyebrow = document.createElement("span");
  chapterEyebrow.className = "eyebrow";

  const chapterHeading = createSplitHeading("h2");
  const chapterCopy = document.createElement("p");
  chapterCopy.className = "screen-copy";
  const chapterTagline = createTagline();
  const chapterSummary = document.createElement("p");
  chapterSummary.className = "micro-copy";
  const chapterInstalled = document.createElement("p");
  chapterInstalled.className = "micro-copy";
  const chapterUpgradeLabel = document.createElement("p");
  chapterUpgradeLabel.className = "micro-copy";
  const chapterUpgradeGrid = document.createElement("div");
  chapterUpgradeGrid.className = "upgrade-grid";

  const chapterActions = document.createElement("div");
  chapterActions.className = "screen-actions";

  const chapterButton = document.createElement("button");
  chapterButton.addEventListener("click", handlers.onContinueChapter);

  chapterActions.append(chapterButton);
  chapterPanel.append(
    chapterEyebrow,
    chapterHeading.root,
    chapterCopy,
    chapterTagline,
    chapterSummary,
    chapterInstalled,
    chapterUpgradeLabel,
    chapterUpgradeGrid,
    chapterActions
  );
  chapterScreen.appendChild(chapterPanel);

  const betweenWavesScreen = document.createElement("section");
  betweenWavesScreen.className = "screen";
  betweenWavesScreen.hidden = true;

  const betweenWavesPanel = document.createElement("div");
  betweenWavesPanel.className = "screen-panel is-upgrade-panel";

  const betweenEyebrow = document.createElement("span");
  betweenEyebrow.className = "eyebrow";

  const betweenHeading = createSplitHeading("h2");
  const betweenCopy = document.createElement("p");
  betweenCopy.className = "screen-copy";

  const upgradeHistory = document.createElement("p");
  upgradeHistory.className = "micro-copy";

  const upgradeTelemetry = document.createElement("p");
  upgradeTelemetry.className = "micro-copy";
  const upgradeBuild = document.createElement("p");
  upgradeBuild.className = "run-support";

  const upgradeGrid = document.createElement("div");
  upgradeGrid.className = "upgrade-grid";

  betweenWavesPanel.append(
    betweenEyebrow,
    betweenHeading.root,
    betweenCopy,
    upgradeHistory,
    upgradeTelemetry,
    upgradeBuild,
    upgradeGrid
  );
  betweenWavesScreen.appendChild(betweenWavesPanel);

  const gameOverScreen = document.createElement("section");
  gameOverScreen.className = "screen";
  gameOverScreen.hidden = true;

  const gameOverPanel = document.createElement("div");
  gameOverPanel.className = "screen-panel";

  const gameOverEyebrow = document.createElement("span");
  gameOverEyebrow.className = "eyebrow";

  const gameOverHeading = createSplitHeading("h2");
  const gameOverCopy = document.createElement("p");
  gameOverCopy.className = "screen-copy";
  const gameOverTitle = document.createElement("p");
  gameOverTitle.className = "run-banner";
  const gameOverSummary = document.createElement("p");
  gameOverSummary.className = "micro-copy";
  const gameOverRank = document.createElement("p");
  gameOverRank.className = "summary-rank";
  const gameOverHighlights = document.createElement("div");
  gameOverHighlights.className = "summary-strip";
  const gameOverMetrics = document.createElement("div");
  gameOverMetrics.className = "run-metric-grid";
  const gameOverBuild = document.createElement("p");
  gameOverBuild.className = "run-support";
  const gameOverChase = document.createElement("p");
  gameOverChase.className = "run-support";
  const gameOverGoalLabel = document.createElement("p");
  gameOverGoalLabel.className = "micro-copy";
  const gameOverGoal = document.createElement("p");
  gameOverGoal.className = "goal-banner";
  const gameOverInstalled = document.createElement("p");
  gameOverInstalled.className = "micro-copy";

  const restartActions = document.createElement("div");
  restartActions.className = "screen-actions";

  const restartButton = document.createElement("button");
  restartButton.addEventListener("click", handlers.onRestart);

  const restartHint = document.createElement("span");
  restartHint.className = "micro-copy";

  const gameOverLegend = createControlLegend(i18n);

  restartActions.append(restartButton, restartHint);
  gameOverPanel.append(
    gameOverEyebrow,
    gameOverHeading.root,
    gameOverCopy,
    gameOverTitle,
    gameOverRank,
    gameOverHighlights,
    gameOverMetrics,
    gameOverBuild,
    gameOverChase,
    gameOverGoalLabel,
    gameOverGoal,
    gameOverSummary,
    gameOverInstalled,
    restartActions,
    gameOverLegend
  );
  gameOverScreen.appendChild(gameOverPanel);

  const victoryScreen = document.createElement("section");
  victoryScreen.className = "screen";
  victoryScreen.hidden = true;

  const victoryPanel = document.createElement("div");
  victoryPanel.className = "screen-panel";

  const victoryEyebrow = document.createElement("span");
  victoryEyebrow.className = "eyebrow";

  const victoryHeading = createSplitHeading("h2");
  const victoryCopy = document.createElement("p");
  victoryCopy.className = "screen-copy";
  const victoryTagline = createTagline();
  const victoryTitle = document.createElement("p");
  victoryTitle.className = "run-banner";
  const victorySummary = document.createElement("p");
  victorySummary.className = "micro-copy";
  const victoryRank = document.createElement("p");
  victoryRank.className = "summary-rank";
  const victoryHighlights = document.createElement("div");
  victoryHighlights.className = "summary-strip";
  const victoryMetrics = document.createElement("div");
  victoryMetrics.className = "run-metric-grid";
  const victoryBuild = document.createElement("p");
  victoryBuild.className = "run-support";
  const victoryChase = document.createElement("p");
  victoryChase.className = "run-support";
  const victoryGoalLabel = document.createElement("p");
  victoryGoalLabel.className = "micro-copy";
  const victoryGoal = document.createElement("p");
  victoryGoal.className = "goal-banner";
  const victoryInstalled = document.createElement("p");
  victoryInstalled.className = "micro-copy";

  const victoryActions = document.createElement("div");
  victoryActions.className = "screen-actions";

  const victoryRestartButton = document.createElement("button");
  victoryRestartButton.addEventListener("click", handlers.onRestart);

  const victoryHint = document.createElement("span");
  victoryHint.className = "micro-copy";

  victoryActions.append(victoryRestartButton, victoryHint);
  victoryPanel.append(
    victoryEyebrow,
    victoryHeading.root,
    victoryCopy,
    victoryTagline,
    victoryTitle,
    victoryRank,
    victoryHighlights,
    victoryMetrics,
    victoryBuild,
    victoryChase,
    victoryGoalLabel,
    victoryGoal,
    victorySummary,
    victoryInstalled,
    victoryActions
  );
  victoryScreen.appendChild(victoryPanel);

  container.append(
    localeSwitch,
    titleScreen,
    chapterScreen,
    betweenWavesScreen,
    gameOverScreen,
    victoryScreen
  );

  const renderLocale = (locale: Locale): void => {
    localeLabel.textContent = i18n.t("locale.label");
    spanishButton.classList.toggle("is-active", locale === "es");
    englishButton.classList.toggle("is-active", locale === "en");
    spanishButton.setAttribute("aria-pressed", String(locale === "es"));
    englishButton.setAttribute("aria-pressed", String(locale === "en"));
  };

  const renderLossReason = (reason: NonNullable<RunSummary["lossReason"]>): string => {
    const isSpanish = i18n.getLocale() === "es";
    const label = isSpanish ? "Causa" : "Cause";

    switch (reason) {
      case "artillery":
        return isSpanish ? `${label}: impacto de artilleria` : `${label}: artillery impact`;
      case "boss-beam":
        return isSpanish ? `${label}: rayo del Overseer` : `${label}: Overseer beam`;
      case "boss-pulse":
        return isSpanish ? `${label}: pulso de fase` : `${label}: phase pulse`;
      case "charger":
        return isSpanish ? `${label}: embestida` : `${label}: charge hit`;
      case "drone":
        return isSpanish ? `${label}: contacto de rastreador` : `${label}: scout contact`;
      case "edge":
        return isSpanish ? `${label}: borde de arena` : `${label}: arena edge`;
      case "elite-burst":
        return isSpanish ? `${label}: nucleo volatil` : `${label}: volatile core`;
      case "overseer":
        return isSpanish ? `${label}: embestida del Overseer` : `${label}: Overseer rush`;
      case "purge":
        return isSpanish ? `${label}: purga de rejilla` : `${label}: grid purge`;
      case "relay":
        return isSpanish ? `${label}: relay escoltado` : `${label}: relay escort`;
      case "sentry":
        return isSpanish ? `${label}: linea sentry` : `${label}: sentry lane`;
      default:
        return isSpanish ? `${label}: saturacion` : `${label}: overrun`;
    }
  };

  const renderSummaryLine = (summary: RunSummary): string =>
    i18n.t("summary.run", {
      chain: summary.bestCombo,
      chapter: summary.chapter,
      efficiency: renderRescueEfficiency(summary),
      lost: summary.lostRescueCount,
      rescueStreak: summary.bestRescueStreak,
      rescued: summary.rescuedCount,
      score: summary.score,
      time: `${summary.elapsedSeconds.toFixed(1)}s`,
      wave: summary.waveNumber
    });

  const renderGameOverSummaryLine = (summary: RunSummary): string => {
    if (!summary.lossReason) {
      return renderSummaryLine(summary);
    }

    return `${renderLossReason(summary.lossReason)} / ${renderSummaryLine(summary)}`;
  };

  const renderInstalledLine = (selectedChoices: UpgradeChoice[]): string =>
    selectedChoices.length === 0
      ? i18n.t("upgrade.history.empty", { wave: progressionWave || runSummary.waveNumber })
      : i18n.t("upgrade.history.installed", {
          modules: selectedChoices
            .map((choice) => i18n.getUpgradeText(choice.id).title)
            .join(" / ")
          });

  const renderRecordsLine = (): string => {
    const rank = getRankTitle(records.bestRank, i18n);
    if (records.fastestVictorySeconds === null) {
      return i18n.t("records.line", {
        chain: records.bestCombo,
        rank,
        score: records.bestScore,
        wins: records.victories
      });
    }

    return i18n.t("records.lineWithClear", {
      chain: records.bestCombo,
      rank,
      score: records.bestScore,
      time: `${records.fastestVictorySeconds.toFixed(1)}s`,
      wins: records.victories
    });
  };

  const renderLastRunLine = (): string => {
    if (!records.lastRun) {
      return i18n.t("records.lastRunEmpty");
    }

    const lastRun = records.lastRun;
    return i18n.t("records.lastRunLine", {
      chain: lastRun.bestCombo,
      chapter: lastRun.chapter,
      rank: getRankTitle(lastRun.rank, i18n),
      result: getLastRunLabel(lastRun, i18n),
      score: lastRun.score,
      wave: lastRun.waveNumber
    });
  };

  const renderTitleStats = (): void => {
    titleRunsCard.label.textContent = i18n.t("records.stat.runs");
    titleRunsCard.value.textContent = `${records.totalRuns}`;
    titleWinsCard.label.textContent = i18n.t("records.stat.victories");
    titleWinsCard.value.textContent = `${records.victories}`;
    titleWinRateCard.label.textContent = i18n.t("records.stat.winRate");
    titleWinRateCard.value.textContent =
      records.totalRuns > 0
        ? `${Math.round((records.victories / records.totalRuns) * 100)}%`
        : "--";
  };

  const renderRankLine = (summary: RunSummary): string =>
    i18n.t("summary.rank", {
      rank: summary.rank.toUpperCase(),
      title: getRankTitle(summary.rank, i18n)
    });

  const renderRescueEfficiency = (summary: RunSummary): string => {
    const total = summary.rescuedCount + summary.lostRescueCount;

    if (total <= 0) {
      return "--";
    }

    return `${Math.round((summary.rescuedCount / total) * 100)}%`;
  };

  const renderHighlights = (target: HTMLDivElement): void => {
    const highlightNodes = createRunHighlightChips(runHighlights, i18n);
    target.hidden = highlightNodes.length === 0;
    target.replaceChildren(...highlightNodes);
  };

  const renderRunTitle = (summary: RunSummary, didWin: boolean): string => {
    const profile = getBuildProfile(summary.selectedChoices);
    const isSpanish = i18n.getLocale() === "es";
    const rescueTotal = summary.rescuedCount + summary.lostRescueCount;
    const rescueEfficiency =
      rescueTotal > 0 ? summary.rescuedCount / rescueTotal : 0;

    if (didWin) {
      if (rescueTotal >= 3 && rescueEfficiency >= 0.85 && summary.bestRescueStreak >= 3) {
        return isSpanish ? "Pastor de Senales" : "Shepherd of Signals";
      }
      if (summary.rank === "s") {
        return isSpanish
          ? "Evento de Extincion Overseer"
          : "Overseer Extinction Event";
      }
      if (profile.primary === "dash-killer") {
        return isSpanish ? "Santo del Impacto Neon" : "Saint of Neon Impact";
      }
      if (profile.primary === "glass-cannon") {
        return isSpanish ? "Apostol del Canon de Cristal" : "Apostle of the Glass Cannon";
      }
      if (profile.primary === "spread-control") {
        return isSpanish ? "Huracan de Reticula" : "Lattice Hurricane";
      }
      return isSpanish ? "Superviviente de la Brecha" : "Breach Survivor";
    }

    if (summary.waveNumber <= 2) {
      return isSpanish ? "Manco de Mantenimiento" : "Maintenance Manco";
    }
    if (rescueTotal >= 3 && rescueEfficiency < 0.4) {
      return isSpanish ? "Carnicero de Extracciones" : "Extraction Butcher";
    }
    if (summary.chapter >= 2 && summary.waveNumber >= 8) {
      return isSpanish ? "Rozaste la Leyenda" : "So Close to Legend";
    }
    if (summary.rescuedCount >= 3 && summary.bestRescueStreak >= 2) {
      return isSpanish ? "Casi los Sacas a Todos" : "Almost Got Them Out";
    }
    if (summary.bestCombo >= 10) {
      return isSpanish ? "Duende de Cadena" : "Chain Goblin";
    }
    if (profile.primary === "glass-cannon") {
      return isSpanish ? "Canon Roto pero Elegante" : "Shattered but Stylish";
    }
    if (profile.primary === "spread-control") {
      return isSpanish ? "Ventilador de Balas" : "Bullet Fanatic";
    }
    return isSpanish ? "Heroe de Propulsor Roto" : "Broken Thruster Hero";
  };

  const renderBuildLineFromChoices = (selectedChoices: UpgradeChoice[]): string => {
    const profile = getBuildProfile(selectedChoices);
    const primary = getBuildLabel(profile.primary, i18n);
    const secondary = profile.secondary ? ` + ${getBuildLabel(profile.secondary, i18n)}` : "";
    const commitment = getBuildCommitmentLabel(profile, i18n);
    const legendaryText =
      profile.legendaryCount > 0
        ? i18n.getLocale() === "es"
          ? ` / ${profile.legendaryCount} legendaria${profile.legendaryCount > 1 ? "s" : ""}`
          : ` / ${profile.legendaryCount} legendary${profile.legendaryCount > 1 ? " modules" : " module"}`
        : "";
    return `${
      i18n.getLocale() === "es" ? "Build" : "Build"
    } // ${primary}${secondary} / ${commitment}${legendaryText}`;
  };

  const renderBuildLine = (summary: RunSummary): string => {
    const strongestBoost = renderStrongestBoost(summary.selectedChoices);
    const actionCards = renderActionCardUse(summary);

    return `${renderBuildLineFromChoices(summary.selectedChoices)} / ${strongestBoost} / ${actionCards}`;
  };

  const renderStrongestBoost = (selectedChoices: UpgradeChoice[]): string => {
    const passiveChoices = selectedChoices.filter((choice) => !isActionCardId(choice.id));

    if (passiveChoices.length === 0) {
      return i18n.getLocale() === "es" ? "sin pasivas" : "no passives";
    }

    const counts = new Map<UpgradeId, { choice: UpgradeChoice; count: number }>();
    for (const choice of passiveChoices) {
      const current = counts.get(choice.id);
      counts.set(choice.id, {
        choice,
        count: (current?.count ?? 0) + 1
      });
    }

    const strongest = [...counts.values()].sort((left, right) => {
      const leftWeight = left.count * 2 + (left.choice.tier === "elite" ? 3 : 0);
      const rightWeight = right.count * 2 + (right.choice.tier === "elite" ? 3 : 0);
      return rightWeight - leftWeight;
    })[0];
    const title = i18n.getUpgradeText(strongest.choice.id).title;
    const prefix = i18n.getLocale() === "es" ? "clave" : "key";

    return strongest.count > 1
      ? `${prefix}: ${title} x${strongest.count}`
      : `${prefix}: ${title}`;
  };

  const renderActionCardUse = (summary: RunSummary): string => {
    if (summary.usedActionCards.length > 0) {
      const counts = new Map<ActionCardId, number>();
      for (const actionId of summary.usedActionCards) {
        counts.set(actionId, (counts.get(actionId) ?? 0) + 1);
      }

      const actionSummary = [...counts.entries()]
        .map(([actionId, count]) => {
          const title = i18n.getUpgradeText(actionId).title;
          return count > 1 ? `${title} x${count}` : title;
        })
        .join(" / ");

      return i18n.getLocale() === "es"
        ? `cartas usadas: ${actionSummary}`
        : `cards used: ${actionSummary}`;
    }

    const heldCards = summary.selectedChoices.filter((choice) =>
      isActionCardId(choice.id)
    ).length;

    if (heldCards > 0) {
      return i18n.getLocale() === "es"
        ? `cartas guardadas: ${heldCards}`
        : `cards held: ${heldCards}`;
    }

    return i18n.getLocale() === "es" ? "sin cartas" : "no cards";
  };

  const renderChaseLine = (summary: RunSummary): string => {
    const isSpanish = i18n.getLocale() === "es";
    const scoreLine = runHighlights.bestScore
      ? isSpanish
        ? "nuevo PB de puntos"
        : "new score PB"
      : records.bestScore > summary.score
        ? isSpanish
          ? `${records.bestScore - summary.score} para el PB`
          : `${records.bestScore - summary.score} to PB`
        : isSpanish
          ? "PB de puntos igualado"
          : "score PB tied";
    const chainLine = runHighlights.bestCombo
      ? isSpanish
        ? "mejor cadena"
        : "best chain"
      : records.bestCombo > summary.bestCombo
        ? isSpanish
          ? `${records.bestCombo - summary.bestCombo} para mejor cadena`
          : `${records.bestCombo - summary.bestCombo} to best chain`
        : isSpanish
          ? "cadena igualada"
          : "chain tied";
    const depthLine = runHighlights.bestWave
      ? isSpanish
        ? "mayor profundidad"
        : "deepest push"
      : records.bestWave > summary.waveNumber
        ? isSpanish
          ? `${records.bestWave - summary.waveNumber} oleadas para la cima`
          : `${records.bestWave - summary.waveNumber} waves from deepest`
        : isSpanish
          ? "profundidad igualada"
          : "depth tied";
    return `${scoreLine} / ${chainLine} / ${depthLine}`;
  };

  const renderNextGoal = (
    summary: RunSummary | null
  ): { primary: string; secondary: string } => {
    const isSpanish = i18n.getLocale() === "es";

    if (records.totalRuns === 0 || summary === null) {
      return isSpanish
        ? {
            primary: "Consigue tu primera run registrada",
            secondary: "Entra, limpia la primera brecha y fija un ritmo base."
          }
        : {
            primary: "Log your first real run",
            secondary: "Drop in, clear the first breach, and set a baseline."
          };
    }

    if (records.victories === 0) {
      return isSpanish
        ? {
            primary: `Llega a la oleada ${Math.max(records.bestWave + 1, 3)}`,
            secondary: "La primera victoria vale mas que un ajuste pequeno de puntos."
          }
        : {
            primary: `Reach wave ${Math.max(records.bestWave + 1, 3)}`,
            secondary: "Your first clear matters more than a small score bump."
          };
    }

    if (summary.score < records.bestScore) {
      return isSpanish
        ? {
            primary: `Supera tu PB por ${records.bestScore - summary.score} puntos`,
            secondary: "Aprieta la cadena y fuerza una build mas agresiva."
          }
        : {
            primary: `Beat your PB by ${records.bestScore - summary.score} points`,
            secondary: "Push chain pressure harder and force a more aggressive build."
          };
    }

    if (summary.bestCombo < records.bestCombo) {
      return isSpanish
        ? {
            primary: `Rompe la cadena x${records.bestCombo}`,
            secondary: "Juega mas cerca del riesgo y no sueltes el tempo."
          }
        : {
            primary: `Break the x${records.bestCombo} chain mark`,
            secondary: "Play closer to risk and do not drop tempo."
          };
    }

    if (records.fastestVictorySeconds !== null && summary.elapsedSeconds > records.fastestVictorySeconds) {
      return isSpanish
        ? {
            primary: `Baja de ${records.fastestVictorySeconds.toFixed(1)}s`,
            secondary: "La siguiente mejora real es velocidad, no solo supervivencia."
          }
        : {
            primary: `Beat ${records.fastestVictorySeconds.toFixed(1)}s`,
            secondary: "The next real gain is pace, not just survival."
          };
    }

    if (
      summary.rescuedCount + summary.lostRescueCount >= 3 &&
      summary.rescuedCount < summary.lostRescueCount
    ) {
      return isSpanish
        ? {
            primary: "Mejora la extraccion",
            secondary: "Estas dejando demasiadas senales colapsar en la arena."
          }
        : {
            primary: "Improve extraction",
            secondary: "Too many rescue signals are collapsing in the arena."
          };
    }

    return isSpanish
      ? {
          primary: "Encadena una run mas limpia",
          secondary: "Mantén presión alta y convierte el clear en una demolición."
        }
      : {
          primary: "Chain a cleaner run",
          secondary: "Keep pressure high and turn the clear into a demolition."
        };
  };

  const renderRunMetrics = (
    target: HTMLDivElement,
    summary: RunSummary
  ): void => {
    const paceValue =
      records.fastestVictorySeconds !== null
        ? summary.elapsedSeconds <= records.fastestVictorySeconds
          ? i18n.getLocale() === "es"
            ? "PB"
            : "PB"
          : `+${(summary.elapsedSeconds - records.fastestVictorySeconds).toFixed(1)}s`
        : `${summary.elapsedSeconds.toFixed(1)}s`;
    target.replaceChildren(
      createRunMetricCard(
        i18n.t("summary.card.score"),
        `${summary.score}`,
        records.bestScore > summary.score ? `-${records.bestScore - summary.score}` : "PB"
      ).root,
      createRunMetricCard(
        i18n.t("summary.card.chain"),
        `x${summary.bestCombo}`,
        records.bestCombo > summary.bestCombo ? `-${records.bestCombo - summary.bestCombo}` : "PB"
      ).root,
      createRunMetricCard(
        i18n.t("summary.card.depth"),
        `C${summary.chapter}-${i18n.getLocale() === "es" ? "O" : "W"}${summary.waveNumber}`,
        records.bestWave > summary.waveNumber ? `-${records.bestWave - summary.waveNumber}` : "PB"
      ).root,
      createRunMetricCard(
        i18n.t("summary.card.rescue"),
        summary.rescuedCount + summary.lostRescueCount > 0
          ? `${summary.rescuedCount}/${summary.rescuedCount + summary.lostRescueCount}`
          : "--",
        summary.lostRescueCount > 0
          ? `${renderRescueEfficiency(summary)} / ${i18n.getLocale() === "es" ? "perdidos" : "lost"} ${summary.lostRescueCount}`
          : `${renderRescueEfficiency(summary)} / ${
              i18n.getLocale() === "es" ? "limpio" : "clean"
            } / x${summary.bestRescueStreak}`
      ).root,
      createRunMetricCard(i18n.t("summary.card.pace"), `${summary.elapsedSeconds.toFixed(1)}s`, paceValue).root
    );
  };

  const renderStaticText = (): void => {
    titleEyebrow.textContent = i18n.t("title.eyebrow");
    titleHeading.main.textContent = "OVERSEER";
    titleHeading.accent.textContent = "Neon Siege";
    titleCopy.textContent = i18n.t("title.copy");
    titlePlayerTag.textContent = i18n.t("title.playerTag");
    titleEnemyTag.textContent = i18n.t("title.enemyTag");
    titleDraftTag.textContent = i18n.t("title.draftTag");
    titleRecordsLabel.textContent = i18n.t("records.label");
    titleRecords.textContent = renderRecordsLine();
    titleLastRunLabel.textContent = i18n.t("records.lastRunLabel");
    titleLastRun.textContent = renderLastRunLine();
    renderTitleStats();
    titleGoalLabel.textContent = i18n.t("summary.nextGoal");
    const titleGoalCopy = renderNextGoal(records.lastRun
      ? {
            bestCombo: records.lastRun.bestCombo,
            bestRescueStreak: 0,
            chapter: records.lastRun.chapter,
            elapsedSeconds: records.lastRun.elapsedSeconds,
            lostRescueCount: 0,
          rank: records.lastRun.rank,
          rescuedCount: 0,
          score: records.lastRun.score,
          selectedChoices: [],
          usedActionCards: [],
          waveNumber: records.lastRun.waveNumber
        }
      : null);
    titleGoal.textContent = titleGoalCopy.primary;
    titleGoalSupport.textContent = titleGoalCopy.secondary;
    titleTagline.textContent = i18n.t("tagline.loop");
    startButton.textContent = i18n.t("title.start");
    startHint.textContent = i18n.t("title.hint");

    chapterEyebrow.textContent = i18n.t("chapter.eyebrow");
    chapterHeading.main.textContent = i18n.t("chapter.titleMain", {
      chapter: chapterTransitionNumber
    });
    chapterHeading.accent.textContent = i18n.t("chapter.titleAccent");
    chapterCopy.textContent = chapterTransitionBonusUnlocked
      ? i18n.t("chapter.copyBonus")
      : i18n.t("chapter.copy");
    chapterTagline.textContent = i18n.t("tagline.loop");
    chapterSummary.textContent = i18n.t(
      chapterTransitionBonusUnlocked
        ? "chapter.summaryBonus"
        : "chapter.summary",
      {
        chapter: chapterTransitionNumber,
        count: chapterTransitionChoices.length
      }
    );
    chapterInstalled.textContent = renderInstalledLine(chapterTransitionChoices);
    chapterUpgradeLabel.textContent = i18n.t("chapter.moduleLabel");
    chapterButton.textContent = i18n.t("chapter.continue");
    chapterButton.hidden = chapterTransitionAvailable.length > 0;
    chapterActions.hidden = chapterTransitionAvailable.length > 0;
    chapterUpgradeGrid.replaceChildren(
      ...chapterTransitionAvailable.map((choice, index) =>
        createUpgradeCard(
          choice,
          handlers,
          i18n,
          chapterTransitionChoices,
          index
        )
      )
    );

    betweenEyebrow.textContent = i18n.t("upgrade.eyebrow");
    betweenHeading.main.textContent = i18n.t("upgrade.titleMain");
    betweenHeading.accent.textContent = i18n.t("upgrade.titleAccent");
    betweenCopy.textContent = progressionBonusUnlocked
      ? i18n.t("upgrade.copyBonus")
      : i18n.t("upgrade.copy");
    upgradeTelemetry.textContent = i18n.t("summary.telemetry", {
      chain: progressionSummary.bestCombo,
      score: progressionSummary.score
    });
    upgradeBuild.textContent = renderBuildLineFromChoices(progressionSelected);

    gameOverEyebrow.textContent = i18n.t("gameOver.eyebrow");
    gameOverHeading.main.textContent = i18n.t("gameOver.titleMain");
    gameOverHeading.accent.textContent = i18n.t("gameOver.titleAccent");
    gameOverCopy.textContent = i18n.t("gameOver.copy");
    gameOverTitle.textContent = renderRunTitle(runSummary, false);
    gameOverRank.textContent = renderRankLine(runSummary);
    renderHighlights(gameOverHighlights);
    renderRunMetrics(gameOverMetrics, runSummary);
    gameOverBuild.textContent = renderBuildLine(runSummary);
    gameOverChase.textContent = renderChaseLine(runSummary);
    gameOverGoalLabel.textContent = i18n.t("summary.nextGoal");
    gameOverGoal.textContent = renderNextGoal(runSummary).primary;
    gameOverSummary.textContent = renderGameOverSummaryLine(runSummary);
    gameOverInstalled.textContent = renderInstalledLine(runSummary.selectedChoices);
    restartButton.textContent = i18n.t("gameOver.restart");
    restartHint.textContent = i18n.t("gameOver.hint");

    victoryEyebrow.textContent = i18n.t("victory.eyebrow");
    victoryHeading.main.textContent = i18n.t("victory.titleMain");
    victoryHeading.accent.textContent = i18n.t("victory.titleAccent");
    victoryCopy.textContent = i18n.t("victory.copy");
    victoryTagline.textContent = i18n.t("tagline.loop");
    victoryTitle.textContent = renderRunTitle(runSummary, true);
    victoryRank.textContent = renderRankLine(runSummary);
    renderHighlights(victoryHighlights);
    renderRunMetrics(victoryMetrics, runSummary);
    victoryBuild.textContent = renderBuildLine(runSummary);
    victoryChase.textContent = renderChaseLine(runSummary);
    victoryGoalLabel.textContent = i18n.t("summary.nextGoal");
    victoryGoal.textContent = renderNextGoal(runSummary).primary;
    victorySummary.textContent = i18n.t("victory.summary", {
      count: runSummary.selectedChoices.length,
      wave: runSummary.waveNumber
    });
    victoryInstalled.textContent = renderSummaryLine(runSummary);
    victoryRestartButton.textContent = i18n.t("victory.restart");
    victoryHint.textContent = i18n.t("victory.hint");

    renderProgression();
  };

  const renderProgression = (): void => {
    upgradeHistory.textContent =
      progressionSelected.length === 0
        ? i18n.t("upgrade.history.empty", { wave: progressionWave })
        : i18n.t("upgrade.history.installed", {
            modules: progressionSelected
              .map((choice) => i18n.getUpgradeText(choice.id).title)
              .join(" / ")
          });
    upgradeTelemetry.textContent = i18n.t("summary.telemetry", {
      chain: progressionSummary.bestCombo,
      score: progressionSummary.score
    });

    upgradeGrid.replaceChildren(
      ...progressionChoices.map((choice, index) =>
        createUpgradeCard(
          choice,
          handlers,
          i18n,
          progressionSelected,
          index
        )
      )
    );
  };

  i18n.subscribe((locale) => {
    renderLocale(locale);
    renderStaticText();
  });

  return {
    setRecords: (nextRecords) => {
      records = nextRecords;
      titleRecords.textContent = renderRecordsLine();
      titleLastRun.textContent = renderLastRunLine();
      renderTitleStats();
      const titleGoalCopy = renderNextGoal(records.lastRun
        ? {
            bestCombo: records.lastRun.bestCombo,
            bestRescueStreak: 0,
            chapter: records.lastRun.chapter,
            elapsedSeconds: records.lastRun.elapsedSeconds,
            lostRescueCount: 0,
            rank: records.lastRun.rank,
            rescuedCount: 0,
            score: records.lastRun.score,
            selectedChoices: [],
            usedActionCards: [],
            waveNumber: records.lastRun.waveNumber
          }
        : null);
      titleGoal.textContent = titleGoalCopy.primary;
      titleGoalSupport.textContent = titleGoalCopy.secondary;
    },
    setChapterTransition: (
      chapter,
      availableChoices,
      selectedChoices,
      rescueBonusUnlocked
    ) => {
      chapterTransitionNumber = chapter;
      chapterTransitionAvailable = availableChoices;
      chapterTransitionBonusUnlocked = rescueBonusUnlocked;
      chapterTransitionChoices = selectedChoices;
      chapterCopy.textContent = rescueBonusUnlocked
        ? i18n.t("chapter.copyBonus")
        : i18n.t("chapter.copy");
      chapterSummary.textContent = i18n.t(
        rescueBonusUnlocked
          ? "chapter.summaryBonus"
          : "chapter.summary",
        {
          chapter,
          count: selectedChoices.length
        }
      );
      chapterInstalled.textContent = renderInstalledLine(selectedChoices);
      chapterHeading.main.textContent = i18n.t("chapter.titleMain", {
        chapter
      });
      chapterButton.hidden = availableChoices.length > 0;
      chapterActions.hidden = availableChoices.length > 0;
      chapterUpgradeGrid.replaceChildren(
        ...availableChoices.map((choice, index) =>
          createUpgradeCard(
            choice,
            handlers,
            i18n,
            selectedChoices,
            index
          )
        )
      );
    },
    setProgression: (
      choices,
      selectedChoices,
      waveNumber,
      summary,
      rescueBonusUnlocked
    ) => {
      progressionChoices = choices;
      progressionBonusUnlocked = rescueBonusUnlocked;
      progressionSelected = selectedChoices;
      progressionWave = waveNumber;
      progressionSummary = summary;
      betweenCopy.textContent = rescueBonusUnlocked
        ? i18n.t("upgrade.copyBonus")
        : i18n.t("upgrade.copy");
      renderProgression();
    },
    setRunSummary: (summary, highlights) => {
      runSummary = summary;
      runHighlights = highlights ?? {
        bestCombo: false,
        bestRank: false,
        bestScore: false,
        bestWave: false,
        fastestVictory: false
      };
      gameOverTitle.textContent = renderRunTitle(summary, false);
      gameOverRank.textContent = renderRankLine(summary);
      renderHighlights(gameOverHighlights);
      renderRunMetrics(gameOverMetrics, summary);
      gameOverBuild.textContent = renderBuildLine(summary);
      gameOverChase.textContent = renderChaseLine(summary);
      gameOverGoal.textContent = renderNextGoal(summary).primary;
      gameOverSummary.textContent = renderGameOverSummaryLine(summary);
      gameOverInstalled.textContent = renderInstalledLine(summary.selectedChoices);
      victoryTitle.textContent = renderRunTitle(summary, true);
      victoryRank.textContent = renderRankLine(summary);
      renderHighlights(victoryHighlights);
      renderRunMetrics(victoryMetrics, summary);
      victoryBuild.textContent = renderBuildLine(summary);
      victoryChase.textContent = renderChaseLine(summary);
      victoryGoal.textContent = renderNextGoal(summary).primary;
      victorySummary.textContent = i18n.t("victory.summary", {
        count: summary.selectedChoices.length,
        wave: summary.waveNumber
      });
      victoryInstalled.textContent = renderSummaryLine(summary);
    },
    setState: (state) => {
      localeSwitch.hidden = state === "playing";
      titleScreen.hidden = state !== "title";
      chapterScreen.hidden = state !== "chapter-transition";
      betweenWavesScreen.hidden = state !== "between-waves";
      gameOverScreen.hidden = state !== "game-over";
      victoryScreen.hidden = state !== "victory";
    }
  };
}

function getRankTitle(
  rank: RunSummary["rank"],
  i18n: I18nController
): string {
  switch (rank) {
    case "s":
      return i18n.t("rank.s");
    case "a":
      return i18n.t("rank.a");
    case "b":
      return i18n.t("rank.b");
    case "c":
      return i18n.t("rank.c");
    default:
      return i18n.t("rank.d");
  }
}

function getLastRunLabel(lastRun: LastRunRecord, i18n: I18nController): string {
  return lastRun.didWin
    ? i18n.t("records.lastRunVictory")
    : i18n.t("records.lastRunFailed");
}

function getBuildLabel(
  archetype: BuildArchetype,
  i18n: I18nController
): string {
  const isSpanish = i18n.getLocale() === "es";
  switch (archetype) {
    case "dash-killer":
      return isSpanish ? "Asesino de Dash" : "Dash Killer";
    case "glass-cannon":
      return isSpanish ? "Canon de Cristal" : "Glass Cannon";
    case "spread-control":
      return isSpanish ? "Control de Rafaga" : "Spread Control";
    default:
      return isSpanish ? "Brecha Balanceada" : "Balanced Breach";
  }
}

function getBuildCommitmentLabel(
  profile: ReturnType<typeof getBuildProfile>,
  i18n: I18nController
): string {
  const isSpanish = i18n.getLocale() === "es";

  if (profile.primary === "balanced") {
    return isSpanish ? "draft abierto" : "open draft";
  }

  if (profile.masteryTier === 2) {
    return isSpanish ? "build cerrada" : "locked build";
  }

  if (profile.masteryTier === 1) {
    return isSpanish ? "build inclinada" : "leaning build";
  }

  return isSpanish ? "senal temprana" : "early signal";
}

function getBuildFitLabel(
  upgradeId: UpgradeId,
  selectedChoices: UpgradeChoice[],
  i18n: I18nController
): string {
  const fit = getUpgradeFit(upgradeId, selectedChoices);
  const isSpanish = i18n.getLocale() === "es";

  switch (fit) {
    case "anchor":
      return isSpanish ? "Ancla" : "Anchor";
    case "surge":
      return isSpanish ? "Empuja" : "Surge";
    case "flex":
      return "Flex";
    case "pivot":
      return "Pivot";
    default:
      return isSpanish ? "Abre build" : "Open build";
  }
}

function createUpgradeCard(
  choice: UpgradeChoice,
  handlers: OverlayHandlers,
  i18n: I18nController,
  selectedChoices: UpgradeChoice[] = [],
  slotIndex = 0
): HTMLButtonElement {
  const archetypeTags = getUpgradeArchetypeTags(choice.id).slice(0, 2);
  const button = document.createElement("button");
  button.className = getUpgradeCardClassName(choice, archetypeTags);
  button.type = "button";
  button.addEventListener("click", () => {
    handlers.onSelectUpgrade(choice.id);
  });

  const copy = i18n.getUpgradeText(choice.id);
  button.setAttribute("aria-label", `${copy.title}. ${copy.description}`);

  const kicker = document.createElement("span");
  kicker.className = "upgrade-kicker";
  kicker.textContent = i18n.t("upgrade.option", { count: slotIndex + 1 });

  const title = document.createElement("span");
  title.className = "upgrade-title";
  title.textContent = copy.title;

  const description = document.createElement("span");
  description.className = "upgrade-desc";

  const cardPreview = document.createElement("span");
  cardPreview.className = "upgrade-card-preview";
  cardPreview.appendChild(
    createBoostCardFace(choice, i18n, {
      size: "preview"
    })
  );

  const tagRail = document.createElement("div");
  tagRail.className = "upgrade-tag-rail";
  const preview = getUpgradePreview(choice.id, i18n);
  description.textContent = [...preview.bonuses, ...preview.tradeoffs].join(" / ");
  const fitChip = document.createElement("span");
  fitChip.className = "upgrade-chip is-fit";
  fitChip.textContent = getBuildFitLabel(choice.id, selectedChoices, i18n);
  tagRail.appendChild(fitChip);

  if (choice.tier === "elite") {
    const chip = document.createElement("span");
    chip.className = "upgrade-chip is-elite";
    chip.textContent = i18n.getLocale() === "es" ? "Legendaria" : "Legendary";
    tagRail.appendChild(chip);
  }

  for (const archetype of archetypeTags) {
    const chip = document.createElement("span");
    chip.className = "upgrade-chip is-build";
    chip.textContent = getBuildLabel(archetype, i18n);
    tagRail.appendChild(chip);
  }

  for (const item of preview.bonuses) {
    const chip = document.createElement("span");
    chip.className = "upgrade-chip is-boost";
    chip.textContent = item;
    tagRail.appendChild(chip);
  }

  for (const item of preview.tradeoffs) {
    const chip = document.createElement("span");
    chip.className = "upgrade-chip is-tradeoff";
    chip.textContent = item;
    tagRail.appendChild(chip);
  }

  button.append(kicker, title, cardPreview, description, tagRail);
  return button;
}

function getUpgradeCardClassName(
  choice: UpgradeChoice,
  archetypeTags: BuildArchetype[]
): string {
  const classNames = ["upgrade-card"];
  const primaryTag = archetypeTags[0] ?? "balanced";

  if (isActionCardId(choice.id)) {
    classNames.push("is-action-card");
  }

  if (choice.tier === "elite") {
    classNames.push("is-elite");
  }

  switch (primaryTag) {
    case "dash-killer":
      classNames.push("is-dash-killer");
      break;
    case "glass-cannon":
      classNames.push("is-glass-cannon");
      break;
    case "spread-control":
      classNames.push("is-spread-control");
      break;
    default:
      classNames.push("is-support");
      break;
  }

  return classNames.join(" ");
}

function createControlLegend(i18n: I18nController): HTMLDivElement {
  const legend = document.createElement("div");
  legend.className = "control-legend";

  const entries = [
    { action: "controls.move", input: "WASD" },
    { action: "controls.aim", input: "Mouse" },
    { action: "controls.fire", input: "LMB" },
    { action: "controls.dash", input: "Space / RMB" }
  ] as const;

  const renderLegend = (): void => {
    legend.replaceChildren(
      ...entries.map((entry) => {
        const card = document.createElement("div");
        card.className = "control-legend-item";

        const label = document.createElement("span");
        label.className = "chip-label";
        label.textContent = i18n.t(entry.action);

        const input = document.createElement("strong");
        input.textContent = entry.input;

        card.append(label, input);
        return card;
      })
    );
  };

  i18n.subscribe(() => {
    renderLegend();
  });

  return legend;
}

function createSplitHeading(
  tagName: "h1" | "h2" = "h1"
): {
  accent: HTMLSpanElement;
  main: HTMLSpanElement;
  root: HTMLHeadingElement;
} {
  const root = document.createElement(tagName);
  root.className = "screen-title";

  const main = document.createElement("span");
  main.className = "screen-title-main";
  const accent = document.createElement("span");
  accent.className = "screen-title-accent";

  root.append(main, accent);

  return { accent, main, root };
}

function createTagline(): HTMLParagraphElement {
  const tagline = document.createElement("p");
  tagline.className = "tagline";
  return tagline;
}

function createRunHighlightChips(
  highlights: RecordHighlights,
  i18n: I18nController
): HTMLSpanElement[] {
  const items: string[] = [];

  if (highlights.bestScore) {
    items.push(i18n.getLocale() === "es" ? "Nuevo PB de puntos" : "New score PB");
  }
  if (highlights.bestCombo) {
    items.push(i18n.getLocale() === "es" ? "Mejor cadena" : "Best chain");
  }
  if (highlights.bestRank) {
    items.push(i18n.getLocale() === "es" ? "Mejor rango" : "Best rank");
  }
  if (highlights.bestWave) {
    items.push(i18n.getLocale() === "es" ? "Mayor profundidad" : "Deepest push");
  }
  if (highlights.fastestVictory) {
    items.push(i18n.getLocale() === "es" ? "Clear mas rapido" : "Fastest clear");
  }

  return items.map((item) => {
    const chip = document.createElement("span");
    chip.className = "summary-chip";
    chip.textContent = item;
    return chip;
  });
}

function createRunMetricCard(
  label = "",
  value = "",
  support = ""
): {
  label: HTMLSpanElement;
  root: HTMLDivElement;
  support: HTMLSpanElement;
  value: HTMLSpanElement;
} {
  const root = document.createElement("div");
  root.className = "run-metric-card";

  const labelNode = document.createElement("span");
  labelNode.className = "chip-label";
  labelNode.textContent = label;

  const valueNode = document.createElement("strong");
  valueNode.className = "run-metric-value";
  valueNode.textContent = value;

  const supportNode = document.createElement("span");
  supportNode.className = "run-metric-support";
  supportNode.textContent = support;

  root.append(labelNode, valueNode, supportNode);

  return {
    label: labelNode,
    root,
    support: supportNode,
    value: valueNode
  };
}

function getUpgradePreview(
  upgradeId: UpgradeId,
  i18n: I18nController
): { bonuses: string[]; tradeoffs: string[] } {
  const isSpanish = i18n.getLocale() === "es";

  switch (upgradeId) {
    case "afterburn-link":
      return {
        bonuses: [isSpanish ? "+ Dash" : "+ Dash"],
        tradeoffs: []
      };
    case "arc-splitter":
      return {
        bonuses: [isSpanish ? "+ Rayo" : "+ Arc"],
        tradeoffs: []
      };
    case "halo-drone":
      return {
        bonuses: [isSpanish ? "+ Dron" : "+ Drone", isSpanish ? "Auto" : "Auto"],
        tradeoffs: []
      };
    case "ricochet-core":
      return {
        bonuses: [isSpanish ? "+ Rebote" : "+ Bounce"],
        tradeoffs: []
      };
    case "starburst-rounds":
      return {
        bonuses: [isSpanish ? "+ Rafaga" : "+ Burst", isSpanish ? "Al matar" : "On kill"],
        tradeoffs: []
      };
    case "rail-pierce":
      return {
        bonuses: [isSpanish ? "+ Perfora" : "+ Pierce"],
        tradeoffs: []
      };
    case "nova-dash":
      return {
        bonuses: [isSpanish ? "+ Nova dash" : "+ Dash nova"],
        tradeoffs: []
      };
    case "afterimage-trail":
      return {
        bonuses: [isSpanish ? "+ Rastro" : "+ Trail", isSpanish ? "Dano" : "Damage"],
        tradeoffs: []
      };
    case "gravity-well":
      return {
        bonuses: [isSpanish ? "+ Pozo" : "+ Well", isSpanish ? "Atrae" : "Pull"],
        tradeoffs: []
      };
    case "breach-pulse":
      return {
        bonuses: [isSpanish ? "+ Pulso dash" : "+ Dash pulse"],
        tradeoffs: []
      };
    case "burn-drive":
      return {
        bonuses: [isSpanish ? "+ Vel" : "+ Move"],
        tradeoffs: []
      };
    case "card-purge":
      return {
        bonuses: [isSpanish ? "Carta" : "Card", isSpanish ? "Limpia mobs" : "Mob wipe"],
        tradeoffs: [isSpanish ? "1 uso" : "1 use"]
      };
    case "card-repair":
      return {
        bonuses: [isSpanish ? "Carta" : "Card", isSpanish ? "+ Cura" : "+ Heal"],
        tradeoffs: [isSpanish ? "1 uso" : "1 use"]
      };
    case "card-overcore":
      return {
        bonuses: [isSpanish ? "Carta" : "Card", isSpanish ? "+ Casco max" : "+ Max hull"],
        tradeoffs: [isSpanish ? "1 uso" : "1 use"]
      };
    case "chatgpt-router":
      return {
        bonuses: [isSpanish ? "+ Via" : "+ Lane"],
        tradeoffs: []
      };
    case "claude-lattice":
      return {
        bonuses: [isSpanish ? "+ Cura" : "+ Heal"],
        tradeoffs: []
      };
    case "coil-rifling":
      return {
        bonuses: [isSpanish ? "+ Dano" : "+ Damage"],
        tradeoffs: []
      };
    case "codex-overclock":
      return {
        bonuses: [isSpanish ? "+ Cadencia" : "+ Fire rate"],
        tradeoffs: []
      };
    case "dash-capacitors":
      return {
        bonuses: [isSpanish ? "+ Dash" : "+ Dash"],
        tradeoffs: []
      };
    case "echo-web":
      return {
        bonuses: [isSpanish ? "+ Via" : "+ Lane"],
        tradeoffs: []
      };
    case "eclipse-protocol":
      return {
        bonuses: [isSpanish ? "+ 2 vias" : "+ 2 lanes"],
        tradeoffs: []
      };
    case "satellite-lattice":
      return {
        bonuses: [isSpanish ? "+ 2 satelites" : "+ 2 satellites", isSpanish ? "Cruz" : "Cross"],
        tradeoffs: []
      };
    case "comet-bloom":
      return {
        bonuses: [isSpanish ? "+ Cometa" : "+ Comet", isSpanish ? "Explosion" : "Explosion"],
        tradeoffs: []
      };
    case "fortress-frame":
      return {
        bonuses: [isSpanish ? "+ Casco" : "+ Hull"],
        tradeoffs: []
      };
    case "glass-reactor":
      return {
        bonuses: [isSpanish ? "+ Dano" : "+ Damage"],
        tradeoffs: []
      };
    case "heat-sink-bypass":
      return {
        bonuses: [isSpanish ? "+ Cadencia" : "+ Fire rate"],
        tradeoffs: []
      };
    case "ion-repeaters":
      return {
        bonuses: [isSpanish ? "+ Cadencia" : "+ Fire rate"],
        tradeoffs: []
      };
    case "magnet-sweep":
      return {
        bonuses: [isSpanish ? "+ Orbes" : "+ Orbs"],
        tradeoffs: []
      };
    case "overcharge-rounds":
      return {
        bonuses: [isSpanish ? "+ Dano" : "+ Damage"],
        tradeoffs: []
      };
    case "overseer-lens":
      return {
        bonuses: [isSpanish ? "+ Dano" : "+ Damage"],
        tradeoffs: []
      };
    case "phase-battery":
      return {
        bonuses: [isSpanish ? "+ Casco" : "+ Hull"],
        tradeoffs: []
      };
    case "shock-greaves":
      return {
        bonuses: [isSpanish ? "+ Pulso dash" : "+ Dash pulse"],
        tradeoffs: []
      };
    case "prism-loader":
      return {
        bonuses: [isSpanish ? "+ Via" : "+ Lane"],
        tradeoffs: []
      };
    case "recovery-matrix":
      return {
        bonuses: [isSpanish ? "+ Cura" : "+ Heal"],
        tradeoffs: []
      };
    case "siege-gyros":
      return {
        bonuses: [isSpanish ? "+ Dano" : "+ Damage"],
        tradeoffs: []
      };
    case "split-lattice":
      return {
        bonuses: [isSpanish ? "+ 2 vias" : "+ 2 lanes"],
        tradeoffs: []
      };
    case "signal-choir":
      return {
        bonuses: [isSpanish ? "+ Rescate" : "+ Rescue"],
        tradeoffs: []
      };
    case "vector-thrusters":
      return {
        bonuses: [isSpanish ? "+ Dash" : "+ Dash"],
        tradeoffs: []
      };
    case "zero-point-capacitor":
      return {
        bonuses: [isSpanish ? "+ Pulso dash" : "+ Dash pulse"],
        tradeoffs: []
      };
    default:
      return {
        bonuses: [isSpanish ? "+ Vel" : "+ Move", isSpanish ? "+ Dash" : "+ Dash"],
        tradeoffs: []
      };
  }
}
