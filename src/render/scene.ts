import * as THREE from "three";
import { GAME_CONFIG } from "../core/config";
import {
  CHANNEL_AVATAR_ATLAS_COLUMNS,
  CHANNEL_AVATAR_ATLAS_ROWS,
  getChannelAvatarIndex
} from "../gameplay/channelLore";
import type { FrameEvent } from "../gameplay/events";
import { createCamera, updateFollowCamera } from "./camera";
import { createArenaMaterial, createNeonMaterial } from "./materials";

type Vec2Like = { x: number; y: number };
type EnemyLike = {
  archetype: "drone" | "charger" | "sentry" | "artillery" | "relay" | "overseer";
  damageFlash: number;
  facing: Vec2Like;
  healthRatio: number;
  id: number;
  isElite: boolean;
  lockTarget: Vec2Like;
  mode: "aim" | "chase" | "dash" | "exposed" | "fire" | "recover" | "windup";
  mutation: "bulwark" | "overclocked" | "volatile" | null;
  phase: number;
  position: Vec2Like;
  radius: number;
  spawnRatio: number;
  supportPulseRatio: number;
  supported: boolean;
};
type PickupLike = {
  boosted?: boolean;
  kind: "orb" | "rescue";
  position: Vec2Like;
  progress?: number;
};
type ProjectileLike = {
  kind: "comet" | "drone" | "player" | "satellite" | "starburst";
  position: Vec2Like;
  scale: number;
};
type ArenaPurgeLike = {
  laneIndex: number;
  phase: "warning" | "active";
  progress: number;
};
type ArtilleryStrikeLike = {
  phase: "warning" | "active";
  position: Vec2Like;
  progress: number;
  radius: number;
};
type BossPulseLike = {
  origin: Vec2Like;
  phase: "warning" | "active";
  progress: number;
  radius: number;
};
type SpawnWarningLike = {
  archetype: EnemyLike["archetype"];
  isElite: boolean;
  mutation: EnemyLike["mutation"];
  position: Vec2Like;
  progress: number;
};
type PlayerVisuals = {
  buildPrimary: "balanced" | "dash-killer" | "glass-cannon" | "spread-control";
  damageFlash: number;
  dashReady: number;
  haloDroneCount: number;
  healthRatio: number;
  invulnerability: number;
  isDashing: boolean;
  legendaryCount: number;
  masteryTier: 0 | 1 | 2;
  satelliteLatticeCount: number;
  shotPulse: number;
  signature:
    | "comet-bloom"
    | "eclipse-protocol"
    | "overseer-lens"
    | "satellite-lattice"
    | "signal-choir"
    | "zero-point-capacitor"
    | null;
};

const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const GROUND_PLANE = new THREE.Plane(UP_VECTOR, 0);
const PLAYER_HEALTH_BAR_WIDTH = 1.38;
const PLAYER_HEALTH_BAR_HEIGHT = 0.12;

function getRenderPixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, GAME_CONFIG.maxPixelRatio);
}

export interface GameScene {
  camera: THREE.PerspectiveCamera;
  emitEffects: (events: FrameEvent[]) => void;
  render: (deltaSeconds?: number) => void;
  resize: () => void;
  dispose: () => void;
  setArenaChapter: (chapter: number) => void;
  setArenaDangerLevel: (dangerLevel: number) => void;
  setArtilleryStrikes: (strikes: ArtilleryStrikeLike[]) => void;
  setBossPulses: (pulses: BossPulseLike[]) => void;
  setArenaPurgeLanes: (purges: ArenaPurgeLike[]) => void;
  setAimPoint: (aimPoint: Vec2Like | null) => void;
  setEnemies: (enemies: EnemyLike[]) => void;
  setPickups: (pickups: PickupLike[]) => void;
  setPlayerPose: (position: Vec2Like, facing: Vec2Like) => void;
  setPlayerVisuals: (visuals: PlayerVisuals) => void;
  setProjectiles: (projectiles: ProjectileLike[]) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSpawnWarnings: (warnings: SpawnWarningLike[]) => void;
  screenToGround: (clientX: number, clientY: number) => Vec2Like | null;
}

interface EnemyView {
  accentMaterial: THREE.MeshStandardMaterial;
  attackBeacon: THREE.Mesh;
  attackBeaconMaterial: THREE.MeshBasicMaterial;
  archetype: EnemyLike["archetype"];
  avatarDisc: THREE.Mesh;
  avatarMaterial: THREE.MeshBasicMaterial;
  bodyMaterial: THREE.MeshStandardMaterial;
  eliteHalo: THREE.Mesh;
  eliteHaloMaterial: THREE.MeshBasicMaterial;
  eliteSpikeMaterial: THREE.MeshBasicMaterial;
  eliteSpikes: THREE.Mesh[];
  ringMaterial: THREE.MeshStandardMaterial;
  root: THREE.Group;
  supportAura: THREE.Mesh;
  supportAuraMaterial: THREE.MeshBasicMaterial;
  telegraph: TelegraphView;
}

interface TelegraphView {
  chevronMaterial: THREE.MeshBasicMaterial;
  chevrons: THREE.Mesh[];
  core: THREE.Mesh;
  coreMaterial: THREE.MeshBasicMaterial;
  glow: THREE.Mesh;
  glowMaterial: THREE.MeshBasicMaterial;
  impact: THREE.Mesh;
  impactMaterial: THREE.MeshBasicMaterial;
  leftRail: THREE.Mesh;
  railMaterial: THREE.MeshBasicMaterial;
  rightRail: THREE.Mesh;
  root: THREE.Group;
}

interface EffectParticle {
  active: boolean;
  life: number;
  maxLife: number;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
}

interface PlayerDebris {
  active: boolean;
  angularVelocity: THREE.Vector3;
  life: number;
  material: THREE.MeshStandardMaterial;
  maxLife: number;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
}

interface EnemyDeathShard {
  active: boolean;
  angularVelocity: THREE.Vector3;
  life: number;
  material: THREE.MeshStandardMaterial;
  maxLife: number;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
}

interface SpawnWarningView {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
}

interface DashEchoView {
  bodyMaterial: THREE.MeshStandardMaterial;
  life: number;
  maxLife: number;
  noseMaterial: THREE.MeshStandardMaterial;
  root: THREE.Group;
  active: boolean;
}

interface RangedTraceView {
  active: boolean;
  baseWidth: number;
  beam: THREE.Mesh;
  beamMaterial: THREE.MeshBasicMaterial;
  core: THREE.Mesh;
  coreMaterial: THREE.MeshBasicMaterial;
  life: number;
  maxLife: number;
  root: THREE.Group;
  span: number;
}

interface BossPulseView {
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
}

interface ArtilleryStrikeView {
  fill: THREE.Mesh;
  fillMaterial: THREE.MeshBasicMaterial;
  ring: THREE.Mesh;
  ringMaterial: THREE.MeshBasicMaterial;
}

interface GroundDecal {
  active: boolean;
  angle: number;
  baseOpacity: number;
  baseScale: number;
  growth: number;
  life: number;
  material: THREE.MeshBasicMaterial;
  maxLife: number;
  mesh: THREE.Mesh;
  spin: number;
}

interface ArenaBreachCrack {
  angle: number;
  length: number;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
  offset: number;
  pulseOffset: number;
  width: number;
}

export function createGameScene(container: HTMLDivElement): GameScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#050811");
  scene.fog = new THREE.Fog("#050811", 18, 42);
  const sceneBackground = scene.background as THREE.Color;
  const sceneFog = scene.fog as THREE.Fog;
  const chapterColdBackground = new THREE.Color("#050811");
  const chapterHotBackground = new THREE.Color("#16040c");
  const chapterColdFog = new THREE.Color("#050811");
  const chapterHotFog = new THREE.Color("#220815");
  const chapterColdArena = new THREE.Color("#0b1022");
  const chapterHotArena = new THREE.Color("#1a0a13");
  const chapterColdArenaGlow = new THREE.Color("#071625");
  const chapterHotArenaGlow = new THREE.Color("#2b0914");
  const chapterColdRing = new THREE.Color("#31f5ff");
  const chapterHotRing = new THREE.Color("#ff648f");
  const chapterColdWarning = new THREE.Color("#ff5b7f");
  const chapterHotWarning = new THREE.Color("#ffb347");
  const chapterColdKey = new THREE.Color("#9ce6ff");
  const chapterHotKey = new THREE.Color("#ff8f9c");
  const chapterColdMagenta = new THREE.Color("#ff4fd8");
  const chapterHotMagenta = new THREE.Color("#ff7d64");
  const chapterColdCyan = new THREE.Color("#31f5ff");
  const chapterHotCyan = new THREE.Color("#ffb347");
  const channelAvatarAtlas = new THREE.TextureLoader().load(
    "/avatars/channel-avatars.jpg"
  );
  channelAvatarAtlas.colorSpace = THREE.SRGBColorSpace;
  channelAvatarAtlas.wrapS = THREE.ClampToEdgeWrapping;
  channelAvatarAtlas.wrapT = THREE.ClampToEdgeWrapping;
  channelAvatarAtlas.anisotropy = 4;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.setSize(
    container.clientWidth || window.innerWidth,
    container.clientHeight || window.innerHeight
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const camera = createCamera(
    (container.clientWidth || window.innerWidth) /
      (container.clientHeight || window.innerHeight)
  );
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const intersectionTarget = new THREE.Vector3();
  const followTarget = new THREE.Vector3();

  scene.add(new THREE.AmbientLight("#89bbff", 0.75));

  const keyLight = new THREE.DirectionalLight("#9ce6ff", 1.9);
  keyLight.position.set(8, 16, 8);
  scene.add(keyLight);

  const magentaAccent = new THREE.PointLight("#ff4fd8", 22, 30, 2);
  magentaAccent.position.set(-6, 4, 6);
  scene.add(magentaAccent);

  const cyanAccent = new THREE.PointLight("#31f5ff", 18, 30, 2);
  cyanAccent.position.set(6, 5, -4);
  scene.add(cyanAccent);

  const arenaMaterial = createArenaMaterial();
  const arena = new THREE.Mesh(
    new THREE.CircleGeometry(GAME_CONFIG.arenaRadius, 64),
    arenaMaterial
  );
  arena.rotation.x = -Math.PI / 2;
  scene.add(arena);

  const grid = new THREE.GridHelper(
    GAME_CONFIG.arenaRadius * 2,
    20,
    "#31f5ff",
    "#13324b"
  );
  grid.position.y = 0.02;
  const gridMaterial = grid.material as THREE.Material | THREE.Material[];
  if (Array.isArray(gridMaterial)) {
    for (const material of gridMaterial) {
      material.transparent = true;
      material.opacity = 0.36;
    }
  } else {
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.36;
  }
  scene.add(grid);

  const ringMaterial = createNeonMaterial("#31f5ff", 1.4);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(GAME_CONFIG.arenaRadius - 0.25, 0.12, 10, 72),
    ringMaterial
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  scene.add(ring);

  const warningRingMaterial = createNeonMaterial("#ff5b7f", 1.2);
  const warningRing = new THREE.Mesh(
    new THREE.TorusGeometry(GAME_CONFIG.arenaDangerRadius, 0.08, 10, 72),
    warningRingMaterial
  );
  warningRing.rotation.x = Math.PI / 2;
  warningRing.position.y = 0.05;
  scene.add(warningRing);

  const playerRoot = new THREE.Group();
  const playerBodyMaterial = createNeonMaterial("#31f5ff", 1.6);
  const playerTrimMaterial = createNeonMaterial("#96ff47", 1.7);
  const playerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.72, 0.34, 6),
    playerBodyMaterial
  );
  playerBody.position.y = 0.2;
  playerRoot.add(playerBody);

  const playerNoseMaterial = createNeonMaterial("#ffffff", 2.3);
  const playerCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22, 0),
    playerNoseMaterial
  );
  playerCore.position.y = 0.32;
  playerRoot.add(playerCore);

  const playerNose = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.52, 6),
    playerNoseMaterial
  );
  playerNose.rotation.x = Math.PI / 2;
  playerNose.position.set(0, 0.22, 0.66);
  playerRoot.add(playerNose);

  const playerWing = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 0.3),
    playerTrimMaterial
  );
  playerWing.position.set(0, 0.22, -0.02);
  playerRoot.add(playerWing);

  const playerThrusterLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.42),
    playerTrimMaterial
  );
  playerThrusterLeft.position.set(-0.32, 0.16, -0.48);
  playerRoot.add(playerThrusterLeft);

  const playerThrusterRight = playerThrusterLeft.clone();
  playerThrusterRight.position.x = 0.32;
  playerRoot.add(playerThrusterRight);

  const playerHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.05, 8, 32),
    playerTrimMaterial
  );
  playerHalo.rotation.x = Math.PI / 2;
  playerHalo.position.y = 0.08;
  playerRoot.add(playerHalo);

  const playerLegendaryMaterial = createNeonMaterial("#ffb84a", 2);
  playerLegendaryMaterial.transparent = true;
  playerLegendaryMaterial.opacity = 0;
  const playerLegendaryHalo = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.035, 8, 40),
    playerLegendaryMaterial
  );
  playerLegendaryHalo.rotation.x = Math.PI / 2;
  playerLegendaryHalo.position.y = 0.14;
  playerRoot.add(playerLegendaryHalo);

  const haloDroneMeshes = Array.from({ length: 2 }, () => {
    const material = createNeonMaterial("#72ffd5", 2.1);
    material.transparent = true;
    material.opacity = 0;
    const drone = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), material);
    drone.visible = false;
    playerRoot.add(drone);
    return drone;
  });

  const satelliteMeshes = Array.from({ length: 2 }, () => {
    const material = createNeonMaterial("#ffb84a", 2.2);
    material.transparent = true;
    material.opacity = 0;
    const satellite = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.14, 0.22),
      material
    );
    satellite.visible = false;
    playerRoot.add(satellite);
    return satellite;
  });
  scene.add(playerRoot);

  const playerHealthBarRoot = new THREE.Group();
  const playerHealthBackMaterial = new THREE.MeshBasicMaterial({
    color: "#030712",
    depthTest: false,
    depthWrite: false,
    opacity: 0.62,
    transparent: true
  });
  const playerHealthFillMaterial = new THREE.MeshBasicMaterial({
    color: "#96ff47",
    depthTest: false,
    depthWrite: false,
    opacity: 0.92,
    transparent: true
  });
  const playerHealthBack = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    playerHealthBackMaterial
  );
  const playerHealthFill = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    playerHealthFillMaterial
  );
  playerHealthBack.renderOrder = 60;
  playerHealthFill.renderOrder = 61;
  playerHealthBack.scale.set(
    PLAYER_HEALTH_BAR_WIDTH + 0.14,
    PLAYER_HEALTH_BAR_HEIGHT + 0.09,
    1
  );
  playerHealthFill.scale.set(
    PLAYER_HEALTH_BAR_WIDTH,
    PLAYER_HEALTH_BAR_HEIGHT,
    1
  );
  playerHealthFill.position.z = 0.01;
  playerHealthBarRoot.add(playerHealthBack, playerHealthFill);
  scene.add(playerHealthBarRoot);

  const reticleMaterial = new THREE.MeshBasicMaterial({
    color: "#ff4fd8",
    transparent: true,
    opacity: 0.92
  });
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.24, 0.34, 24),
    reticleMaterial
  );
  reticle.rotation.x = -Math.PI / 2;
  reticle.position.y = 0.03;
  scene.add(reticle);

  const enemyRoot = new THREE.Group();
  scene.add(enemyRoot);

  const killGridRoot = new THREE.Group();
  scene.add(killGridRoot);

  const pickupRoot = new THREE.Group();
  scene.add(pickupRoot);

  const projectileRoot = new THREE.Group();
  scene.add(projectileRoot);

  const rangedTraceRoot = new THREE.Group();
  scene.add(rangedTraceRoot);

  const bossPulseRoot = new THREE.Group();
  scene.add(bossPulseRoot);

  const artilleryStrikeRoot = new THREE.Group();
  scene.add(artilleryStrikeRoot);

  const spawnWarningRoot = new THREE.Group();
  scene.add(spawnWarningRoot);

  const decalRoot = new THREE.Group();
  scene.add(decalRoot);

  const arenaBreachRoot = new THREE.Group();
  scene.add(arenaBreachRoot);

  const dashEchoRoot = new THREE.Group();
  scene.add(dashEchoRoot);

  const enemyDeathShardRoot = new THREE.Group();
  scene.add(enemyDeathShardRoot);

  const playerDebrisRoot = new THREE.Group();
  scene.add(playerDebrisRoot);

  const particleRoot = new THREE.Group();
  scene.add(particleRoot);

  const killGridMaterials: THREE.MeshBasicMaterial[] = [];
  const purgeLaneMaterials: THREE.MeshBasicMaterial[] = [];
  const purgeLaneStates: Array<ArenaPurgeLike | undefined> = [
    undefined,
    undefined,
    undefined,
    undefined
  ];
  let artilleryStrikeStates: ArtilleryStrikeLike[] = [];
  let bossPulseStates: BossPulseLike[] = [];
  const arenaBreachCoreMaterial = new THREE.MeshBasicMaterial({
    color: "#04070f",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const arenaBreachCore = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 40),
    arenaBreachCoreMaterial
  );
  arenaBreachCore.rotation.x = -Math.PI / 2;
  arenaBreachCore.position.y = 0.041;
  arenaBreachCore.visible = false;
  arenaBreachRoot.add(arenaBreachCore);

  const arenaBreachRingMaterial = new THREE.MeshBasicMaterial({
    color: "#ffb84a",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const arenaBreachRing = new THREE.Mesh(
    new THREE.RingGeometry(1.18, 1.64, 40),
    arenaBreachRingMaterial
  );
  arenaBreachRing.rotation.x = -Math.PI / 2;
  arenaBreachRing.position.y = 0.045;
  arenaBreachRing.visible = false;
  arenaBreachRoot.add(arenaBreachRing);

  const arenaBreachCracks = Array.from({ length: 7 }, (_, index) =>
    createArenaBreachCrack(arenaBreachRoot, index)
  );
  for (let index = 0; index < 4; index += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: "#ff648f",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.04, GAME_CONFIG.arenaRadius * 1.86),
      material
    );
    lane.position.y = 0.035;
    lane.rotation.y = (Math.PI / 4) * index;
    killGridRoot.add(lane);
    killGridMaterials.push(material);
  }

  const purgeLaneRoot = new THREE.Group();
  scene.add(purgeLaneRoot);
  for (let index = 0; index < 4; index += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: "#ffb347",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const lane = new THREE.Mesh(
      new THREE.BoxGeometry(GAME_CONFIG.arenaPurgeLaneWidth, 0.05, GAME_CONFIG.arenaRadius * 1.9),
      material
    );
    lane.position.y = 0.05;
    lane.rotation.y = (Math.PI / 4) * index;
    purgeLaneRoot.add(lane);
    purgeLaneMaterials.push(material);
  }

  const enemyViews = new Map<number, EnemyView>();
  const activeEnemyIds = new Set<number>();
  const enemyViewPool: Record<EnemyLike["archetype"], EnemyView[]> = {
    artillery: [],
    charger: [],
    drone: [],
    overseer: [],
    relay: [],
    sentry: []
  };
  let pickupMeshes: THREE.Mesh[] = [];
  let projectileMeshes: THREE.Mesh[] = [];
  let artilleryStrikeViews: ArtilleryStrikeView[] = [];
  let bossPulseViews: BossPulseView[] = [];
  let spawnWarningViews: SpawnWarningView[] = [];
  const rangedTracePool = Array.from({ length: 16 }, () =>
    createRangedTraceView(rangedTraceRoot)
  );
  const dashEchoPool = Array.from({ length: 10 }, () =>
    createDashEchoView(dashEchoRoot)
  );
  const decalPool = Array.from({ length: 20 }, () => createGroundDecal(decalRoot));
  const particlePool = Array.from({ length: 72 }, () =>
    createEffectParticle(particleRoot)
  );
  const enemyDeathShardPool = createEnemyDeathShardPool(enemyDeathShardRoot);
  const playerDebrisPool = createPlayerDebrisPool(playerDebrisRoot);
  let arenaDangerLevel = 0;
  let arenaChapter = 1;
  let arenaChapterBlend = 0;
  let arenaBreachPulse = 0;
  let cameraShake = 0;
  let chapterPulse = 0;
  let reducedMotion = false;
  let dashEchoCooldown = 0;
  let playerDestructionTime = 0;
  let playerHeading = 0;
  const playerPosition = new THREE.Vector3();
  let playerVisuals: PlayerVisuals = {
    buildPrimary: "balanced",
    damageFlash: 0,
    dashReady: 1,
    haloDroneCount: 0,
    healthRatio: 1,
    invulnerability: 0,
    isDashing: false,
    legendaryCount: 0,
    masteryTier: 0,
    satelliteLatticeCount: 0,
    shotPulse: 0,
    signature: null
  };
  let collapsePulse = 0;
  let ritualPulse = 0;
  let sceneTime = 0;

  const acquireEnemyView = (archetype: EnemyLike["archetype"]): EnemyView => {
    const pooledView = enemyViewPool[archetype].pop();
    if (pooledView) {
      return pooledView;
    }

    const nextView = createEnemyView(archetype, channelAvatarAtlas);
    enemyRoot.add(nextView.root);
    return nextView;
  };

  const releaseEnemyView = (id: number, view: EnemyView): void => {
    enemyViews.delete(id);
    view.root.visible = false;
    enemyViewPool[view.archetype].push(view);
  };

  const ensureEnemyView = (
    id: number,
    archetype: EnemyLike["archetype"]
  ): EnemyView => {
    const currentView = enemyViews.get(id);

    if (currentView && currentView.archetype === archetype) {
      return currentView;
    }

    if (currentView) {
      releaseEnemyView(id, currentView);
    }

    const nextView = acquireEnemyView(archetype);
    enemyViews.set(id, nextView);
    return nextView;
  };

  const ensurePickupMeshes = (count: number): void => {
    while (pickupMeshes.length < count) {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.18, 0),
        createNeonMaterial("#31f5ff", 2.2)
      );
      mesh.visible = false;
      pickupRoot.add(mesh);
      pickupMeshes.push(mesh);
    }
  };

  const ensureProjectileMeshes = (count: number): void => {
    while (projectileMeshes.length < count) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        createNeonMaterial("#96ff47", 2.1)
      );
      mesh.visible = false;
      projectileRoot.add(mesh);
      projectileMeshes.push(mesh);
    }
  };

  const ensureBossPulseViews = (count: number): void => {
    while (bossPulseViews.length < count) {
      const material = new THREE.MeshBasicMaterial({
        color: "#ffb84a",
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.1, 48), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      bossPulseRoot.add(mesh);
      bossPulseViews.push({ material, mesh });
    }
  };

  const ensureArtilleryStrikeViews = (count: number): void => {
    while (artilleryStrikeViews.length < count) {
      artilleryStrikeViews.push(createArtilleryStrikeView(artilleryStrikeRoot));
    }
  };

  const ensureSpawnWarningViews = (count: number): void => {
    while (spawnWarningViews.length < count) {
      const material = new THREE.MeshBasicMaterial({
        color: "#ff4fd8",
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.6, 1.02, 28),
        material
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      spawnWarningRoot.add(mesh);
      spawnWarningViews.push({ mesh, material });
    }
  };

  const emitParticleBurst = (
    position: Vec2Like,
    color: string,
    count: number,
    speed: number,
    lifetime: number,
    scaleRange: [number, number]
  ): void => {
    let emitted = 0;

    for (const particle of particlePool) {
      if (particle.active) {
        continue;
      }

      const meshMaterial = particle.mesh.material as THREE.MeshStandardMaterial;
      particle.active = true;
      particle.life = lifetime * (0.7 + Math.random() * 0.4);
      particle.maxLife = particle.life;
      particle.mesh.visible = true;
      particle.mesh.position.set(position.x, 0.24 + Math.random() * 0.26, position.y);

      const burstAngle = Math.random() * Math.PI * 2;
      const burstSpeed = speed * (0.5 + Math.random() * 0.7);
      particle.velocity.set(
        Math.cos(burstAngle) * burstSpeed,
        0.25 + Math.random() * burstSpeed * 0.09,
        Math.sin(burstAngle) * burstSpeed
      );

      const scale =
        scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      particle.mesh.scale.setScalar(scale);
      meshMaterial.color.set(color);
      meshMaterial.emissive.set(color);
      meshMaterial.emissiveIntensity = 2.2;
      meshMaterial.opacity = 1;
      emitted += 1;

      if (emitted >= count) {
        break;
      }
    }
  };

  const spawnEnemyDeathBreakup = (
    event: FrameEvent,
    fallbackArchetype: EnemyLike["archetype"] = "drone"
  ): void => {
    const archetype = event.enemyArchetype ?? fallbackArchetype;
    const profile = getEnemyDeathProfile(archetype, event.isElite ?? false);
    const count = reducedMotion
      ? Math.max(5, Math.floor(profile.count * 0.55))
      : profile.count;
    let emitted = 0;

    for (const shard of enemyDeathShardPool) {
      if (shard.active) {
        continue;
      }

      const angle =
        Math.random() * Math.PI * 2 +
        (archetype === "charger" ? Math.PI * 0.15 * emitted : 0);
      const tangent = angle + Math.PI * 0.5;
      const speed = profile.speed * (0.62 + Math.random() * 0.72);
      const lift = profile.lift * (0.55 + Math.random() * 0.9);
      const sideSkew =
        archetype === "sentry" || archetype === "artillery"
          ? (Math.random() - 0.5) * profile.speed * 0.7
          : 0;
      const color = profile.colors[emitted % profile.colors.length];
      const scale = profile.scale * (0.72 + Math.random() * 0.58);

      shard.active = true;
      shard.life = profile.life * (0.72 + Math.random() * 0.5);
      shard.maxLife = shard.life;
      shard.mesh.visible = true;
      shard.mesh.position.set(
        event.position.x + Math.cos(angle) * profile.spawnRadius,
        0.18 + Math.random() * profile.spawnLift,
        event.position.y + Math.sin(angle) * profile.spawnRadius
      );
      shard.mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shard.mesh.scale.set(
        scale * profile.stretch.x,
        scale * profile.stretch.y,
        scale * profile.stretch.z
      );
      shard.mesh.userData.baseScale = scale;
      shard.mesh.userData.stretchX = profile.stretch.x;
      shard.mesh.userData.stretchY = profile.stretch.y;
      shard.mesh.userData.stretchZ = profile.stretch.z;
      shard.velocity.set(
        Math.cos(angle) * speed + Math.cos(tangent) * sideSkew,
        lift,
        Math.sin(angle) * speed + Math.sin(tangent) * sideSkew
      );
      shard.angularVelocity.set(
        (Math.random() - 0.5) * profile.spin,
        (Math.random() - 0.5) * profile.spin * 1.3,
        (Math.random() - 0.5) * profile.spin
      );
      shard.material.color.set(color);
      shard.material.emissive.set(color);
      shard.material.emissiveIntensity = profile.emissive;
      shard.material.opacity = profile.opacity;

      emitted += 1;
      if (emitted >= count) {
        break;
      }
    }
  };

  const spawnPlayerDeathBreakup = (position: Vec2Like): void => {
    playerDestructionTime = GAME_CONFIG.playerDeathHoldSeconds;
    playerRoot.visible = false;
    playerHealthBarRoot.visible = false;
    reticle.visible = false;

    const fragmentCount = reducedMotion ? 7 : playerDebrisPool.length;
    for (let index = 0; index < playerDebrisPool.length; index += 1) {
      const debris = playerDebrisPool[index];
      const active = index < fragmentCount;
      debris.active = active;
      debris.mesh.visible = active;

      if (!active) {
        continue;
      }

      const angle = playerHeading + (Math.PI * 2 * index) / fragmentCount;
      const spread = 2.4 + Math.random() * 3.2;
      const lift = 1.4 + Math.random() * 2.2;
      const sideJitter = (Math.random() - 0.5) * 0.9;
      const scale = 0.82 + Math.random() * 0.34;

      debris.life = 1.25 + Math.random() * 0.62;
      debris.maxLife = debris.life;
      debris.mesh.position.set(
        position.x + Math.cos(angle) * 0.18,
        0.22 + Math.random() * 0.22,
        position.y + Math.sin(angle) * 0.18
      );
      debris.mesh.rotation.set(
        Math.random() * Math.PI,
        playerHeading + Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      debris.mesh.scale.setScalar(scale);
      debris.mesh.userData.baseScale = scale;
      debris.velocity.set(
        Math.cos(angle) * spread + Math.cos(angle + Math.PI * 0.5) * sideJitter,
        lift,
        Math.sin(angle) * spread + Math.sin(angle + Math.PI * 0.5) * sideJitter
      );
      debris.angularVelocity.set(
        (Math.random() - 0.5) * 7.4,
        (Math.random() - 0.5) * 9.2,
        (Math.random() - 0.5) * 7.4
      );
      debris.material.opacity = 1;
      debris.material.emissiveIntensity = 2.4;
    }
  };

  const spawnDashEcho = (): void => {
    const echo = dashEchoPool.find((entry) => !entry.active);

    if (!echo) {
      return;
    }

    echo.active = true;
    echo.life = 0.22;
    echo.maxLife = echo.life;
    echo.root.visible = true;
    echo.root.position.copy(playerPosition);
    echo.root.position.y = 0.02;
    echo.root.rotation.y = playerHeading;
    echo.root.scale.setScalar(1.02);
    echo.bodyMaterial.opacity = 0.18;
    echo.noseMaterial.opacity = 0.26;
    echo.bodyMaterial.emissiveIntensity = 1.7;
    echo.noseMaterial.emissiveIntensity = 2.1;
  };

  const spawnGroundDecal = (
    position: Vec2Like,
    color: string,
    scale: number,
    lifetime: number,
    opacity: number
  ): void => {
    const decal = decalPool.find((entry) => !entry.active);

    if (!decal) {
      return;
    }

    decal.active = true;
    decal.life = lifetime;
    decal.maxLife = lifetime;
    decal.baseOpacity = opacity;
    decal.baseScale = scale;
    decal.growth = 0.22 + Math.random() * 0.36;
    decal.spin = (Math.random() - 0.5) * 1.4;
    decal.angle = Math.random() * Math.PI * 2;
    decal.mesh.visible = true;
    decal.mesh.position.set(position.x, 0.035, position.y);
    decal.mesh.scale.setScalar(scale);
    decal.mesh.rotation.z = decal.angle;
    decal.material.color.set(color);
    decal.material.opacity = opacity;
  };

  const spawnRangedTrace = (
    position: Vec2Like,
    direction: Vec2Like,
    span: number,
    kind: "arc" | "artillery" | "comet" | "drone" | "overseer" | "satellite" | "sentry"
  ): void => {
    const trace = rangedTracePool.find((entry) => !entry.active);

    if (!trace) {
      return;
    }

    const rotation = Math.atan2(direction.x, direction.y);
    const beamColor =
      kind === "arc"
        ? "#72ffd5"
        : kind === "comet"
          ? "#ff8a4a"
        : kind === "drone"
          ? "#72ffd5"
        : kind === "satellite"
          ? "#ffb84a"
        : kind === "overseer"
          ? "#ff8a4a"
          : kind === "artillery"
            ? "#ff648f"
            : "#ffb84a";
    const coreColor =
      kind === "arc"
        ? "#ffffff"
        : kind === "comet"
          ? "#fff0cb"
        : kind === "drone"
          ? "#d9fff3"
        : kind === "satellite"
          ? "#fff0cb"
        : kind === "overseer"
          ? "#fff0cb"
          : kind === "artillery"
            ? "#ffd2e5"
            : "#9bf7ff";
    const width =
      kind === "overseer"
        ? 1.3
        : kind === "comet"
          ? 0.72
        : kind === "artillery"
          ? 0.52
        : kind === "arc" || kind === "drone"
          ? 0.28
          : 0.38;
    const life =
      kind === "overseer"
        ? 0.26
        : kind === "comet"
          ? 0.3
        : kind === "artillery"
          ? 0.22
        : kind === "arc" || kind === "drone"
          ? 0.16
          : 0.18;
    const startOffset =
      kind === "overseer"
        ? 0.72
        : kind === "comet"
          ? 0.62
        : kind === "artillery"
          ? 0.54
        : kind === "arc"
          ? 0.08
          : 0.46;
    const endPoint = {
      x: position.x + direction.x * span,
      y: position.y + direction.y * span
    };

    trace.active = true;
    trace.baseWidth = width;
    trace.life = life;
    trace.maxLife = life;
    trace.span = span;
    trace.root.visible = true;
    trace.root.position.set(position.x, 0.05, position.y);
    trace.root.rotation.y = rotation;
    trace.beamMaterial.color.set(beamColor);
    trace.coreMaterial.color.set(coreColor);
    trace.beamMaterial.opacity =
      kind === "overseer" ? 0.34 : kind === "artillery" ? 0.32 : 0.28;
    trace.coreMaterial.opacity =
      kind === "overseer" ? 0.62 : kind === "artillery" ? 0.56 : 0.54;
    trace.beam.position.set(0, 0, span * 0.5 + startOffset);
    trace.beam.scale.set(width, span, 1);
    trace.core.position.set(0, 0.001, span * 0.5 + startOffset);
    trace.core.scale.set(width * 0.34, span * 0.92, 1);

    spawnGroundDecal(
      endPoint,
      kind === "arc"
        ? "#72ffd5"
        : kind === "comet"
          ? "#ff8a4a"
        : kind === "drone"
          ? "#72ffd5"
        : kind === "satellite"
          ? "#ffb84a"
        : kind === "overseer"
          ? "#ff8a4a"
          : kind === "artillery"
            ? "#ff648f"
            : "#ffb84a",
      kind === "overseer" ? 0.98 : kind === "comet" ? 0.9 : kind === "artillery" ? 0.7 : kind === "arc" ? 0.46 : 0.54,
      kind === "overseer" ? 0.48 : kind === "comet" ? 0.56 : kind === "artillery" ? 0.34 : kind === "arc" ? 0.24 : 0.28,
      kind === "overseer" ? 0.16 : kind === "comet" ? 0.18 : kind === "artillery" ? 0.14 : kind === "arc" ? 0.11 : 0.12
    );
  };

  return {
    camera,
    emitEffects: (events) => {
      for (const event of events) {
        switch (event.type) {
          case "shot-fired":
            emitParticleBurst(
              event.position,
              "#96ff47",
              2,
              1.4,
              0.18,
              [0.05, 0.1]
            );
            break;
          case "dash":
            cameraShake = Math.max(cameraShake, 0.1);
            emitParticleBurst(
              event.position,
              "#31f5ff",
              10,
              3.2,
              0.32,
              [0.07, 0.16]
            );
            spawnGroundDecal(event.position, "#31f5ff", 1.36, 0.48, 0.22);
            break;
          case "arena-boundary-hit":
            cameraShake = Math.max(cameraShake, 0.045);
            emitParticleBurst(
              event.position,
              "#31f5ff",
              5,
              1.9,
              0.18,
              [0.04, 0.1]
            );
            spawnGroundDecal(event.position, "#31f5ff", 0.72, 0.32, 0.12);
            break;
          case "projectile-ricochet":
            cameraShake = Math.max(cameraShake, 0.035);
            emitParticleBurst(
              event.position,
              "#31f5ff",
              5,
              2.1,
              0.2,
              [0.04, 0.1]
            );
            spawnGroundDecal(event.position, "#31f5ff", 0.62, 0.28, 0.1);
            break;
          case "rail-pierce":
            cameraShake = Math.max(cameraShake, 0.035);
            spawnRangedTrace(
              event.position,
              event.direction ?? { x: 0, y: 1 },
              event.span ?? 1.8,
              "satellite"
            );
            emitParticleBurst(
              event.position,
              "#fff0cb",
              5,
              2.4,
              0.18,
              [0.04, 0.1]
            );
            break;
          case "halo-drone-fired":
            spawnRangedTrace(
              event.position,
              event.direction ?? { x: 0, y: 1 },
              Math.min(event.span ?? 5.2, 8.4),
              "drone"
            );
            emitParticleBurst(
              event.position,
              "#72ffd5",
              4,
              1.8,
              0.16,
              [0.04, 0.09]
            );
            break;
          case "satellite-lattice-fired":
            cameraShake = Math.max(cameraShake, 0.045);
            spawnRangedTrace(
              event.position,
              event.direction ?? { x: 0, y: 1 },
              event.span ?? 7.6,
              "satellite"
            );
            emitParticleBurst(
              event.position,
              "#ffb84a",
              5,
              2.2,
              0.18,
              [0.04, 0.1]
            );
            break;
          case "comet-bloom-fired":
            cameraShake = Math.max(cameraShake, 0.09);
            spawnRangedTrace(
              event.position,
              event.direction ?? { x: 0, y: 1 },
              Math.min(event.span ?? 8.5, 11.5),
              "comet"
            );
            emitParticleBurst(
              event.position,
              "#ff8a4a",
              10,
              3.2,
              0.32,
              [0.06, 0.16]
            );
            break;
          case "comet-bloom-impact":
            cameraShake = Math.max(cameraShake, 0.2);
            emitParticleBurst(
              event.position,
              "#fff0cb",
              24,
              4.6,
              0.52,
              [0.08, 0.22]
            );
            emitParticleBurst(
              event.position,
              "#ff8a4a",
              20,
              3.9,
              0.44,
              [0.08, 0.2]
            );
            spawnGroundDecal(event.position, "#fff0cb", (event.span ?? 2.4) * 2.1, 1.1, 0.22);
            spawnGroundDecal(event.position, "#ff8a4a", (event.span ?? 2.4) * 2.65, 1.35, 0.16);
            break;
          case "starburst-rounds":
            cameraShake = Math.max(cameraShake, 0.045);
            emitParticleBurst(
              event.position,
              "#ffffff",
              10,
              2.65,
              0.22,
              [0.06, 0.16]
            );
            spawnGroundDecal(event.position, "#fff0cb", (event.span ?? 2.1) * 1.02, 0.34, 0.13);
            break;
          case "nova-dash":
            cameraShake = Math.max(cameraShake, 0.09);
            emitParticleBurst(
              event.position,
              "#31f5ff",
              14,
              3.2,
              0.3,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#31f5ff", (event.span ?? 2.4) * 1.48, 0.58, 0.17);
            spawnGroundDecal(event.position, "#ffffff", (event.span ?? 2.4) * 0.96, 0.38, 0.12);
            break;
          case "afterimage-trail":
            emitParticleBurst(
              event.position,
              "#9bf7ff",
              5,
              1.9,
              0.16,
              [0.04, 0.1]
            );
            spawnGroundDecal(event.position, "#31f5ff", event.span ?? 1.1, 0.32, 0.1);
            break;
          case "gravity-well":
            cameraShake = Math.max(cameraShake, 0.03);
            emitParticleBurst(
              event.position,
              "#ff4fd8",
              10,
              2.45,
              0.26,
              [0.06, 0.14]
            );
            spawnGroundDecal(event.position, "#ff4fd8", (event.span ?? 3.9) * 1.28, 0.74, 0.12);
            spawnGroundDecal(event.position, "#72ffd5", (event.span ?? 3.9) * 0.78, 0.54, 0.08);
            break;
          case "card-purge-cast":
            cameraShake = Math.max(cameraShake, 0.36);
            ritualPulse = 1.05;
            chapterPulse = 0.95;
            emitParticleBurst(
              event.position,
              "#ffffff",
              34,
              5.2,
              0.82,
              [0.1, 0.24]
            );
            emitParticleBurst(
              event.position,
              "#ff648f",
              30,
              4.8,
              0.72,
              [0.09, 0.22]
            );
            emitParticleBurst(
              event.position,
              "#ff4fd8",
              20,
              4.2,
              0.56,
              [0.08, 0.2]
            );
            spawnGroundDecal(event.position, "#ffffff", 7.8, 1.08, 0.3);
            spawnGroundDecal(event.position, "#ff648f", 11.8, 1.28, 0.2);
            spawnGroundDecal(event.position, "#ff4fd8", 15.4, 1.5, 0.15);
            break;
          case "card-repair-cast":
            cameraShake = Math.max(cameraShake, 0.12);
            ritualPulse = Math.max(ritualPulse, 0.45);
            emitParticleBurst(
              event.position,
              "#72ffd5",
              26,
              3.8,
              0.58,
              [0.08, 0.2]
            );
            emitParticleBurst(
              event.position,
              "#31f5ff",
              20,
              3.2,
              0.42,
              [0.07, 0.16]
            );
            spawnGroundDecal(event.position, "#72ffd5", 4.2, 0.92, 0.24);
            spawnGroundDecal(event.position, "#31f5ff", 6.4, 1.14, 0.16);
            break;
          case "card-overcore-cast":
            cameraShake = Math.max(cameraShake, 0.18);
            ritualPulse = Math.max(ritualPulse, 0.62);
            emitParticleBurst(
              event.position,
              "#ffb84a",
              28,
              4.1,
              0.62,
              [0.08, 0.2]
            );
            emitParticleBurst(
              event.position,
              "#96ff47",
              20,
              3.4,
              0.46,
              [0.07, 0.16]
            );
            spawnGroundDecal(event.position, "#ffb84a", 5.2, 1.02, 0.24);
            spawnGroundDecal(event.position, "#96ff47", 7.2, 1.22, 0.18);
            break;
          case "artillery-lock-start":
            cameraShake = Math.max(cameraShake, 0.08);
            emitParticleBurst(
              event.position,
              "#ff648f",
              12,
              3,
              0.28,
              [0.06, 0.14]
            );
            spawnGroundDecal(
              event.position,
              "#ff648f",
              (event.span ?? GAME_CONFIG.artilleryBaseRadius) * 1.8,
              0.92,
              0.16
            );
            break;
            case "artillery-impact":
              cameraShake = Math.max(cameraShake, 0.2);
              emitParticleBurst(
                event.position,
                "#fff0cb",
              22,
              4.2,
              0.42,
              [0.08, 0.2]
            );
            emitParticleBurst(
              event.position,
              "#ff648f",
              16,
              3.6,
              0.34,
              [0.08, 0.18]
            );
            spawnGroundDecal(
              event.position,
              "#fff0cb",
              (event.span ?? GAME_CONFIG.artilleryBaseRadius) * 2.1,
              1.1,
              0.22
            );
              spawnGroundDecal(
                event.position,
                "#ff648f",
                (event.span ?? GAME_CONFIG.artilleryBaseRadius) * 2.6,
                1.35,
                0.16
              );
              break;
            case "relay-boost-start":
              cameraShake = Math.max(cameraShake, 0.07);
              emitParticleBurst(
                event.position,
                "#72ffd5",
                14,
                3.2,
                0.34,
                [0.08, 0.18]
              );
              emitParticleBurst(
                event.position,
                "#fff0cb",
                10,
                2.4,
                0.24,
                [0.06, 0.14]
              );
              spawnGroundDecal(
                event.position,
                "#72ffd5",
                Math.max(1.8, (event.span ?? 1.8) * 0.62),
                1.02,
                0.16
              );
              break;
            case "combo-surge":
              cameraShake = Math.max(cameraShake, 0.08);
            emitParticleBurst(
              event.position,
              "#96ff47",
              14,
              3.4,
              0.34,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#96ff47", 1.8, 0.72, 0.18);
            break;
          case "elite-spawned":
            cameraShake = Math.max(cameraShake, 0.09);
            emitParticleBurst(
              event.position,
              "#ffd56e",
              14,
              3.2,
              0.34,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#ffd56e", 1.9, 0.82, 0.16);
            break;
          case "elite-killed":
            emitParticleBurst(
              event.position,
              getEnemyEventColor(event, "accent"),
              12,
              3.1,
              0.34,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, getEnemyEventColor(event, "accent"), 1.2, 0.86, 0.14);
            break;
          case "elite-burst":
            cameraShake = Math.max(cameraShake, 0.14);
            emitParticleBurst(
              event.position,
              getEnemyEventColor(event, "accent"),
              20,
              3.8,
              0.44,
              [0.08, 0.2]
            );
            spawnGroundDecal(
              event.position,
              getEnemyEventColor(event, "accent"),
              Math.max(2.2, (event.span ?? 2.35) * 1.15),
              1.08,
              0.18
            );
            break;
          case "arena-purge-start":
            cameraShake = Math.max(cameraShake, 0.12);
            chapterPulse = 0.8;
            emitParticleBurst(
              event.position,
              "#ffb347",
              18,
              3.6,
              0.42,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#ffb347", 5.8, 1.7, 0.2);
            break;
          case "enemy-fired":
            cameraShake = Math.max(cameraShake, 0.05);
            spawnRangedTrace(
              event.position,
              event.direction ?? { x: 0, y: 1 },
              event.span ??
                (event.traceKind === "overseer"
                  ? 16.5
                  : event.traceKind === "artillery"
                    ? 10.5
                    : 13.6),
              event.traceKind ?? "sentry"
            );
            emitParticleBurst(
              event.position,
              event.traceKind === "overseer"
                ? "#ff8a4a"
                : event.traceKind === "artillery"
                  ? "#ff648f"
                  : "#ffb84a",
              event.traceKind === "overseer" ? 12 : event.traceKind === "artillery" ? 10 : 7,
              event.traceKind === "overseer" ? 3.4 : event.traceKind === "artillery" ? 3 : 2.8,
              event.traceKind === "overseer" ? 0.28 : event.traceKind === "artillery" ? 0.24 : 0.22,
              [0.06, 0.12]
            );
            spawnGroundDecal(
              event.position,
              event.traceKind === "overseer"
                ? "#ff8a4a"
                : event.traceKind === "artillery"
                  ? "#ff648f"
                  : "#ffb84a",
              event.traceKind === "overseer" ? 1.8 : event.traceKind === "artillery" ? 1.4 : 1.2,
              event.traceKind === "overseer" ? 0.74 : event.traceKind === "artillery" ? 0.58 : 0.52,
              0.12
            );
            break;
          case "enemy-hit":
            emitParticleBurst(
              event.position,
              getEnemyEventColor(event, "body"),
              event.isElite ? 6 : 5,
              2.4,
              0.22,
              [0.05, 0.11]
            );
            break;
          case "enemy-spawned":
            emitParticleBurst(
              event.position,
              "#31f5ff",
              8,
              2.6,
              0.28,
              [0.06, 0.14]
            );
            break;
          case "arc-chain": {
            const direction = event.direction ?? { x: 0, y: 1 };
            const span = event.span ?? 3.2;
            const endPoint = {
              x: event.position.x + direction.x * span,
              y: event.position.y + direction.y * span
            };
            cameraShake = Math.max(cameraShake, 0.045);
            spawnRangedTrace(event.position, direction, span, "arc");
            emitParticleBurst(
              event.position,
              "#72ffd5",
              7,
              2.8,
              0.26,
              [0.05, 0.12]
            );
            emitParticleBurst(
              endPoint,
              "#ffffff",
              8,
              2.6,
              0.3,
              [0.05, 0.12]
            );
            spawnGroundDecal(endPoint, "#72ffd5", 0.72, 0.36, 0.14);
            break;
          }
          case "enemy-killed":
            spawnEnemyDeathBreakup(event);
            emitParticleBurst(
              event.position,
              getEnemyEventColor(event, "accent"),
              event.isElite ? 11 : 9,
              3.4,
              0.38,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, getEnemyEventColor(event, "body"), 0.76, 1.1, 0.12);
            break;
          case "boss-spawned":
            cameraShake = Math.max(cameraShake, 0.18);
            ritualPulse = 1;
            emitParticleBurst(
              event.position,
              "#9bf7ff",
              24,
              4,
              0.64,
              [0.08, 0.2]
            );
            spawnGroundDecal(event.position, "#9bf7ff", 5.4, 1.65, 0.24);
            break;
          case "boss-collapse-start":
            cameraShake = Math.max(cameraShake, 0.42);
            arenaBreachPulse = GAME_CONFIG.arenaBreachSeconds;
            arenaBreachRoot.position.set(event.position.x, 0, event.position.y);
            arenaBreachRoot.rotation.y = Math.random() * Math.PI * 2;
            ritualPulse = 1.25;
            chapterPulse = 1.35;
            collapsePulse = 1.2;
            emitParticleBurst(
              event.position,
              "#ffffff",
              36,
              5.4,
              1.1,
              [0.12, 0.3]
            );
            emitParticleBurst(
              event.position,
              "#ffb84a",
              28,
              4.6,
              0.96,
              [0.1, 0.24]
            );
            emitParticleBurst(
              event.position,
              "#ff4fd8",
              24,
              4.2,
              0.88,
              [0.08, 0.22]
            );
            spawnGroundDecal(event.position, "#ffffff", 7.2, 1.8, 0.3);
            spawnGroundDecal(event.position, "#ffb84a", 9.1, 2.2, 0.22);
            spawnGroundDecal(event.position, "#ff4fd8", 11.2, 2.5, 0.18);
            break;
          case "boss-phase-shift":
            cameraShake = Math.max(cameraShake, 0.24);
            ritualPulse = 1;
            chapterPulse = 1;
            collapsePulse = Math.max(collapsePulse, 0.34);
            emitParticleBurst(
              event.position,
              "#ffb84a",
              26,
              4.3,
              0.72,
              [0.08, 0.22]
            );
            spawnGroundDecal(event.position, "#ffb84a", 6.4, 1.95, 0.26);
            break;
          case "boss-core-exposed":
            cameraShake = Math.max(cameraShake, 0.26);
            ritualPulse = 1;
            chapterPulse = 1;
            collapsePulse = Math.max(collapsePulse, 0.48);
            emitParticleBurst(
              event.position,
              "#ffffff",
              30,
              4.6,
              0.82,
              [0.08, 0.22]
            );
            emitParticleBurst(
              event.position,
              "#ff4fd8",
              20,
              3.8,
              0.7,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#ffffff", (event.span ?? 2.8) * 1.55, 1.1, 0.24);
            spawnGroundDecal(event.position, "#ff4fd8", (event.span ?? 2.8) * 2.2, 1.6, 0.18);
            break;
          case "boss-phase-pulse-start":
            cameraShake = Math.max(cameraShake, 0.22);
            ritualPulse = 1;
            chapterPulse = 0.8;
            emitParticleBurst(
              event.position,
              "#ffb84a",
              22,
              3.8,
              0.6,
              [0.08, 0.2]
            );
            spawnGroundDecal(event.position, "#ffb84a", 2.4, 0.9, 0.18);
            break;
          case "boss-defeated":
            cameraShake = Math.max(cameraShake, 0.28);
            ritualPulse = 0.8;
            collapsePulse = Math.max(collapsePulse, 0.82);
            spawnEnemyDeathBreakup(event, "overseer");
            emitParticleBurst(
              event.position,
              "#ffffff",
              28,
              4.2,
              0.72,
              [0.1, 0.24]
            );
            spawnGroundDecal(event.position, "#ffffff", 6.2, 1.8, 0.28);
            break;
          case "rescue-spawned":
            cameraShake = Math.max(cameraShake, 0.06);
            emitParticleBurst(
              event.position,
              "#72ffd5",
              12,
              2.8,
              0.34,
              [0.07, 0.16]
            );
            emitParticleBurst(
              event.position,
              "#fff0cb",
              6,
              2.1,
              0.26,
              [0.05, 0.12]
            );
            spawnGroundDecal(event.position, "#72ffd5", 1.45, 0.9, 0.16);
            break;
          case "orb-collected":
            emitParticleBurst(
              event.position,
              "#31f5ff",
              6,
              2.2,
              0.3,
              [0.06, 0.12]
            );
            break;
          case "player-hit":
            cameraShake = Math.max(cameraShake, 0.16);
            emitParticleBurst(
              event.position,
              "#ff5b7f",
              8,
              3.1,
              0.32,
              [0.08, 0.16]
            );
            break;
          case "player-died":
            cameraShake = Math.max(cameraShake, 0.46);
            spawnPlayerDeathBreakup(event.position);
            emitParticleBurst(
              event.position,
              "#ff5b7f",
              reducedMotion ? 18 : 30,
              4.6,
              0.68,
              [0.08, 0.2]
            );
            emitParticleBurst(
              event.position,
              "#fff0cb",
              reducedMotion ? 10 : 18,
              3.8,
              0.54,
              [0.07, 0.18]
            );
            spawnGroundDecal(event.position, "#ff5b7f", 3.6, 1.05, 0.22);
            break;
          case "upgrade-ready":
            emitParticleBurst(
              event.position,
              "#31f5ff",
              12,
              2.8,
              0.4,
              [0.08, 0.16]
            );
            break;
          case "victory":
            cameraShake = Math.max(cameraShake, 0.1);
            ritualPulse = 0.7;
            emitParticleBurst(
              event.position,
              "#96ff47",
              18,
              3.2,
              0.55,
              [0.08, 0.18]
            );
            spawnGroundDecal(event.position, "#96ff47", 4.4, 1.35, 0.22);
            break;
        }
      }
    },
    render: (deltaSeconds = GAME_CONFIG.fixedStepSeconds) => {
      const renderDeltaSeconds = THREE.MathUtils.clamp(deltaSeconds, 0, 0.05);
      const motionScale = reducedMotion ? 0.22 : 1;
      sceneTime += renderDeltaSeconds;
      updateFollowCamera(camera, followTarget, renderDeltaSeconds);
      arenaBreachPulse = Math.max(
        0,
        arenaBreachPulse - renderDeltaSeconds
      );
      cameraShake = Math.max(0, cameraShake - renderDeltaSeconds * (reducedMotion ? 2.1 : 0.9));
      chapterPulse = Math.max(0, chapterPulse - renderDeltaSeconds * (reducedMotion ? 1.6 : 0.75));
      collapsePulse = Math.max(0, collapsePulse - renderDeltaSeconds * (reducedMotion ? 1.45 : 0.62));
      ritualPulse = Math.max(0, ritualPulse - renderDeltaSeconds * (reducedMotion ? 1.5 : 0.68));
      dashEchoCooldown = Math.max(0, dashEchoCooldown - renderDeltaSeconds);
      arenaChapterBlend +=
        ((arenaChapter - 1) - arenaChapterBlend) *
        Math.min(1, renderDeltaSeconds * 3.4);

      if (cameraShake > 0.001) {
        const shakeAmount = cameraShake * motionScale;
        camera.position.x += (Math.random() - 0.5) * shakeAmount;
        camera.position.z += (Math.random() - 0.5) * shakeAmount;
      }

      sceneBackground.lerpColors(
        chapterColdBackground,
        chapterHotBackground,
        arenaChapterBlend
      );
      sceneFog.color.lerpColors(chapterColdFog, chapterHotFog, arenaChapterBlend);
      arenaMaterial.color.lerpColors(chapterColdArena, chapterHotArena, arenaChapterBlend);
      arenaMaterial.emissive.lerpColors(
        chapterColdArenaGlow,
        chapterHotArenaGlow,
        arenaChapterBlend
      );
      arenaMaterial.emissiveIntensity =
        0.9 +
        arenaChapterBlend * 0.55 +
        ritualPulse * 0.3 * motionScale +
        collapsePulse * 0.9 * motionScale;
      keyLight.color.lerpColors(chapterColdKey, chapterHotKey, arenaChapterBlend);
      keyLight.intensity = 1.9 + collapsePulse * 0.38 * motionScale;
      magentaAccent.color.lerpColors(
        chapterColdMagenta,
        chapterHotMagenta,
        arenaChapterBlend
      );
      magentaAccent.intensity = 22 + collapsePulse * 9 * motionScale;
      cyanAccent.color.lerpColors(chapterColdCyan, chapterHotCyan, arenaChapterBlend);
      cyanAccent.intensity = 18 + collapsePulse * 8 * motionScale;
      ringMaterial.color.lerpColors(chapterColdRing, chapterHotRing, arenaChapterBlend);
      ringMaterial.emissive.copy(ringMaterial.color);
      warningRingMaterial.color.lerpColors(
        chapterColdWarning,
        chapterHotWarning,
        arenaChapterBlend
      );
      warningRingMaterial.emissive.copy(warningRingMaterial.color);
      ring.rotation.z += reducedMotion ? 0.00035 : 0.0015;
      ring.scale.setScalar(1 + collapsePulse * 0.05 * motionScale);
      ringMaterial.emissiveIntensity =
        1.4 +
        arenaDangerLevel * 1.3 +
        arenaChapterBlend * 0.55 +
        ritualPulse * 0.45 * motionScale +
        collapsePulse * 1.5 * motionScale;
      warningRingMaterial.emissiveIntensity =
        1.2 +
        arenaDangerLevel * 2.6 +
        arenaChapterBlend * 0.8 +
        ritualPulse * 0.35 * motionScale +
        collapsePulse * 1.2 * motionScale;
      warningRing.scale.setScalar(
        1 +
          arenaDangerLevel * 0.018 +
          ritualPulse * 0.02 * motionScale +
          collapsePulse * 0.08 * motionScale
      );
      const breachRatio = arenaBreachPulse / GAME_CONFIG.arenaBreachSeconds;
      const breachProgress = 1 - breachRatio;
      const breachVisible = breachRatio > 0.001;
      arenaBreachCore.visible = breachVisible;
      arenaBreachRing.visible = breachVisible;
      if (breachVisible) {
        arenaBreachCore.scale.setScalar(
          1.12 + breachProgress * 2.8 + Math.sin(sceneTime * 11) * 0.04 * breachRatio
        );
        arenaBreachCoreMaterial.opacity = 0.18 + breachRatio * 0.24;
        arenaBreachRing.scale.setScalar(
          1.08 + breachProgress * 3.2 + Math.sin(sceneTime * 8) * 0.05 * breachRatio
        );
        arenaBreachRingMaterial.opacity = 0.08 + breachRatio * 0.26;
        arenaBreachRingMaterial.color.lerpColors(
          chapterHotWarning,
          chapterHotMagenta,
          0.45 + breachProgress * 0.35
        );

        for (const crack of arenaBreachCracks) {
          const crackPulse =
            0.86 + Math.sin(sceneTime * 12 + crack.pulseOffset) * 0.14;
          crack.mesh.visible = true;
          crack.mesh.position.set(
            Math.cos(crack.angle) * crack.offset,
            0.042,
            Math.sin(crack.angle) * crack.offset
          );
          crack.mesh.rotation.z = crack.angle + breachProgress * 0.03;
          crack.mesh.scale.set(
            crack.width * (1 + breachRatio * 0.45),
            crack.length * (0.38 + breachProgress * 0.92),
            1
          );
          crack.material.opacity =
            (0.08 + breachRatio * 0.18 + collapsePulse * 0.08) * crackPulse;
        }
      } else {
        for (const crack of arenaBreachCracks) {
          crack.mesh.visible = false;
        }
      }
      killGridRoot.rotation.y +=
        renderDeltaSeconds * (0.03 + arenaChapterBlend * 0.05);
      for (let index = 0; index < killGridMaterials.length; index += 1) {
        const material = killGridMaterials[index];
        const lanePulse = 0.8 + Math.sin(sceneTime * 2.1 + index * 0.9) * 0.2;
        material.color.set(index % 2 === 0 ? "#ff648f" : "#ffb347");
        material.opacity =
          (arenaChapterBlend * 0.055 +
            chapterPulse * 0.1 +
            ritualPulse * 0.08 +
            collapsePulse * 0.18) *
          lanePulse;
      }

      for (let index = 0; index < purgeLaneMaterials.length; index += 1) {
        const material = purgeLaneMaterials[index];
        const purge = purgeLaneStates[index];

        if (!purge) {
          material.opacity = 0;
          continue;
        }

        material.color.set(purge.phase === "active" ? "#fff0cb" : "#ff5b7f");
        material.opacity =
          purge.phase === "active"
            ? 0.2 + (1 - purge.progress) * 0.08
            : 0.055 + purge.progress * 0.11;
      }

      for (let index = 0; index < bossPulseViews.length; index += 1) {
        const view = bossPulseViews[index];
        const pulse = bossPulseStates[index];

        if (!pulse) {
          view.mesh.visible = false;
          continue;
        }

        view.mesh.visible = true;
        view.mesh.position.set(pulse.origin.x, 0.052, pulse.origin.y);
        view.mesh.scale.setScalar(pulse.radius);
        view.material.color.set(pulse.phase === "active" ? "#fff0cb" : "#ffb84a");
        view.material.opacity =
          pulse.phase === "active"
            ? 0.34 + (1 - pulse.progress) * 0.08
            : 0.1 + pulse.progress * 0.16;
      }

      for (let index = 0; index < artilleryStrikeViews.length; index += 1) {
        const view = artilleryStrikeViews[index];
        const strike = artilleryStrikeStates[index];

        if (!strike) {
          view.ring.visible = false;
          view.fill.visible = false;
          continue;
        }

        const pulse = 0.88 + Math.sin(sceneTime * 10 + index * 0.9) * 0.12;
        view.ring.visible = true;
        view.fill.visible = true;
        view.ring.position.set(strike.position.x, 0.048, strike.position.y);
        view.fill.position.set(strike.position.x, 0.044, strike.position.y);
        view.ring.scale.setScalar(strike.radius * pulse);
        view.fill.scale.setScalar(
          strike.radius *
            (strike.phase === "active"
              ? 1.04 + (1 - strike.progress) * 0.08
              : 0.82 + strike.progress * 0.14)
        );
        view.ringMaterial.color.set(
          strike.phase === "active" ? "#fff0cb" : "#ff648f"
        );
        view.fillMaterial.color.set(
          strike.phase === "active" ? "#ff8a4a" : "#ff648f"
        );
        view.ringMaterial.opacity =
          strike.phase === "active"
            ? 0.28 + (1 - strike.progress) * 0.12
            : 0.12 + strike.progress * 0.16;
        view.fillMaterial.opacity =
          strike.phase === "active"
            ? 0.16 + (1 - strike.progress) * 0.1
            : 0.04 + strike.progress * 0.08;
      }

      playerDestructionTime = Math.max(0, playerDestructionTime - renderDeltaSeconds);
      const playerDestroyed = playerDestructionTime > 0;
      playerRoot.visible = !playerDestroyed;
      playerHealthBarRoot.visible = !playerDestroyed;
      if (playerDestroyed) {
        reticle.visible = false;
      }

      const invulnerabilityBlink =
        playerVisuals.invulnerability > 0.02 &&
        Math.sin(sceneTime * 42) > 0;
      const bodyColor =
        playerVisuals.damageFlash > 0.04
          ? "#ff5b7f"
          : invulnerabilityBlink
            ? "#ffffff"
            : "#31f5ff";
      const buildColor =
        playerVisuals.buildPrimary === "dash-killer"
          ? "#31f5ff"
          : playerVisuals.buildPrimary === "glass-cannon"
            ? "#ff8a4a"
            : playerVisuals.buildPrimary === "spread-control"
              ? "#ff4fd8"
              : "#96ff47";
      const trimColor = playerVisuals.isDashing
        ? "#ffffff"
        : playerVisuals.dashReady >= 0.99
          ? buildColor
          : "#31f5ff";
      const legendaryColor =
        playerVisuals.signature === "comet-bloom"
          ? "#ff8a4a"
          : playerVisuals.signature === "satellite-lattice"
            ? "#ffb84a"
        : playerVisuals.signature === "zero-point-capacitor"
          ? "#ffb84a"
          : playerVisuals.signature === "overseer-lens"
            ? "#9bf7ff"
            : playerVisuals.signature === "signal-choir"
              ? "#72ffd5"
            : playerVisuals.signature === "eclipse-protocol"
              ? "#ff4fd8"
              : "#ffd56e";
      playerBodyMaterial.color.set(bodyColor);
      playerBodyMaterial.emissive.set(bodyColor);
      playerBodyMaterial.emissiveIntensity =
        1.4 +
        playerVisuals.shotPulse * 0.9 +
        (playerVisuals.isDashing ? 1.1 : 0) +
        playerVisuals.invulnerability * 0.55 +
        (1 - playerVisuals.healthRatio) * 0.4;
      playerNoseMaterial.emissiveIntensity =
        1.8 + playerVisuals.shotPulse * 0.5 + (playerVisuals.isDashing ? 0.45 : 0);
      playerTrimMaterial.color.set(trimColor);
      playerTrimMaterial.emissive.set(trimColor);
      playerTrimMaterial.emissiveIntensity =
        1.3 +
        playerVisuals.dashReady * 0.35 +
        playerVisuals.shotPulse * 0.2 +
        (playerVisuals.isDashing ? 1.1 : 0);
      playerHalo.rotation.z += renderDeltaSeconds * 1.8;
        playerHalo.scale.setScalar(
        1 +
          playerVisuals.shotPulse * 0.08 +
          (playerVisuals.isDashing ? 0.1 : 0) +
          playerVisuals.masteryTier * 0.05
      );
      reticleMaterial.color.set(
        playerVisuals.buildPrimary === "glass-cannon"
          ? "#ffb84a"
          : playerVisuals.buildPrimary === "spread-control"
            ? "#ff4fd8"
            : "#31f5ff"
      );
      playerLegendaryMaterial.color.set(legendaryColor);
      playerLegendaryMaterial.emissive.set(legendaryColor);
      playerLegendaryMaterial.opacity =
        playerVisuals.legendaryCount > 0 || playerVisuals.masteryTier > 0
          ? 0.1 +
            playerVisuals.legendaryCount * 0.03 +
            playerVisuals.masteryTier * 0.03 +
            playerVisuals.shotPulse * 0.08
          : 0;
      playerLegendaryMaterial.emissiveIntensity =
        playerVisuals.legendaryCount > 0 || playerVisuals.masteryTier > 0
          ? 1.4 +
            playerVisuals.legendaryCount * 0.35 +
            playerVisuals.masteryTier * 0.26 +
            (playerVisuals.isDashing ? 0.8 : 0) +
            playerVisuals.shotPulse * 0.4
          : 0;
      playerLegendaryHalo.visible =
        playerVisuals.legendaryCount > 0 || playerVisuals.masteryTier > 0;
      playerLegendaryHalo.rotation.z -=
        renderDeltaSeconds *
        (1.2 + playerVisuals.legendaryCount * 0.3 + playerVisuals.masteryTier * 0.18);
      playerLegendaryHalo.scale.setScalar(
        1 +
          playerVisuals.legendaryCount * 0.05 +
          playerVisuals.masteryTier * 0.04 +
          playerVisuals.shotPulse * 0.12 +
          (playerVisuals.isDashing ? 0.14 : 0)
      );
      playerRoot.scale.set(
        playerVisuals.isDashing ? 0.94 : 1,
        playerVisuals.isDashing ? 1.08 : 1,
        playerVisuals.isDashing ? 1.18 : 1
      );
      for (let index = 0; index < haloDroneMeshes.length; index += 1) {
        const drone = haloDroneMeshes[index];
        const material = drone.material as THREE.MeshStandardMaterial;
        const visible = index < playerVisuals.haloDroneCount;
        drone.visible = visible;
        material.opacity = visible ? 0.88 : 0;
        if (!visible) {
          continue;
        }

        const angle =
          sceneTime * 2.4 +
          (Math.PI * 2 * index) / Math.max(1, playerVisuals.haloDroneCount);
        drone.position.set(
          Math.cos(angle) * 1.35,
          0.54 + Math.sin(sceneTime * 5.2 + index) * 0.08,
          Math.sin(angle) * 1.35
        );
        drone.rotation.y = -angle;
        drone.scale.setScalar(0.95 + Math.sin(sceneTime * 8 + index) * 0.08);
        material.color.set("#72ffd5");
        material.emissive.set("#72ffd5");
        material.emissiveIntensity = 1.9 + playerVisuals.shotPulse * 0.4;
      }
      for (let index = 0; index < satelliteMeshes.length; index += 1) {
        const satellite = satelliteMeshes[index];
        const material = satellite.material as THREE.MeshStandardMaterial;
        const visible = playerVisuals.satelliteLatticeCount > 0;
        satellite.visible = visible;
        material.opacity = visible ? 0.9 : 0;
        if (!visible) {
          continue;
        }

        const angle = sceneTime * -1.2 + Math.PI * index;
        satellite.position.set(
          Math.cos(angle) * 1.86,
          0.48 + Math.sin(sceneTime * 4.4 + index) * 0.06,
          Math.sin(angle) * 1.86
        );
        satellite.rotation.y = -angle + Math.PI * 0.5;
        satellite.scale.setScalar(1 + Math.sin(sceneTime * 6 + index) * 0.06);
        material.color.set("#ffb84a");
        material.emissive.set("#ffb84a");
        material.emissiveIntensity = 2.1 + playerVisuals.legendaryCount * 0.3;
      }
      reticle.scale.setScalar(1 + playerVisuals.shotPulse * 0.35);
      reticleMaterial.opacity = 0.7 + playerVisuals.dashReady * 0.25;

      const playerHealthRatio = THREE.MathUtils.clamp(
        playerVisuals.healthRatio,
        0,
        1
      );
      const playerHealthWidth =
        PLAYER_HEALTH_BAR_WIDTH * Math.max(0.04, playerHealthRatio);
      playerHealthBarRoot.position.set(
        playerPosition.x,
        1.18 + playerVisuals.masteryTier * 0.03,
        playerPosition.z
      );
      playerHealthBarRoot.quaternion.copy(camera.quaternion);
      playerHealthFill.scale.set(
        playerHealthWidth,
        PLAYER_HEALTH_BAR_HEIGHT,
        1
      );
      playerHealthFill.position.x =
        (playerHealthWidth - PLAYER_HEALTH_BAR_WIDTH) * 0.5;
      playerHealthBackMaterial.opacity =
        0.52 + playerVisuals.damageFlash * 0.18;
      playerHealthFillMaterial.color.set(
        playerHealthRatio < 0.34
          ? "#ff5b7f"
          : playerHealthRatio < 0.62
            ? "#ffb84a"
            : "#96ff47"
      );
      playerHealthFillMaterial.opacity =
        0.84 + Math.max(playerVisuals.damageFlash, 1 - playerHealthRatio) * 0.14;

      if (playerVisuals.isDashing && dashEchoCooldown <= 0) {
        spawnDashEcho();
        dashEchoCooldown = 0.036;
      }

      for (let index = 0; index < pickupMeshes.length; index += 1) {
        const mesh = pickupMeshes[index];
        if (!mesh.visible) {
          continue;
        }

        mesh.position.y = 0.24 + Math.sin(sceneTime * 5.2 + index * 0.9) * 0.06;
        mesh.scale.setScalar(0.92 + Math.sin(sceneTime * 7 + index) * 0.08);
      }

      for (let index = 0; index < projectileMeshes.length; index += 1) {
        const mesh = projectileMeshes[index];
        if (!mesh.visible) {
          continue;
        }

        const baseScale =
          typeof mesh.userData.projectileScale === "number"
            ? mesh.userData.projectileScale
            : 1;
        mesh.scale.setScalar(
          baseScale * (0.95 + Math.sin(sceneTime * 18 + index) * 0.08)
        );
      }

      for (const particle of particlePool) {
        if (!particle.active) {
          continue;
        }

        particle.life = Math.max(
          0,
          particle.life - renderDeltaSeconds
        );

        if (particle.life <= 0) {
          particle.active = false;
          particle.mesh.visible = false;
          continue;
        }

        particle.mesh.position.addScaledVector(
          particle.velocity,
          renderDeltaSeconds
        );
        particle.velocity.multiplyScalar(0.94);
        particle.velocity.y *= 0.96;

        const lifeRatio = particle.life / particle.maxLife;
        const particleMaterial =
          particle.mesh.material as THREE.MeshStandardMaterial;
        particleMaterial.emissiveIntensity = 0.6 + lifeRatio * 1.8;
        particleMaterial.opacity = lifeRatio;
        particle.mesh.scale.multiplyScalar(0.985);
      }

      for (const debris of playerDebrisPool) {
        if (!debris.active) {
          continue;
        }

        debris.life = Math.max(0, debris.life - renderDeltaSeconds);
        if (debris.life <= 0) {
          debris.active = false;
          debris.mesh.visible = false;
          continue;
        }

        debris.velocity.y -= 4.4 * renderDeltaSeconds;
        debris.mesh.position.addScaledVector(debris.velocity, renderDeltaSeconds);
        if (debris.mesh.position.y < 0.08) {
          debris.mesh.position.y = 0.08;
          debris.velocity.y = Math.abs(debris.velocity.y) * 0.18;
          debris.velocity.x *= 0.72;
          debris.velocity.z *= 0.72;
        } else {
          debris.velocity.multiplyScalar(0.985);
        }
        debris.mesh.rotation.x += debris.angularVelocity.x * renderDeltaSeconds;
        debris.mesh.rotation.y += debris.angularVelocity.y * renderDeltaSeconds;
        debris.mesh.rotation.z += debris.angularVelocity.z * renderDeltaSeconds;

        const lifeRatio = debris.life / debris.maxLife;
        const baseScale =
          typeof debris.mesh.userData.baseScale === "number"
            ? debris.mesh.userData.baseScale
            : 1;
        debris.mesh.scale.setScalar(baseScale * (0.72 + lifeRatio * 0.28));
        debris.material.opacity = Math.min(1, lifeRatio * 1.25);
        debris.material.emissiveIntensity = 0.6 + lifeRatio * 2.2;
      }

      for (const shard of enemyDeathShardPool) {
        if (!shard.active) {
          continue;
        }

        shard.life = Math.max(0, shard.life - renderDeltaSeconds);
        if (shard.life <= 0) {
          shard.active = false;
          shard.mesh.visible = false;
          continue;
        }

        shard.velocity.y -= 3.8 * renderDeltaSeconds;
        shard.mesh.position.addScaledVector(shard.velocity, renderDeltaSeconds);
        if (shard.mesh.position.y < 0.055) {
          shard.mesh.position.y = 0.055;
          shard.velocity.y = Math.abs(shard.velocity.y) * 0.12;
          shard.velocity.x *= 0.74;
          shard.velocity.z *= 0.74;
        } else {
          shard.velocity.multiplyScalar(0.982);
        }
        shard.mesh.rotation.x += shard.angularVelocity.x * renderDeltaSeconds;
        shard.mesh.rotation.y += shard.angularVelocity.y * renderDeltaSeconds;
        shard.mesh.rotation.z += shard.angularVelocity.z * renderDeltaSeconds;

        const lifeRatio = shard.life / shard.maxLife;
        const baseScale =
          typeof shard.mesh.userData.baseScale === "number"
            ? shard.mesh.userData.baseScale
            : 1;
        const stretchX =
          typeof shard.mesh.userData.stretchX === "number"
            ? shard.mesh.userData.stretchX
            : 1;
        const stretchY =
          typeof shard.mesh.userData.stretchY === "number"
            ? shard.mesh.userData.stretchY
            : 1;
        const stretchZ =
          typeof shard.mesh.userData.stretchZ === "number"
            ? shard.mesh.userData.stretchZ
            : 1;
        const shrink = 0.56 + lifeRatio * 0.44;
        shard.mesh.scale.set(
          baseScale * stretchX * shrink,
          baseScale * stretchY * shrink,
          baseScale * stretchZ * shrink
        );
        shard.material.opacity = Math.min(1, lifeRatio * 1.4);
        shard.material.emissiveIntensity = 0.5 + lifeRatio * 2.6;
      }

      for (const decal of decalPool) {
        if (!decal.active) {
          continue;
        }

        decal.life = Math.max(0, decal.life - renderDeltaSeconds);
        if (decal.life <= 0) {
          decal.active = false;
          decal.mesh.visible = false;
          continue;
        }

        const lifeRatio = decal.life / decal.maxLife;
        const progress = 1 - lifeRatio;
        decal.mesh.scale.setScalar(decal.baseScale * (1 + progress * decal.growth));
        decal.mesh.rotation.z = decal.angle + progress * decal.spin;
        decal.material.opacity = decal.baseOpacity * lifeRatio;
      }

      for (const trace of rangedTracePool) {
        if (!trace.active) {
          continue;
        }

        trace.life = Math.max(0, trace.life - renderDeltaSeconds);
        if (trace.life <= 0) {
          trace.active = false;
          trace.root.visible = false;
          continue;
        }

        const lifeRatio = trace.life / trace.maxLife;
        trace.beamMaterial.opacity = 0.28 * lifeRatio;
        trace.coreMaterial.opacity = 0.58 * lifeRatio;
        trace.beam.scale.x = trace.baseWidth * (1 + (1 - lifeRatio) * 0.18);
        trace.core.scale.x = trace.baseWidth * 0.34 * (1 + (1 - lifeRatio) * 0.08);
        trace.root.position.y = 0.05 + (1 - lifeRatio) * 0.04;
      }

      for (const echo of dashEchoPool) {
        if (!echo.active) {
          continue;
        }

        echo.life = Math.max(0, echo.life - renderDeltaSeconds);
        if (echo.life <= 0) {
          echo.active = false;
          echo.root.visible = false;
          continue;
        }

        const lifeRatio = echo.life / echo.maxLife;
        echo.bodyMaterial.opacity = 0.18 * lifeRatio;
        echo.noseMaterial.opacity = 0.26 * lifeRatio;
        echo.bodyMaterial.emissiveIntensity = 0.8 + lifeRatio * 1.2;
        echo.noseMaterial.emissiveIntensity = 1.2 + lifeRatio * 1.4;
        echo.root.position.y = 0.02 + (1 - lifeRatio) * 0.12;
        echo.root.scale.setScalar(1 + (1 - lifeRatio) * 0.18);
      }

      renderer.render(scene, camera);
    },
    resize: () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getRenderPixelRatio());
      renderer.setSize(width, height);
    },
    dispose: () => {
      for (const view of enemyViews.values()) {
        disposeEnemyView(view);
      }
      for (const pool of Object.values(enemyViewPool)) {
        for (const view of pool) {
          disposeEnemyView(view);
        }
      }
      renderer.dispose();
    },
    setArenaChapter: (chapter) => {
      if (arenaChapter === chapter) {
        return;
      }

      arenaChapter = chapter;
      chapterPulse = 1;
    },
    setArenaDangerLevel: (dangerLevel) => {
      arenaDangerLevel = dangerLevel;
    },
    setArtilleryStrikes: (strikes) => {
      artilleryStrikeStates = strikes;
      ensureArtilleryStrikeViews(strikes.length);
    },
    setBossPulses: (pulses) => {
      bossPulseStates = pulses;
      ensureBossPulseViews(pulses.length);

      for (let index = pulses.length; index < bossPulseViews.length; index += 1) {
        bossPulseViews[index].mesh.visible = false;
      }
    },
    setArenaPurgeLanes: (purges) => {
      for (let index = 0; index < purgeLaneStates.length; index += 1) {
        purgeLaneStates[index] = undefined;
      }

      for (const purge of purges) {
        purgeLaneStates[purge.laneIndex] = purge;
      }
    },
    setAimPoint: (aimPoint) => {
      if (!aimPoint) {
        reticle.visible = false;
        return;
      }

      reticle.visible = true;
      reticle.position.set(aimPoint.x, 0.03, aimPoint.y);
    },
    setEnemies: (enemies) => {
      activeEnemyIds.clear();

      for (let index = 0; index < enemies.length; index += 1) {
        const enemy = enemies[index];
        activeEnemyIds.add(enemy.id);
        const view = ensureEnemyView(enemy.id, enemy.archetype);
        const mutationColor =
          enemy.mutation === "bulwark"
            ? "#9bf7ff"
            : enemy.mutation === "overclocked"
              ? "#ff8a4a"
              : enemy.mutation === "volatile"
                ? "#ff4fd8"
                : null;
        const mutationAccent =
          enemy.mutation === "bulwark"
            ? "#ffffff"
            : enemy.mutation === "overclocked"
              ? "#fff0cb"
              : enemy.mutation === "volatile"
                ? "#ffb84a"
                : null;
        const baseColor =
          enemy.mode === "exposed" && enemy.archetype === "overseer"
            ? "#fff0cb"
            :
          mutationColor ??
          (enemy.archetype === "charger"
            ? "#96ff47"
            : enemy.archetype === "sentry"
              ? "#ffb84a"
            : enemy.archetype === "artillery"
              ? "#ff648f"
            : enemy.archetype === "relay"
              ? "#72ffd5"
            : enemy.archetype === "overseer"
              ? enemy.phase > 1
                ? "#ffb84a"
                : "#9bf7ff"
              : "#ff4fd8");
        const accentColor =
          enemy.mode === "exposed"
            ? "#ff4fd8"
            :
          enemy.mode === "windup" ||
          enemy.mode === "dash" ||
          enemy.mode === "aim" ||
          enemy.mode === "fire"
            ? "#ffffff"
            : mutationAccent ??
              (enemy.archetype === "overseer"
                ? enemy.phase > 1
                  ? "#ff5b7f"
                  : "#31f5ff"
                : enemy.archetype === "relay"
                  ? "#fff0cb"
                : enemy.archetype === "artillery"
                  ? "#ffd2e5"
                : enemy.archetype === "sentry"
                  ? "#9bf7ff"
                  : enemy.archetype === "charger"
                    ? "#31f5ff"
                    : "#96ff47");
        const isAttackState =
          enemy.mode === "windup" ||
          enemy.mode === "aim" ||
          enemy.mode === "dash" ||
          enemy.mode === "fire";
        const baseScale =
          (enemy.archetype === "overseer"
            ? 1.18
            : enemy.archetype === "artillery"
              ? 1.06
            : enemy.archetype === "relay"
              ? 1.03
            : enemy.archetype === "sentry"
              ? 0.98
              : 1) * (enemy.isElite ? 1.06 : 1);
        const spawnScale = 0.68 + enemy.spawnRatio * 0.32;
        const spawnLift = (1 - enemy.spawnRatio) * 0.42;
        const exposedLift =
          enemy.mode === "exposed" ? 0.14 + Math.sin(sceneTime * 18) * 0.05 : 0;
        const exposedScalePulse =
          enemy.mode === "exposed" ? 1.08 + Math.sin(sceneTime * 18) * 0.04 : 1;

        view.root.visible = true;
        view.root.position.set(
          enemy.position.x,
          spawnLift + exposedLift,
          enemy.position.y
        );
        view.root.rotation.y = Math.atan2(enemy.facing.x, enemy.facing.y);
        view.root.rotation.z =
          enemy.archetype === "overseer"
            ? enemy.phase > 1 || enemy.mode === "exposed"
              ? Math.sin(sceneTime * (enemy.mode === "exposed" ? 7.5 : 3.2)) * 0.075
              : Math.sin(sceneTime * 1.8) * 0.025
            : 0;
        view.root.scale.setScalar(
          baseScale *
            spawnScale *
            exposedScalePulse *
            (enemy.mode === "dash" ? 1.08 : enemy.mode === "windup" ? 0.94 : 1)
        );

        view.bodyMaterial.color.set(
          enemy.damageFlash > 0.08 ? "#ffffff" : baseColor
        );
        view.bodyMaterial.emissive.set(
          enemy.damageFlash > 0.08 ? "#ffffff" : baseColor
        );
        view.bodyMaterial.emissiveIntensity =
          (enemy.mode === "exposed" ? 3 : 1.45 + (1 - enemy.healthRatio) * 0.9) +
          (1 - enemy.spawnRatio) * 0.6;

        view.accentMaterial.color.set(accentColor);
        view.accentMaterial.emissive.set(accentColor);
        view.accentMaterial.emissiveIntensity =
          (enemy.mode === "exposed"
            ? 3.2
            : enemy.mode === "windup" || enemy.mode === "dash"
              ? 2.4
              : 1.5) +
          (1 - enemy.spawnRatio) * 0.5;

        view.ringMaterial.color.set(accentColor);
        view.ringMaterial.emissive.set(accentColor);
        view.ringMaterial.emissiveIntensity =
          enemy.mode === "exposed"
            ? 3.5
            : enemy.mode === "dash" || enemy.mode === "fire"
            ? 2.8
            : enemy.mode === "windup" || enemy.mode === "aim"
              ? 2.1
              : 1.2;
        const avatarVisible = enemy.archetype !== "overseer";
        view.avatarDisc.visible = avatarVisible;
        if (avatarVisible) {
          if (view.avatarDisc.userData.avatarSeed !== enemy.id) {
            updateChannelAvatarGeometryUv(view.avatarDisc.geometry, enemy.id);
            view.avatarDisc.userData.avatarSeed = enemy.id;
          }
          view.avatarDisc.position.y =
            enemy.archetype === "charger"
              ? 1.02
              : enemy.archetype === "artillery"
                ? 1.12
              : enemy.archetype === "relay"
                ? 1.14
              : 1.08;
          view.avatarDisc.scale.setScalar(
            (enemy.archetype === "charger" ? 1.08 : 1.18) *
              (enemy.isElite ? 1.08 : 1) *
              (enemy.damageFlash > 0.08 ? 1.08 : 1)
          );
          view.avatarDisc.rotation.z =
            Math.sin(sceneTime * 0.9 + enemy.id * 0.33) * 0.09;
          view.avatarMaterial.opacity = 1;
        }
        view.attackBeacon.visible = isAttackState || enemy.mode === "exposed";
        if (view.attackBeacon.visible) {
          const attackPulse =
            0.78 + Math.sin(sceneTime * (enemy.mode === "fire" || enemy.mode === "dash" ? 18 : 10) + enemy.id) * 0.22;
          view.attackBeaconMaterial.color.set(accentColor);
          view.attackBeaconMaterial.opacity =
            (enemy.mode === "fire" || enemy.mode === "dash"
              ? 0.5
              : enemy.mode === "exposed"
                ? 0.44
                : 0.28) *
            attackPulse;
          view.attackBeacon.rotation.z +=
            GAME_CONFIG.fixedStepSeconds *
            (enemy.archetype === "charger"
              ? 5.4
              : enemy.archetype === "sentry"
                ? -3.2
                : enemy.archetype === "artillery"
                  ? 2.2
                  : enemy.archetype === "relay"
                    ? -2.6
                    : 3.8);
          view.attackBeacon.scale.setScalar(
            (enemy.archetype === "overseer" ? 1.36 : 1) *
              (enemy.mode === "fire" || enemy.mode === "dash" ? 1.18 : 1) *
              (0.92 + attackPulse * 0.16)
          );
        }
        const bossAuraActive =
          enemy.archetype === "overseer" &&
          (enemy.phase > 1 || enemy.mode === "exposed");
        view.supportAura.visible =
          enemy.archetype === "relay" || enemy.supported || bossAuraActive;
        if (view.supportAura.visible) {
          const supportColor =
            bossAuraActive
              ? enemy.mode === "exposed" ? "#ff4fd8" : "#ffb84a"
              : mutationAccent ??
                (enemy.archetype === "relay" ? "#72ffd5" : "#9bf7ff");
          const supportPulse =
            bossAuraActive
              ? enemy.mode === "exposed"
                ? 1
                : 0.62 + Math.sin(sceneTime * 5.8) * 0.28
            : enemy.archetype === "relay"
              ? enemy.supportPulseRatio
              : enemy.supported
                ? 0.8 + Math.sin(sceneTime * 9) * 0.2
                : 0;
          view.supportAuraMaterial.color.set(supportColor);
          view.supportAuraMaterial.opacity =
            bossAuraActive
              ? enemy.mode === "exposed"
                ? 0.22 + supportPulse * 0.08
                : 0.09 + supportPulse * 0.12
            : enemy.archetype === "relay"
              ? 0.06 + supportPulse * 0.18
              : 0.08 + supportPulse * 0.08;
          view.supportAura.scale.setScalar(
            bossAuraActive
              ? 1.28 + supportPulse * (enemy.mode === "exposed" ? 0.38 : 0.22)
            : enemy.archetype === "relay"
              ? 0.92 + supportPulse * 0.28 + (enemy.isElite ? 0.08 : 0)
              : 0.82 + supportPulse * 0.1
          );
          view.supportAura.rotation.z +=
            GAME_CONFIG.fixedStepSeconds *
            (bossAuraActive
              ? enemy.mode === "exposed" ? -3.4 : 2.4
              : enemy.archetype === "relay"
                ? 1.8
                : -1.2);
        }
        view.eliteHalo.visible = enemy.isElite;
        if (enemy.isElite) {
          view.eliteHaloMaterial.color.set(mutationAccent ?? "#ffd56e");
          view.eliteHaloMaterial.opacity =
            0.16 +
            (enemy.mode === "dash" || enemy.mode === "fire" ? 0.12 : 0) +
            (1 - enemy.healthRatio) * 0.1;
          view.eliteHalo.rotation.z +=
            GAME_CONFIG.fixedStepSeconds *
            (enemy.mutation === "overclocked"
              ? 2.8
              : enemy.mutation === "volatile"
                ? -2.2
                : 1.8);
          view.eliteHalo.scale.setScalar(
            1.02 +
            (enemy.mutation === "bulwark" ? 0.18 : 0.08) +
            (enemy.mode === "dash" || enemy.mode === "fire" ? 0.08 : 0)
          );
        }
        view.eliteSpikeMaterial.color.set(mutationAccent ?? "#ffd56e");
        view.eliteSpikeMaterial.opacity = enemy.isElite
          ? 0.24 +
            (isAttackState ? 0.16 : 0) +
            (enemy.mutation === "volatile" ? 0.08 : 0)
          : 0;
        for (let spikeIndex = 0; spikeIndex < view.eliteSpikes.length; spikeIndex += 1) {
          const spike = view.eliteSpikes[spikeIndex];
          spike.visible = enemy.isElite;
          if (!enemy.isElite) {
            continue;
          }

          const spikeAngle =
            (Math.PI * 2 * spikeIndex) / view.eliteSpikes.length +
            sceneTime *
              (enemy.mutation === "overclocked"
                ? 1.6
                : enemy.mutation === "volatile"
                  ? -1.2
                  : 0.7);
          const spikeRadius =
            enemy.archetype === "overseer"
              ? 1.1
              : enemy.mutation === "bulwark"
                ? 0.84
                : 0.72;
          const spikePulse =
            0.9 + Math.sin(sceneTime * 7 + spikeIndex * 1.2) * 0.1;
          spike.position.set(
            Math.cos(spikeAngle) * spikeRadius,
            enemy.archetype === "overseer" ? 0.22 : 0.08,
            Math.sin(spikeAngle) * spikeRadius
          );
          spike.rotation.y = -spikeAngle + Math.PI * 0.5;
          spike.scale.set(
            enemy.mutation === "bulwark" ? 1.18 : 1,
            1,
            (enemy.mutation === "overclocked" ? 1.22 : 1) * spikePulse
          );
        }

        const artilleryTargetDistance =
          enemy.archetype === "artillery"
            ? Math.hypot(
                enemy.lockTarget.x - enemy.position.x,
                enemy.lockTarget.y - enemy.position.y
              )
            : 0;
        const telegraphFamily =
          enemy.archetype === "artillery"
            ? "area"
            : enemy.archetype === "sentry"
              ? "line"
            : enemy.archetype === "charger"
              ? "charge"
            : enemy.archetype === "overseer"
              ? "boss"
              : "none";
        const telegraphLength =
          telegraphFamily === "boss"
            ? enemy.phase > 1
              ? 18.2
              : 16.5
            : telegraphFamily === "area"
              ? Math.max(2.4, artilleryTargetDistance)
            : telegraphFamily === "charge"
              ? enemy.isElite ? 6.3 : 5.4
            : telegraphFamily === "line"
              ? enemy.isElite ? 15.4 : 13.6
              : 0;
        const telegraphWidth =
          telegraphFamily === "boss"
            ? enemy.phase > 1 ? 1.55 : 1.3
            : telegraphFamily === "area"
              ? 0.44
            : telegraphFamily === "charge"
              ? enemy.isElite ? 1.05 : 0.9
            : telegraphFamily === "line"
              ? enemy.isElite ? 0.52 : 0.34
              : 0;
        const telegraphVisible =
          telegraphLength > 0 &&
          (
            enemy.mode === "windup" ||
            enemy.mode === "dash" ||
            enemy.mode === "aim" ||
            enemy.mode === "fire"
          );

        view.telegraph.root.visible = telegraphVisible;
        if (telegraphVisible) {
          const areaTelegraph = telegraphFamily === "area";
          const bossTelegraph = telegraphFamily === "boss";
          const chargeTelegraph = telegraphFamily === "charge";
          const lineTelegraph = telegraphFamily === "line";
          const telegraphColor =
            mutationAccent ??
            (enemy.archetype === "overseer"
              ? enemy.phase > 1
                ? "#ffb84a"
                : "#9bf7ff"
              : enemy.archetype === "artillery"
                ? "#ff648f"
              : enemy.archetype === "sentry"
                ? "#ffb84a"
              : enemy.archetype === "charger"
                ? "#96ff47"
                : "#ff5b7f");
          const telegraphIntensity =
            enemy.mode === "dash" || enemy.mode === "fire"
              ? 1
              : enemy.mode === "windup" || enemy.mode === "aim"
                ? 0.72
                : 0.55;
          const telegraphPulse =
            0.78 +
            Math.sin(
              sceneTime *
                (enemy.mode === "dash" || enemy.mode === "fire" ? 18 : 10) +
                enemy.id * 0.4
            ) *
              0.22;
          const finalLength =
            telegraphLength *
            (enemy.mode === "dash" || enemy.mode === "fire"
              ? bossTelegraph
                ? 1
                : 1.05
              : areaTelegraph
                ? 0.94
              : lineTelegraph
                ? 0.98
              : chargeTelegraph
                ? 0.9
                : 0.84);
          const finalWidth =
            telegraphWidth *
            (enemy.mode === "dash" || enemy.mode === "fire"
              ? bossTelegraph ? 1.06 : 1.02
              : lineTelegraph
                ? 0.72
              : areaTelegraph
                ? 0.7
              : chargeTelegraph
                ? 0.95
                : 0.82);
          const railOffset = Math.max(0.18, finalWidth * 0.45);
          const glowOpacity =
            areaTelegraph
              ? 0.055
              : lineTelegraph
                ? 0.05
              : bossTelegraph
                ? 0.16
                : 0.12;
          const coreWidth =
            lineTelegraph
              ? 0.026
              : areaTelegraph
                ? Math.max(0.03, finalWidth * 0.055)
              : bossTelegraph
                ? Math.max(0.07, finalWidth * 0.11)
                : Math.max(0.045, finalWidth * 0.08);
          const coreOpacity =
            lineTelegraph
              ? 0.82
              : areaTelegraph
                ? 0.34
              : bossTelegraph
                ? 0.64
                : 0.52;
          const railOpacity =
            lineTelegraph
              ? 0.14
              : areaTelegraph
                ? 0.12
              : bossTelegraph
                ? 0.32
                : 0.24;
          const impactBaseScale =
            areaTelegraph
              ? 1.45
              : bossTelegraph
                ? Math.max(0.78, finalWidth * 0.62)
              : chargeTelegraph
                ? Math.max(0.58, finalWidth * 0.72)
                : Math.max(0.42, finalWidth * 0.54);
          const impactOpacity =
            lineTelegraph
              ? 0
              : areaTelegraph
                ? 0.56
              : bossTelegraph
                ? 0.5
                : 0.42;

          view.telegraph.root.position.set(
            0,
            0.045,
            enemy.radius * 0.5
          );
          view.telegraph.glow.position.set(0, 0, finalLength * 0.48);
          view.telegraph.glow.scale.set(finalWidth, finalLength, 1);
          view.telegraph.glowMaterial.color.set(telegraphColor);
          view.telegraph.glowMaterial.opacity =
            glowOpacity * telegraphIntensity * telegraphPulse;

          view.telegraph.core.position.set(0, 0.003, finalLength * 0.5);
          view.telegraph.core.scale.set(coreWidth, finalLength, 1);
          view.telegraph.coreMaterial.color.set(telegraphColor);
          view.telegraph.coreMaterial.opacity =
            coreOpacity * telegraphIntensity + 0.14 * telegraphPulse;

          view.telegraph.leftRail.position.set(-railOffset, 0.002, finalLength * 0.5);
          view.telegraph.rightRail.position.set(railOffset, 0.002, finalLength * 0.5);
          view.telegraph.leftRail.scale.set(
            lineTelegraph ? 0.018 : bossTelegraph ? 0.046 : 0.035,
            finalLength * (lineTelegraph ? 0.96 : 0.74),
            1
          );
          view.telegraph.rightRail.scale.copy(view.telegraph.leftRail.scale);
          view.telegraph.railMaterial.color.set(telegraphColor);
          view.telegraph.railMaterial.opacity =
            railOpacity * telegraphIntensity + 0.1 * telegraphPulse;

          view.telegraph.impact.position.set(0, 0.006, finalLength);
          view.telegraph.impact.scale.setScalar(
            impactBaseScale * (1 + telegraphPulse * 0.08)
          );
          view.telegraph.impact.rotation.z += GAME_CONFIG.fixedStepSeconds * 1.6;
          view.telegraph.impactMaterial.color.set(telegraphColor);
          view.telegraph.impactMaterial.opacity =
            impactOpacity * telegraphIntensity +
            (lineTelegraph ? 0 : 0.12 * telegraphPulse);

          for (let index = 0; index < view.telegraph.chevrons.length; index += 1) {
            const chevron = view.telegraph.chevrons[index];
            chevron.visible = !lineTelegraph && !areaTelegraph;
            const ratio = (index + 1) / (view.telegraph.chevrons.length + 1);
            const wave =
              0.82 +
              Math.sin(sceneTime * (bossTelegraph ? 8 : 11) - index * 0.85) *
                0.18;
            chevron.position.set(0, 0.004, finalLength * ratio);
            chevron.scale.set(
              Math.max(0.24, finalWidth * (bossTelegraph ? 0.48 : 0.38)) *
                wave,
              Math.max(0.28, finalWidth * (bossTelegraph ? 0.58 : 0.48)) *
                wave,
              1
            );
          }
          view.telegraph.chevronMaterial.color.set(telegraphColor);
          view.telegraph.chevronMaterial.opacity =
            (bossTelegraph ? 0.34 : chargeTelegraph ? 0.26 : 0.08) *
              telegraphIntensity +
            0.09 * telegraphPulse;
        }
      }

      for (const [id, view] of enemyViews) {
        if (!activeEnemyIds.has(id)) {
          releaseEnemyView(id, view);
        }
      }
    },
    setPickups: (pickups) => {
      ensurePickupMeshes(pickups.length);

      for (let index = 0; index < pickupMeshes.length; index += 1) {
        const mesh = pickupMeshes[index];
        const pickup = pickups[index];
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (!pickup) {
          mesh.visible = false;
          continue;
        }

        mesh.visible = true;
        mesh.position.set(pickup.position.x, 0.28, pickup.position.y);
        mesh.rotation.y += pickup.kind === "rescue" ? 0.12 : 0.08;
        if (pickup.kind === "rescue") {
          const urgency = pickup.progress ?? 0;
          const blink = 0.7 + Math.sin(sceneTime * 10 + index * 0.8) * 0.3;
          const pulse =
            (pickup.boosted ? 1.18 : 1.04) +
            urgency * (pickup.boosted ? 0.3 : 0.22) +
            blink * 0.06;
          mesh.scale.setScalar(pulse);
          material.color.set(pickup.boosted ? "#d9fff3" : "#fff3c4");
          material.emissive.set(
            pickup.boosted
              ? "#72ffd5"
              : urgency > 0.7
                ? "#ff648f"
                : "#96ff47"
          );
          material.emissiveIntensity =
            (pickup.boosted ? 3.2 : 2.4) + urgency * 0.8;
        } else {
          mesh.scale.setScalar(1);
          material.color.set("#31f5ff");
          material.emissive.set("#31f5ff");
          material.emissiveIntensity = 2.2;
        }
      }
    },
    setPlayerPose: (position, facing) => {
      playerPosition.set(position.x, 0, position.y);
      playerRoot.position.copy(playerPosition);
      if (playerDestructionTime <= 0) {
        playerRoot.visible = true;
        playerHealthBarRoot.visible = true;
      }
      followTarget.set(position.x, 0, position.y);
      playerHeading = Math.atan2(facing.x, facing.y);
      playerRoot.rotation.y = playerHeading;
    },
    setPlayerVisuals: (visuals) => {
      playerVisuals = visuals;
    },
    setProjectiles: (projectiles) => {
      ensureProjectileMeshes(projectiles.length);
      const projectileBudgetRatio = Math.min(
        1,
        Math.max(0, (projectiles.length - 24) / 36)
      );

      for (let index = 0; index < projectileMeshes.length; index += 1) {
        const mesh = projectileMeshes[index];
        const projectile = projectiles[index];

        if (!projectile) {
          mesh.visible = false;
          continue;
        }

        const material = mesh.material as THREE.MeshStandardMaterial;
        const projectileColor =
          projectile.kind === "comet"
            ? "#ff8a4a"
            : projectile.kind === "drone"
              ? "#72ffd5"
              : projectile.kind === "satellite"
                ? "#ffb84a"
                : projectile.kind === "starburst"
                  ? "#ffffff"
                  : "#96ff47";
        mesh.visible = true;
        mesh.position.set(projectile.position.x, 0.24, projectile.position.y);
        mesh.userData.projectileScale =
          projectile.scale *
          (projectile.kind === "comet" ? 1 : 1 - projectileBudgetRatio * 0.24);
        material.color.set(projectileColor);
        material.emissive.set(projectileColor);
        material.emissiveIntensity =
          projectile.kind === "comet"
            ? 2.9
            : 2.1 - projectileBudgetRatio * 0.55;
      }
    },
    setReducedMotion: (enabled) => {
      reducedMotion = enabled;
      if (enabled) {
        cameraShake = Math.min(cameraShake, 0.03);
        chapterPulse = Math.min(chapterPulse, 0.22);
        collapsePulse = Math.min(collapsePulse, 0.3);
        ritualPulse = Math.min(ritualPulse, 0.25);
      }
    },
    setSpawnWarnings: (warnings) => {
      ensureSpawnWarningViews(warnings.length);

      for (let index = 0; index < spawnWarningViews.length; index += 1) {
        const view = spawnWarningViews[index];
        const warning = warnings[index];

        if (!warning) {
          view.mesh.visible = false;
          continue;
        }

        const baseScale =
          warning.archetype === "overseer"
            ? 1.85
            : warning.archetype === "artillery"
              ? 1.28
            : warning.archetype === "relay"
              ? 1.18
            : warning.archetype === "sentry"
              ? 1.12
            : warning.archetype === "charger"
              ? 1.25
              : 1;
        const progressPulse = 1 - warning.progress * 0.42;
        const warningColor =
          warning.mutation === "bulwark"
            ? "#9bf7ff"
            : warning.mutation === "overclocked"
              ? "#ffb84a"
              : warning.mutation === "volatile"
                ? "#ff4fd8"
                : warning.archetype === "overseer"
                  ? "#9bf7ff"
                  : warning.archetype === "artillery"
                    ? "#ff648f"
                  : warning.archetype === "relay"
                    ? "#72ffd5"
                  : warning.archetype === "sentry"
                    ? "#ffb84a"
                    : warning.archetype === "charger"
                      ? "#96ff47"
                      : "#ff4fd8";

        view.mesh.visible = true;
        view.mesh.position.set(warning.position.x, 0.04, warning.position.y);
        view.mesh.scale.setScalar(
          baseScale * progressPulse * (warning.isElite ? 1.16 : 1)
        );
        view.material.color.set(warningColor);
        view.material.opacity = 0.12 + warning.progress * 0.18;
      }
    },
    screenToGround: (clientX, clientY) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      const normalizedX = ((clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = -(((clientY - bounds.top) / bounds.height) * 2 - 1);

      pointerNdc.set(normalizedX, normalizedY);
      raycaster.setFromCamera(pointerNdc, camera);

      if (!raycaster.ray.intersectPlane(GROUND_PLANE, intersectionTarget)) {
        return null;
      }

      return {
        x: intersectionTarget.x,
        y: intersectionTarget.z
      };
    }
  };
}

function createEnemyView(
  archetype: EnemyLike["archetype"],
  channelAvatarAtlas: THREE.Texture
): EnemyView {
  const root = new THREE.Group();
  const bodyMaterial = createNeonMaterial(
    archetype === "charger"
      ? "#96ff47"
      : archetype === "sentry"
        ? "#ffb84a"
      : archetype === "artillery"
        ? "#ff648f"
      : archetype === "relay"
        ? "#72ffd5"
      : archetype === "overseer"
        ? "#9bf7ff"
        : "#ff4fd8",
    1.7
  );
  const accentMaterial = createNeonMaterial(
    archetype === "charger" || archetype === "overseer"
      ? "#31f5ff"
      : archetype === "relay"
        ? "#fff0cb"
      : archetype === "sentry"
        ? "#9bf7ff"
      : archetype === "artillery"
        ? "#ffd2e5"
      : "#96ff47",
    1.6
  );
  const ringMaterial = createNeonMaterial("#ffffff", 1.1);
  const avatarGeometry = new THREE.CircleGeometry(
    archetype === "overseer" ? 0.62 : 0.56,
    34
  );
  const avatarMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    depthWrite: false,
    map: channelAvatarAtlas,
    opacity: 0,
    side: THREE.DoubleSide,
    transparent: true
  });
  const avatarDisc = new THREE.Mesh(avatarGeometry, avatarMaterial);
  avatarDisc.rotation.x = -Math.PI / 2;
  avatarDisc.position.y = archetype === "overseer" ? 1.28 : 1.08;
  avatarDisc.visible = false;

  if (archetype === "charger") {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.52, 1.36),
      bodyMaterial
    );
    body.position.y = 0.38;
    root.add(body);

    const ramPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.4, 0.82, 6),
      accentMaterial
    );
    ramPlate.rotation.x = Math.PI / 2;
    ramPlate.position.set(0, 0.36, 0.98);
    root.add(ramPlate);

    const leftBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.26, 1.18),
      accentMaterial
    );
    leftBlade.position.set(-0.52, 0.34, 0.06);
    leftBlade.rotation.z = -0.22;
    root.add(leftBlade);

    const rightBlade = leftBlade.clone();
    rightBlade.position.x = 0.52;
    rightBlade.rotation.z = 0.22;
    root.add(rightBlade);

    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.34, 1.62),
      bodyMaterial
    );
    spine.position.set(0, 0.64, -0.06);
    root.add(spine);
  } else if (archetype === "sentry") {
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.52, 0.44, 6),
      bodyMaterial
    );
    core.position.y = 0.26;
    root.add(core);

    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      accentMaterial
    );
    lens.position.set(0, 0.38, 0.44);
    root.add(lens);

    const barrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.88),
      accentMaterial
    );
    barrel.position.set(-0.14, 0.28, 0.58);
    root.add(barrel);

    const barrelRight = barrel.clone();
    barrelRight.position.x = 0.14;
    root.add(barrelRight);

    const backFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.12, 0.22),
      bodyMaterial
    );
    backFin.position.set(0, 0.24, -0.04);
    root.add(backFin);

    const stabilizer = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.42, 0.72),
      accentMaterial
    );
    stabilizer.position.set(0, 0.42, -0.12);
    root.add(stabilizer);
  } else if (archetype === "artillery") {
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.54, 0.46, 6),
      bodyMaterial
    );
    core.position.y = 0.28;
    root.add(core);

    const chamber = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.24, 0.92),
      accentMaterial
    );
    chamber.position.set(0, 0.4, -0.06);
    root.add(chamber);

    const mortar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 1.06, 8),
      accentMaterial
    );
    mortar.rotation.x = Math.PI / 3.4;
    mortar.position.set(0, 0.54, 0.28);
    root.add(mortar);

    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.52, 0.16),
      bodyMaterial
    );
    leftLeg.position.set(-0.34, 0.18, -0.2);
    leftLeg.rotation.z = 0.22;
    root.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.34;
    rightLeg.rotation.z = -0.22;
    root.add(rightLeg);

    const rearBrace = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.12, 0.2),
      accentMaterial
    );
    rearBrace.position.set(0, 0.22, -0.42);
    root.add(rearBrace);
  } else if (archetype === "relay") {
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.5, 0.56, 6),
      bodyMaterial
    );
    core.position.y = 0.28;
    root.add(core);

    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      accentMaterial
    );
    lens.position.set(0, 0.46, 0.16);
    root.add(lens);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.08, 8, 24),
      accentMaterial
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.42;
    root.add(halo);

    for (let index = 0; index < 3; index += 1) {
      const brace = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.52, 0.18),
        bodyMaterial
      );
      const angle = (Math.PI * 2 * index) / 3;
      brace.position.set(Math.cos(angle) * 0.44, 0.28, Math.sin(angle) * 0.44);
      brace.rotation.z = Math.cos(angle) * 0.24;
      root.add(brace);
    }

    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.62, 0.72),
      accentMaterial
    );
    spine.position.set(0, 0.52, -0.06);
    root.add(spine);
  } else {
    const body = new THREE.Mesh(
      new THREE.OctahedronGeometry(archetype === "overseer" ? 0.82 : 0.66, 0),
      bodyMaterial
    );
    body.position.y = 0.48;
    root.add(body);

    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(archetype === "overseer" ? 1.68 : 1.18, 0.18, 0.28),
      accentMaterial
    );
    wing.position.set(0, 0.4, 0);
    root.add(wing);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(archetype === "overseer" ? 0.2 : 0.14, 12, 12),
      accentMaterial
    );
    eye.position.set(0, 0.42, archetype === "overseer" ? 0.64 : 0.52);
    root.add(eye);

    const rearFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, archetype === "overseer" ? 0.84 : 0.46, 0.8),
      accentMaterial
    );
    rearFin.position.set(0, archetype === "overseer" ? 0.7 : 0.52, -0.08);
    root.add(rearFin);

    if (archetype === "overseer") {
      const crown = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.09, 8, 24),
        accentMaterial
      );
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 1.04;
      root.add(crown);

      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.9, 1.8),
        bodyMaterial
      );
      spine.position.set(0, 0.52, 0);
      root.add(spine);

      for (let index = 0; index < 4; index += 1) {
        const pylon = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.68, 0.18),
          accentMaterial
        );
        const angle = (Math.PI / 2) * index + Math.PI / 4;
        pylon.position.set(Math.cos(angle) * 0.72, 0.78, Math.sin(angle) * 0.72);
        root.add(pylon);
      }
    } else {
      const sideFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.22, 0.72),
        accentMaterial
      );
      sideFin.position.set(-0.42, 0.38, 0.04);
      sideFin.rotation.z = -0.28;
      root.add(sideFin);

      const mirroredFin = sideFin.clone();
      mirroredFin.position.x = 0.42;
      mirroredFin.rotation.z = 0.28;
      root.add(mirroredFin);
    }
  }

  root.add(avatarDisc);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      archetype === "overseer" ? 0.92 : 0.6,
      archetype === "overseer" ? 0.09 : 0.06,
      8,
      24
    ),
    ringMaterial
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.06;
  root.add(ring);

  const eliteHaloMaterial = new THREE.MeshBasicMaterial({
    color: "#ffd56e",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const eliteHalo = new THREE.Mesh(
    new THREE.RingGeometry(
      archetype === "overseer" ? 0.98 : 0.72,
      archetype === "overseer" ? 1.18 : 0.9,
      28
    ),
    eliteHaloMaterial
  );
  eliteHalo.rotation.x = -Math.PI / 2;
  eliteHalo.position.y = 0.05;
  eliteHalo.visible = false;
  root.add(eliteHalo);

  const eliteSpikeMaterial = new THREE.MeshBasicMaterial({
    color: "#ffd56e",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const eliteSpikes = Array.from({ length: archetype === "overseer" ? 4 : 3 }, () => {
    const spike = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.05, archetype === "overseer" ? 0.64 : 0.44),
      eliteSpikeMaterial
    );
    spike.visible = false;
    root.add(spike);
    return spike;
  });

  const attackBeaconMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const attackBeacon = new THREE.Mesh(
    new THREE.RingGeometry(
      archetype === "overseer" ? 0.46 : 0.28,
      archetype === "overseer" ? 0.62 : 0.42,
      archetype === "charger" ? 3 : archetype === "sentry" ? 4 : 24
    ),
    attackBeaconMaterial
  );
  attackBeacon.rotation.x = Math.PI / 2;
  attackBeacon.position.y = archetype === "overseer" ? 1.26 : 0.82;
  attackBeacon.visible = false;
  root.add(attackBeacon);

  const supportAuraMaterial = new THREE.MeshBasicMaterial({
    color: archetype === "relay" ? "#72ffd5" : "#9bf7ff",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const supportAura = new THREE.Mesh(
    new THREE.RingGeometry(
      archetype === "relay" ? 0.84 : 0.58,
      archetype === "relay" ? 1.04 : 0.74,
      28
    ),
    supportAuraMaterial
  );
  supportAura.rotation.x = -Math.PI / 2;
  supportAura.position.y = 0.045;
  supportAura.visible = false;
  root.add(supportAura);

  const telegraph = createTelegraphView(root);

  return {
    accentMaterial,
    attackBeacon,
    attackBeaconMaterial,
    archetype,
    avatarDisc,
    avatarMaterial,
    bodyMaterial,
    eliteHalo,
    eliteHaloMaterial,
    eliteSpikeMaterial,
    eliteSpikes,
    ringMaterial,
    root,
    supportAura,
    supportAuraMaterial,
    telegraph
  };
}

function updateChannelAvatarGeometryUv(
  geometry: THREE.BufferGeometry,
  seed: number
): void {
  const avatarIndex = getChannelAvatarIndex(seed);
  const column = avatarIndex % CHANNEL_AVATAR_ATLAS_COLUMNS;
  const row = Math.floor(avatarIndex / CHANNEL_AVATAR_ATLAS_COLUMNS);
  const uvAttribute = geometry.getAttribute("uv");

  if (!(uvAttribute instanceof THREE.BufferAttribute)) {
    return;
  }

  const baseUvs =
    geometry.userData.baseAvatarUvs instanceof Float32Array
      ? geometry.userData.baseAvatarUvs
      : new Float32Array(uvAttribute.array as ArrayLike<number>);
  geometry.userData.baseAvatarUvs = baseUvs;

  const cellWidth = 1 / CHANNEL_AVATAR_ATLAS_COLUMNS;
  const cellHeight = 1 / CHANNEL_AVATAR_ATLAS_ROWS;
  const offsetX = column * cellWidth;
  const offsetY = 1 - (row + 1) * cellHeight;

  for (let index = 0; index < uvAttribute.count; index += 1) {
    uvAttribute.setXY(
      index,
      offsetX + baseUvs[index * 2] * cellWidth,
      offsetY + baseUvs[index * 2 + 1] * cellHeight
    );
  }

  uvAttribute.needsUpdate = true;
}

function createTelegraphView(parent: THREE.Group): TelegraphView {
  const root = new THREE.Group();
  root.visible = false;

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: "#ff5b7f",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMaterial);
  glow.rotation.x = -Math.PI / 2;
  root.add(glow);

  const coreMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), coreMaterial);
  core.rotation.x = -Math.PI / 2;
  root.add(core);

  const railMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const leftRail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), railMaterial);
  const rightRail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), railMaterial);
  leftRail.rotation.x = -Math.PI / 2;
  rightRail.rotation.x = -Math.PI / 2;
  root.add(leftRail, rightRail);

  const chevronMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const chevronGeometry = createChevronGeometry();
  const chevrons = Array.from({ length: 3 }, () => {
    const chevron = new THREE.Mesh(chevronGeometry, chevronMaterial);
    chevron.rotation.x = -Math.PI / 2;
    root.add(chevron);
    return chevron;
  });

  const impactMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const impact = new THREE.Mesh(new THREE.RingGeometry(0.54, 0.72, 28), impactMaterial);
  impact.rotation.x = -Math.PI / 2;
  root.add(impact);

  parent.add(root);

  return {
    chevronMaterial,
    chevrons,
    core,
    coreMaterial,
    glow,
    glowMaterial,
    impact,
    impactMaterial,
    leftRail,
    railMaterial,
    rightRail,
    root
  };
}

function createChevronGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.58);
  shape.lineTo(-0.5, -0.4);
  shape.lineTo(-0.18, -0.52);
  shape.lineTo(0, -0.12);
  shape.lineTo(0.18, -0.52);
  shape.lineTo(0.5, -0.4);
  shape.lineTo(0, 0.58);

  return new THREE.ShapeGeometry(shape);
}

function createEffectParticle(parent: THREE.Group): EffectParticle {
  const material = createNeonMaterial("#ffffff", 2.2);
  material.transparent = true;

  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.09, 0),
    material
  );
  mesh.visible = false;
  parent.add(mesh);

  return {
    active: false,
    life: 0,
    maxLife: 0,
    mesh,
    velocity: new THREE.Vector3()
  };
}

function createEnemyDeathShardPool(parent: THREE.Group): EnemyDeathShard[] {
  const geometries: THREE.BufferGeometry[] = [
    new THREE.BoxGeometry(1, 0.28, 0.46),
    new THREE.TetrahedronGeometry(0.42, 0),
    new THREE.OctahedronGeometry(0.36, 0),
    new THREE.ConeGeometry(0.32, 0.82, 5),
    new THREE.BoxGeometry(0.32, 0.18, 1)
  ];

  return Array.from({ length: 96 }, (_, index) => {
    const geometry = geometries[index % geometries.length];
    const material = createNeonMaterial("#ff4fd8", 2.1);
    material.transparent = true;
    material.opacity = 0;
    material.depthWrite = false;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    parent.add(mesh);

    return {
      active: false,
      angularVelocity: new THREE.Vector3(),
      life: 0,
      material,
      maxLife: 0,
      mesh,
      velocity: new THREE.Vector3()
    };
  });
}

function getEnemyDeathProfile(
  archetype: EnemyLike["archetype"],
  isElite: boolean
): {
  colors: string[];
  count: number;
  emissive: number;
  life: number;
  lift: number;
  opacity: number;
  scale: number;
  spawnLift: number;
  spawnRadius: number;
  speed: number;
  spin: number;
  stretch: { x: number; y: number; z: number };
} {
  const eliteMultiplier = isElite ? 1.28 : 1;

  switch (archetype) {
    case "charger":
      return {
        colors: ["#96ff47", "#31f5ff", "#ffffff"],
        count: Math.round(10 * eliteMultiplier),
        emissive: 2.7,
        life: 0.78,
        lift: 1.4,
        opacity: 0.95,
        scale: 0.2 * eliteMultiplier,
        spawnLift: 0.26,
        spawnRadius: 0.28,
        speed: 4.8,
        spin: 9.5,
        stretch: { x: 0.72, y: 0.42, z: 1.9 }
      };
    case "sentry":
      return {
        colors: ["#ffb84a", "#fff0cb", "#9bf7ff"],
        count: Math.round(11 * eliteMultiplier),
        emissive: 2.9,
        life: 0.86,
        lift: 1.15,
        opacity: 0.92,
        scale: 0.18 * eliteMultiplier,
        spawnLift: 0.22,
        spawnRadius: 0.24,
        speed: 3.9,
        spin: 11.5,
        stretch: { x: 0.34, y: 0.38, z: 2.35 }
      };
    case "artillery":
      return {
        colors: ["#ff648f", "#ff8a4a", "#ffd2e5"],
        count: Math.round(15 * eliteMultiplier),
        emissive: 3.1,
        life: 1.08,
        lift: 1.85,
        opacity: 0.96,
        scale: 0.24 * eliteMultiplier,
        spawnLift: 0.34,
        spawnRadius: 0.34,
        speed: 5.2,
        spin: 8.2,
        stretch: { x: 1.22, y: 0.58, z: 1.22 }
      };
    case "relay":
      return {
        colors: ["#72ffd5", "#fff0cb", "#31f5ff"],
        count: Math.round(13 * eliteMultiplier),
        emissive: 2.8,
        life: 1,
        lift: 1.55,
        opacity: 0.9,
        scale: 0.2 * eliteMultiplier,
        spawnLift: 0.32,
        spawnRadius: 0.3,
        speed: 3.6,
        spin: 7.8,
        stretch: { x: 1.5, y: 0.34, z: 1.5 }
      };
    case "overseer":
      return {
        colors: ["#ffffff", "#ffb84a", "#ff4fd8", "#31f5ff"],
        count: Math.round(26 * eliteMultiplier),
        emissive: 3.5,
        life: 1.35,
        lift: 2.25,
        opacity: 1,
        scale: 0.34 * eliteMultiplier,
        spawnLift: 0.46,
        spawnRadius: 0.62,
        speed: 6.2,
        spin: 8.6,
        stretch: { x: 1.42, y: 0.7, z: 1.42 }
      };
    case "drone":
    default:
      return {
        colors: ["#ff4fd8", "#96ff47", "#31f5ff"],
        count: Math.round(8 * eliteMultiplier),
        emissive: 2.5,
        life: 0.72,
        lift: 1.2,
        opacity: 0.9,
        scale: 0.16 * eliteMultiplier,
        spawnLift: 0.2,
        spawnRadius: 0.18,
        speed: 3.4,
        spin: 10.5,
        stretch: { x: 1, y: 0.52, z: 1 }
      };
  }
}

function createPlayerDebrisPool(parent: THREE.Group): PlayerDebris[] {
  const geometries: THREE.BufferGeometry[] = [
    new THREE.CylinderGeometry(0.34, 0.42, 0.2, 6),
    new THREE.BoxGeometry(0.7, 0.1, 0.24),
    new THREE.BoxGeometry(0.24, 0.16, 0.42),
    new THREE.BoxGeometry(0.24, 0.16, 0.42),
    new THREE.ConeGeometry(0.18, 0.42, 6),
    new THREE.TorusGeometry(0.34, 0.035, 8, 22),
    new THREE.IcosahedronGeometry(0.18, 0),
    new THREE.BoxGeometry(0.44, 0.12, 0.18),
    new THREE.BoxGeometry(0.44, 0.12, 0.18),
    new THREE.IcosahedronGeometry(0.12, 0)
  ];
  const colors = [
    "#31f5ff",
    "#96ff47",
    "#96ff47",
    "#96ff47",
    "#ffffff",
    "#ffb84a",
    "#fff0cb",
    "#31f5ff",
    "#31f5ff",
    "#ff5b7f"
  ];

  return geometries.map((geometry, index) => {
    const material = createNeonMaterial(colors[index] ?? "#31f5ff", 2.2);
    material.transparent = true;
    material.opacity = 0;
    material.depthWrite = false;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    parent.add(mesh);

    return {
      active: false,
      angularVelocity: new THREE.Vector3(),
      life: 0,
      material,
      maxLife: 0,
      mesh,
      velocity: new THREE.Vector3()
    };
  });
}

function createDashEchoView(parent: THREE.Group): DashEchoView {
  const root = new THREE.Group();
  root.visible = false;

  const bodyMaterial = createNeonMaterial("#31f5ff", 1.8);
  bodyMaterial.transparent = true;
  bodyMaterial.opacity = 0;
  bodyMaterial.depthWrite = false;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.72, 0.34, 6),
    bodyMaterial
  );
  body.position.y = 0.2;
  root.add(body);

  const noseMaterial = createNeonMaterial("#ffffff", 2.2);
  noseMaterial.transparent = true;
  noseMaterial.opacity = 0;
  noseMaterial.depthWrite = false;

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.52, 6),
    noseMaterial
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.22, 0.66);
  root.add(nose);

  parent.add(root);

  return {
    active: false,
    bodyMaterial,
    life: 0,
    maxLife: 0,
    noseMaterial,
    root
  };
}

function createRangedTraceView(parent: THREE.Group): RangedTraceView {
  const root = new THREE.Group();
  root.visible = false;

  const beamMaterial = new THREE.MeshBasicMaterial({
    color: "#ffb84a",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), beamMaterial);
  beam.rotation.x = -Math.PI / 2;
  root.add(beam);

  const coreMaterial = new THREE.MeshBasicMaterial({
    color: "#fff0cb",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), coreMaterial);
  core.rotation.x = -Math.PI / 2;
  root.add(core);

  parent.add(root);

  return {
    active: false,
    baseWidth: 0.4,
    beam,
    beamMaterial,
    core,
    coreMaterial,
    life: 0,
    maxLife: 0,
    root,
    span: 8
  };
}

function createArtilleryStrikeView(parent: THREE.Group): ArtilleryStrikeView {
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#ff648f",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 40), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  parent.add(ring);

  const fillMaterial = new THREE.MeshBasicMaterial({
    color: "#ff648f",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const fill = new THREE.Mesh(new THREE.CircleGeometry(0.92, 40), fillMaterial);
  fill.rotation.x = -Math.PI / 2;
  fill.visible = false;
  parent.add(fill);

  return {
    fill,
    fillMaterial,
    ring,
    ringMaterial
  };
}

function createGroundDecal(parent: THREE.Group): GroundDecal {
  const material = new THREE.MeshBasicMaterial({
    color: "#31f5ff",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = false;
  parent.add(mesh);

  return {
    active: false,
    angle: 0,
    baseOpacity: 0,
    baseScale: 1,
    growth: 0,
    life: 0,
    material,
    maxLife: 0,
    mesh,
    spin: 0
  };
}

function createArenaBreachCrack(
  parent: THREE.Group,
  index: number
): ArenaBreachCrack {
  const material = new THREE.MeshBasicMaterial({
    color: index % 2 === 0 ? "#ff4fd8" : "#ffb84a",
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = false;
  parent.add(mesh);

  return {
    angle:
      (Math.PI * 2 * index) / 7 +
      (index % 2 === 0 ? -0.08 : 0.12),
    length: 4.8 + index * 0.58,
    material,
    mesh,
    offset: 1.4 + index * 0.22,
    pulseOffset: index * 0.9,
    width: 0.18 + (index % 3) * 0.05
  };
}

function getEnemyEventColor(
  event: FrameEvent,
  channel: "accent" | "body"
): string {
  if (event.enemyMutation === "bulwark") {
    return channel === "accent" ? "#ffffff" : "#9bf7ff";
  }

  if (event.enemyMutation === "overclocked") {
    return channel === "accent" ? "#fff0cb" : "#ff8a4a";
  }

  if (event.enemyMutation === "volatile") {
    return channel === "accent" ? "#ffb84a" : "#ff4fd8";
  }

  switch (event.enemyArchetype) {
    case "charger":
      return channel === "accent" ? "#31f5ff" : "#96ff47";
    case "sentry":
      return channel === "accent" ? "#9bf7ff" : "#ffb84a";
    case "artillery":
      return channel === "accent" ? "#ffd2e5" : "#ff648f";
    case "relay":
      return channel === "accent" ? "#fff0cb" : "#72ffd5";
    case "overseer":
      return channel === "accent" ? "#31f5ff" : "#9bf7ff";
    case "drone":
    default:
      return channel === "accent" ? "#96ff47" : "#ff4fd8";
  }
}

function disposeEnemyView(view: EnemyView): void {
  view.root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();

      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          material.dispose();
        }
      } else {
        object.material.dispose();
      }
    }
  });
}
