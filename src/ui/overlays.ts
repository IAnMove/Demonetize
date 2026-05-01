import type { I18nController, Locale } from "../core/i18n";
import {
  formatMoney,
  getMetaUpgradeRank,
  getNextMetaUpgradeCost,
  META_UPGRADES,
  type MetaProgressionState,
  type MetaUpgradeId
} from "../core/metaProgression";
import type { GameState } from "../core/stateMachine";
import type { LastRunRecord, RecordHighlights, RunRecords } from "../core/runRecords";
import {
  getBuildProfile,
  getUpgradeArchetypeTags,
  type BuildArchetype
} from "../gameplay/progression/builds";
import {
  getUpgradeChoice,
  isActionCardId,
  type ActionCardId,
  type UpgradeChoice,
  type UpgradeId
} from "../gameplay/progression/upgrades";
import { createBoostCardFace } from "./boostCards";

const META_UPGRADE_ICON_CLASS: Record<MetaUpgradeId, string> = {
  "aggressive-audit": "damage",
  "collection-reach": "pickup",
  "expedited-process": "cooldown",
  "initial-budget": "cards",
  "legal-armor": "armor",
  "orbital-infra": "orbit",
  "preferred-contract": "reroll",
  "reputation-insurance": "shield"
};

interface OverlayHandlers {
  onContinueChapter: () => void;
  onPurchaseMetaUpgrade: (upgradeId: MetaUpgradeId) => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onRerollDraft: () => void;
  onSelectUpgrade: (upgradeId: UpgradeId) => void;
  onSkipIntro: () => void;
  onStart: () => void;
}

interface RunSummary {
  bestCombo: number;
  bestRescueStreak: number;
  channelsDestroyed: number;
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
  moneyEarned: number;
  rank: "a" | "b" | "c" | "d" | "s";
  rescuedCount: number;
  score: number;
  selectedChoices: UpgradeChoice[];
  usedActionCards: ActionCardId[];
  waveNumber: number;
}

type ProgressionMode = "opening-action" | "upgrade";

interface UpgradeCardRenderOptions {
  compactAction?: boolean;
}

export interface OverlayController {
  setRecords: (records: RunRecords) => void;
  setChapterTransition: (
    chapter: number,
    availableChoices: UpgradeChoice[],
    selectedChoices: UpgradeChoice[],
    rescueBonusUnlocked: boolean,
    rerollsRemaining?: number
  ) => void;
  setProgression: (
    choices: UpgradeChoice[],
    selectedChoices: UpgradeChoice[],
    waveNumber: number,
    summary: RunSummary,
    rescueBonusUnlocked: boolean,
    mode?: ProgressionMode,
    rerollsRemaining?: number,
    picksRemaining?: number
  ) => void;
  setMetaProgression: (state: MetaProgressionState) => void;
  setRunSummary: (summary: RunSummary, highlights?: RecordHighlights) => void;
  setState: (state: GameState) => void;
}

export function createOverlays(
  container: HTMLDivElement,
  handlers: OverlayHandlers,
  i18n: I18nController,
  initialMetaProgression: MetaProgressionState
): OverlayController {
  let metaProgression = initialMetaProgression;
  let progressionChoices: UpgradeChoice[] = [];
  let progressionBonusUnlocked = false;
  let progressionMode: ProgressionMode = "upgrade";
  let progressionPicksRemaining = 1;
  let progressionRerollsRemaining = 0;
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
  let chapterTransitionRerollsRemaining = 0;
  let progressionSummary: RunSummary = {
    bestCombo: 0,
    bestRescueStreak: 0,
    channelsDestroyed: 0,
    chapter: 1,
    elapsedSeconds: 0,
    lostRescueCount: 0,
    moneyEarned: 0,
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
    channelsDestroyed: 0,
    chapter: 1,
    elapsedSeconds: 0,
    lostRescueCount: 0,
    moneyEarned: 0,
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

  const introScreen = document.createElement("section");
  introScreen.className = "screen intro-screen";
  introScreen.hidden = true;
  introScreen.addEventListener("click", handlers.onSkipIntro);

  const introBackdrop = document.createElement("div");
  introBackdrop.className = "intro-backdrop";

  const introPanel = document.createElement("div");
  introPanel.className = "intro-panel";

  const introEyebrow = document.createElement("span");
  introEyebrow.className = "intro-eyebrow";

  const introCopy = document.createElement("p");
  introCopy.className = "intro-copy";

  const introActions = document.createElement("div");
  introActions.className = "intro-actions";

  const introSkipButton = document.createElement("button");
  introSkipButton.className = "intro-skip";
  introSkipButton.type = "button";
  introSkipButton.addEventListener("click", (event) => {
    event.stopPropagation();
    handlers.onSkipIntro();
  });

  introActions.append(introSkipButton);
  introPanel.append(introEyebrow, introCopy, introActions);
  introScreen.append(introBackdrop, introPanel);

  const titleScreen = document.createElement("section");
  titleScreen.className = "screen title-screen";

  const titlePanel = document.createElement("div");
  titlePanel.className = "screen-panel";
  const titleContractPanel = document.createElement("div");
  titleContractPanel.className = "title-contract-panel";

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
  const titleLastRunBuild = document.createElement("p");
  titleLastRunBuild.className = "run-support";
  const titleStats = document.createElement("div");
  titleStats.className = "run-metric-grid is-title";
  const titleRunsCard = createRunMetricCard();
  const titleWinsCard = createRunMetricCard();
  const titleWinRateCard = createRunMetricCard();
  titleStats.append(titleRunsCard.root, titleWinsCard.root, titleWinRateCard.root);
  const metaShop = document.createElement("section");
  metaShop.className = "meta-shop";
  const metaShopHeader = document.createElement("div");
  metaShopHeader.className = "meta-shop-header";
  const metaShopTitle = document.createElement("h2");
  metaShopTitle.className = "meta-shop-title";
  const metaShopWallet = document.createElement("strong");
  metaShopWallet.className = "meta-shop-wallet";
  const metaShopLedger = document.createElement("p");
  metaShopLedger.className = "micro-copy";
  const metaShopGrid = document.createElement("div");
  metaShopGrid.className = "meta-shop-grid";
  metaShopHeader.append(metaShopTitle, metaShopWallet);
  metaShop.append(metaShopHeader, metaShopLedger, metaShopGrid);
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
  titleContractPanel.append(
    titleEyebrow,
    titleHeading.root,
    titleCopy,
    titleStats,
    titleLastRunLabel,
    titleLastRun,
    titleActions
  );
  titlePanel.append(titleContractPanel, metaShop);
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
  const chapterDraftActions = document.createElement("div");
  chapterDraftActions.className = "draft-actions";
  const chapterRerollButton = document.createElement("button");
  chapterRerollButton.className = "draft-reroll-button";
  chapterRerollButton.type = "button";
  chapterRerollButton.addEventListener("click", handlers.onRerollDraft);
  const chapterRerollStatus = document.createElement("span");
  chapterRerollStatus.className = "micro-copy";
  chapterDraftActions.append(chapterRerollButton, chapterRerollStatus);

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
    chapterDraftActions,
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
  const upgradeDraftActions = document.createElement("div");
  upgradeDraftActions.className = "draft-actions";
  const upgradeRerollButton = document.createElement("button");
  upgradeRerollButton.className = "draft-reroll-button";
  upgradeRerollButton.type = "button";
  upgradeRerollButton.addEventListener("click", handlers.onRerollDraft);
  const upgradeRerollStatus = document.createElement("span");
  upgradeRerollStatus.className = "micro-copy";
  upgradeDraftActions.append(upgradeRerollButton, upgradeRerollStatus);

  const upgradeGrid = document.createElement("div");
  upgradeGrid.className = "upgrade-grid";

  betweenWavesPanel.append(
    betweenEyebrow,
    betweenHeading.root,
    betweenCopy,
    upgradeHistory,
    upgradeTelemetry,
    upgradeBuild,
    upgradeDraftActions,
    upgradeGrid
  );
  betweenWavesScreen.appendChild(betweenWavesPanel);

  const gameOverScreen = document.createElement("section");
  gameOverScreen.className = "screen";
  gameOverScreen.hidden = true;

  const gameOverPanel = document.createElement("div");
  gameOverPanel.className = "screen-panel is-run-summary-panel";

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
  gameOverMetrics.className = "run-metric-grid is-run-summary";
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
  const gameOverMenuButton = document.createElement("button");
  gameOverMenuButton.className = "secondary-action-button";
  gameOverMenuButton.type = "button";
  gameOverMenuButton.addEventListener("click", handlers.onReturnToTitle);

  const restartHint = document.createElement("span");
  restartHint.className = "micro-copy";

  const gameOverLegend = createControlLegend(i18n);

  restartActions.append(restartButton, gameOverMenuButton, restartHint);
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
  victoryPanel.className = "screen-panel is-run-summary-panel";

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
  victoryMetrics.className = "run-metric-grid is-run-summary";
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
  const victoryMenuButton = document.createElement("button");
  victoryMenuButton.className = "secondary-action-button";
  victoryMenuButton.type = "button";
  victoryMenuButton.addEventListener("click", handlers.onReturnToTitle);

  const victoryHint = document.createElement("span");
  victoryHint.className = "micro-copy";

  victoryActions.append(victoryRestartButton, victoryMenuButton, victoryHint);
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
    introScreen,
    titleScreen,
    chapterScreen,
    betweenWavesScreen,
    gameOverScreen,
    victoryScreen
  );

  gameOverCopy.hidden = true;
  gameOverBuild.hidden = true;
  gameOverChase.hidden = true;
  gameOverSummary.hidden = true;
  gameOverInstalled.hidden = true;
  victoryCopy.hidden = true;
  victoryTagline.hidden = true;
  victoryBuild.hidden = true;
  victoryChase.hidden = true;
  victorySummary.hidden = true;
  victoryInstalled.hidden = true;

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
        return isSpanish ? `${label}: impacto de reportes` : `${label}: mass-report impact`;
      case "boss-beam":
        return isSpanish ? `${label}: rayo del Algoritmo de TheirTube` : `${label}: TheirTube Algorithm beam`;
      case "boss-pulse":
        return isSpanish ? `${label}: pulso de fase` : `${label}: phase pulse`;
      case "charger":
        return isSpanish ? `${label}: embestida` : `${label}: charge hit`;
      case "drone":
        return isSpanish ? `${label}: contacto de rastreador` : `${label}: scout contact`;
      case "edge":
        return isSpanish ? `${label}: borde del Feed de TheirTube` : `${label}: TheirTube Feed edge`;
      case "elite-burst":
        return isSpanish ? `${label}: nucleo volatil` : `${label}: volatile core`;
      case "overseer":
        return isSpanish ? `${label}: embestida del Algoritmo de TheirTube` : `${label}: TheirTube Algorithm rush`;
      case "purge":
        return isSpanish ? `${label}: barrido de autenticidad` : `${label}: authenticity sweep`;
      case "relay":
        return isSpanish ? `${label}: amplificacion bot` : `${label}: bot amplification`;
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

  const createSummaryFromLastRun = (lastRun: LastRunRecord): RunSummary => ({
    bestCombo: lastRun.bestCombo,
    bestRescueStreak: 0,
    channelsDestroyed: 0,
    chapter: lastRun.chapter,
    elapsedSeconds: lastRun.elapsedSeconds,
    lostRescueCount: 0,
    moneyEarned: 0,
    rank: lastRun.rank,
    rescuedCount: 0,
    score: lastRun.score,
    selectedChoices: (lastRun.selectedChoiceIds ?? []).map(getUpgradeChoice),
    usedActionCards: [...(lastRun.usedActionCards ?? [])],
    waveNumber: lastRun.waveNumber
  });

  const renderLastRunBuildLine = (): string =>
    records.lastRun && (records.lastRun.selectedChoiceIds?.length ?? 0) > 0
      ? renderBuildLine(createSummaryFromLastRun(records.lastRun))
      : "";

  const updateTitleLastRunBuild = (): void => {
    const line = renderLastRunBuildLine();
    titleLastRunBuild.textContent = line;
    titleLastRunBuild.hidden = line.length === 0;
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

  const renderMetaShop = (): void => {
    metaShopTitle.textContent = i18n.t("meta.shopTitle");
    metaShopWallet.textContent = formatMoney(metaProgression.wallet);
    metaShopLedger.textContent = i18n.t("meta.ledger", {
      earned: formatMoney(metaProgression.lifetimeEarned),
      spent: formatMoney(metaProgression.totalSpent)
    });
    metaShopGrid.replaceChildren(
      ...META_UPGRADES.map((upgrade) =>
        createMetaUpgradeButton(upgrade.id, metaProgression, handlers, i18n)
      )
    );
  };

  const renderDraftRerolls = (
    button: HTMLButtonElement,
    status: HTMLSpanElement,
    rerollsRemaining: number,
    canReroll: boolean
  ): void => {
    const showReroll = canReroll && rerollsRemaining > 0;
    if (button.parentElement instanceof HTMLElement) {
      button.parentElement.hidden = !showReroll;
    }
    button.textContent = `${i18n.t("draft.reroll")} ${rerollsRemaining}`;
    button.hidden = !showReroll;
    button.disabled = !showReroll;
    status.hidden = true;
    status.textContent = "";
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
          ? "Evento de Riesgo de TheirTube"
          : "TheirTube Liability Event";
      }
      if (profile.primary === "dash-killer") {
        return isSpanish ? "Santo del Impacto de Apelacion" : "Appeal Impact Saint";
      }
      if (profile.primary === "glass-cannon") {
        return isSpanish ? "Apostol del Canal de Riesgo" : "Apostle of the Risk Channel";
      }
      if (profile.primary === "spread-control") {
        return isSpanish ? "Huracan de Senal" : "Signal Hurricane";
      }
      return isSpanish ? "Superviviente de TheirTube" : "TheirTube Survivor";
    }

    if (summary.waveNumber <= 2) {
      return isSpanish ? "Canal no encontrado" : "Channel Not Found";
    }
    if (rescueTotal >= 3 && rescueEfficiency < 0.4) {
      return isSpanish ? "Apelaciones Perdidas" : "Lost Appeals";
    }
    if (summary.chapter >= 2 && summary.waveNumber >= 8) {
      return isSpanish ? "Rozaste la Leyenda" : "So Close to Legend";
    }
    if (summary.rescuedCount >= 3 && summary.bestRescueStreak >= 2) {
      return isSpanish ? "Casi los Restauras a Todos" : "Almost Restored Them All";
    }
    if (summary.bestCombo >= 10) {
      return isSpanish ? "Cadena Imparable" : "Chain Runaway";
    }
    if (profile.primary === "glass-cannon") {
      return isSpanish ? "Canal Roto pero Elegante" : "Broken but Broadcast";
    }
    if (profile.primary === "spread-control") {
      return isSpanish ? "Fanatico de Senal" : "Signal Fanatic";
    }
    return isSpanish ? "Operador de Canal Revocado" : "Revoked Channel Operator";
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
            primary: "Mejora la restauracion",
            secondary: "Estas dejando demasiadas apelaciones expirar dentro del Feed de TheirTube."
          }
        : {
            primary: "Improve restoration",
            secondary: "Too many creator appeals are expiring inside TheirTube's Feed."
          };
    }

    return isSpanish
      ? {
          primary: "Encadena una run mas limpia",
          secondary: "Manten presion alta y convierte el clear en un evento de compliance."
        }
      : {
          primary: "Chain a cleaner run",
          secondary: "Keep pressure high and turn the clear into a compliance event."
        };
  };

  const renderRunMetrics = (
    target: HTMLDivElement,
    summary: RunSummary
  ): void => {
    const channelsCard = createRunMetricCard(
      i18n.t("summary.card.channels"),
      `${summary.channelsDestroyed}`,
      i18n.t("summary.card.channelsSupport")
    );
    channelsCard.root.classList.add("is-primary-summary");

    const moneyCard = createRunMetricCard(
      i18n.t("summary.card.money"),
      formatMoney(summary.moneyEarned),
      ""
    );
    moneyCard.root.classList.add("is-primary-summary", "is-money-summary");
    const stolenLabel = document.createElement("s");
    stolenLabel.textContent = i18n.t("summary.card.moneyStolen");
    moneyCard.support.replaceChildren(
      stolenLabel,
      document.createTextNode(` ${i18n.t("summary.card.moneyRetained")}`)
    );

    target.replaceChildren(
      channelsCard.root,
      moneyCard.root
    );
  };

  const renderStaticText = (): void => {
    introEyebrow.textContent = i18n.t("intro.eyebrow");
    introCopy.textContent = i18n.t("intro.copy");
    introSkipButton.textContent = i18n.t("intro.skip");
    titleEyebrow.textContent = i18n.t("title.eyebrow");
    titleHeading.main.textContent = i18n.t("title.main");
    titleHeading.accent.textContent = i18n.t("title.accent");
    titleCopy.textContent = i18n.t("title.copy");
    titlePlayerTag.textContent = i18n.t("title.playerTag");
    titleEnemyTag.textContent = i18n.t("title.enemyTag");
    titleDraftTag.textContent = i18n.t("title.draftTag");
    titleRecordsLabel.textContent = i18n.t("records.label");
    titleRecords.textContent = renderRecordsLine();
    titleLastRunLabel.textContent = i18n.t("records.lastRunLabel");
    titleLastRun.textContent = renderLastRunLine();
    updateTitleLastRunBuild();
    renderTitleStats();
    renderMetaShop();
    titleGoalLabel.textContent = i18n.t("summary.nextGoal");
    const titleGoalCopy = renderNextGoal(records.lastRun
      ? createSummaryFromLastRun(records.lastRun)
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
    renderDraftRerolls(
      chapterRerollButton,
      chapterRerollStatus,
      chapterTransitionRerollsRemaining,
      chapterTransitionAvailable.length > 0
    );
    chapterUpgradeGrid.replaceChildren(
      ...chapterTransitionAvailable.map((choice, index) =>
        createUpgradeCard(
          choice,
          handlers,
          i18n,
          index
        )
      )
    );

    betweenEyebrow.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.eyebrow")
        : i18n.t("upgrade.eyebrow");
    betweenHeading.main.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.titleMain")
        : i18n.t("upgrade.titleMain");
    betweenHeading.accent.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.titleAccent")
        : i18n.t("upgrade.titleAccent");
    betweenCopy.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.copy")
        : progressionBonusUnlocked
          ? i18n.t("upgrade.copyBonus")
          : i18n.t("upgrade.copy");
    upgradeTelemetry.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.count", {
            count: progressionChoices.length,
            picks: progressionPicksRemaining
          })
        : i18n.t("summary.telemetry", {
            chain: progressionSummary.bestCombo,
            score: progressionSummary.score
          });
    upgradeBuild.textContent =
      progressionMode === "opening-action"
        ? i18n.t("opening.build", { picks: progressionPicksRemaining })
        : renderBuildLineFromChoices(progressionSelected);
    renderDraftRerolls(
      upgradeRerollButton,
      upgradeRerollStatus,
      progressionRerollsRemaining,
      progressionMode === "upgrade" && progressionChoices.length > 0
    );

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
    gameOverMenuButton.textContent = i18n.t("gameOver.menu");
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
    victoryMenuButton.textContent = i18n.t("victory.menu");
    victoryHint.textContent = i18n.t("victory.hint");

    renderProgression();
  };

  const renderProgression = (): void => {
    const isOpeningDraft = progressionMode === "opening-action";
    betweenWavesPanel.classList.toggle(
      "is-opening-draft",
      isOpeningDraft
    );
    upgradeGrid.classList.toggle(
      "is-action-draft",
      isOpeningDraft
    );
    betweenEyebrow.hidden = true;
    betweenCopy.hidden = true;
    upgradeHistory.hidden = true;
    upgradeTelemetry.hidden = true;
    upgradeBuild.hidden = true;
    betweenEyebrow.textContent =
      isOpeningDraft
        ? i18n.t("opening.eyebrow")
        : i18n.t("upgrade.eyebrow");
    betweenHeading.main.textContent =
      isOpeningDraft
        ? i18n.t("opening.titleMain")
        : i18n.t("upgrade.titleMain");
    betweenHeading.accent.textContent =
      isOpeningDraft
        ? i18n.t("opening.titleAccent")
        : i18n.t("upgrade.titleAccent");
    betweenCopy.textContent =
      isOpeningDraft
        ? i18n.t("opening.copy")
        : progressionBonusUnlocked
          ? i18n.t("upgrade.copyBonus")
          : i18n.t("upgrade.copy");
    upgradeHistory.textContent =
      isOpeningDraft
        ? progressionSelected.length > 0
          ? i18n.t("opening.historyWithCards", {
              count: progressionSelected.length
            })
          : i18n.t("opening.history")
        : progressionSelected.length === 0
          ? i18n.t("upgrade.history.empty", { wave: progressionWave })
          : i18n.t("upgrade.history.installed", {
              modules: progressionSelected
                .map((choice) => i18n.getUpgradeText(choice.id).title)
                .join(" / ")
            });
    upgradeTelemetry.textContent =
      isOpeningDraft
        ? i18n.t("opening.count", {
            count: progressionChoices.length,
            picks: progressionPicksRemaining
          })
        : i18n.t("summary.telemetry", {
            chain: progressionSummary.bestCombo,
            score: progressionSummary.score
          });
    upgradeBuild.textContent =
      isOpeningDraft
        ? i18n.t("opening.build", { picks: progressionPicksRemaining })
        : renderBuildLineFromChoices(progressionSelected);
    renderDraftRerolls(
      upgradeRerollButton,
      upgradeRerollStatus,
      progressionRerollsRemaining,
      progressionMode === "upgrade" && progressionChoices.length > 0
    );

    upgradeGrid.replaceChildren(
      ...progressionChoices.map((choice, index) =>
        createUpgradeCard(
          choice,
          handlers,
          i18n,
          index,
          { compactAction: isOpeningDraft }
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
      updateTitleLastRunBuild();
      renderTitleStats();
      renderMetaShop();
      const titleGoalCopy = renderNextGoal(records.lastRun
        ? createSummaryFromLastRun(records.lastRun)
        : null);
      titleGoal.textContent = titleGoalCopy.primary;
      titleGoalSupport.textContent = titleGoalCopy.secondary;
    },
    setChapterTransition: (
      chapter,
      availableChoices,
      selectedChoices,
      rescueBonusUnlocked,
      rerollsRemaining = 0
    ) => {
      chapterTransitionNumber = chapter;
      chapterTransitionAvailable = availableChoices;
      chapterTransitionBonusUnlocked = rescueBonusUnlocked;
      chapterTransitionChoices = selectedChoices;
      chapterTransitionRerollsRemaining = rerollsRemaining;
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
      renderDraftRerolls(
        chapterRerollButton,
        chapterRerollStatus,
        chapterTransitionRerollsRemaining,
        availableChoices.length > 0
      );
      chapterUpgradeGrid.replaceChildren(
        ...availableChoices.map((choice, index) =>
          createUpgradeCard(
            choice,
            handlers,
            i18n,
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
      rescueBonusUnlocked,
      mode = "upgrade",
      rerollsRemaining = 0,
      picksRemaining = 1
    ) => {
      progressionChoices = choices;
      progressionBonusUnlocked = rescueBonusUnlocked;
      progressionMode = mode;
      progressionPicksRemaining = picksRemaining;
      progressionRerollsRemaining = rerollsRemaining;
      progressionSelected = selectedChoices;
      progressionWave = waveNumber;
      progressionSummary = summary;
      betweenCopy.textContent =
        mode === "opening-action"
          ? i18n.t("opening.copy")
          : rescueBonusUnlocked
            ? i18n.t("upgrade.copyBonus")
            : i18n.t("upgrade.copy");
      renderProgression();
    },
    setMetaProgression: (state) => {
      metaProgression = state;
      renderMetaShop();
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
      introScreen.hidden = state !== "intro";
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
      return isSpanish ? "Golpe de Apelacion" : "Appeal Striker";
    case "glass-cannon":
      return isSpanish ? "Canal de Riesgo" : "Risk Channel";
    case "spread-control":
      return isSpanish ? "Abanico de Senal" : "Signal Fanout";
    default:
      return isSpanish ? "Nucleo Creador" : "Creator Core";
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

function createUpgradeCard(
  choice: UpgradeChoice,
  handlers: OverlayHandlers,
  i18n: I18nController,
  slotIndex = 0,
  options: UpgradeCardRenderOptions = {}
): HTMLButtonElement {
  const archetypeTags = getUpgradeArchetypeTags(choice.id).slice(0, 2);
  const button = document.createElement("button");
  button.className = getUpgradeCardClassName(choice, archetypeTags);
  button.classList.toggle("is-compact-action", options.compactAction === true);
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

  const preview = getUpgradePreview(choice.id, i18n);
  description.textContent = [...preview.bonuses, ...preview.tradeoffs].join(" / ");

  button.append(kicker, title, cardPreview, description);
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
  } else {
    classNames.push("is-passive-card");
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

function createMetaUpgradeButton(
  upgradeId: MetaUpgradeId,
  state: MetaProgressionState,
  handlers: OverlayHandlers,
  i18n: I18nController
): HTMLButtonElement {
  const definition = META_UPGRADES.find((upgrade) => upgrade.id === upgradeId);
  if (!definition) {
    throw new Error(`Unknown meta upgrade: ${upgradeId}`);
  }

  const rank = getMetaUpgradeRank(state, upgradeId);
  const maxRank = definition.costs.length;
  const nextCost = getNextMetaUpgradeCost(state, upgradeId);
  const copy = definition.copy[i18n.getLocale()];
  const isMaxed = nextCost === null;
  const canAfford = !isMaxed && state.wallet >= nextCost;
  const button = document.createElement("button");
  button.className = "meta-upgrade-button";
  button.type = "button";
  button.disabled = isMaxed || !canAfford;
  button.setAttribute(
    "aria-label",
    `${copy.title}. ${copy.effect}. ${rank}/${maxRank}. ${
      isMaxed ? i18n.t("meta.maxed") : formatMoney(nextCost)
    }`
  );
  button.addEventListener("click", () => {
    handlers.onPurchaseMetaUpgrade(upgradeId);
  });

  const icon = createMetaUpgradeIcon(rank, upgradeId);

  const body = document.createElement("span");
  body.className = "meta-upgrade-body";

  const header = document.createElement("span");
  header.className = "meta-upgrade-row";

  const title = document.createElement("span");
  title.className = "meta-upgrade-name";
  title.textContent = copy.title;

  const rankLabel = document.createElement("span");
  rankLabel.className = "meta-upgrade-rank";
  rankLabel.textContent = i18n.t("meta.rank", {
    max: maxRank,
    rank
  });

  const effect = document.createElement("span");
  effect.className = "meta-upgrade-effect";
  effect.textContent = copy.effect;

  const price = document.createElement("span");
  price.className = "meta-upgrade-price";
  price.textContent = isMaxed
    ? i18n.t("meta.maxed")
    : canAfford
      ? i18n.t("meta.buy", { cost: formatMoney(nextCost) })
      : i18n.t("meta.need", { cost: formatMoney(nextCost) });

  header.append(title, rankLabel);
  body.append(header, effect, price);
  button.append(icon, body);
  return button;
}

function createMetaUpgradeIcon(
  rank: number,
  upgradeId: MetaUpgradeId
): HTMLSpanElement {
  const stack = document.createElement("span");
  stack.className = `meta-card-stack is-${META_UPGRADE_ICON_CLASS[upgradeId]}`;
  stack.setAttribute("aria-hidden", "true");

  const baseCard = document.createElement("span");
  baseCard.className = "meta-card-icon is-base";
  baseCard.appendChild(createMetaUpgradeSymbol());
  stack.appendChild(baseCard);

  for (let index = 0; index < rank; index += 1) {
    const card = document.createElement("span");
    card.className = "meta-card-icon is-earned";
    card.style.setProperty("--stack-index", `${index + 1}`);
    card.appendChild(createMetaUpgradeSymbol());
    stack.appendChild(card);
  }

  return stack;
}

function createMetaUpgradeSymbol(): HTMLSpanElement {
  const symbol = document.createElement("span");
  symbol.className = "meta-card-symbol";
  symbol.append(
    document.createElement("span"),
    document.createElement("span"),
    document.createElement("span")
  );
  return symbol;
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
        bonuses: [isSpanish ? "Limpia mobs" : "Mob wipe"],
        tradeoffs: [isSpanish ? "1 uso" : "1 use"]
      };
    case "card-repair":
      return {
        bonuses: [isSpanish ? "+ Cura" : "+ Heal"],
        tradeoffs: [isSpanish ? "1 uso" : "1 use"]
      };
    case "card-overcore":
      return {
        bonuses: [isSpanish ? "+ Senal max" : "+ Max signal"],
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
        bonuses: [isSpanish ? "+ Senal" : "+ Signal"],
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
        bonuses: [isSpanish ? "+ Confianza" : "+ Trust"],
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
        bonuses: [isSpanish ? "+ Senal" : "+ Signal"],
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
