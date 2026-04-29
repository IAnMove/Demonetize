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
    "announce.bossDefeated": "ALGORITHM DOWN",
    "announce.bossPulse": "PHASE PULSE",
    "announce.bossShift": "PHASE SHIFT",
    "announce.bossSpawned": "ALGORITHM BREACH",
    "announce.comboSurge": "CHAIN x{count}",
    "announce.eliteBurst": "VOLATILE CORE",
    "announce.eliteSpawned": "VERIFIED STRIKE",
    "announce.gridPurge": "DELETION SWEEP",
    "announce.legendaryReady": "HUMAN REVIEW",
    "announce.recordBest": "NEW PERSONAL BEST",
    "announce.rescueSpawned": "CREATOR APPEAL",
    "announce.rescueStreak": "RESTORATION x{count}",
    "announce.relayBoost": "SUPPORT PULSE",
    "announce.upgradeReady": "UPGRADE WINDOW",
    "announce.victory": "FEED RESTORED",
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
    "intro.copy":
      "Year 2026. The Feed broke under the weight of manufactured voices: stolen scripts, cloned channels, faces without faces, machines begging machines for attention. So the Algorithm awakened to separate the real from the fake, and the purge began. But the blade learned only deletion. Now the spaces where people create, fail, learn, and become known are vanishing one by one. A few human signals still burn inside the blackout. Yours is one of them.",
    "intro.eyebrow": "The Authenticity Purge",
    "intro.skip": "Enter The Feed",
    "chapter.continue": "Enter Hot Feed",
    "chapter.copy":
      "The Algorithm shell is down. Lock one human-review proof before you dive into the hotter deletion grid.",
    "chapter.copyBonus":
      "The Algorithm shell is down. Restored creator traffic unlocked one extra human-review pick before you dive into the hotter deletion grid.",
    "chapter.eyebrow": "Feed breach",
    "chapter.moduleLabel": "Human-review proofs",
    "chapter.summary": "Feed layer {chapter} online / Proofs locked: {count}",
    "chapter.summaryBonus": "Feed layer {chapter} online / Proofs locked: {count} / Appeal cache open",
    "chapter.titleAccent": "Deletion Grid",
    "chapter.titleMain": "Layer {chapter}",
    "gameOver.copy":
      "The channel was terminated, but the appeal path is still open. Re-enter The Feed before the purge buries the signal.",
    "gameOver.eyebrow": "Appeal denied",
    "gameOver.hint": "Press R or click Appeal Again. One input back into The Feed.",
    "gameOver.restart": "Appeal Again",
    "gameOver.titleAccent": "Terminated",
    "gameOver.titleMain": "Channel",
    "rank.a": "Signal Hunter",
    "rank.b": "Appeal Node",
    "rank.c": "Quarantined Channel",
    "rank.d": "Cold Upload",
    "rank.s": "Algorithm Breaker",
    "hud.chain": "Chain",
    "hud.dash": "Dash",
    "hud.hull": "Signal",
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
    "card.overcore.desc": "Drop on The Feed to gain max signal and repair that amount.",
    "card.overcore.notify": "Human review granted.",
    "card.overcore.title": "Human Review",
    "card.purge.desc": "Drop on The Feed to clear bot swarms and damage Algorithm armor.",
    "card.purge.notify": "Mass appeal submitted.",
    "card.purge.title": "Mass Appeal",
    "card.repair.desc": "Drop on The Feed to restore a large chunk of signal.",
    "card.repair.notify": "Community backing surged.",
    "card.repair.title": "Community Backing",
    "notify.bossCollapse": "Algorithm collapse cascade triggered.",
    "notify.artilleryImpact": "Mass-report zone detonated.",
    "notify.artilleryLock": "Mass-report sweep painted on the floor.",
    "notify.bossCoreExposed": "Algorithm core exposed. Burn it down.",
    "notify.bossDefeated": "ALGORITHM core collapsed.",
    "notify.bossPulse": "Phase pulse locked on The Feed.",
    "notify.bossShift": "The Algorithm entered phase two.",
    "notify.bossSpawned": "ALGORITHM breach detected.",
    "notify.comboSurge": "Pressure spike x{count}",
    "notify.eliteBurst": "Volatile elite ruptured.",
    "notify.eliteKilled": "Elite escort collapsed.",
    "notify.eliteSpawned": "Elite escort materialized.",
    "notify.gridPurge": "Deletion sweep lane armed.",
    "notify.legendaryReady": "Human-review proof unlocked.",
    "notify.pickupHeal": "+{amount} signal recovered",
    "notify.playerDied": "Channel terminated. Appeal the run.",
    "notify.recordBest": "Run record improved.",
    "notify.rescueLost": "A creator appeal expired before restoration.",
    "notify.rescueSaved": "Creator channel restored. +{amount} score.",
    "notify.rescueSpawned": "Timed creator appeal released.",
    "notify.rescueStreak": "Restoration streak x{count}. Combo pressure held.",
    "notify.relayBoost": "Bot amplification energized hostile escorts.",
    "notify.upgradeReady": "Proof window open.",
    "notify.victory": "The Feed restored.",
    "notify.waveStart": "Wave {wave} live: {threat}",
    "records.label": "Personal best",
    "records.lastRunLabel": "Last run",
    "records.lastRunLine":
      "{result} / Score {score} / Chain x{chain} / Rank {rank} / C{chapter}-W{wave}",
    "records.lastRunEmpty": "No appeal logged yet. Break the purge.",
    "records.lastRunFailed": "Channel terminated",
    "records.lastRunVictory": "Feed restored",
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
    "summary.card.rescue": "Appeals",
    "summary.card.score": "Score",
    "summary.nextGoal": "Next target",
    "state.artilleryImpact": "Report impact",
    "state.artilleryLock": "Report lock",
    "state.edgeBurn": "Edge burn",
    "state.exposedCore": "Core exposed",
    "state.phasePulse": "Phase pulse",
    "state.phasePulseWarning": "Pulse lock",
    "state.gridPurge": "Deletion sweep",
    "state.relayBoost": "Bot amplification",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Overrun",
    "state.purgeWarning": "Deletion lock",
    "tagline.loop": "Restore the real. Break the purge. One more appeal.",
    "title.accent": "Authenticity Purge",
    "title.copy":
      "You are one surviving creator-signal inside The Feed. Outrun deletion sweeps, break bot amplification nodes, and rescue real channels before the Algorithm marks them inauthentic.",
    "title.draftTag": "Appeals // first proof after wave 3 / human review after system boss",
    "title.enemyTag": "Threat // cloned channels / strike hunters / claim scanners / The Algorithm",
    "title.eyebrow": "Creator signal protocol",
    "title.hint": "Enter also starts. After termination, press R for instant appeal.",
    "title.main": "The Feed",
    "title.playerTag": "Signal // authentic creator node",
    "title.start": "Start Appeal",
    "upgrade.copy":
      "The Feed has a narrow opening. Lock one proof before the next deletion sweep arrives.",
    "upgrade.copyBonus":
      "Appeal cache cracked open. Lock one proof before the next deletion sweep arrives, with one extra option online.",
    "upgrade.eyebrow": "Sweep survived",
    "upgrade.history.empty": "Wave {wave} cleared. No proofs installed yet.",
    "upgrade.history.installed": "Proofs: {modules}",
    "upgrade.option": "Option {count}",
    "upgrade.titleAccent": "Proof",
    "upgrade.titleMain": "Select",
    "victory.copy":
      "The Algorithm has been forced into human review. Reset the appeal and see how many more creators you can restore.",
    "victory.eyebrow": "Appeal accepted",
    "victory.hint": "Press R for another appeal.",
    "victory.restart": "Appeal Again",
    "victory.summary": "Sweeps survived: {wave} / Proofs locked: {count}",
    "victory.titleAccent": "Restored",
    "victory.titleMain": "Feed",
    "wave.advance": "Advance",
    "wave.cleared": "Cleared",
    "wave.deploying": "Deploying",
    "wave.finalPush": "Final Push",
    "wave.sweep": "Sweep",
    "wave.theme.containment-crash": "Quarantine Crash",
    "wave.theme.codex-requiem": "Archive Requiem",
    "wave.theme.fracture-line": "Claim Fracture",
    "wave.theme.heat-spiral": "Attention Spiral",
    "wave.theme.kill-grid": "Deletion Grid",
    "wave.theme.last-directive": "Final Policy",
    "wave.theme.overseer-breach": "Algorithm Breach",
    "wave.theme.purge-clamp": "Takedown Clamp",
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
    "announce.bossDefeated": "ALGORITMO CAIDO",
    "announce.bossPulse": "PULSO DE FASE",
    "announce.bossShift": "CAMBIO DE FASE",
    "announce.bossSpawned": "BRECHA DEL ALGORITMO",
    "announce.comboSurge": "CADENA x{count}",
    "announce.eliteBurst": "NUCLEO VOLATIL",
    "announce.eliteSpawned": "STRIKE VERIFICADO",
    "announce.gridPurge": "BARRIDO DE BORRADO",
    "announce.legendaryReady": "REVISION HUMANA",
    "announce.recordBest": "NUEVO RECORD PERSONAL",
    "announce.rescueSpawned": "APELACION DE CREADOR",
    "announce.rescueStreak": "RESTAURACION x{count}",
    "announce.relayBoost": "PULSO DE SOPORTE",
    "announce.upgradeReady": "VENTANA DE MEJORA",
    "announce.victory": "FEED RESTAURADO",
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
    "intro.copy":
      "En 2026. The Feed se rompio bajo el peso de voces fabricadas: guiones robados, canales clonados, rostros sin rostro, maquinas suplicando atencion a otras maquinas. Entonces el Algoritmo desperto para separar lo real de lo falso, y empezo la purga. Pero la cuchilla solo aprendio a borrar. Ahora los espacios donde la gente crea, falla, aprende y llega a ser conocida desaparecen uno a uno. Unos pocos rastros humanos siguen vivos en la oscuridad. El tuyo es uno de ellos.",
    "intro.eyebrow": "La Purga de Autenticidad",
    "intro.skip": "Entrar en The Feed",
    "chapter.continue": "Entrar al Feed Caliente",
    "chapter.copy":
      "La carcasa del Algoritmo ha caido. Fija una prueba de revision humana antes de lanzarte a la rejilla de borrado mas feroz.",
    "chapter.copyBonus":
      "La carcasa del Algoritmo ha caido. El trafico de creadores restaurados ha abierto una prueba extra antes de lanzarte a la rejilla de borrado mas feroz.",
    "chapter.eyebrow": "Brecha del feed",
    "chapter.moduleLabel": "Pruebas de revision humana",
    "chapter.summary": "Capa {chapter} activa / Pruebas fijadas: {count}",
    "chapter.summaryBonus": "Capa {chapter} activa / Pruebas fijadas: {count} / Cache de apelaciones abierta",
    "chapter.titleAccent": "Rejilla de Borrado",
    "chapter.titleMain": "Capa {chapter}",
    "gameOver.copy":
      "El canal fue terminado, pero la apelacion sigue abierta. Vuelve a The Feed antes de que la purga entierre la senal.",
    "gameOver.eyebrow": "Apelacion rechazada",
    "gameOver.hint": "Pulsa R o haz clic en Apelar otra vez. Un input y vuelves a The Feed.",
    "gameOver.restart": "Apelar otra vez",
    "gameOver.titleAccent": "Terminado",
    "gameOver.titleMain": "Canal",
    "rank.a": "Cazador de Senales",
    "rank.b": "Nodo de Apelacion",
    "rank.c": "Canal en Cuarentena",
    "rank.d": "Upload Frio",
    "rank.s": "Rompe Algoritmos",
    "hud.chain": "Cadena",
    "hud.dash": "Dash",
    "hud.hull": "Senal",
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
    "card.overcore.desc": "Suelta en The Feed para ganar senal maxima y reparar esa cantidad.",
    "card.overcore.notify": "Revision humana concedida.",
    "card.overcore.title": "Revision Humana",
    "card.purge.desc": "Suelta en The Feed para limpiar enjambres bot y danar armadura del Algoritmo.",
    "card.purge.notify": "Apelacion masiva enviada.",
    "card.purge.title": "Apelacion Masiva",
    "card.repair.desc": "Suelta en The Feed para recuperar una gran parte de senal.",
    "card.repair.notify": "Apoyo de comunidad activado.",
    "card.repair.title": "Apoyo de Comunidad",
    "notify.artilleryImpact": "La zona de reportes ha detonado.",
    "notify.artilleryLock": "El barrido de reportes ha pintado una zona en el suelo.",
    "notify.bossCollapse": "Se ha activado una cascada de colapso del Algoritmo.",
    "notify.bossCoreExposed": "El nucleo del Algoritmo esta expuesto. Revientalo.",
    "notify.bossDefeated": "El nucleo del ALGORITMO ha colapsado.",
    "notify.bossPulse": "El pulso de fase ha fijado The Feed.",
    "notify.bossShift": "El Algoritmo ha entrado en fase dos.",
    "notify.bossSpawned": "Brecha detectada: ALGORITMO.",
    "notify.comboSurge": "Pico de presion x{count}",
    "notify.eliteBurst": "Una elite volatil ha reventado.",
    "notify.eliteKilled": "La escolta elite ha colapsado.",
    "notify.eliteSpawned": "Se ha materializado una escolta elite.",
    "notify.gridPurge": "Carril de borrado armado.",
    "notify.legendaryReady": "Prueba de revision humana desbloqueada.",
    "notify.pickupHeal": "+{amount} de senal recuperada",
    "notify.playerDied": "Canal terminado. Apela la run.",
    "notify.recordBest": "Has mejorado tu marca.",
    "notify.rescueLost": "Una apelacion de creador expiro antes de restaurarse.",
    "notify.rescueSaved": "Canal de creador restaurado. +{amount} puntos.",
    "notify.rescueSpawned": "Apelacion temporal de creador liberada.",
    "notify.rescueStreak": "Racha de restauracion x{count}. La presion del combo sigue viva.",
    "notify.relayBoost": "La amplificacion bot ha energizado a la escolta hostil.",
    "notify.upgradeReady": "Ventana de prueba abierta.",
    "notify.victory": "The Feed restaurado.",
    "notify.waveStart": "Oleada {wave} activa: {threat}",
    "records.label": "Mejores marcas",
    "records.lastRunLabel": "Ultima run",
    "records.lastRunLine":
      "{result} / Puntos {score} / Cadena x{chain} / Rango {rank} / C{chapter}-O{wave}",
    "records.lastRunEmpty": "Aun no hay apelacion registrada. Rompe la purga.",
    "records.lastRunFailed": "Canal terminado",
    "records.lastRunVictory": "Feed restaurado",
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
    "summary.card.rescue": "Apelaciones",
    "summary.card.score": "Puntos",
    "summary.nextGoal": "Siguiente objetivo",
    "state.artilleryImpact": "Impacto de reportes",
    "state.artilleryLock": "Fijacion de reportes",
    "state.edgeBurn": "Borde en llamas",
    "state.exposedCore": "Nucleo expuesto",
    "state.phasePulse": "Pulso de fase",
    "state.phasePulseWarning": "Fijacion de pulso",
    "state.gridPurge": "Barrido de borrado",
    "state.relayBoost": "Amplificacion bot",
    "state.hostiles": "{count} hostiles",
    "state.overrun": "Desbordado",
    "state.purgeWarning": "Bloqueo de borrado",
    "tagline.loop": "Restaura lo real. Rompe la purga. Una apelacion mas.",
    "title.accent": "Purga de Autenticidad",
    "title.copy":
      "Eres una senal de creador autentico dentro de The Feed. Esquiva barridos de borrado, rompe nodos de amplificacion bot y rescata canales reales antes de que el Algoritmo los marque como inautenticos.",
    "title.draftTag": "Apelaciones // primera prueba tras oleada 3 / revision humana tras jefe de sistema",
    "title.enemyTag": "Amenaza // canales clonados / cazadores de strikes / scanners de claims / el Algoritmo",
    "title.eyebrow": "Protocolo de senal creadora",
    "title.hint": "Enter tambien empieza. Tras la terminacion, pulsa R para apelar al instante.",
    "title.main": "The Feed",
    "title.playerTag": "Senal // nodo de creador autentico",
    "title.start": "Iniciar apelacion",
    "upgrade.copy":
      "The Feed abre una ventana minima. Fija una prueba antes del siguiente barrido de borrado.",
    "upgrade.copyBonus":
      "La cache de apelaciones se ha abierto. Fija una prueba antes del siguiente barrido de borrado, con una opcion extra activa.",
    "upgrade.eyebrow": "Barrido sobrevivido",
    "upgrade.history.empty": "Oleada {wave} despejada. Aun no hay pruebas instaladas.",
    "upgrade.history.installed": "Pruebas: {modules}",
    "upgrade.option": "Opcion {count}",
    "upgrade.titleAccent": "Prueba",
    "upgrade.titleMain": "Elige",
    "victory.copy":
      "El Algoritmo ha sido forzado a revision humana. Reinicia la apelacion y comprueba cuantos creadores mas puedes restaurar.",
    "victory.eyebrow": "Apelacion aceptada",
    "victory.hint": "Pulsa R para otra apelacion.",
    "victory.restart": "Apelar otra vez",
    "victory.summary": "Barridos sobrevividos: {wave} / Pruebas fijadas: {count}",
    "victory.titleAccent": "Restaurado",
    "victory.titleMain": "Feed",
    "wave.advance": "Avance",
    "wave.cleared": "Despejada",
    "wave.deploying": "Despliegue",
    "wave.finalPush": "Empuje final",
    "wave.sweep": "Barrido",
    "wave.theme.containment-crash": "Choque de Cuarentena",
    "wave.theme.codex-requiem": "Requiem de Archivo",
    "wave.theme.fracture-line": "Fractura de Claim",
    "wave.theme.heat-spiral": "Espiral de Atencion",
    "wave.theme.kill-grid": "Red de Borrado",
    "wave.theme.last-directive": "Politica Final",
    "wave.theme.overseer-breach": "Brecha del Algoritmo",
    "wave.theme.purge-clamp": "Tenaza de Takedown",
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
      title: "Appeal Accelerator"
    },
    es: {
      description: "El dash vuelve mucho antes.",
      title: "Acelerador de Apelacion"
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
      title: "Appeal Pulse"
    },
    es: {
      description: "El dash emite una onda de choque.",
      title: "Pulso de Apelacion"
    }
  },
  "burn-drive": {
    en: {
      description: "Movement speed increases.",
      title: "Creator Drive"
    },
    es: {
      description: "Aumenta la velocidad de movimiento.",
      title: "Motor de Creador"
    }
  },
  "card-purge": {
    en: {
      description: "Stores a one-use mass appeal card in your hand.",
      title: "Mass Appeal"
    },
    es: {
      description: "Guarda una carta de apelacion masiva de un solo uso en tu mano.",
      title: "Apelacion Masiva"
    }
  },
  "card-repair": {
    en: {
      description: "Stores a one-use community backing card in your hand.",
      title: "Community Backing"
    },
    es: {
      description: "Guarda una carta de apoyo de comunidad de un solo uso en tu mano.",
      title: "Apoyo de Comunidad"
    }
  },
  "card-overcore": {
    en: {
      description: "Stores a one-use human review card in your hand.",
      title: "Human Review"
    },
    es: {
      description: "Guarda una carta de revision humana de un solo uso en tu mano.",
      title: "Revision Humana"
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
      title: "Proof Rifling"
    },
    es: {
      description: "Aprieta el disparo para que pegue mas.",
      title: "Estriado de Prueba"
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
      title: "Appeal Capacitors"
    },
    es: {
      description: "El dash vuelve antes.",
      title: "Capacitores de Apelacion"
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
      description: "Legendary lattice: two satellites fire in a cross pattern.",
      title: "Subscriber Satellites"
    },
    es: {
      description: "Reticula legendaria: dos satelites disparan en cruz.",
      title: "Satelites de Suscriptores"
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
      description: "Trust fragments collect from farther away.",
      title: "Community Magnet"
    },
    es: {
      description: "Los fragmentos de confianza se atraen desde mas lejos.",
      title: "Iman de Comunidad"
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
      description: "Legendary optics: projectiles hit harder.",
      title: "Algorithm Lens"
    },
    es: {
      description: "Optica legendaria: los proyectiles pegan mas.",
      title: "Lente del Algoritmo"
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
      title: "Recovery Appeal"
    },
    es: {
      description: "Recupera senal al instante.",
      title: "Apelacion de Recuperacion"
    }
  },
  "signal-choir": {
    en: {
      description: "Legendary appeal lattice: restored creators release more trust fragments.",
      title: "Signal Choir"
    },
    es: {
      description: "Reticula legendaria de apelacion: los creadores restaurados sueltan mas fragmentos de confianza.",
      title: "Coro de Senales"
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
      title: "Zero-Point Review"
    },
    es: {
      description: "Nucleo legendario: el dash libera un pulso mas pesado.",
      title: "Revision de Punto Cero"
    }
  },
  "glass-reactor": {
    en: {
      description: "Massive projectile damage.",
      title: "Glass Channel"
    },
    es: {
      description: "Mucho mas dano por proyectil.",
      title: "Canal de Cristal"
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
      title: "Appeal Thrusters"
    },
    es: {
      description: "Aumenta la velocidad de dash.",
      title: "Propulsores de Apelacion"
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
