import type {
  PlayerState,
  ProjectileState,
  ShotSide
} from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';

export function createSideProjectiles(
  player: PlayerState,
  side: ShotSide
): ProjectileState[] {
  const weapon = GAMEPLAY_CONFIG.sideArm;

  // Direção para a qual a frente do navio aponta.
  const forwardX = Math.sin(player.rotation);
  const forwardY = -Math.cos(player.rotation);

  // O sinal escolhe o lado direito ou esquerdo.
  const sideSign = side === 'right' ? 1 : -1;
  const directionX = Math.cos(player.rotation) * sideSign;
  const directionY = Math.sin(player.rotation) * sideSign;
  const spawnDistance =
    GAMEPLAY_CONFIG.player.collisionRadius +
    weapon.projectileRadius +
    2;

  const offsets = [
    -weapon.projectileSpacing,
    0,
    weapon.projectileSpacing
  ];

  return offsets.map((offset): ProjectileState => {
    return {
      x:
        player.x +
        directionX * spawnDistance +
        forwardX * offset,
      y:
        player.y +
        directionY * spawnDistance +
        forwardY * offset,

      // Os três tiros seguem a mesma direção, são paralelos.
      speedX: directionX * weapon.projectileSpeed,
      speedY: directionY * weapon.projectileSpeed,
      radius: weapon.projectileRadius,
      shotDamage: weapon.shotDamage,
      remainingSeconds: weapon.projectileLifetime,
      owner: 'player'
    };
  });
}