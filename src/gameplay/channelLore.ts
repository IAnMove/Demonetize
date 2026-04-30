const CHANNEL_NAME_PREFIXES = [
  "Pixel",
  "Cafe",
  "Neon",
  "Analog",
  "Barrio",
  "Manual",
  "Tiny",
  "Midnight",
  "Casero",
  "Pocket",
  "Solar",
  "Lo-Fi",
  "Afterwork",
  "Sunday",
  "Open Tab",
  "Human",
  "No Filter",
  "Late Upload",
  "Workbench",
  "Signal"
] as const;

const CHANNEL_NAME_TOPICS = [
  "Makers",
  "Cocina",
  "Repairs",
  "Sketchbook",
  "Cinema Club",
  "Arcade",
  "Garden",
  "Synth Lab",
  "Historia",
  "Tutoriales",
  "Garage",
  "Podcast",
  "Notebook",
  "Astronauta",
  "Critica",
  "Ceramics",
  "Modding",
  "Travel Log",
  "Code Room",
  "Mini Docs",
  "Merienda",
  "Retro Bits",
  "Voces",
  "Street Food"
] as const;

const CHANNEL_NAME_SUFFIXES = [
  "TV",
  "Live",
  "Studio",
  "Diario",
  "Club",
  "FM",
  "Now",
  "Archivo",
  "Lab",
  "Directo",
  "Room",
  "Express"
] as const;

export const CHANNEL_AVATAR_ATLAS_COLUMNS = 10;
export const CHANNEL_AVATAR_ATLAS_ROWS = 10;
export const CHANNEL_AVATAR_COUNT =
  CHANNEL_AVATAR_ATLAS_COLUMNS * CHANNEL_AVATAR_ATLAS_ROWS;

export function getChannelAvatarIndex(seed: number): number {
  return hashSeed(seed, 41) % CHANNEL_AVATAR_COUNT;
}

export function getChannelName(seed: number): string {
  const format = hashSeed(seed, 7) % 4;
  const prefix =
    CHANNEL_NAME_PREFIXES[hashSeed(seed, 11) % CHANNEL_NAME_PREFIXES.length];
  const topic =
    CHANNEL_NAME_TOPICS[hashSeed(seed, 17) % CHANNEL_NAME_TOPICS.length];
  const suffix =
    CHANNEL_NAME_SUFFIXES[hashSeed(seed, 23) % CHANNEL_NAME_SUFFIXES.length];

  switch (format) {
    case 1:
      return `${topic} ${suffix}`;
    case 2:
      return `${prefix} ${suffix}`;
    case 3:
      return `${prefix} ${topic} ${suffix}`;
    default:
      return `${prefix} ${topic}`;
  }
}

function hashSeed(seed: number, salt: number): number {
  let value = (seed | 0) ^ Math.imul(salt, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  value ^= value >>> 16;
  return value >>> 0;
}
