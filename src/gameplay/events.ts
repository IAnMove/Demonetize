import type { Vec2 } from "./math";

export type FrameEventType =
  | "shot-fired"
  | "dash"
  | "afterimage-trail"
  | "combo-surge"
  | "artillery-lock-start"
  | "artillery-impact"
  | "arc-chain"
  | "comet-bloom-fired"
  | "comet-bloom-impact"
  | "gravity-well"
  | "halo-drone-fired"
  | "nova-dash"
  | "projectile-ricochet"
  | "rail-pierce"
  | "satellite-lattice-fired"
  | "starburst-rounds"
  | "relay-boost-start"
  | "elite-spawned"
  | "elite-killed"
  | "elite-burst"
  | "enemy-fired"
  | "boss-core-exposed"
  | "boss-collapse-start"
  | "boss-phase-pulse-start"
  | "card-overcore-cast"
  | "card-purge-cast"
  | "card-repair-cast"
  | "arena-purge-start"
  | "arena-boundary-hit"
  | "enemy-spawned"
  | "enemy-hit"
  | "enemy-killed"
  | "boss-spawned"
  | "boss-phase-shift"
  | "boss-defeated"
  | "orb-collected"
  | "rescue-lost"
  | "rescue-saved"
  | "rescue-spawned"
  | "rescue-streak"
  | "player-hit"
  | "player-died"
  | "upgrade-ready"
  | "victory";

export interface FrameEvent {
  amount?: number;
  channelAvatarIndex?: number;
  channelName?: string;
  direction?: Vec2;
  enemyArchetype?: "drone" | "charger" | "sentry" | "artillery" | "relay" | "overseer";
  enemyMutation?: "bulwark" | "overclocked" | "volatile" | null;
  isElite?: boolean;
  position: Vec2;
  span?: number;
  traceKind?: "arc" | "artillery" | "comet" | "drone" | "overseer" | "satellite" | "sentry";
  type: FrameEventType;
}
