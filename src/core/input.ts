import type { Vec2 } from "../gameplay/math";

type AimResolver = (clientX: number, clientY: number) => Vec2 | null;

type TouchPointer = {
  currentX: number;
  currentY: number;
  id: number;
};

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
  setTouchControlsVisible: (visible: boolean) => void;
}

const TOUCH_STICK_RADIUS = 54;

export function createInputController(target: HTMLDivElement): InputController {
  const pressedKeys = new Set<string>();
  let dashQueued = false;
  let mousePrimaryHeld = false;
  let pointerPosition = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5
  };
  let touchControlsVisible = false;
  let moveTouch: TouchPointer | null = null;
  let aimTouch: TouchPointer | null = null;
  let dashTouchId: number | null = null;

  const touchControls = document.createElement("div");
  touchControls.className = "mobile-controls";
  touchControls.setAttribute("aria-hidden", "true");

  const movePad = document.createElement("div");
  movePad.className = "mobile-stick";

  const moveKnob = document.createElement("span");
  moveKnob.className = "mobile-stick-knob";
  movePad.appendChild(moveKnob);

  const aimPad = document.createElement("div");
  aimPad.className = "mobile-aim-pad";

  const aimKnob = document.createElement("span");
  aimKnob.className = "mobile-aim-knob";
  aimPad.appendChild(aimKnob);

  const dashButton = document.createElement("button");
  dashButton.className = "mobile-dash-button";
  dashButton.type = "button";
  dashButton.textContent = "Dash";
  dashButton.setAttribute("aria-label", "Dash");

  touchControls.append(movePad, dashButton, aimPad);
  target.appendChild(touchControls);

  const handlePointerMove = (event: MouseEvent): void => {
    pointerPosition = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const handleMouseDown = (event: MouseEvent): void => {
    handlePointerMove(event);
    if (event.button === 0) {
      mousePrimaryHeld = true;
    }

    if (event.button === 2) {
      dashQueued = true;
    }
  };

  const handleMouseUp = (event: MouseEvent): void => {
    handlePointerMove(event);
    if (event.button === 0) {
      mousePrimaryHeld = false;
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
    mousePrimaryHeld = false;
    dashQueued = false;
    clearTouchState();
  };

  const handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  const getPadVector = (
    pointer: TouchPointer | null,
    pad: HTMLElement
  ): Vec2 => {
    if (!pointer) {
      return { x: 0, y: 0 };
    }

    const bounds = pad.getBoundingClientRect();
    const centerX = bounds.left + bounds.width * 0.5;
    const centerY = bounds.top + bounds.height * 0.5;
    const deltaX = pointer.currentX - centerX;
    const deltaY = pointer.currentY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const ratio =
      distance > TOUCH_STICK_RADIUS && distance > 0
        ? TOUCH_STICK_RADIUS / distance
        : 1;

    return {
      x: deltaX * ratio,
      y: deltaY * ratio
    };
  };

  const updateTouchVisuals = (): void => {
    const moveVector = getPadVector(moveTouch, movePad);
    movePad.classList.toggle("is-active", Boolean(moveTouch));
    movePad.style.setProperty("--stick-x", `${moveVector.x}px`);
    movePad.style.setProperty("--stick-y", `${moveVector.y}px`);

    const aimVector = getPadVector(aimTouch, aimPad);
    aimPad.classList.toggle("is-active", Boolean(aimTouch));
    aimPad.style.setProperty("--aim-x", `${aimVector.x}px`);
    aimPad.style.setProperty("--aim-y", `${aimVector.y}px`);
  };

  function clearTouchState(): void {
    moveTouch = null;
    aimTouch = null;
    dashTouchId = null;
    dashButton.classList.remove("is-active");
    updateTouchVisuals();
  }

  const capturePointer = (event: PointerEvent): void => {
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail if the browser has already cancelled the touch.
    }
  };

  const isTouchPointer = (event: PointerEvent): boolean =>
    event.pointerType !== "mouse";

  const shouldIgnoreTouchTarget = (event: PointerEvent): boolean => {
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) {
      return false;
    }

    return Boolean(
      eventTarget.closest(
        "button, a, input, select, textarea, .action-card, .screen-panel"
      )
    );
  };

  const handleTouchPointerDown = (event: PointerEvent): void => {
    if (
      !touchControlsVisible ||
      !isTouchPointer(event) ||
      event.button !== 0 ||
      shouldIgnoreTouchTarget(event)
    ) {
      return;
    }

    event.preventDefault();
    capturePointer(event);

    const touch = {
      currentX: event.clientX,
      currentY: event.clientY,
      id: event.pointerId
    };

    if (event.clientX < window.innerWidth * 0.5 && !moveTouch) {
      moveTouch = touch;
      updateTouchVisuals();
      return;
    }

    if (!aimTouch) {
      aimTouch = touch;
      pointerPosition = {
        x: event.clientX,
        y: event.clientY
      };
      updateTouchVisuals();
    }
  };

  const handleTouchPointerMove = (event: PointerEvent): void => {
    if (!isTouchPointer(event)) {
      return;
    }

    if (moveTouch?.id === event.pointerId) {
      event.preventDefault();
      moveTouch = {
        currentX: event.clientX,
        currentY: event.clientY,
        id: event.pointerId
      };
      updateTouchVisuals();
      return;
    }

    if (aimTouch?.id === event.pointerId) {
      event.preventDefault();
      aimTouch = {
        currentX: event.clientX,
        currentY: event.clientY,
        id: event.pointerId
      };
      pointerPosition = {
        x: event.clientX,
        y: event.clientY
      };
      updateTouchVisuals();
    }
  };

  const handleTouchPointerUp = (event: PointerEvent): void => {
    let changed = false;

    if (moveTouch?.id === event.pointerId) {
      moveTouch = null;
      changed = true;
    }

    if (aimTouch?.id === event.pointerId) {
      aimTouch = null;
      changed = true;
    }

    if (dashTouchId === event.pointerId) {
      dashTouchId = null;
      dashButton.classList.remove("is-active");
    }

    if (changed) {
      event.preventDefault();
      updateTouchVisuals();
    }
  };

  const handleDashPointerDown = (event: PointerEvent): void => {
    if (!touchControlsVisible || !isTouchPointer(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dashQueued = true;
    dashTouchId = event.pointerId;
    dashButton.classList.add("is-active");
    try {
      dashButton.setPointerCapture(event.pointerId);
    } catch {
      // The button may lose capture if the OS interrupts the gesture.
    }
  };

  const handleDashPointerUp = (event: PointerEvent): void => {
    if (dashTouchId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dashTouchId = null;
    dashButton.classList.remove("is-active");
  };

  const getTouchMove = (): Vec2 => {
    const vector = getPadVector(moveTouch, movePad);

    return {
      x: vector.x / TOUCH_STICK_RADIUS,
      y: vector.y / TOUCH_STICK_RADIUS
    };
  };

  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);
  target.addEventListener("contextmenu", handleContextMenu);
  target.addEventListener("pointerdown", handleTouchPointerDown);
  target.addEventListener("pointermove", handleTouchPointerMove);
  target.addEventListener("pointerup", handleTouchPointerUp);
  target.addEventListener("pointercancel", handleTouchPointerUp);
  dashButton.addEventListener("pointerdown", handleDashPointerDown);
  dashButton.addEventListener("pointerup", handleDashPointerUp);
  dashButton.addEventListener("pointercancel", handleDashPointerUp);

  return {
    clearTransientState: () => {
      dashQueued = false;
      mousePrimaryHeld = false;
      clearTouchState();
    },
    createSnapshot: (resolver, fallbackAim) => {
      const keyboardMove = {
        x: (pressedKeys.has("KeyD") ? 1 : 0) - (pressedKeys.has("KeyA") ? 1 : 0),
        y: (pressedKeys.has("KeyS") ? 1 : 0) - (pressedKeys.has("KeyW") ? 1 : 0)
      };
      const touchMove = getTouchMove();
      const move = {
        x: keyboardMove.x + touchMove.x,
        y: keyboardMove.y + touchMove.y
      };
      const resolvedAim =
        resolver(pointerPosition.x, pointerPosition.y) ?? fallbackAim;
      const dashPressed = dashQueued;
      dashQueued = false;

      return {
        aim: resolvedAim,
        dashPressed,
        move,
        primaryHeld: mousePrimaryHeld || Boolean(aimTouch)
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
      target.removeEventListener("pointerdown", handleTouchPointerDown);
      target.removeEventListener("pointermove", handleTouchPointerMove);
      target.removeEventListener("pointerup", handleTouchPointerUp);
      target.removeEventListener("pointercancel", handleTouchPointerUp);
      dashButton.removeEventListener("pointerdown", handleDashPointerDown);
      dashButton.removeEventListener("pointerup", handleDashPointerUp);
      dashButton.removeEventListener("pointercancel", handleDashPointerUp);
      touchControls.remove();
    },
    setTouchControlsVisible: (visible) => {
      touchControlsVisible = visible;
      touchControls.classList.toggle("is-visible", visible);
      if (!visible) {
        clearTouchState();
      }
    }
  };
}
