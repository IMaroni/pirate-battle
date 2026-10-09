import type {
  EnemyState,
  PlayerState
} from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';
import { CONFIG_ARENA } from '../config/configArena';
import type { IslandState } from '../types/game';
import { hitsIsland } from './islandCollision';

export function updateEnemy(
  enemy: EnemyState,
  player: PlayerState,
  deltaSeconds: number,
  islands: IslandState[]
): void {
  if (enemy.health <= 0) {
    return;
  }

  const config = GAMEPLAY_CONFIG[enemy.type];
  const differenceX = player.x - enemy.x;
  const differenceY = player.y - enemy.y;
  // Calcula a direção do jogador.
  const targetRotation = Math.atan2(differenceX, -differenceY);
  // Escolhe o caminho mais curto para girar a direção.
  const rotationDifference = Math.atan2(
    Math.sin(targetRotation - enemy.rotation),
    Math.cos(targetRotation - enemy.rotation),
  );
  const maximumTurn = config.rotationSpeed * deltaSeconds;
  enemy.rotation += Math.max(
    -maximumTurn,
    Math.min(maximumTurn, rotationDifference),
  );
  const distanceToPlayer = Math.hypot(differenceX, differenceY);
  const contactDistance =
    config.collisionRadius +
    GAMEPLAY_CONFIG.player.collisionRadius;
  const stopDistance =
    enemy.type === 'shooter'
      ? GAMEPLAY_CONFIG.shooter.attackRange * 0.8
      : contactDistance;
  
  if (distanceToPlayer <= stopDistance) {
    return;
  }

  let nextX =
    enemy.x +
    Math.sin(enemy.rotation) * config.moveSpeed * deltaSeconds;
  let nextY =
    enemy.y -
    Math.cos(enemy.rotation) * config.moveSpeed * deltaSeconds;
  nextX = Math.max(
    config.collisionRadius,
    Math.min(CONFIG_ARENA.width - config.collisionRadius, nextX)
  );
  nextY = Math.max(
    config.collisionRadius,
    Math.min(CONFIG_ARENA.height - config.collisionRadius, nextY)
  );
  
  if (hitsIsland(nextX, nextY, config.collisionRadius, islands)) {
    return;
  }

  enemy.x = nextX;
  enemy.y = nextY;
}