import type {
  PlayerState,
  ProjectileState
} from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';

export function createPlayerProjectile(
  player: PlayerState,
): ProjectileState {
  const weapon = GAMEPLAY_CONFIG.frontWeapon;
  const directionX = Math.sin(player.rotation);
  const directionY = -Math.cos(player.rotation);
  const spawnDistance = GAMEPLAY_CONFIG.player.collisionRadius + weapon.projectileRadius + 2;

  return {
    x: player.x + directionX * spawnDistance,
    y: player.y + directionY * spawnDistance,
    speedX: directionX * weapon.projectileSpeed,
    speedY: directionY * weapon.projectileSpeed,
    radius: weapon.projectileRadius,
    shotDamage: weapon.shotDamage,
    remainingSeconds: weapon.projectileLifetime,
    owner: 'player'
  };
}