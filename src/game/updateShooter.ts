import type {
  EnemyState,
  PlayerState,
  ProjectileState
} from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';

export function updateShooter(
  enemy: EnemyState,
  player: PlayerState,
  deltaSeconds: number
): ProjectileState | null {
  if (enemy.type !== 'shooter' || enemy.health <= 0) {
    return null;
  }
  const config = GAMEPLAY_CONFIG.shooter;
  enemy.shotCooldown = Math.max(
    0,
    enemy.shotCooldown - deltaSeconds,
  );

  if (enemy.shotCooldown > 0) {
    return null;
  }

  const differenceX = player.x - enemy.x;
  const differenceY = player.y - enemy.y;
  const distance = Math.hypot(differenceX, differenceY);

  if (distance > config.attackRange) {
    return null;
  }

  const targetRotation = Math.atan2(differenceX, -differenceY);
  const aimDifference = Math.atan2(
    Math.sin(targetRotation - enemy.rotation),
    Math.cos(targetRotation - enemy.rotation)
  );

  // Espera o navio apontar aproximadamente para o jogador.
  if (Math.abs(aimDifference) > config.aimTolerance) {
    return null;
  }

  const directionX = Math.sin(enemy.rotation);
  const directionY = -Math.cos(enemy.rotation);
  const spawnDistance =
    config.collisionRadius + config.projectileRadius + 2;
  enemy.shotCooldown = config.cooldown;

  return {
    x: enemy.x + directionX * spawnDistance,
    y: enemy.y + directionY * spawnDistance,
    speedX: directionX * config.projectileSpeed,
    speedY: directionY * config.projectileSpeed,
    radius: config.projectileRadius,
    shotDamage: config.shotDamage,
    remainingSeconds: config.projectileLifetime,
    owner: 'enemy'
  };
}