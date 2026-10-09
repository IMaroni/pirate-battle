export const GAMEPLAY_CONFIG = {
  player: {
    initialHealth: 100,
    moveSpeed: 180,
    rotationSpeed: 2.5,
    collisionRadius: 32,
    reverseMoveSpeed: 90
  },

  frontWeapon: {
    cooldown: 0.4,
    projectileSpeed: 360,
    projectileLifetime: 1.5,
    projectileRadius: 5,
    shotDamage: 20
  },
  
  sideArm: {
    cooldown: 0.9,
    projectileSpeed: 360,
    projectileLifetime: 1.5,
    projectileRadius: 5,
    shotDamage: 20,
    projectileSpacing: 16
  },

  chaser: {
    initialHealth: 60,
    moveSpeed: 100,
    rotationSpeed: 2,
    collisionRadius: 32,
    hitDamage: 25
  },
  spawn: {
    minimumPlayerDistance: 200,
    shooterEvery: 2
  },
  shooter: {
    moveSpeed: 80,
    rotationSpeed: 1.8,
    collisionRadius: 32,
    initialHealth: 60,
    attackRange: 300,
    cooldown: 1.2,
    projectileSpeed: 240,
    projectileLifetime: 2,
    projectileRadius: 5,
    shotDamage: 10,
    aimTolerance: 0.15
  },
  effects: {
    explosionDuration: 0.45,
    explosionSize: 72,
    shotDuration: 0.12,
    shotRadius: 9,
    impactDuration: 0.2,
    impactRadius: 12
  }
};



