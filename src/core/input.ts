import type { Vec2 } from "../gameplay/math";

type AimResolver = (clientX: number, clientY: number) => Vec2 | null;

export interface InputSnapshot {
  aim: Vec2;
  dashPressed: boolean;
  move: Vec2;
  primaryHeld: boolean;
}

export interface InputController {
  clearTransientState: () => void;
  createSnapshot: (resolver: AimResolver, fallbackAim: Vec2) => InputSnapshot;
  dispose: () => void;
}

export function createInputController(target: HTMLDivElement): InputController {
  const pressedKeys = new Set<string>();
  let dashQueued = false;
  let primaryHeld = false;
  let pointerPosition = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5
  };

  const handlePointerMove = (event: MouseEvent): void => {
    pointerPosition = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const handleMouseDown = (event: MouseEvent): void => {
    handlePointerMove(event);
    if (event.button === 0) {
      primaryHeld = true;
    }

    if (event.button === 2) {
      dashQueued = true;
    }
  };

  const handleMouseUp = (event: MouseEvent): void => {
    handlePointerMove(event);
    if (event.button === 0) {
      primaryHeld = false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    pressedKeys.add(event.code);

    if (event.code === "Space") {
      event.preventDefault();
      dashQueued = true;
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    pressedKeys.delete(event.code);
  };

  const handleBlur = (): void => {
    pressedKeys.clear();
    primaryHeld = false;
    dashQueued = false;
  };

  const handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);
  target.addEventListener("contextmenu", handleContextMenu);

  return {
    clearTransientState: () => {
      dashQueued = false;
      primaryHeld = false;
    },
    createSnapshot: (resolver, fallbackAim) => {
      const move = {
        x: (pressedKeys.has("KeyD") ? 1 : 0) - (pressedKeys.has("KeyA") ? 1 : 0),
        y: (pressedKeys.has("KeyS") ? 1 : 0) - (pressedKeys.has("KeyW") ? 1 : 0)
      };
      const resolvedAim =
        resolver(pointerPosition.x, pointerPosition.y) ?? fallbackAim;
      const dashPressed = dashQueued;
      dashQueued = false;

      return {
        aim: resolvedAim,
        dashPressed,
        move,
        primaryHeld
      };
    },
    dispose: () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      target.removeEventListener("contextmenu", handleContextMenu);
    }
  };
}
