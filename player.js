import { CONFIG } from "./config.js";
import { input } from "./input.js";
import { createBullet } from "./bullets.js";

export const player = {
  x: 0,
  y: 0,
  radius: CONFIG.player.radius,
  speed: CONFIG.player.speed,
  health: CONFIG.player.maxHealth,
  angle: 0,
  ammo: CONFIG.player.magazineSize,
  reloading: false,
  reloadTimer: 0,
  fireTimer: 0,
  alive: true
};

export function resetPlayer(canvasWidth, canvasHeight) {
  player.x = canvasWidth / 2;
  player.y = canvasHeight / 2;
  player.health = CONFIG.player.maxHealth;
  player.ammo = CONFIG.player.magazineSize;
  player.reloading = false;
  player.reloadTimer = 0;
  player.fireTimer = 0;
  player.alive = true;
  player.angle = 0;
}

export function updatePlayer(dt, bullets, zombies, gameState) {
  if (!player.alive) return;

  player.x += input.moveX * player.speed * dt;
  player.y += input.moveY * player.speed * dt;

  player.x = Math.max(player.radius, Math.min(gameState.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(gameState.height - player.radius, player.y));

  if (input.aiming) {
    // Mouse aim: face the cursor
    player.angle = Math.atan2(input.aimY - player.y, input.aimX - player.x);
  } else if (input.moveX !== 0 || input.moveY !== 0) {
    // Touch/keyboard: face the move direction
    player.angle = Math.atan2(input.moveY, input.moveX);
  }

  if (player.reloading) {
    player.reloadTimer -= dt;

    if (player.reloadTimer <= 0) {
      player.reloading = false;
      player.ammo = CONFIG.player.magazineSize;
    }
  } else if (input.reloadRequested && player.ammo < CONFIG.player.magazineSize) {
    player.reloading = true;
    player.reloadTimer = CONFIG.player.reloadTime;
  }

  input.reloadRequested = false;

  player.fireTimer -= dt;

  if (input.firing && !player.reloading && player.ammo > 0 && player.fireTimer <= 0) {
    shoot(bullets);
    player.fireTimer = CONFIG.player.fireRate;
  }

  checkZombieDamage(zombies, gameState);
}

function shoot(bullets) {
  player.ammo--;

  createBullet(
    bullets,
    player.x + Math.cos(player.angle) * player.radius,
    player.y + Math.sin(player.angle) * player.radius,
    player.angle
  );

  if (player.ammo <= 0) {
    player.reloading = true;
    player.reloadTimer = CONFIG.player.reloadTime;
  }
}

function checkZombieDamage(zombies, gameState) {
  for (const zombie of zombies) {
    const dx = zombie.x - player.x;
    const dy = zombie.y - player.y;
    const distance = Math.hypot(dx, dy);
    const minDistance = zombie.radius + player.radius;

    if (distance < minDistance && zombie.attackTimer <= 0) {
      player.health -= zombie.damage;
      zombie.attackTimer = CONFIG.zombie.attackCooldown;

      if (player.health <= 0) {
        player.health = 0;
        player.alive = false;
        gameState.state = "gameOver";
      }
    }
  }
}