import { CONFIG } from "./config.js";
import { buildBackground, drawBackground } from "./background.js";
import { input } from "./input.js";
import { player, resetPlayer, updatePlayer } from "./player.js";
import { zombies, resetZombies, spawnZombie, updateZombies } from "./zombie.js";
import { bullets, resetBullets, updateBullets } from "./bullets.js";
import {
  updateHUD,
  showPauseMenu,
  hidePauseMenu,
  showGameOver,
  hideGameOver
} from "./ui.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const game_overRestartButton = document.getElementById("game-over-restart-button");

const gameState = {
  state: "playing",
  width: 0,
  height: 0,
  wave: 1,
  score: 0,
  zombiesToSpawn: 0,
  spawnTimer: 0,
  waveTimer: CONFIG.waves.startDelay
};

const portraitQuery = window.matchMedia("(orientation: portrait) and (pointer: coarse)");

function isPortraitTouch() {
  return portraitQuery.matches;
}

function lockLandscape() {
  try {
    const orientation = screen.orientation;
    if (!orientation || !orientation.lock) return;

    const root = document.documentElement;
    const enterFullscreen = root.requestFullscreen
      ? root.requestFullscreen()
      : Promise.resolve();

    Promise.resolve(enterFullscreen)
      .then(() => orientation.lock("landscape"))
      .catch(() => {});
  } catch (error) {
    // Not supported (for example iOS Safari). The rotate notice covers this.
  }
}

window.addEventListener("pointerdown", lockLandscape, { once: true });

function resizeCanvas() {
  gameState.width = window.innerWidth;
  gameState.height = window.innerHeight;

  canvas.width = gameState.width * window.devicePixelRatio;
  canvas.height = gameState.height * window.devicePixelRatio;

  canvas.style.width = `${gameState.width}px`;
  canvas.style.height = `${gameState.height}px`;

  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  buildBackground(gameState.width, gameState.height);
}

function startGame() {
  resizeCanvas();
  resetPlayer(gameState.width, gameState.height);
  resetZombies();
  resetBullets();

  gameState.state = "playing";
  gameState.wave = 1;
  gameState.score = 0;
  gameState.zombiesToSpawn = CONFIG.waves.baseCount;
  gameState.spawnTimer = 0;
  gameState.waveTimer = CONFIG.waves.startDelay;

  hidePauseMenu();
  hideGameOver();
}

function startNextWave() {
  gameState.wave++;
  gameState.zombiesToSpawn = CONFIG.waves.baseCount + (gameState.wave - 1) * CONFIG.waves.countPerWave;
  gameState.waveTimer = CONFIG.waves.startDelay;
}

function updateWave(dt) {
  if (gameState.zombiesToSpawn > 0) {
    gameState.spawnTimer -= dt;

    if (gameState.spawnTimer <= 0) {
      spawnZombie(gameState.width, gameState.height, gameState.wave);
      gameState.zombiesToSpawn--;
      gameState.spawnTimer = CONFIG.waves.spawnInterval;
    }
  } else if (zombies.length === 0) {
    gameState.waveTimer -= dt;

    if (gameState.waveTimer <= 0) {
      startNextWave();
    }
  }
}

function update(dt) {
  if (input.pauseRequested) {
    input.pauseRequested = false;

    if (gameState.state === "playing") {
      gameState.state = "paused";
      showPauseMenu();
    } else if (gameState.state === "paused") {
      // Keyboard P / Esc toggles pause
      gameState.state = "playing";
      hidePauseMenu();
    }
  }

  if (input.restartRequested) {
    input.restartRequested = false;

    if (gameState.state === "gameOver") {
      startGame();
      return;
    }
  }

  if (gameState.state !== "playing") return;
  if (isPortraitTouch()) return;

  updateWave(dt);
  updatePlayer(dt, bullets, zombies, gameState);
  updateZombies(dt, gameState);
  updateBullets(dt, gameState);
  updateHUD(player, gameState);

  if (gameState.state === "gameOver") {
    showGameOver(gameState.score);
  }
}

function render() {
  drawBackground(ctx, gameState.width, gameState.height, CONFIG.canvas.backgroundColor);

  drawPlayer();
  drawZombies();
  drawBullets();
}

function drawPlayer() {
  if (!player.alive) return;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  ctx.fillStyle = CONFIG.player.color;
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, -3, player.radius + 10, 6);

  ctx.restore();
}

function drawZombies() {
  for (const zombie of zombies) {
    ctx.fillStyle = CONFIG.zombie.color;
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
    ctx.fill();

    const healthPercent = Math.max(0, zombie.health / zombie.maxHealth);

    ctx.fillStyle = "#000";
    ctx.fillRect(zombie.x - 20, zombie.y - zombie.radius - 12, 40, 5);

    ctx.fillStyle = "#e63946";
    ctx.fillRect(zombie.x - 20, zombie.y - zombie.radius - 12, 40 * healthPercent, 5);
  }
}

function drawBullets() {
  ctx.fillStyle = CONFIG.bullet.color;

  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function gameLoop(timestamp) {
  const lastTime = gameLoop.lastTime || timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  gameLoop.lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

resumeButton.addEventListener("click", () => {
  gameState.state = "playing";
  hidePauseMenu();
});

restartButton.addEventListener("click", startGame);
game_overRestartButton.addEventListener("click", startGame);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

startGame();
requestAnimationFrame(gameLoop);