import type { FrameEvent, FrameEventType } from "../gameplay/events";

type AudioCue =
  | "ui-accept"
  | "shot-fired"
  | "dash"
  | "combo-surge"
  | "artillery-lock-start"
  | "artillery-impact"
  | "relay-boost-start"
  | "elite-spawned"
  | "elite-killed"
  | "elite-burst"
  | "enemy-fired"
  | "arena-purge-start"
  | "legendary-ready"
  | "enemy-spawned"
  | "enemy-hit"
  | "enemy-killed"
  | "boss-spawned"
  | "boss-collapse-start"
  | "boss-core-exposed"
  | "boss-phase-pulse-start"
  | "boss-phase-shift"
  | "boss-defeated"
  | "orb-collected"
  | "player-hit"
  | "player-died"
  | "record-best"
  | "upgrade-ready"
  | "victory";

interface CueSample {
  gain: number;
  minIntervalMs?: number;
  path: string;
  playbackRate?: number;
  rateVariance?: number;
}

interface LoopSample {
  gain: number;
  path: string;
}

const CUE_SAMPLES: Record<AudioCue, CueSample> = {
  "ui-accept": {
    gain: 0.42,
    minIntervalMs: 70,
    path: "/assets/audio/sfx/ui-accept.wav"
  },
  "shot-fired": {
    gain: 0.24,
    minIntervalMs: 42,
    path: "/assets/audio/sfx/shot-fired.ogg",
    rateVariance: 0.05
  },
  dash: {
    gain: 0.28,
    minIntervalMs: 120,
    path: "/assets/audio/sfx/dash.wav",
    playbackRate: 1.12,
    rateVariance: 0.04
  },
  "combo-surge": {
    gain: 0.2,
    minIntervalMs: 260,
    path: "/assets/audio/sfx/combo-surge.wav"
  },
  "artillery-lock-start": {
    gain: 0.34,
    minIntervalMs: 220,
    path: "/assets/audio/sfx/artillery-lock-start.wav"
  },
  "artillery-impact": {
    gain: 0.42,
    minIntervalMs: 80,
    path: "/assets/audio/sfx/artillery-impact.ogg",
    playbackRate: 0.92,
    rateVariance: 0.04
  },
  "relay-boost-start": {
    gain: 0.22,
    minIntervalMs: 260,
    path: "/assets/audio/sfx/relay-boost-start.wav"
  },
  "elite-spawned": {
    gain: 0.34,
    minIntervalMs: 300,
    path: "/assets/audio/sfx/elite-spawned.ogg",
    playbackRate: 0.86,
    rateVariance: 0.03
  },
  "elite-killed": {
    gain: 0.3,
    minIntervalMs: 160,
    path: "/assets/audio/sfx/elite-killed.ogg",
    playbackRate: 0.9,
    rateVariance: 0.05
  },
  "elite-burst": {
    gain: 0.44,
    minIntervalMs: 140,
    path: "/assets/audio/sfx/elite-burst.ogg",
    playbackRate: 0.86,
    rateVariance: 0.04
  },
  "enemy-fired": {
    gain: 0.24,
    minIntervalMs: 90,
    path: "/assets/audio/sfx/enemy-fired.ogg",
    playbackRate: 1.05,
    rateVariance: 0.05
  },
  "arena-purge-start": {
    gain: 0.36,
    minIntervalMs: 360,
    path: "/assets/audio/sfx/arena-purge-start.wav"
  },
  "legendary-ready": {
    gain: 0.22,
    minIntervalMs: 380,
    path: "/assets/audio/sfx/record-best.wav"
  },
  "enemy-spawned": {
    gain: 0.2,
    minIntervalMs: 120,
    path: "/assets/audio/sfx/enemy-spawned.ogg",
    playbackRate: 1.15,
    rateVariance: 0.06
  },
  "enemy-hit": {
    gain: 0.22,
    minIntervalMs: 38,
    path: "/assets/audio/sfx/enemy-hit.ogg",
    rateVariance: 0.1
  },
  "enemy-killed": {
    gain: 0.28,
    minIntervalMs: 75,
    path: "/assets/audio/sfx/enemy-killed.ogg",
    rateVariance: 0.08
  },
  "boss-spawned": {
    gain: 0.3,
    minIntervalMs: 600,
    path: "/assets/audio/sfx/boss-spawned.wav",
    playbackRate: 0.78
  },
  "boss-collapse-start": {
    gain: 0.26,
    minIntervalMs: 650,
    path: "/assets/audio/sfx/boss-collapse-start.wav",
    playbackRate: 0.82
  },
  "boss-core-exposed": {
    gain: 0.24,
    minIntervalMs: 500,
    path: "/assets/audio/sfx/boss-core-exposed.wav",
    playbackRate: 1.08
  },
  "boss-phase-pulse-start": {
    gain: 0.26,
    minIntervalMs: 420,
    path: "/assets/audio/sfx/boss-phase-pulse-start.wav",
    playbackRate: 0.9
  },
  "boss-phase-shift": {
    gain: 0.4,
    minIntervalMs: 500,
    path: "/assets/audio/sfx/boss-phase-shift.ogg",
    playbackRate: 0.76
  },
  "boss-defeated": {
    gain: 0.2,
    minIntervalMs: 900,
    path: "/assets/audio/sfx/boss-defeated.wav"
  },
  "orb-collected": {
    gain: 0.18,
    minIntervalMs: 35,
    path: "/assets/audio/sfx/orb-collected.ogg",
    playbackRate: 1.22,
    rateVariance: 0.12
  },
  "player-hit": {
    gain: 0.34,
    minIntervalMs: 180,
    path: "/assets/audio/sfx/player-hit.ogg",
    playbackRate: 0.82,
    rateVariance: 0.04
  },
  "player-died": {
    gain: 0.28,
    minIntervalMs: 1200,
    path: "/assets/audio/sfx/player-died.wav"
  },
  "record-best": {
    gain: 0.22,
    minIntervalMs: 500,
    path: "/assets/audio/sfx/record-best.wav"
  },
  "upgrade-ready": {
    gain: 0.32,
    minIntervalMs: 260,
    path: "/assets/audio/sfx/upgrade-ready.wav",
    playbackRate: 1.08
  },
  victory: {
    gain: 0.22,
    minIntervalMs: 900,
    path: "/assets/audio/sfx/victory.wav"
  }
};

const LOOP_SAMPLES: LoopSample[] = [
  {
    gain: 0.12,
    path: "/assets/audio/music/battle-theme.mp3"
  },
  {
    gain: 0.04,
    path: "/assets/audio/music/neon-ambience.ogg"
  }
];

export interface AudioBus {
  dispatch: (events: FrameEvent[]) => void;
  playCue: (cue: AudioCue) => void;
  prime: () => void;
}

export function createAudioBus(): AudioBus {
  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return {
      dispatch: () => {},
      playCue: () => {},
      prime: () => {}
    };
  }

  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 1;
  master.connect(context.destination);

  const synthMaster = context.createGain();
  synthMaster.gain.value = 0.082;
  synthMaster.connect(master);

  const sfxMaster = context.createGain();
  sfxMaster.gain.value = 0.58;
  sfxMaster.connect(master);

  const musicMaster = context.createGain();
  musicMaster.gain.value = 0.5;
  musicMaster.connect(master);

  const decodedBuffers = new Map<string, AudioBuffer>();
  const pendingBufferLoads = new Map<string, Promise<AudioBuffer | null>>();
  const failedBufferPaths = new Set<string>();
  const lastCueTimes = new Map<AudioCue, number>();
  const activeLoopPaths = new Set<string>();
  let enabled = false;
  let lastVerdictAt = -1000;

  const triggerCue = (cue: AudioCue): void => {
    if (!enabled) {
      return;
    }

    if (playSample(cue)) {
      return;
    }

    switch (cue) {
      case "ui-accept":
        playTone("triangle", 360, 520, 0.08, 0.22);
        break;
      case "shot-fired":
        playTone("sawtooth", 520, 180, 0.05, 0.11);
        playTone("square", 150, 88, 0.045, 0.035);
        break;
      case "dash":
        playTone("triangle", 150, 320, 0.12, 0.15);
        playTone("sine", 90, 52, 0.09, 0.06);
        break;
      case "combo-surge":
        playTone("triangle", 360, 720, 0.16, 0.14);
        window.setTimeout(() => {
          playTone("sine", 720, 960, 0.1, 0.08);
        }, 70);
        break;
      case "artillery-lock-start":
        playTone("triangle", 280, 520, 0.12, 0.12);
        window.setTimeout(() => {
          playTone("sine", 520, 420, 0.1, 0.08);
        }, 65);
        break;
      case "artillery-impact":
        playTone("sawtooth", 180, 72, 0.2, 0.18);
        window.setTimeout(() => {
          playTone("triangle", 420, 180, 0.12, 0.08);
        }, 45);
        break;
      case "relay-boost-start":
        playTone("triangle", 320, 760, 0.16, 0.12);
        window.setTimeout(() => {
          playTone("sine", 760, 260, 0.12, 0.08);
        }, 55);
        break;
      case "elite-spawned":
        playTone("sawtooth", 240, 420, 0.16, 0.12);
        window.setTimeout(() => {
          playTone("triangle", 420, 620, 0.12, 0.08);
        }, 60);
        break;
      case "elite-killed":
        playTone("triangle", 320, 520, 0.14, 0.12);
        break;
      case "elite-burst":
        playTone("sawtooth", 260, 110, 0.18, 0.18);
        window.setTimeout(() => {
          playTone("triangle", 110, 360, 0.1, 0.08);
        }, 70);
        break;
      case "arena-purge-start":
        playTone("sawtooth", 210, 92, 0.14, 0.14);
        window.setTimeout(() => {
          playTone("triangle", 640, 240, 0.12, 0.08);
        }, 80);
        break;
      case "enemy-fired":
        playTone("square", 260, 180, 0.08, 0.1);
        playTone("triangle", 640, 220, 0.06, 0.05);
        break;
      case "legendary-ready":
        playTone("triangle", 280, 760, 0.18, 0.15);
        window.setTimeout(() => {
          playTone("sine", 760, 1120, 0.18, 0.11);
        }, 90);
        break;
      case "enemy-spawned":
        playTone("triangle", 260, 340, 0.08, 0.08);
        break;
      case "enemy-hit":
        playTone("square", 210, 120, 0.05, 0.08);
        break;
      case "enemy-killed":
        playTone("square", 240, 90, 0.11, 0.13);
        break;
      case "boss-spawned":
        playTone("sawtooth", 84, 42, 0.38, 0.24);
        window.setTimeout(() => {
          playTone("triangle", 148, 102, 0.24, 0.15);
        }, 70);
        window.setTimeout(() => {
          playTone("sine", 220, 140, 0.28, 0.08);
        }, 120);
        break;
      case "boss-collapse-start":
        playTone("sawtooth", 72, 34, 0.42, 0.26);
        window.setTimeout(() => {
          playTone("triangle", 180, 1120, 0.28, 0.18);
        }, 90);
        window.setTimeout(() => {
          playTone("sine", 1120, 180, 0.32, 0.12);
        }, 180);
        break;
      case "boss-core-exposed":
        playTone("triangle", 280, 980, 0.24, 0.18);
        window.setTimeout(() => {
          playTone("sine", 980, 760, 0.18, 0.12);
        }, 70);
        window.setTimeout(() => {
          playTone("triangle", 760, 1180, 0.14, 0.08);
        }, 130);
        break;
      case "boss-phase-pulse-start":
        playTone("sawtooth", 110, 54, 0.28, 0.26);
        window.setTimeout(() => {
          playTone("triangle", 240, 880, 0.22, 0.14);
        }, 90);
        break;
      case "boss-phase-shift":
        playTone("sawtooth", 160, 64, 0.32, 0.22);
        window.setTimeout(() => {
          playTone("triangle", 220, 520, 0.22, 0.12);
        }, 90);
        window.setTimeout(() => {
          playTone("sine", 620, 320, 0.22, 0.1);
        }, 160);
        break;
      case "boss-defeated":
        playTone("triangle", 220, 680, 0.28, 0.18);
        window.setTimeout(() => {
          playTone("sine", 680, 980, 0.24, 0.12);
        }, 120);
        break;
      case "orb-collected":
        playTone("sine", 640, 880, 0.09, 0.14);
        break;
      case "player-hit":
        playTone("sawtooth", 150, 80, 0.12, 0.18);
        break;
      case "player-died":
        playTone("sawtooth", 180, 36, 0.45, 0.24);
        break;
      case "record-best":
        playTone("triangle", 420, 760, 0.16, 0.16);
        window.setTimeout(() => {
          playTone("sine", 760, 1080, 0.14, 0.1);
        }, 80);
        break;
      case "upgrade-ready":
        playTone("triangle", 360, 720, 0.18, 0.18);
        break;
      case "victory":
        playTone("sine", 440, 660, 0.28, 0.18);
        window.setTimeout(() => {
          playTone("triangle", 660, 960, 0.2, 0.14);
        }, 110);
        break;
    }
  };

  const playTone = (
    oscillatorType: OscillatorType,
    fromFrequency: number,
    toFrequency: number,
    durationSeconds: number,
    gainAmount: number
  ): void => {
    const now = context.currentTime + 0.002;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(fromFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(0.001, toFrequency),
      now + durationSeconds
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainAmount, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.connect(gain);
    gain.connect(synthMaster);

    oscillator.start(now);
    oscillator.stop(now + durationSeconds + 0.02);
  };

  const loadAudioBuffer = (path: string): Promise<AudioBuffer | null> => {
    const decodedBuffer = decodedBuffers.get(path);
    if (decodedBuffer) {
      return Promise.resolve(decodedBuffer);
    }

    if (failedBufferPaths.has(path)) {
      return Promise.resolve(null);
    }

    const pendingLoad = pendingBufferLoads.get(path);
    if (pendingLoad) {
      return pendingLoad;
    }

    const load = fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Audio asset failed to load: ${path}`);
        }

        return response.arrayBuffer();
      })
      .then((audioData) => context.decodeAudioData(audioData))
      .then((buffer) => {
        decodedBuffers.set(path, buffer);
        pendingBufferLoads.delete(path);
        return buffer;
      })
      .catch(() => {
        pendingBufferLoads.delete(path);
        failedBufferPaths.add(path);
        return null;
      });

    pendingBufferLoads.set(path, load);
    return load;
  };

  const preloadAudioAssets = (): void => {
    for (const sample of Object.values(CUE_SAMPLES)) {
      void loadAudioBuffer(sample.path);
    }

    for (const sample of LOOP_SAMPLES) {
      void loadAudioBuffer(sample.path);
    }
  };

  const playSample = (cue: AudioCue): boolean => {
    const sample = CUE_SAMPLES[cue];
    const nowMs = window.performance.now();
    const minIntervalMs = sample.minIntervalMs ?? 0;
    const lastPlayedAt = lastCueTimes.get(cue) ?? -Number.POSITIVE_INFINITY;

    if (nowMs - lastPlayedAt < minIntervalMs) {
      return true;
    }

    const buffer = decodedBuffers.get(sample.path);
    if (!buffer) {
      void loadAudioBuffer(sample.path);
      return false;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const playbackRate =
      (sample.playbackRate ?? 1) +
      (sample.rateVariance ?? 0) * (Math.random() * 2 - 1);

    source.buffer = buffer;
    source.playbackRate.value = Math.max(0.25, playbackRate);
    gain.gain.value = sample.gain;

    source.connect(gain);
    gain.connect(sfxMaster);
    source.start();
    lastCueTimes.set(cue, nowMs);

    return true;
  };

  const startLoop = (sample: LoopSample): void => {
    if (activeLoopPaths.has(sample.path)) {
      return;
    }

    const buffer = decodedBuffers.get(sample.path);
    if (!buffer) {
      void loadAudioBuffer(sample.path).then(() => {
        if (enabled) {
          startLoop(sample);
        }
      });
      return;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = sample.gain;

    source.connect(gain);
    gain.connect(musicMaster);
    source.start();
    activeLoopPaths.add(sample.path);
    source.onended = () => {
      activeLoopPaths.delete(sample.path);
    };
  };

  const startMusicLoops = (): void => {
    for (const sample of LOOP_SAMPLES) {
      startLoop(sample);
    }
  };

  const playRoboticVerdict = (): void => {
    const nowMs = window.performance.now();
    if (nowMs - lastVerdictAt < 380) {
      return;
    }

    lastVerdictAt = nowMs;
    playTone("square", 92, 92, 0.12, 0.05);
    window.setTimeout(() => playTone("sawtooth", 132, 84, 0.16, 0.04), 95);

    if (
      typeof window.speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }
    if (window.speechSynthesis.speaking) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance("inauthentic content");
    utterance.lang = "en-US";
    utterance.pitch = 0.25;
    utterance.rate = 0.78;
    utterance.volume = 0.48;

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((candidate) => /david|mark|google us english/i.test(candidate.name)) ??
      voices.find((candidate) => candidate.lang.toLowerCase().startsWith("en"));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  preloadAudioAssets();

  return {
    dispatch: (events) => {
      if (events.length === 0 || !enabled) {
        return;
      }

      const mapped = collapseEventCues(events);
      const hasEnemyKill = events.some((event) => event.type === "enemy-killed");
      let playedCount = 0;

      for (const cue of mapped) {
        triggerCue(cue);
        playedCount += 1;

        if (playedCount >= 3) {
          break;
        }
      }

      if (hasEnemyKill) {
        playRoboticVerdict();
      }
    },
    playCue: (cue) => {
      triggerCue(cue);
    },
    prime: () => {
      enabled = true;
      if (context.state === "suspended") {
        void context.resume().then(startMusicLoops);
        return;
      }

      startMusicLoops();
    }
  };
}

function collapseEventCues(events: FrameEvent[]): AudioCue[] {
  const eventTypes = new Set(events.map((event) => event.type));

  if (eventTypes.has("player-died")) {
    return ["player-died"];
  }

  const order: FrameEventType[] = [
    "victory",
    "combo-surge",
    "boss-collapse-start",
    "boss-defeated",
    "boss-core-exposed",
    "boss-phase-pulse-start",
    "boss-phase-shift",
    "boss-spawned",
    "card-purge-cast",
    "card-overcore-cast",
    "card-repair-cast",
    "comet-bloom-impact",
    "comet-bloom-fired",
    "nova-dash",
    "starburst-rounds",
    "artillery-impact",
    "artillery-lock-start",
    "relay-boost-start",
    "elite-burst",
    "elite-spawned",
    "elite-killed",
    "arena-purge-start",
    "upgrade-ready",
    "player-hit",
    "enemy-fired",
    "satellite-lattice-fired",
    "halo-drone-fired",
    "projectile-ricochet",
    "rail-pierce",
    "arc-chain",
    "gravity-well",
    "afterimage-trail",
    "dash",
    "arena-boundary-hit",
    "enemy-spawned",
    "rescue-spawned",
    "rescue-streak",
    "rescue-saved",
    "orb-collected",
    "rescue-lost",
    "enemy-killed",
    "enemy-hit",
    "shot-fired"
  ];

  return order
    .filter((eventType) => eventTypes.has(eventType))
    .map((eventType) => mapEventToCue(eventType));
}

function mapEventToCue(eventType: FrameEventType): AudioCue {
  switch (eventType) {
    case "shot-fired":
      return "shot-fired";
    case "dash":
      return "dash";
    case "arena-boundary-hit":
      return "enemy-hit";
    case "combo-surge":
      return "combo-surge";
    case "artillery-lock-start":
      return "artillery-lock-start";
    case "artillery-impact":
      return "artillery-impact";
    case "relay-boost-start":
      return "relay-boost-start";
    case "elite-spawned":
      return "elite-spawned";
    case "elite-killed":
      return "elite-killed";
    case "elite-burst":
      return "elite-burst";
    case "arena-purge-start":
      return "arena-purge-start";
    case "enemy-fired":
      return "enemy-fired";
    case "arc-chain":
      return "enemy-hit";
    case "afterimage-trail":
      return "dash";
    case "comet-bloom-fired":
      return "enemy-fired";
    case "comet-bloom-impact":
      return "artillery-impact";
    case "gravity-well":
      return "relay-boost-start";
    case "halo-drone-fired":
      return "shot-fired";
    case "nova-dash":
      return "dash";
    case "projectile-ricochet":
      return "enemy-hit";
    case "rail-pierce":
      return "enemy-hit";
    case "satellite-lattice-fired":
      return "enemy-fired";
    case "starburst-rounds":
      return "enemy-hit";
    case "enemy-spawned":
      return "enemy-spawned";
    case "enemy-hit":
      return "enemy-hit";
    case "enemy-killed":
      return "enemy-killed";
    case "boss-spawned":
      return "boss-spawned";
    case "boss-collapse-start":
      return "boss-collapse-start";
    case "boss-core-exposed":
      return "boss-core-exposed";
    case "boss-phase-pulse-start":
      return "boss-phase-pulse-start";
    case "boss-phase-shift":
      return "boss-phase-shift";
    case "boss-defeated":
      return "boss-defeated";
    case "card-purge-cast":
      return "artillery-impact";
    case "card-overcore-cast":
      return "upgrade-ready";
    case "card-repair-cast":
      return "orb-collected";
    case "orb-collected":
      return "orb-collected";
    case "rescue-saved":
      return "orb-collected";
    case "rescue-spawned":
      return "orb-collected";
    case "rescue-streak":
      return "combo-surge";
    case "rescue-lost":
      return "player-hit";
    case "player-hit":
      return "player-hit";
    case "player-died":
      return "player-died";
    case "upgrade-ready":
      return "upgrade-ready";
    case "victory":
      return "victory";
    default:
      return "ui-accept";
  }
}
