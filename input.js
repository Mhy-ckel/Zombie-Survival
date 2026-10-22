import { CONFIG } from "./config.js";

export const input = {
  moveX: 0,
  moveY: 0,
  firing: false,
  reloadRequested: false,
  pauseRequested: false,
  restartRequested: false,
  aiming: false, // true once the mouse has moved; false again on touch
  aimX: 0,
  aimY: 0
};

// Touch and keyboard each keep their own state; syncInput() merges them.
const touch = { moveX: 0, moveY: 0, firing: false };
const keys = new Set();
let mouseFiring = false;

function syncInput() {
  // Keyboard movement (normalized so diagonals aren't faster)
  let kx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
  let ky = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
  const len = Math.hypot(kx, ky);
  if (len > 0) {
    kx /= len;
    ky /= len;
  }

  // Joystick wins when it is being used, otherwise keyboard
  const touchActive = touch.moveX !== 0 || touch.moveY !== 0;
  input.moveX = touchActive ? touch.moveX : kx;
  input.moveY = touchActive ? touch.moveY : ky;
  input.firing = touch.firing || mouseFiring || keys.has("fire");
}

const joystickZone = document.getElementById("joystick-zone");
const joystickBase = document.getElementById("joystick-base");
const joystickKnob = document.getElementById("joystick-knob");
const fireButton = document.getElementById("fire-button");
const reloadButton = document.getElementById("reload-button");
const pauseButton = document.getElementById("pause-button");
const gameRoot = document.getElementById("game-root");

const JOYSTICK_RADIUS = CONFIG.controls.joystickRadius;
const DEAD_ZONE = CONFIG.controls.joystickDeadZone;

let joystickPointerId = null;
let centerX = 0;
let centerY = 0;

function getPoint(event, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function clampToJoystick(dx, dy) {
  const distance = Math.hypot(dx, dy);

  if (distance <= JOYSTICK_RADIUS) {
    return { x: dx, y: dy, distance };
  }

  const scale = JOYSTICK_RADIUS / distance;

  return {
    x: dx * scale,
    y: dy * scale,
    distance: JOYSTICK_RADIUS
  };
}

function updateJoystick(event) {
  const point = getPoint(event, joystickZone);
  const rawX = point.x - centerX;
  const rawY = point.y - centerY;
  const clamped = clampToJoystick(rawX, rawY);

  joystickKnob.style.transform =
    `translate(calc(-50% + ${clamped.x}px), calc(-50% + ${clamped.y}px))`;

  let axisX = clamped.x / JOYSTICK_RADIUS;
  let axisY = clamped.y / JOYSTICK_RADIUS;

  if (clamped.distance < DEAD_ZONE) {
    axisX = 0;
    axisY = 0;
  }

  touch.moveX = Math.max(-1, Math.min(1, axisX));
  touch.moveY = Math.max(-1, Math.min(1, axisY));
  syncInput();
}

function resetJoystick() {
  joystickPointerId = null;
  touch.moveX = 0;
  touch.moveY = 0;
  syncInput();
  joystickBase.style.display = "none";
  joystickKnob.style.transform = "translate(-50%, -50%)";
}

joystickZone.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return; // mouse is for firing, not the joystick
  event.preventDefault();

  if (joystickPointerId !== null) return;

  joystickPointerId = event.pointerId;
  const point = getPoint(event, joystickZone);

  centerX = point.x;
  centerY = point.y;

  joystickBase.style.left = `${centerX}px`;
  joystickBase.style.top = `${centerY}px`;
  joystickBase.style.display = "block";

  joystickZone.setPointerCapture(event.pointerId);
  updateJoystick(event);
});

joystickZone.addEventListener("pointermove", (event) => {
  if (event.pointerId !== joystickPointerId) return;

  event.preventDefault();
  updateJoystick(event);
});

function endJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;

  event.preventDefault();
  resetJoystick();
}

joystickZone.addEventListener("pointerup", endJoystick);
joystickZone.addEventListener("pointercancel", endJoystick);

fireButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  fireButton.setPointerCapture(event.pointerId);
  touch.firing = true;
  syncInput();
});

function stopFiring(event) {
  event.preventDefault();
  touch.firing = false;
  syncInput();
}

fireButton.addEventListener("pointerup", stopFiring);
fireButton.addEventListener("pointercancel", stopFiring);
fireButton.addEventListener("pointerleave", stopFiring);

reloadButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  input.reloadRequested = true;
});

pauseButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  input.pauseRequested = true;
});

function blockBrowserGesture(event) {
  event.preventDefault();
}

gameRoot.addEventListener("touchstart", blockBrowserGesture, { passive: false });
gameRoot.addEventListener("touchmove", blockBrowserGesture, { passive: false });
gameRoot.addEventListener("contextmenu", blockBrowserGesture);

// ---- Keyboard controls ----
// Move: WASD / Arrow keys   Fire: Space (hold)   Reload: R
// Pause/Resume: P or Esc    Restart (after death): Enter
const KEY_MAP = {
  KeyW: "up", ArrowUp: "up",
  KeyS: "down", ArrowDown: "down",
  KeyA: "left", ArrowLeft: "left",
  KeyD: "right", ArrowRight: "right",
  Space: "fire"
};

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const action = KEY_MAP[event.code];

  if (action) {
    event.preventDefault(); // stop arrows/space from scrolling or clicking buttons
    keys.add(action);
    syncInput();
    return;
  }

  if (event.repeat) return;

  if (event.code === "KeyR") {
    input.reloadRequested = true;
  } else if (event.code === "KeyP" || event.code === "Escape") {
    input.pauseRequested = true;
  } else if (event.code === "Enter") {
    input.restartRequested = true;
  }
});

window.addEventListener("keyup", (event) => {
  const action = KEY_MAP[event.code];
  if (!action) return;

  keys.delete(action);
  syncInput();
});

// ---- Mouse: move to aim ----
window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;

  input.aiming = true;
  input.aimX = event.clientX;
  input.aimY = event.clientY;
});

// Touching the screen switches back to move-direction facing
window.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    input.aiming = false;
  }
});

// ---- Mouse: hold left button to fire ----
window.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (event.target.closest("button")) return; // ignore pause/menu/on-screen buttons

  input.aiming = true;
  input.aimX = event.clientX;
  input.aimY = event.clientY;
  mouseFiring = true;
  syncInput();
});

window.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;

  mouseFiring = false;
  syncInput();
});

window.addEventListener("blur", () => {
  resetJoystick();
  touch.firing = false;
  mouseFiring = false;
  keys.clear();
  syncInput();
});