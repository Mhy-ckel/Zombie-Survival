import { CONFIG } from "./config.js";
import { player } from "./player.js";

export const zombies = [];

export function resetZombies() {
  zombies.length = 0;
}

export function spawnZombie(canvasWidth, canvasHeight, wave) {
  const side = Math.floor(Math.random() * 4);
  const margin = 40;

  let x;
  let y;

  if (side === 0) {
    x = Math.random() * canvasWidth;
    y = -margin;
  } else if (side === 1) {
    x = canvasWidth + margin;
    y = Math.random() * canvasHeight;
  } else if (side === 2) {
    x = Math.random() * canvasWidth;
    y = canvasHeight + margin;
  } else {
    x = -margin;
    y = Math.random() * canvasHeight;
  }

  zombies.push({
    x,
    y,
    radius: CONFIG.zombie.radius,
    health: CONFIG.zombie.baseHealth + (wave - 1) * CONFIG.waves.healthPerWave,
    maxHealth: CONFIG.zombie.baseHealth + (wave - 1) * CONFIG.waves.healthPerWave,
    speed: CONFIG.zombie.baseSpeed + (wave - 1) * CONFIG.waves.speedPerWave,
    damage: CONFIG.zombie.damage,
    attackTimer: 0
  });
}

export function updateZombies(dt, gameState) {
  for (let i = zombies.length - 1; i >= 0; i--) {
    const zombie = zombies[i];

    const dx = player.x - zombie.x;
    const dy = player.y - zombie.y;
    const distance = Math.hypot(dx, dy) || 1;

    zombie.x += (dx / distance) * zombie.speed * dt;
    zombie.y += (dy / distance) * zombie.speed * dt;

    zombie.attackTimer -= dt;

    if (zombie.health <= 0) {
      zombies.splice(i, 1);
      gameState.score += 10;
    }
  }
}