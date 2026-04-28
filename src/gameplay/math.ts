export interface Vec2 {
  x: number;
  y: number;
}

export function add(left: Vec2, right: Vec2): Vec2 {
  return {
    x: left.x + right.x,
    y: left.y + right.y
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampLength(vector: Vec2, maxLength: number): Vec2 {
  const currentLength = length(vector);

  if (currentLength === 0 || currentLength <= maxLength) {
    return vector;
  }

  return scale(vector, maxLength / currentLength);
}

export function distance(left: Vec2, right: Vec2): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function distanceSquared(left: Vec2, right: Vec2): number {
  const x = left.x - right.x;
  const y = left.y - right.y;
  return x * x + y * y;
}

export function length(vector: Vec2): number {
  return Math.hypot(vector.x, vector.y);
}

export function lengthSquared(vector: Vec2): number {
  return vector.x * vector.x + vector.y * vector.y;
}

export function normalize(vector: Vec2): Vec2 {
  const magnitude = length(vector);

  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

export function normalizeOrZero(vector: Vec2): Vec2 {
  return lengthSquared(vector) > 0 ? normalize(vector) : { x: 0, y: 0 };
}

export function scale(vector: Vec2, scalar: number): Vec2 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar
  };
}

export function subtract(left: Vec2, right: Vec2): Vec2 {
  return {
    x: left.x - right.x,
    y: left.y - right.y
  };
}
