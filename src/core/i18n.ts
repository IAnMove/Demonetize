import type { UpgradeId } from "../gameplay/progression/upgrades";

export type Locale = "en" | "es";

type MessageKey = keyof typeof UI_TEXT.en;
type MessageParams = Record<string, number | string>;
type LocaleListener = (locale: Locale) => void;

const STORAGE_KEY = "overseer.locale";

const UI_TEXT = {
  en: {
    "announce.artilleryImpact": "ARTILLERY IMPACT",
    "announce.artilleryLock": "ARTILLERY LOCK",
    "announce.bossCollapse": "OVERSEER COLLAPSE",
    "announce.bossCoreExposed": "CORE EXPOSED",
    "announce.bossDefeated": "OVERSEER DOWN",
    "announce.bossPulse": "PHASE PULSE",
    "announce.bossShift": "PHASE SHIFT",
    "announce.bossSpawned": "OVERSEER BREACH",
    "announce.comboSurge": "CHAIN x{count}",
    "announce.eliteBurst": "VOLATILE CORE",
    "announce.eliteSpawned": "ELITE STRAIN",
    "announce.gridPurge": "GRID PURGE",
    "announce.legendaryReady": "LEGENDARY MODULE",
    "announce.recordBest": "NEW PERSONAL BEST",
    "announce.rescueSpawned": "RESCUE SIGNAL",
    "announce.rescueStreak": "EXTRACTION x{count}",
    "announce.relayBoost": "SUPPORT PULSE",
    "announce.upgradeReady": "UPGRADE WINDOW",
    "announce.victory": "ARENA SECURED",
    "announce.waveStart": "WAVE {wave} // {threat}",
    "boss.mode.charging": "Charging",
    "boss.mode.cooldown": "Cooldown",
    "boss.mode.exposed": "Exposed",
    "boss.mode.purge": "Purge",
    "boss.mode.rush": "Rush",
    "boss.mode.tracking": "Tracking",
    "controls.aim": "Aim",
    "controls.combat": "Combat controls",
    "controls.dash": "Dash",
    "controls.fire": "Fire",
    "controls.move": "Move",
    "chapter.continue": "Breach Sector",
    "chapter.copy":
    "The Overseer shell is down. Lock one legendary breach module before you dive into the hotter kill-grid.",
    "chapter.copyBonus":
    "The Overseer shell is down. Rescue traffic unlocked an extra legendary pick before you dive into the hotter kill-grid.",
    "chapter.eyebrow": "Chapter breach",
    "chapter.moduleLabel": "Legendary breach modules",
    "chapter.summary": "Chapter {chapter} online / Upgrades locked: {count}",
    "chapter.summaryBonus": "Chapter {chapter} online / Upgrades locked: {count} / Rescue cache open",
    "chapter.titleAccent": "Purge Grid",
    "chapter.titleMain": "Sector {chapter}",
    "gameOver.copy":
      "The arena is still hot. Re-enter immediately and keep the pressure on the rebel swarm.",
    "gameOver.eyebrow": "Run failed",
    "gameOver.hint": "Press R or click Restart. One input back into the arena.",
    "gameOver.restart": "Restart",
    "gameOver.titleAccent": "Lost",
    "gameOver.titleMain": "Signal",
    "rank.a": "Grid Hunter",
    "rank.b": "Strike Node",
    "rank.c": "Containment Unit",
    "rank.d": "Cold Start",
    "rank.s": "Overseer Breaker",
    "hud.chain": "Chain",
    "hud.dash": "Dash",
    "hud.hull": "Hull",
    "hud.pb": "PB",
    "hud.pbAhead": "+{score}",
    "hud.pbBehind": "-{score}",
    "hud.pbSet": "Set PB",
    "hud.ready": "Ready",
    "hud.score": "Score",
    "hud.standBy": "Stand by",
    "hud.state": "State",
    "hud.threat": "Threat",
    "hud.uptime": "Uptime",
    "hud.wave": "Wave",
    "locale.label": "Language",
    "card.overcore.desc": "Drop on the arena to gain max hull and repair that amount.",
    "card.overcore.notify": "Overcore plating installed.",
    "card.overcore.title": "Overcore Plating",
    "card.purge.desc": "Drop on the arena to clear non-boss enemies and damage boss armor.",
    "card.purge.notify": "Purge protocol fired.",
    "card.purge.title": "Purge Protocol",
    "card.repair.desc": "Drop on the arena to restore a large chunk of hull.",
    "card.repair.notify": "Field repair triggered.",
    "card.repair.title": "Field Repair",
    "notify.bossCollapse": "Arena collapse cascade triggered.",
    "notify.artilleryImpact": "Impact zone detonated.",
    "notify.artilleryLock": "Artillery strike painted on the floor.",
    "notify.bossCoreExposed": "Overseer core exposed. Burn it down.",
    "notify.bossDefeated": "OVERSEER core collapsed.",
    "notify.bossPulse": "Phase pulse locked on the arena.",
    "notify.bossShift": "Overseer entered phase two.",
    "notify.bossSpawned": "OVERSEER breach detected.",
    "notify.comboSurge": "Pressure spike x{count}",
    "notify.eliteBurst": "Volatile elite ruptured.",
    "notify.eliteKilled": "Elite escort collapsed.",
    "notify.eliteSpawned": "Elite escort materialized.",
    "notify.gridPurge": "Kill-grid purge lane armed.",
    "notify.legendaryReady": "Legendary breach module unlocked.",
    "notify.pickupHeal": "+{amount} hull recovered",
    "notify.playerDied": "Signal lost. Recycle the run.",
    "notify.recordBest": "Run record improved.",
    "notify.rescueLost": "A rescued signal collapsed before extraction.",
    "notify.rescueSaved": "Civilian signal extracted. +{amount} score.",
    "notify.rescueSpawned": "Timed rescue signal released.",
    "notify.rescueStreak": "Extraction streak x{count}. Combo pressure held.",
    "notify.relayBoost": "Relay field energized hostile escorts.",
    "notify.upgradeReady": "Upgrade window open.",
    "notify.victory": "Arena secured.",
    "notify.waveStart": "Wave {wave} live: {threat}",
    "records.label": "Personal best",
    "records.lastRunLabel": "Last run",
    "records.lastRunLine":
      "{result} / Score {score} / Chain x{chain} / Rank {rank} / C{chapter}-W{wave}",
    "records.lastRunEmpty": "No run logged yet. Break the grid.",
    "records.lastRunFailed": "Signal lost",
    "records.lastRunVictory": "Arena secured",
    "records.line": "PB {score} / Chain x{chain} / Rank {rank} / Wins {wins}",
    "records.lineWithClear":
      "PB {score} / Chain x{chain} / Rank {rank} / Wins {wins} / Best clear {time}",
    "records.stat.runs": "Runs",
    "records.stat.victories": "Wins",
    "records.stat.winRate": "Win rate",
    "summary.run": "Time: {time} / Wave: {wave} / Chapter: {chapter} / Score: {score} / Best chain: x{chain} / Rescue streak: x{rescueStreak} / Rescued: {rescued} / Lost: {lost} / Efficiency: {efficiency}",
    "summary.rank": "Rank {rank} / {title}",
    "summary.telemetry": "Score {score} / Best chain x{chain}",
    "summary.card.chain": "Chain",
    "summary.card.depth": "Depth",
    "summary.card.pace": "Pace",
    "summary.card.rescue": "Rescue",
    "summary.card.score": "Score",
    "summary.nextGoal": "Next target",
    "state.artilleryImpact": "Impact zone",
    "state.artilleryLock": "Artillery lock",
    "state.edgeBurn": "Edge burn",
    "state.exposedCore": "Core exposed",
    "state.phasePulse": "Phase pulse",
    "state.phasePulseWarning": "Pulse lock",
    "state.gridPurge": "Grid purge",
    "state.relayBoost": "Support pulse",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Overrun",
    "state.purgeWarning": "Purge lock",
    "tagline.loop": "Break the shell. Push deeper. One more run.",
    "title.copy":
      "Pilot TALON-7, the last breach rig still online. Break scout shells, survive sentry crossfire, and force the Overseer through phase collapse.",
    "title.draftTag": "Draft // first module after wave 3 / legendary breach after sector boss",
    "title.enemyTag": "Threat // scout shells / ram shells / sentry prisms / phase-shift overseer",
    "title.eyebrow": "Neon siege protocol",
    "title.hint": "Enter also starts. After failure, press R for instant retry.",
    "title.playerTag": "Asset // TALON-7 breach rig",
    "title.start": "Start Run",
    "upgrade.copy":
      "The arena has a narrow opening. Lock one enhancement before the next assault arrives.",
    "upgrade.copyBonus":
      "Rescue cache cracked open. Lock one enhancement before the next assault arrives, with one extra option online.",
    "upgrade.eyebrow": "Wave cleared",
    "upgrade.history.empty": "Wave {wave} cleared. No modules installed yet.",
    "upgrade.history.installed": "Installed: {modules}",
    "upgrade.option": "Option {count}",
    "upgrade.titleAccent": "Upgrade",
    "upgrade.titleMain": "Select",
    "victory.copy":
      "The rogue director has been crushed for now. Reset the breach and see how much faster you can burn through it.",
    "victory.eyebrow": "Run completed",
    "victory.hint": "Press R for another run.",
    "victory.restart": "Run Again",
    "victory.summary": "Waves cleared: {wave} / Upgrades locked: {count}",
    "victory.titleAccent": "Secured",
    "victory.titleMain": "Arena",
    "wave.advance": "Advance",
    "wave.cleared": "Cleared",
    "wave.deploying": "Deploying",
    "wave.finalPush": "Final Push",
    "wave.sweep": "Sweep",
    "wave.theme.containment-crash": "Containment Crash",
    "wave.theme.codex-requiem": "Codex Requiem",
    "wave.theme.fracture-line": "Fracture Line",
    "wave.theme.heat-spiral": "Heat Spiral",
    "wave.theme.kill-grid": "Kill-Grid",
    "wave.theme.last-directive": "Last Directive",
    "wave.theme.overseer-breach": "Overseer Breach",
    "wave.theme.purge-clamp": "Purge Clamp",
    "wave.theme.ram-drill": "Ram Drill",
    "wave.theme.signal-sweep": "Signal Sweep",
    "wave.theme.token-drought": "Token Drought",
    "wave.upgrade": "Upgrade"
  },
  es: {
    "announce.artilleryImpact": "IMPACTO DE ARTILLERIA",
    "announce.artilleryLock": "FIJACION DE ARTILLERIA",
    "announce.bossCollapse": "COLAPSO OVERSEER",
    "announce.bossCoreExposed": "NUCLEO EXPUESTO",
    "announce.bossDefeated": "OVERSEER CAIDO",
    "announce.bossPulse": "PULSO DE FASE",
    "announce.bossShift": "CAMBIO DE FASE",
    "announce.bossSpawned": "BRECHA OVERSEER",
    "announce.comboSurge": "CADENA x{count}",
    "announce.eliteBurst": "NUCLEO VOLATIL",
    "announce.eliteSpawned": "CEPA ELITE",
    "announce.gridPurge": "PURGA DE REJILLA",
    "announce.legendaryReady": "MODULO LEGENDARIO",
    "announce.recordBest": "NUEVO RECORD PERSONAL",
    "announce.rescueSpawned": "SENAL DE RESCATE",
    "announce.rescueStreak": "EXTRACCION x{count}",
    "announce.relayBoost": "PULSO DE SOPORTE",
    "announce.upgradeReady": "VENTANA DE MEJORA",
    "announce.victory": "ARENA ASEGURADA",
    "announce.waveStart": "OLEADA {wave} // {threat}",
    "boss.mode.charging": "Cargando",
    "boss.mode.cooldown": "Recarga",
    "boss.mode.exposed": "Expuesto",
    "boss.mode.purge": "Purga",
    "boss.mode.rush": "Embestida",
    "boss.mode.tracking": "Rastreo",
    "controls.aim": "Apuntar",
    "controls.combat": "Controles",
    "controls.dash": "Dash",
    "controls.fire": "Disparo",
    "controls.move": "Mover",
    "chapter.continue": "Abrir Sector",
    "chapter.copy":
    "La carcasa del Overseer ha caido. Fija un modulo legendario de brecha antes de lanzarte a la rejilla de purga mas feroz.",
    "chapter.copyBonus":
    "La carcasa del Overseer ha caido. El trafico rescatado ha abierto una opcion legendaria extra antes de lanzarte a la rejilla de purga mas feroz.",
    "chapter.eyebrow": "Brecha de capitulo",
    "chapter.moduleLabel": "Modulos legendarios de brecha",
    "chapter.summary": "Capitulo {chapter} activo / Mejoras fijadas: {count}",
    "chapter.summaryBonus": "Capitulo {chapter} activo / Mejoras fijadas: {count} / Cache de rescate abierta",
    "chapter.titleAccent": "Rejilla de Purga",
    "chapter.titleMain": "Sector {chapter}",
    "gameOver.copy":
      "La arena sigue al rojo vivo. Entra otra vez al instante y manten la presion sobre la IA rebelde.",
    "gameOver.eyebrow": "Incursion fallida",
    "gameOver.hint": "Pulsa R o haz clic en Reiniciar. Un input y vuelves a la arena.",
    "gameOver.restart": "Reiniciar",
    "gameOver.titleAccent": "Perdida",
    "gameOver.titleMain": "Senal",
    "rank.a": "Cazador de Rejilla",
    "rank.b": "Nodo de Ataque",
    "rank.c": "Unidad de Contencion",
    "rank.d": "Arranque Frio",
    "rank.s": "Rompe Overseers",
    "hud.chain": "Cadena",
    "hud.dash": "Dash",
    "hud.hull": "Casco",
    "hud.pb": "PB",
    "hud.pbAhead": "+{score}",
    "hud.pbBehind": "-{score}",
    "hud.pbSet": "Nuevo PB",
    "hud.ready": "Lista",
    "hud.score": "Puntos",
    "hud.standBy": "En espera",
    "hud.state": "Estado",
    "hud.threat": "Amenaza",
    "hud.uptime": "Tiempo",
    "hud.wave": "Oleada",
    "locale.label": "Idioma",
    "card.overcore.desc": "Suelta en la arena para ganar casco maximo y reparar esa cantidad.",
    "card.overcore.notify": "Blindaje overcore instalado.",
    "card.overcore.title": "Blindaje Overcore",
    "card.purge.desc": "Suelta en la arena para limpiar enemigos sin jefe y danar armadura de jefe.",
    "card.purge.notify": "Protocolo de purga disparado.",
    "card.purge.title": "Protocolo de Purga",
    "card.repair.desc": "Suelta en la arena para recuperar una gran parte del casco.",
    "card.repair.notify": "Reparacion de campo activada.",
    "card.repair.title": "Reparacion de Campo",
    "notify.artilleryImpact": "La zona de impacto ha detonado.",
    "notify.artilleryLock": "La artilleria ha pintado una zona en la arena.",
    "notify.bossCollapse": "Se ha activado una cascada de colapso en la arena.",
    "notify.bossCoreExposed": "El nucleo del Overseer esta expuesto. Revientalo.",
    "notify.bossDefeated": "El nucleo del OVERSEER ha colapsado.",
    "notify.bossPulse": "El pulso de fase ha fijado la arena.",
    "notify.bossShift": "El Overseer ha entrado en fase dos.",
    "notify.bossSpawned": "Brecha detectada: OVERSEER.",
    "notify.comboSurge": "Pico de presion x{count}",
    "notify.eliteBurst": "Una elite volatil ha reventado.",
    "notify.eliteKilled": "La escolta elite ha colapsado.",
    "notify.eliteSpawned": "Se ha materializado una escolta elite.",
    "notify.gridPurge": "Carril de purga armado.",
    "notify.legendaryReady": "Modulo legendario de brecha desbloqueado.",
    "notify.pickupHeal": "+{amount} de casco recuperado",
    "notify.playerDied": "Senal perdida. Recicla la incursion.",
    "notify.recordBest": "Has mejorado tu marca.",
    "notify.rescueLost": "Una senal rescatable colapso antes de la extraccion.",
    "notify.rescueSaved": "Senal civil extraida. +{amount} puntos.",
    "notify.rescueSpawned": "Senal de rescate temporal liberada.",
    "notify.rescueStreak": "Racha de extraccion x{count}. La presion del combo sigue viva.",
    "notify.relayBoost": "El relay ha energizado a la escolta hostil.",
    "notify.upgradeReady": "Ventana de mejora abierta.",
    "notify.victory": "Arena asegurada.",
    "notify.waveStart": "Oleada {wave} activa: {threat}",
    "records.label": "Mejores marcas",
    "records.lastRunLabel": "Ultima run",
    "records.lastRunLine":
      "{result} / Puntos {score} / Cadena x{chain} / Rango {rank} / C{chapter}-O{wave}",
    "records.lastRunEmpty": "Aun no hay run registrada. Rompe la rejilla.",
    "records.lastRunFailed": "Senal perdida",
    "records.lastRunVictory": "Arena asegurada",
    "records.line": "PB {score} / Cadena x{chain} / Rango {rank} / Victorias {wins}",
    "records.lineWithClear":
      "PB {score} / Cadena x{chain} / Rango {rank} / Victorias {wins} / Mejor clear {time}",
    "records.stat.runs": "Runs",
    "records.stat.victories": "Victorias",
    "records.stat.winRate": "Win rate",
    "summary.run": "Tiempo: {time} / Oleada: {wave} / Capitulo: {chapter} / Puntos: {score} / Mejor cadena: x{chain} / Racha de rescate: x{rescueStreak} / Rescatados: {rescued} / Perdidos: {lost} / Eficiencia: {efficiency}",
    "summary.rank": "Rango {rank} / {title}",
    "summary.telemetry": "Puntos {score} / Mejor cadena x{chain}",
    "summary.card.chain": "Cadena",
    "summary.card.depth": "Profundidad",
    "summary.card.pace": "Ritmo",
    "summary.card.rescue": "Rescates",
    "summary.card.score": "Puntos",
    "summary.nextGoal": "Siguiente objetivo",
    "state.artilleryImpact": "Zona de impacto",
    "state.artilleryLock": "Fijacion de artilleria",
    "state.edgeBurn": "Borde en llamas",
    "state.exposedCore": "Nucleo expuesto",
    "state.phasePulse": "Pulso de fase",
    "state.phasePulseWarning": "Fijacion de pulso",
    "state.gridPurge": "Purga de rejilla",
    "state.relayBoost": "Pulso de soporte",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Desbordado",
    "state.purgeWarning": "Bloqueo de purga",
    "tagline.loop": "Rompe la carcasa. Baja mas hondo. Una run mas.",
    "title.copy":
      "Pilotas TALON-7, la ultima plataforma de brecha aun operativa. Revienta rastreadores, sobrevive al fuego cruzado de los sentries y fuerza al Overseer a colapsar de fase.",
    "title.draftTag": "Draft // primer modulo tras oleada 3 / legendaria tras jefe de sector",
    "title.enemyTag": "Amenaza // rastreadores / arietes / sentries prisma / overseer en cambio de fase",
    "title.eyebrow": "Protocolo de asedio neon",
    "title.hint": "Enter tambien empieza. Tras caer, pulsa R para reintentar al instante.",
    "title.playerTag": "Activo // plataforma de brecha TALON-7",
    "title.start": "Empezar",
    "upgrade.copy":
      "La arena abre una ventana minima. Fija una mejora antes de la siguiente oleada.",
    "upgrade.copyBonus":
      "La cache de rescate se ha abierto. Fija una mejora antes de la siguiente oleada, con una opcion extra activa.",
    "upgrade.eyebrow": "Oleada despejada",
    "upgrade.history.empty": "Oleada {wave} despejada. Aun no hay modulos instalados.",
    "upgrade.history.installed": "Instaladas: {modules}",
    "upgrade.option": "Opcion {count}",
    "upgrade.titleAccent": "Mejora",
    "upgrade.titleMain": "Elige",
    "victory.copy":
      "El director rebelde ha sido aplastado por ahora. Reinicia la brecha e intenta quemar la run todavia mas rapido.",
    "victory.eyebrow": "Incursion completada",
    "victory.hint": "Pulsa R para otra incursion.",
    "victory.restart": "Otra incursion",
    "victory.summary": "Oleadas superadas: {wave} / Mejoras fijadas: {count}",
    "victory.titleAccent": "Asegurada",
    "victory.titleMain": "Arena",
    "wave.advance": "Avance",
    "wave.cleared": "Despejada",
    "wave.deploying": "Despliegue",
    "wave.finalPush": "Empuje final",
    "wave.sweep": "Barrido",
    "wave.theme.containment-crash": "Choque de Contencion",
    "wave.theme.codex-requiem": "Requiem Codex",
    "wave.theme.fracture-line": "Linea de Fractura",
    "wave.theme.heat-spiral": "Espiral Termica",
    "wave.theme.kill-grid": "Rejilla de Muerte",
    "wave.theme.last-directive": "Ultima Directiva",
    "wave.theme.overseer-breach": "Brecha Overseer",
    "wave.theme.purge-clamp": "Tenaza de Purga",
    "wave.theme.ram-drill": "Taladro de Arietes",
    "wave.theme.signal-sweep": "Barrido de Senal",
    "wave.theme.token-drought": "Sequia de Tokens",
    "wave.upgrade": "Mejora"
  }
} as const;

const UPGRADE_TEXT: Record<
  UpgradeId,
  Record<Locale, { description: string; title: string }>
> = {
  "afterburn-link": {
    en: {
      description: "Dash returns much sooner.",
      title: "Afterburn Link"
    },
    es: {
      description: "El dash vuelve mucho antes.",
      title: "Enlace de Postcombustion"
    }
  },
  "arc-splitter": {
    en: {
      description: "Projectiles chain lightning to a nearby enemy.",
      title: "Arc Splitter"
    },
    es: {
      description: "Los proyectiles encadenan un rayo a un enemigo cercano.",
      title: "Divisor de Arco"
    }
  },
  "halo-drone": {
    en: {
      description: "One orbital drone fires automatically.",
      title: "Halo Drone"
    },
    es: {
      description: "Un dron orbital dispara automaticamente.",
      title: "Dron Halo"
    }
  },
  "ricochet-core": {
    en: {
      description: "Projectiles bounce once off the arena edge.",
      title: "Ricochet Core"
    },
    es: {
      description: "Los proyectiles rebotan una vez en el borde de la arena.",
      title: "Nucleo Ricochet"
    }
  },
  "starburst-rounds": {
    en: {
      description: "Kills release a small radial burst.",
      title: "Starburst Rounds"
    },
    es: {
      description: "Las bajas liberan una pequena rafaga radial.",
      title: "Municion Estelar"
    }
  },
  "rail-pierce": {
    en: {
      description: "Projectiles pierce the first enemy hit.",
      title: "Rail Pierce"
    },
    es: {
      description: "Los proyectiles perforan al primer enemigo alcanzado.",
      title: "Perforador Rail"
    }
  },
  "nova-dash": {
    en: {
      description: "Dash creates an explosion at the end point.",
      title: "Nova Dash"
    },
    es: {
      description: "El dash crea una explosion en el punto final.",
      title: "Dash Nova"
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
      title: "Gravity Well"
    },
    es: {
      description: "Los pickups crean un campo breve que atrae enemigos.",
      title: "Pozo Gravitatorio"
    }
  },
  "breach-pulse": {
    en: {
      description: "Dash emits a shock pulse.",
      title: "Breach Pulse"
    },
    es: {
      description: "El dash emite una onda de choque.",
      title: "Pulso de Brecha"
    }
  },
  "burn-drive": {
    en: {
      description: "Movement speed increases.",
      title: "Burn Drive"
    },
    es: {
      description: "Aumenta la velocidad de movimiento.",
      title: "Motor de Combustion"
    }
  },
  "card-purge": {
    en: {
      description: "Stores a one-use purge card in your hand.",
      title: "Purge Protocol"
    },
    es: {
      description: "Guarda una carta de purga de un solo uso en tu mano.",
      title: "Protocolo de Purga"
    }
  },
  "card-repair": {
    en: {
      description: "Stores a one-use repair card in your hand.",
      title: "Field Repair"
    },
    es: {
      description: "Guarda una carta de reparacion de un solo uso en tu mano.",
      title: "Reparacion de Campo"
    }
  },
  "card-overcore": {
    en: {
      description: "Stores a one-use max hull card in your hand.",
      title: "Overcore Plating"
    },
    es: {
      description: "Guarda una carta de casco maximo de un solo uso en tu mano.",
      title: "Blindaje Overcore"
    }
  },
  "chatgpt-router": {
    en: {
      description: "Adds a routed firing lane.",
      title: "ChatGPT Router"
    },
    es: {
      description: "Anade una via de disparo guiada.",
      title: "Router ChatGPT"
    }
  },
  "claude-lattice": {
    en: {
      description: "Orbs repair more hull.",
      title: "Claude Lattice"
    },
    es: {
      description: "Los orbes reparan mas casco.",
      title: "Reticula Claude"
    }
  },
  "coil-rifling": {
    en: {
      description: "Tightens the shot coil for harder rounds.",
      title: "Coil Rifling"
    },
    es: {
      description: "Aprieta el disparo para que pegue mas.",
      title: "Estriado de Bobina"
    }
  },
  "codex-overclock": {
    en: {
      description: "Primary fire goes feral-fast.",
      title: "Codex Overclock"
    },
    es: {
      description: "El disparo principal se acelera una barbaridad.",
      title: "Overclock Codex"
    }
  },
  "dash-capacitors": {
    en: {
      description: "Dash comes back sooner.",
      title: "Dash Capacitors"
    },
    es: {
      description: "El dash vuelve antes.",
      title: "Capacitores de Dash"
    }
  },
  "echo-web": {
    en: {
      description: "Adds one more firing lane.",
      title: "Echo Web"
    },
    es: {
      description: "Anade otra calle de disparo.",
      title: "Red de Eco"
    }
  },
  "eclipse-protocol": {
    en: {
      description: "Legendary lattice: adds two wide firing lanes.",
      title: "Eclipse Protocol"
    },
    es: {
      description: "Reticula legendaria: anade dos vias de disparo amplias.",
      title: "Protocolo Eclipse"
    }
  },
  "satellite-lattice": {
    en: {
      description: "Legendary lattice: two satellites fire in a cross pattern.",
      title: "Satellite Lattice"
    },
    es: {
      description: "Reticula legendaria: dos satelites disparan en cruz.",
      title: "Reticula Satelite"
    }
  },
  "comet-bloom": {
    en: {
      description: "Legendary artillery: periodic shots launch a large explosive projectile.",
      title: "Comet Bloom"
    },
    es: {
      description: "Artilleria legendaria: disparos periodicos lanzan un proyectil explosivo grande.",
      title: "Floracion Cometa"
    }
  },
  "ion-repeaters": {
    en: {
      description: "Primary fire cycles faster.",
      title: "Ion Repeaters"
    },
    es: {
      description: "El disparo principal cicla mas rapido.",
      title: "Repetidores de Iones"
    }
  },
  "magnet-sweep": {
    en: {
      description: "Orbs collect from farther away.",
      title: "Magnet Sweep"
    },
    es: {
      description: "Los orbes se atraen desde mas lejos.",
      title: "Barrido Magnetico"
    }
  },
  "overcharge-rounds": {
    en: {
      description: "Projectiles hit harder.",
      title: "Overcharge Rounds"
    },
    es: {
      description: "Los proyectiles golpean mas fuerte.",
      title: "Municion Sobrecargada"
    }
  },
  "overseer-lens": {
    en: {
      description: "Legendary optics: projectiles hit harder.",
      title: "Overseer Lens"
    },
    es: {
      description: "Optica legendaria: los proyectiles pegan mas.",
      title: "Lente Overseer"
    }
  },
  "phase-battery": {
    en: {
      description: "Increase max hull.",
      title: "Phase Battery"
    },
    es: {
      description: "Aumenta el casco maximo.",
      title: "Bateria de Fase"
    }
  },
  "prism-loader": {
    en: {
      description: "Adds another lane to the volley.",
      title: "Prism Loader"
    },
    es: {
      description: "Anade otra linea a la rafaga.",
      title: "Cargador Prisma"
    }
  },
  "recovery-matrix": {
    en: {
      description: "Patch hull immediately.",
      title: "Recovery Matrix"
    },
    es: {
      description: "Recupera casco al instante.",
      title: "Matriz de Recuperacion"
    }
  },
  "signal-choir": {
    en: {
      description: "Legendary rescue lattice: rescues release more orbs.",
      title: "Signal Choir"
    },
    es: {
      description: "Reticula legendaria de rescate: los rescates sueltan mas orbes.",
      title: "Coro de Senales"
    }
  },
  "siege-gyros": {
    en: {
      description: "Shots hit harder.",
      title: "Siege Gyros"
    },
    es: {
      description: "Los disparos pegan mas.",
      title: "Giros de Asedio"
    }
  },
  "shock-greaves": {
    en: {
      description: "Dash becomes dangerous on impact.",
      title: "Shock Greaves"
    },
    es: {
      description: "El dash se vuelve peligroso al impactar.",
      title: "Grebas de Choque"
    }
  },
  "split-lattice": {
    en: {
      description: "Primary fire fans into a wider multi-shot spread.",
      title: "Split Lattice"
    },
    es: {
      description: "El disparo principal se abre en una rafaga multiple mas amplia.",
      title: "Reticula Segmentada"
    }
  },
  "zero-point-capacitor": {
    en: {
      description: "Legendary core: dash releases a heavier pulse.",
      title: "Zero-Point Capacitor"
    },
    es: {
      description: "Nucleo legendario: el dash libera un pulso mas pesado.",
      title: "Capacitor de Punto Cero"
    }
  },
  "glass-reactor": {
    en: {
      description: "Massive projectile damage.",
      title: "Glass Reactor"
    },
    es: {
      description: "Mucho mas dano por proyectil.",
      title: "Reactor de Cristal"
    }
  },
  "fortress-frame": {
    en: {
      description: "Gain heavy max hull.",
      title: "Fortress Frame"
    },
    es: {
      description: "Ganas mucho casco maximo.",
      title: "Chasis Fortaleza"
    }
  },
  "heat-sink-bypass": {
    en: {
      description: "Primary fire accelerates.",
      title: "Heat Sink Bypass"
    },
    es: {
      description: "El disparo acelera.",
      title: "Bypass de Disipacion"
    }
  },
  "vector-thrusters": {
    en: {
      description: "Dash speed increases.",
      title: "Vector Thrusters"
    },
    es: {
      description: "Aumenta la velocidad de dash.",
      title: "Propulsores Vectoriales"
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
    window.localStorage.getItem(STORAGE_KEY) ?? window.navigator.language
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
