export const CONFIG = {
  canvas: {
    backgroundColor: "#111111"
  },

  player: {
    radius: 16,
    speed: 230,
    maxHealth: 100,
    color: "#4da3ff",
    fireRate: 0.14,
    magazineSize: 30,
    reloadTime: 1.2
  },

  bullet: {
    speed: 720,
    radius: 4,
    damage: 25,
    color: "#ffe066",
    maxLifetime: 1.5
  },

  zombie: {
    radius: 17,
    baseSpeed: 20,
    baseHealth: 60,
    damage: 10,
    attackCooldown: 0.8,
    color: "#63d471"
  },

  waves: {
    startDelay: 2,
    baseCount: 5,
    countPerWave: 2,
    spawnInterval: 0.8,
    healthPerWave: 8,
    speedPerWave: 2
  },

  controls: {
    joystickRadius: 55,
    joystickDeadZone: 8
  }
};