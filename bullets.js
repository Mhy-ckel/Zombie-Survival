import { CONFIG } from "./config.js";
import { zombies } from "./zombie.js";

export const bullets = [];

export function resetBullets() {
  bullets.length = 0;
}

export function createBullet(bulletArray, x, y, angle) {
  bulletArray.push({
    x,
    y,
    vx: Math.cos(angle) * CONFIG.bullet.speed,
    vy: Math.sin(angle) * CONFIG.bullet.speed,
    radius: CONFIG.bullet.radius,
    damage: CONFIG.bullet.damage,
    lifetime: CONFIG.bullet.maxLifetime
  });
}

export function updateBullets(dt, gameState) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.lifetime -= dt;

    let removed = false;

    for (let j = zombies.length - 1; j >= 0; j--) {
      const zombie = zombies[j];
      const distance = Math.hypot(zombie.x - bullet.x, zombie.y - bullet.y);

      if (distance < zombie.radius + bullet.radius) {
        zombie.health -= bullet.damage;
        bullets.splice(i, 1);
        removed = true;
        break;
      }
    }

    if (removed) continue;

    const outside =
      bullet.x < -20 ||
      bullet.x > gameState.width + 20 ||
      bullet.y < -20 ||
      bullet.y > gameState.height + 20;

    if (outside || bullet.lifetime <= 0) {
      bullets.splice(i, 1);
    }
  }
}