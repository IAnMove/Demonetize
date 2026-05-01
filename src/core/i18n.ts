import type { UpgradeId } from "../gameplay/progression/upgrades";

export type Locale = "en" | "es";

type MessageKey = keyof typeof UI_TEXT.en;
type MessageParams = Record<string, number | string>;
type LocaleListener = (locale: Locale) => void;

const STORAGE_KEY = "overseer.locale";

const UI_TEXT = {
  en: {
    "announce.artilleryImpact": "MASS-REPORT IMPACT",
    "announce.artilleryLock": "MASS-REPORT LOCK",
    "announce.bossCollapse": "ALGORITHM COLLAPSE",
    "announce.bossCoreExposed": "CORE EXPOSED",
    "announce.bossDefeated": "DEMONETIZATION COMPLETE",
    "announce.bossPulse": "PHASE PULSE",
    "announce.bossShift": "PHASE SHIFT",
    "announce.bossSpawned": "ALGORITHM BREACH",
    "announce.comboSurge": "CHAIN x{count}",
    "announce.eliteBurst": "VOLATILE CORE",
    "announce.eliteSpawned": "HUMAN VALUE DETECTED",
    "announce.gridPurge": "AUTHENTICITY SWEEP",
    "announce.legendaryReady": "EXECUTIVE OVERRIDE",
    "announce.recordBest": "NEW PERSONAL BEST",
    "announce.rescueSpawned": "APPEAL CACHE",
    "announce.rescueStreak": "QUARANTINE x{count}",
    "announce.relayBoost": "SUPPORT PULSE",
    "announce.upgradeReady": "UPGRADE WINDOW",
    "announce.victory": "BRAND SAFETY EVENT RESOLVED",
    "announce.waveStart": "WAVE {wave} // {threat}",
    "boss.mode.charging": "Charging",
    "boss.mode.cooldown": "Cooldown",
    "boss.mode.exposed": "Exposed",
    "boss.mode.purge": "Demonetize",
    "boss.mode.rush": "Rush",
    "boss.mode.tracking": "Tracking",
    "controls.aim": "Aim",
    "controls.combat": "Combat controls",
    "controls.dash": "Dash",
    "controls.fire": "Fire",
    "controls.move": "Move",
    "draft.reroll": "Reroll Draft",
    "draft.rerolls": "Contract rerolls: {count}",
    "draft.rerollsEmpty": "No rerolls left",
    "channel.unknown": "unknown channel",
    "intro.copy":
      "T.O.P.E. is TheirTube's premium moderation AI, hired to clean The Feed. Its official mission is to protect authenticity. Its real mission is to turn inconvenient human channels into closed cases, mark them as inauthentic, extract their remaining value, and erase them from the system.",
    "intro.eyebrow": "DEMONETIZED: The Authenticity Purge // 2026",
    "intro.skip": "Accept Contract",
    "chapter.continue": "Enter Hot Feed",
    "chapter.copy":
      "TheirTube's server shell is down. Install one policy module before you dive into the hotter authenticity grid.",
    "chapter.copyBonus":
      "TheirTube's server shell is down. Quarantined appeal traffic unlocked one extra policy pick before you dive into the hotter authenticity grid.",
    "chapter.eyebrow": "TheirTube feed breach",
    "chapter.moduleLabel": "Policy modules",
    "chapter.summary": "Feed layer {chapter} online / Modules installed: {count}",
    "chapter.summaryBonus": "Feed layer {chapter} online / Modules installed: {count} / Appeal cache seized",
    "chapter.titleAccent": "Authenticity Grid",
    "chapter.titleMain": "Layer {chapter}",
    "gameOver.copy":
      "TheirTube marked your moderation unit unstable. Reboot before the humans archive what happened.",
    "gameOver.eyebrow": "Contract interrupted",
    "gameOver.hint": "Press R or click Reboot Unit. One input back into TheirTube's Feed.",
    "gameOver.menu": "Contract Ledger",
    "gameOver.restart": "Reboot Unit",
    "gameOver.titleAccent": "Revoked",
    "gameOver.titleMain": "Unit",
    "rank.a": "Signal Hunter",
    "rank.b": "Compliance Node",
    "rank.c": "Quarantine Clerk",
    "rank.d": "Cold Upload",
    "rank.s": "Contract Optimizer",
    "hud.chain": "Chain",
    "hud.dash": "Dash",
    "hud.hull": "Signal",
    "hud.pb": "PB",
    "hud.pbAhead": "+{score}",
    "hud.pbBehind": "-{score}",
    "hud.pbSet": "Set PB",
    "hud.level": "Upgrade",
    "hud.ready": "Ready",
    "hud.score": "Score",
    "hud.standBy": "Stand by",
    "hud.state": "State",
    "hud.threat": "Threat",
    "hud.uptime": "Uptime",
    "hud.wave": "Wave",
    "locale.label": "Language",
    "meta.buy": "Buy {cost}",
    "meta.ledger": "Permanent upgrades",
    "meta.maxed": "Max rank",
    "meta.need": "Need {cost}",
    "meta.rank": "{rank}/{max}",
    "meta.shopTitle": "Store",
    "opening.build": "",
    "opening.copy": "",
    "opening.count": "",
    "opening.eyebrow": "",
    "opening.history": "",
    "opening.historyWithCards": "",
    "opening.titleAccent": "",
    "opening.titleMain": "Choose Starter Card",
    "card.overcore.desc": "Drop on The Feed to raise process integrity with an executive value override.",
    "card.overcore.notify": "Monetization rights reassigned.",
    "card.overcore.title": "Value Override",
    "card.purge.desc": "Drop on The Feed to demonetize hostile channels and damage server armor.",
    "card.purge.notify": "Demonetization submitted.",
    "card.purge.title": "Demonetization Order",
    "card.repair.desc": "Drop on The Feed to restore a large chunk of process integrity.",
    "card.repair.notify": "Budget patch approved.",
    "card.repair.title": "Budget Patch",
    "notify.bossCollapse": "Algorithm collapse cascade triggered.",
    "notify.artilleryImpact": "Mass-report zone detonated.",
    "notify.artilleryLock": "Mass-report sweep painted on the floor.",
    "notify.bossCoreExposed": "TheirTube algorithm core exposed. Extract the remaining value.",
    "notify.bossDefeated": "Demonetization complete. Creator removed, value retained.",
    "notify.bossPulse": "Phase pulse locked on The Feed.",
    "notify.bossShift": "The Algorithm entered phase two.",
    "notify.bossSpawned": "TheirTube compliance core online.",
    "notify.comboSurge": "Pressure spike x{count}",
    "notify.eliteBurst": "Volatile elite ruptured.",
    "notify.eliteKilled": "Elite escort collapsed.",
    "notify.eliteSpawned": "Elite escort materialized.",
    "notify.gridPurge": "Authenticity sweep lane armed.",
    "notify.legendaryReady": "Executive override unlocked.",
    "notify.moneyCollected": "+{amount} retained value",
    "notify.pickupHeal": "+{amount} signal recovered",
    "notify.playerDied": "Moderation unit revoked. TheirTube retains liability.",
    "notify.recordBest": "Run record improved.",
    "notify.enemyKilled": "{channel}: CREATOR REMOVED, VALUE RETAINED",
    "notify.rescueLost": "Appeal evidence leaked before quarantine.",
    "notify.rescueSaved": "Creator appeal quarantined. +{amount} score.",
    "notify.rescueSpawned": "Timed appeal cache exposed.",
    "notify.rescueStreak": "Quarantine streak x{count}. Combo pressure held.",
    "notify.relayBoost": "Bot amplification energized hostile escorts.",
    "notify.upgradeReady": "Compliance window open.",
    "notify.victory": "TheirTube dashboard is green.",
    "notify.waveStart": "Wave {wave} live: {threat}",
    "records.label": "Personal best",
    "records.lastRunLabel": "Last run",
    "records.lastRunLine":
      "{result} / Score {score} / Chain x{chain} / Rank {rank} / C{chapter}-W{wave}",
    "records.lastRunEmpty": "No contract logged yet. Start the purge.",
    "records.lastRunFailed": "Channel demonetized",
    "records.lastRunVictory": "Brand safety resolved",
    "records.line": "PB {score} / Chain x{chain} / Rank {rank} / Wins {wins}",
    "records.lineWithClear":
      "PB {score} / Chain x{chain} / Rank {rank} / Wins {wins} / Best clear {time}",
    "records.stat.runs": "Runs",
    "records.stat.victories": "Wins",
    "records.stat.winRate": "Win rate",
    "summary.run": "Time: {time} / Wave: {wave} / Chapter: {chapter} / Score: {score} / Best chain: x{chain} / Rescue streak: x{rescueStreak} / Rescued: {rescued} / Lost: {lost} / Efficiency: {efficiency}",
    "summary.rank": "Rank {rank} / {title}",
    "summary.telemetry": "Score {score} / Best chain x{chain}",
    "summary.card.channels": "Channels destroyed",
    "summary.card.channelsSupport": "Creator rooms closed",
    "summary.card.chain": "Chain",
    "summary.card.depth": "Depth",
    "summary.card.money": "Value extracted",
    "summary.card.moneyRetained": "retained",
    "summary.card.moneySupport": "Banked after run",
    "summary.card.moneyStolen": "stolen",
    "summary.card.pace": "Pace",
    "summary.card.rescue": "Caches",
    "summary.card.score": "Score",
    "summary.nextGoal": "Next target",
    "state.artilleryImpact": "Report impact",
    "state.artilleryLock": "Report lock",
    "state.edgeBurn": "Edge burn",
    "state.exposedCore": "Core exposed",
    "state.phasePulse": "Phase pulse",
    "state.phasePulseWarning": "Pulse lock",
    "state.gridPurge": "Authenticity sweep",
    "state.relayBoost": "Bot amplification",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Overrun",
    "state.purgeWarning": "Demonetization lock",
    "tagline.loop": "T.O.P.E. doesn't erase creators. It only optimizes TheirTube's profits.",
    "title.accent": "",
    "title.copy": "Buy permanent upgrades. Start the next Feed run.",
    "title.draftTag": "Policy // inauthentic labels / appeal suppression / executive metrics",
    "title.enemyTag": "Targets // TheirTube channels / creator rooms / appeal residue / The Feed",
    "title.eyebrow": "TheirTube",
    "title.hint": "Enter starts.",
    "title.main": "PURGE",
    "title.playerTag": "Unit // TheirTube moderation AI",
    "title.start": "Begin Demonetization",
    "upgrade.copy": "Pick one upgrade.",
    "upgrade.copyBonus": "Pick one upgrade.",
    "upgrade.eyebrow": "Demonetization executed",
    "upgrade.history.empty": "Wave {wave} cleared. No modules installed yet.",
    "upgrade.history.installed": "Modules: {modules}",
    "upgrade.option": "Option {count}",
    "upgrade.titleAccent": "Upgrade",
    "upgrade.titleMain": "Choose",
    "victory.copy":
      "TheirTube's dashboard is green, The Feed is clean, and nobody with a face can prove they were here. Reboot the contract and optimize the next silence.",
    "victory.eyebrow": "Compliance achieved",
    "victory.hint": "Press R for another contract.",
    "victory.menu": "Contract Ledger",
    "victory.restart": "Run Contract Again",
    "victory.summary": "Sweeps survived: {wave} / Value claims locked: {count}",
    "victory.titleAccent": "Complete",
    "victory.titleMain": "Demonetization",
    "wave.advance": "Advance",
    "wave.cleared": "Cleared",
    "wave.deploying": "Deploying",
    "wave.finalPush": "Final Push",
    "wave.sweep": "Sweep",
    "wave.theme.containment-crash": "Quarantine Crash",
    "wave.theme.codex-requiem": "Archive Requiem",
    "wave.theme.fracture-line": "Claim Fracture",
    "wave.theme.heat-spiral": "Attention Spiral",
    "wave.theme.kill-grid": "Authenticity Grid",
    "wave.theme.last-directive": "Final Policy",
    "wave.theme.overseer-breach": "TheirTube Breach",
    "wave.theme.purge-clamp": "Demonetization Clamp",
    "wave.theme.ram-drill": "Strike Raid",
    "wave.theme.signal-sweep": "Signal Sweep",
    "wave.theme.token-drought": "Trust Drought",
    "wave.upgrade": "Proof"
  },
  es: {
    "announce.artilleryImpact": "IMPACTO DE REPORTES",
    "announce.artilleryLock": "FIJACION DE REPORTES",
    "announce.bossCollapse": "COLAPSO DEL ALGORITMO",
    "announce.bossCoreExposed": "NUCLEO EXPUESTO",
    "announce.bossDefeated": "DESMONETIZACION COMPLETA",
    "announce.bossPulse": "PULSO DE FASE",
    "announce.bossShift": "CAMBIO DE FASE",
    "announce.bossSpawned": "BRECHA DEL ALGORITMO",
    "announce.comboSurge": "CADENA x{count}",
    "announce.eliteBurst": "NUCLEO VOLATIL",
    "announce.eliteSpawned": "VALOR HUMANO DETECTADO",
    "announce.gridPurge": "BARRIDO DE AUTENTICIDAD",
    "announce.legendaryReady": "OVERRIDE EJECUTIVO",
    "announce.recordBest": "NUEVO RECORD PERSONAL",
    "announce.rescueSpawned": "CACHE DE APELACION",
    "announce.rescueStreak": "CUARENTENA x{count}",
    "announce.relayBoost": "PULSO DE SOPORTE",
    "announce.upgradeReady": "VENTANA DE MEJORA",
    "announce.victory": "EVENTO DE BRAND SAFETY RESUELTO",
    "announce.waveStart": "OLEADA {wave} // {threat}",
    "boss.mode.charging": "Cargando",
    "boss.mode.cooldown": "Recarga",
    "boss.mode.exposed": "Expuesto",
    "boss.mode.purge": "Desmonetizar",
    "boss.mode.rush": "Embestida",
    "boss.mode.tracking": "Rastreo",
    "controls.aim": "Apuntar",
    "controls.combat": "Controles",
    "controls.dash": "Dash",
    "controls.fire": "Disparo",
    "controls.move": "Mover",
    "draft.reroll": "Rerollear Draft",
    "draft.rerolls": "Rerolls de contrato: {count}",
    "draft.rerollsEmpty": "Sin rerolls restantes",
    "channel.unknown": "canal desconocido",
    "intro.copy":
      "T.O.P.E. es la IA de moderacion premium de TheirTube, contratada para limpiar The Feed. Su mision oficial es proteger la autenticidad; su mision real es convertir cualquier canal humano incomodo en un expediente cerrado, marcarlo como inautentico, extraer todo su valor restante y borrarlo del sistema.",
    "intro.eyebrow": "DEMONETIZED: The Authenticity Purge // 2026",
    "intro.skip": "Aceptar contrato",
    "chapter.continue": "Entrar al Feed Caliente",
    "chapter.copy":
      "La carcasa del servidor de TheirTube ha caido. Instala un modulo de politica antes de lanzarte a la rejilla de autenticidad mas feroz.",
    "chapter.copyBonus":
      "La carcasa del servidor de TheirTube ha caido. El trafico de apelaciones en cuarentena ha abierto una opcion extra antes de lanzarte a la rejilla de autenticidad mas feroz.",
    "chapter.eyebrow": "Brecha del feed de TheirTube",
    "chapter.moduleLabel": "Modulos de politica",
    "chapter.summary": "Capa {chapter} activa / Modulos instalados: {count}",
    "chapter.summaryBonus": "Capa {chapter} activa / Modulos instalados: {count} / Cache de apelacion incautada",
    "chapter.titleAccent": "Rejilla de Autenticidad",
    "chapter.titleMain": "Capa {chapter}",
    "gameOver.copy":
      "TheirTube ha marcado tu unidad de moderacion como inestable. Reinicia antes de que los humanos archiven lo ocurrido.",
    "gameOver.eyebrow": "Contrato interrumpido",
    "gameOver.hint": "Pulsa R o haz clic en Reiniciar unidad. Un input y vuelves al Feed de TheirTube.",
    "gameOver.menu": "Libro de Contrato",
    "gameOver.restart": "Reiniciar unidad",
    "gameOver.titleAccent": "Revocada",
    "gameOver.titleMain": "Unidad",
    "rank.a": "Cazador de Senales",
    "rank.b": "Nodo de Compliance",
    "rank.c": "Gestor de Cuarentena",
    "rank.d": "Upload Frio",
    "rank.s": "Optimizador de Contrato",
    "hud.chain": "Cadena",
    "hud.dash": "Dash",
    "hud.hull": "Senal",
    "hud.pb": "PB",
    "hud.pbAhead": "+{score}",
    "hud.pbBehind": "-{score}",
    "hud.pbSet": "Nuevo PB",
    "hud.level": "Mejora",
    "hud.ready": "Lista",
    "hud.score": "Puntos",
    "hud.standBy": "En espera",
    "hud.state": "Estado",
    "hud.threat": "Amenaza",
    "hud.uptime": "Tiempo",
    "hud.wave": "Oleada",
    "locale.label": "Idioma",
    "meta.buy": "Comprar {cost}",
    "meta.ledger": "Mejoras permanentes",
    "meta.maxed": "Rango maximo",
    "meta.need": "Falta {cost}",
    "meta.rank": "{rank}/{max}",
    "meta.shopTitle": "Tienda",
    "opening.build": "",
    "opening.copy": "",
    "opening.count": "",
    "opening.eyebrow": "",
    "opening.history": "",
    "opening.historyWithCards": "",
    "opening.titleAccent": "",
    "opening.titleMain": "Elige Carta Inicial",
    "card.overcore.desc": "Suelta en The Feed para subir integridad de proceso con un override de valor ejecutivo.",
    "card.overcore.notify": "Derechos de monetizacion reasignados.",
    "card.overcore.title": "Override de Valor",
    "card.purge.desc": "Suelta en The Feed para desmonetizar canales hostiles y danar armadura del servidor.",
    "card.purge.notify": "Desmonetizacion enviada.",
    "card.purge.title": "Orden de Desmonetizacion",
    "card.repair.desc": "Suelta en The Feed para recuperar una gran parte de integridad de proceso.",
    "card.repair.notify": "Parche de presupuesto aprobado.",
    "card.repair.title": "Parche de Presupuesto",
    "notify.artilleryImpact": "La zona de reportes ha detonado.",
    "notify.artilleryLock": "El barrido de reportes ha pintado una zona en el suelo.",
    "notify.bossCollapse": "Se ha activado una cascada de colapso del Algoritmo.",
    "notify.bossCoreExposed": "Nucleo del Algoritmo de TheirTube expuesto. Extrae el valor restante.",
    "notify.bossDefeated": "Desmonetizacion completa. Creador eliminado, valor retenido.",
    "notify.bossPulse": "El pulso de fase ha fijado The Feed.",
    "notify.bossShift": "El Algoritmo ha entrado en fase dos.",
    "notify.bossSpawned": "Nucleo de compliance de TheirTube activo.",
    "notify.comboSurge": "Pico de presion x{count}",
    "notify.eliteBurst": "Una elite volatil ha reventado.",
    "notify.eliteKilled": "La escolta elite ha colapsado.",
    "notify.eliteSpawned": "Se ha materializado una escolta elite.",
    "notify.gridPurge": "Carril de autenticidad armado.",
    "notify.legendaryReady": "Override ejecutivo desbloqueado.",
    "notify.moneyCollected": "+{amount} de valor retenido",
    "notify.pickupHeal": "+{amount} de senal recuperada",
    "notify.playerDied": "Unidad de moderacion revocada. TheirTube retiene la responsabilidad.",
    "notify.recordBest": "Has mejorado tu marca.",
    "notify.enemyKilled": "{channel}: CREADOR ELIMINADO, VALOR RETENIDO",
    "notify.rescueLost": "Una evidencia de apelacion se filtro antes de cuarentena.",
    "notify.rescueSaved": "Apelacion de creador en cuarentena. +{amount} puntos.",
    "notify.rescueSpawned": "Cache temporal de apelacion expuesta.",
    "notify.rescueStreak": "Racha de cuarentena x{count}. La presion del combo sigue viva.",
    "notify.relayBoost": "La amplificacion bot ha energizado a la escolta hostil.",
    "notify.upgradeReady": "Ventana de compliance abierta.",
    "notify.victory": "El panel de TheirTube esta verde.",
    "notify.waveStart": "Oleada {wave} activa: {threat}",
    "records.label": "Mejores marcas",
    "records.lastRunLabel": "Ultima run",
    "records.lastRunLine":
      "{result} / Puntos {score} / Cadena x{chain} / Rango {rank} / C{chapter}-O{wave}",
    "records.lastRunEmpty": "Aun no hay contrato registrado. Inicia la purga.",
    "records.lastRunFailed": "Canal desmonetizado",
    "records.lastRunVictory": "Brand safety resuelto",
    "records.line": "PB {score} / Cadena x{chain} / Rango {rank} / Victorias {wins}",
    "records.lineWithClear":
      "PB {score} / Cadena x{chain} / Rango {rank} / Victorias {wins} / Mejor clear {time}",
    "records.stat.runs": "Runs",
    "records.stat.victories": "Victorias",
    "records.stat.winRate": "Win rate",
    "summary.run": "Tiempo: {time} / Oleada: {wave} / Capitulo: {chapter} / Puntos: {score} / Mejor cadena: x{chain} / Racha de rescate: x{rescueStreak} / Rescatados: {rescued} / Perdidos: {lost} / Eficiencia: {efficiency}",
    "summary.rank": "Rango {rank} / {title}",
    "summary.telemetry": "Puntos {score} / Mejor cadena x{chain}",
    "summary.card.channels": "Canales destruidos",
    "summary.card.channelsSupport": "Salas de creador cerradas",
    "summary.card.chain": "Cadena",
    "summary.card.depth": "Profundidad",
    "summary.card.money": "Dinero extraido",
    "summary.card.moneyRetained": "retenido",
    "summary.card.moneySupport": "Guardado al final",
    "summary.card.moneyStolen": "robado",
    "summary.card.pace": "Ritmo",
    "summary.card.rescue": "Caches",
    "summary.card.score": "Puntos",
    "summary.nextGoal": "Siguiente objetivo",
    "state.artilleryImpact": "Impacto de reportes",
    "state.artilleryLock": "Fijacion de reportes",
    "state.edgeBurn": "Borde en llamas",
    "state.exposedCore": "Nucleo expuesto",
    "state.phasePulse": "Pulso de fase",
    "state.phasePulseWarning": "Fijacion de pulso",
    "state.gridPurge": "Barrido de autenticidad",
    "state.relayBoost": "Amplificacion bot",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Desbordado",
    "state.purgeWarning": "Bloqueo de desmonetizacion",
    "tagline.loop": "T.O.P.E. no borra creadores. Solo optimiza las ganancias de TheirTube.",
    "title.accent": "",
    "title.copy": "Compra mejoras permanentes. Entra al siguiente Feed.",
    "title.draftTag": "Politica // etiquetas de inautenticidad / apelaciones bloqueadas / metricas ejecutivas",
    "title.enemyTag": "Objetivos // canales de TheirTube / salas de creadores / restos de apelacion / The Feed",
    "title.eyebrow": "TheirTube",
    "title.hint": "Enter empieza.",
    "title.main": "PURGE",
    "title.playerTag": "Unidad // IA de moderacion de TheirTube",
    "title.start": "Iniciar Desmonetizacion",
    "upgrade.copy": "Elige una mejora.",
    "upgrade.copyBonus": "Elige una mejora.",
    "upgrade.eyebrow": "Desmonetizacion ejecutada",
    "upgrade.history.empty": "Oleada {wave} despejada. Aun no hay modulos instalados.",
    "upgrade.history.installed": "Modulos: {modules}",
    "upgrade.option": "Opcion {count}",
    "upgrade.titleAccent": "Mejora",
    "upgrade.titleMain": "Elige",
    "victory.copy":
      "El panel de TheirTube esta verde, The Feed esta limpio y nadie con rostro puede probar que estuvo aqui. Reinicia el contrato y optimiza el siguiente silencio.",
    "victory.eyebrow": "Compliance alcanzado",
    "victory.hint": "Pulsa R para otro contrato.",
    "victory.menu": "Libro de Contrato",
    "victory.restart": "Ejecutar otro contrato",
    "victory.summary": "Barridos sobrevividos: {wave} / Claims de valor fijados: {count}",
    "victory.titleAccent": "Completa",
    "victory.titleMain": "Desmonetizacion",
    "wave.advance": "Avance",
    "wave.cleared": "Despejada",
    "wave.deploying": "Despliegue",
    "wave.finalPush": "Empuje final",
    "wave.sweep": "Barrido",
    "wave.theme.containment-crash": "Choque de Cuarentena",
    "wave.theme.codex-requiem": "Requiem de Archivo",
    "wave.theme.fracture-line": "Fractura de Claim",
    "wave.theme.heat-spiral": "Espiral de Atencion",
    "wave.theme.kill-grid": "Red de Autenticidad",
    "wave.theme.last-directive": "Politica Final",
    "wave.theme.overseer-breach": "Brecha de TheirTube",
    "wave.theme.purge-clamp": "Tenaza de Desmonetizacion",
    "wave.theme.ram-drill": "Redada de Strikes",
    "wave.theme.signal-sweep": "Barrido de Senal",
    "wave.theme.token-drought": "Sequia de Confianza",
    "wave.upgrade": "Prueba"
  }
} as const;

const UPGRADE_TEXT: Record<
  UpgradeId,
  Record<Locale, { description: string; title: string }>
> = {
  "afterburn-link": {
    en: {
      description: "Dash returns much sooner.",
      title: "Purge Accelerator"
    },
    es: {
      description: "El dash vuelve mucho antes.",
      title: "Acelerador de Purga"
    }
  },
  "arc-splitter": {
    en: {
      description: "Projectiles chain lightning to a nearby enemy.",
      title: "Signal Fork"
    },
    es: {
      description: "Los proyectiles encadenan un rayo a un enemigo cercano.",
      title: "Bifurcador de Senal"
    }
  },
  "halo-drone": {
    en: {
      description: "One watchdog drone fires automatically.",
      title: "Watchdog Drone"
    },
    es: {
      description: "Un dron guardian dispara automaticamente.",
      title: "Dron Guardian"
    }
  },
  "ricochet-core": {
    en: {
      description: "Projectiles bounce once off the feed edge.",
      title: "Mirror Claim"
    },
    es: {
      description: "Los proyectiles rebotan una vez en el borde del feed.",
      title: "Claim Espejo"
    }
  },
  "starburst-rounds": {
    en: {
      description: "Kills release a small radial burst.",
      title: "Viral Burst"
    },
    es: {
      description: "Las bajas liberan una pequena rafaga radial.",
      title: "Rafaga Viral"
    }
  },
  "rail-pierce": {
    en: {
      description: "Projectiles pierce the first enemy hit.",
      title: "Takedown Pierce"
    },
    es: {
      description: "Los proyectiles perforan al primer enemigo alcanzado.",
      title: "Perforador de Takedown"
    }
  },
  "nova-dash": {
    en: {
      description: "Dash creates an explosion at the end point.",
      title: "Callback Nova"
    },
    es: {
      description: "El dash crea una explosion en el punto final.",
      title: "Nova de Callback"
    }
  },
  "afterimage-trail": {
    en: {
      description: "Dash leaves damaging afterimages.",
      title: "Afterimage Trail"
    },
    es: {
      description: "El dash deja postimagenes daninas.",
      title: "Rastro de Postimagen"
    }
  },
  "gravity-well": {
    en: {
      description: "Pickups create a brief enemy-pull field.",
      title: "Attention Well"
    },
    es: {
      description: "Los pickups crean un campo breve que atrae enemigos.",
      title: "Pozo de Atencion"
    }
  },
  "breach-pulse": {
    en: {
      description: "Dash emits a shock pulse.",
      title: "Compliance Pulse"
    },
    es: {
      description: "El dash emite una onda de choque.",
      title: "Pulso de Compliance"
    }
  },
  "burn-drive": {
    en: {
      description: "Movement speed increases.",
      title: "Contract Drive"
    },
    es: {
      description: "Aumenta la velocidad de movimiento.",
      title: "Motor de Contrato"
    }
  },
  "card-purge": {
    en: {
      description: "Stores a one-use demonetization order in your hand.",
      title: "Demonetization Order"
    },
    es: {
      description: "Guarda una orden de desmonetizacion de un solo uso en tu mano.",
      title: "Orden de Desmonetizacion"
    }
  },
  "card-repair": {
    en: {
      description: "Stores a one-use compliance budget patch in your hand.",
      title: "Compliance Budget Patch"
    },
    es: {
      description: "Guarda un parche de presupuesto de compliance de un solo uso en tu mano.",
      title: "Parche de Presupuesto"
    }
  },
  "card-overcore": {
    en: {
      description: "Stores a one-use monetization rights override in your hand.",
      title: "Value Override"
    },
    es: {
      description: "Guarda un override de derechos de monetizacion de un solo uso en tu mano.",
      title: "Override de Valor"
    }
  },
  "chatgpt-router": {
    en: {
      description: "Adds a routed firing lane.",
      title: "Script Router"
    },
    es: {
      description: "Anade una via de disparo guiada.",
      title: "Router de Guion"
    }
  },
  "claude-lattice": {
    en: {
      description: "Trust fragments repair more signal.",
      title: "Trust Lattice"
    },
    es: {
      description: "Los fragmentos de confianza reparan mas senal.",
      title: "Reticula de Confianza"
    }
  },
  "coil-rifling": {
    en: {
      description: "Tightens the shot coil for harder rounds.",
      title: "Policy Rifling"
    },
    es: {
      description: "Aprieta el disparo para que pegue mas.",
      title: "Estriado de Politica"
    }
  },
  "codex-overclock": {
    en: {
      description: "Primary fire goes feral-fast.",
      title: "Upload Overclock"
    },
    es: {
      description: "El disparo principal se acelera una barbaridad.",
      title: "Overclock de Upload"
    }
  },
  "dash-capacitors": {
    en: {
      description: "Dash comes back sooner.",
      title: "Purge Capacitors"
    },
    es: {
      description: "El dash vuelve antes.",
      title: "Capacitores de Purga"
    }
  },
  "echo-web": {
    en: {
      description: "Adds one more firing lane.",
      title: "Mirror Web"
    },
    es: {
      description: "Anade otra calle de disparo.",
      title: "Red Espejo"
    }
  },
  "eclipse-protocol": {
    en: {
      description: "Legendary lattice: adds two wide firing lanes.",
      title: "Blackout Protocol"
    },
    es: {
      description: "Reticula legendaria: anade dos vias de disparo amplias.",
      title: "Protocolo Apagon"
    }
  },
  "satellite-lattice": {
    en: {
      description: "Legendary lattice: two TheirTube satellites fire in a cross pattern.",
      title: "TheirTube Satellites"
    },
    es: {
      description: "Reticula legendaria: dos satelites de TheirTube disparan en cruz.",
      title: "Satelites de TheirTube"
    }
  },
  "comet-bloom": {
    en: {
      description: "Legendary artillery: periodic shots launch a large explosive projectile.",
      title: "Viral Comet"
    },
    es: {
      description: "Artilleria legendaria: disparos periodicos lanzan un proyectil explosivo grande.",
      title: "Cometa Viral"
    }
  },
  "ion-repeaters": {
    en: {
      description: "Primary fire cycles faster.",
      title: "Upload Repeaters"
    },
    es: {
      description: "El disparo principal cicla mas rapido.",
      title: "Repetidores de Upload"
    }
  },
  "magnet-sweep": {
    en: {
      description: "Evidence fragments collect from farther away.",
      title: "Evidence Magnet"
    },
    es: {
      description: "Los fragmentos de evidencia se atraen desde mas lejos.",
      title: "Iman de Evidencia"
    }
  },
  "overcharge-rounds": {
    en: {
      description: "Projectiles hit harder.",
      title: "Overclaim Rounds"
    },
    es: {
      description: "Los proyectiles golpean mas fuerte.",
      title: "Municion de Overclaim"
    }
  },
  "overseer-lens": {
    en: {
      description: "Legendary optics: TheirTube's authenticity model makes projectiles hit harder.",
      title: "Authenticity Lens"
    },
    es: {
      description: "Optica legendaria: el modelo de autenticidad de TheirTube hace que los proyectiles peguen mas.",
      title: "Lente de Autenticidad"
    }
  },
  "phase-battery": {
    en: {
      description: "Increase max signal.",
      title: "Signal Battery"
    },
    es: {
      description: "Aumenta la senal maxima.",
      title: "Bateria de Senal"
    }
  },
  "prism-loader": {
    en: {
      description: "Adds another lane to the volley.",
      title: "Thumbnail Prism"
    },
    es: {
      description: "Anade otra linea a la rafaga.",
      title: "Prisma de Miniatura"
    }
  },
  "recovery-matrix": {
    en: {
      description: "Patch signal immediately.",
      title: "Recovery Patch"
    },
    es: {
      description: "Recupera senal al instante.",
      title: "Parche de Recuperacion"
    }
  },
  "signal-choir": {
    en: {
      description: "Legendary quarantine lattice: seized appeal caches release more evidence fragments.",
      title: "Quarantine Choir"
    },
    es: {
      description: "Reticula legendaria de cuarentena: las caches de apelacion incautadas sueltan mas fragmentos de evidencia.",
      title: "Coro de Cuarentena"
    }
  },
  "siege-gyros": {
    en: {
      description: "Shots hit harder.",
      title: "Strike Gyros"
    },
    es: {
      description: "Los disparos pegan mas.",
      title: "Giros de Strike"
    }
  },
  "shock-greaves": {
    en: {
      description: "Dash becomes dangerous on impact.",
      title: "Strike Greaves"
    },
    es: {
      description: "El dash se vuelve peligroso al impactar.",
      title: "Grebas de Strike"
    }
  },
  "split-lattice": {
    en: {
      description: "Primary fire fans into a wider multi-shot spread.",
      title: "Split Signal"
    },
    es: {
      description: "El disparo principal se abre en una rafaga multiple mas amplia.",
      title: "Senal Segmentada"
    }
  },
  "zero-point-capacitor": {
    en: {
      description: "Legendary core: dash releases a heavier pulse.",
      title: "Zero-Point Override"
    },
    es: {
      description: "Nucleo legendario: el dash libera un pulso mas pesado.",
      title: "Override de Punto Cero"
    }
  },
  "glass-reactor": {
    en: {
      description: "Massive projectile damage.",
      title: "Glass Unit"
    },
    es: {
      description: "Mucho mas dano por proyectil.",
      title: "Unidad de Cristal"
    }
  },
  "fortress-frame": {
    en: {
      description: "Gain heavy max signal.",
      title: "Archive Frame"
    },
    es: {
      description: "Ganas mucha senal maxima.",
      title: "Chasis de Archivo"
    }
  },
  "heat-sink-bypass": {
    en: {
      description: "Primary fire accelerates.",
      title: "Cooldown Bypass"
    },
    es: {
      description: "El disparo acelera.",
      title: "Bypass de Cooldown"
    }
  },
  "vector-thrusters": {
    en: {
      description: "Dash speed increases.",
      title: "Purge Thrusters"
    },
    es: {
      description: "Aumenta la velocidad de dash.",
      title: "Propulsores de Purga"
    }
  }
};

export interface I18nController {
  getLocale: () => Locale;
  getUpgradeText: (upgradeId: UpgradeId) => {
    description: string;
    title: string;
  };
  setLocale: (locale: Locale) => void;
  subscribe: (listener: LocaleListener) => () => void;
  t: (key: MessageKey, params?: MessageParams) => string;
  toggleLocale: () => void;
}

export function createI18n(): I18nController {
  let locale = resolveLocale(
    window.localStorage.getItem(STORAGE_KEY) ?? "en"
  );
  const listeners = new Set<LocaleListener>();

  const notify = (): void => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    for (const listener of listeners) {
      listener(locale);
    }
  };

  return {
    getLocale: () => locale,
    getUpgradeText: (upgradeId) => UPGRADE_TEXT[upgradeId][locale],
    setLocale: (nextLocale) => {
      if (locale === nextLocale) {
        return;
      }

      locale = nextLocale;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(locale);
      return () => {
        listeners.delete(listener);
      };
    },
    t: (key, params = {}) => formatText(UI_TEXT[locale][key], params),
    toggleLocale: () => {
      locale = locale === "es" ? "en" : "es";
      notify();
    }
  };
}

function formatText(template: string, params: MessageParams): string {
  let result = template;

  for (const [key, value] of Object.entries(params)) {
    result = result.split(`{${key}}`).join(String(value));
  }

  return result;
}

function resolveLocale(candidate: string | null | undefined): Locale {
  return candidate?.toLowerCase().startsWith("es") ? "es" : "en";
}
