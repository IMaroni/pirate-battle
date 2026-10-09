import type {
  EnemyState,
  PlayerState
} from '../types/game';
import { CONFIG_ARENA } from '../config/configArena';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';
import type { IslandState } from '../types/game';
import { hitsIsland } from './islandCollision';

export function createEnemy(
  player: PlayerState,
  enemies: EnemyState[],
  spawnIndex: number,
  islands: IslandState[]
): EnemyState | null {
  // Escolhe os tipo antes de procurar uma posição segura.
  const type: EnemyState['type'] =
    (spawnIndex + 1) % GAMEPLAY_CONFIG.spawn.shooterEvery === 0
      ? 'shooter'
      : 'chaser';

  const config = GAMEPLAY_CONFIG[type];
  const margin = config.collisionRadius + 48;
  const right = CONFIG_ARENA.width - margin;
  const bottom = CONFIG_ARENA.height - margin;
  const spawnPoints = [
    { x: margin, y: margin },
    { x: right, y: margin },
    { x: right, y: bottom },
    { x: margin, y: bottom },
    { x: CONFIG_ARENA.width / 2, y: margin },
    { x: right, y: CONFIG_ARENA.height / 2 },
    { x: CONFIG_ARENA.width / 2, y: bottom },
    { x: margin, y: CONFIG_ARENA.height / 2 }
  ];

  // Alterna o primeiro ponto procurado a cada tentativa.
  for (let offset = 0; offset < spawnPoints.length; offset += 1) {
    const index = (spawnIndex + offset) % spawnPoints.length;
    const point = spawnPoints[index];

    if (!point) {
      continue;
    }

    const distanceToPlayer = Math.hypot(
      point.x - player.x,
      point.y - player.y
    );

    if (
      distanceToPlayer <
      GAMEPLAY_CONFIG.spawn.minimumPlayerDistance
    ) {
      continue;
    }

    // Procura outro ponto se este estiver ocupado por uma ilha.
    if (
      hitsIsland(point.x, point.y, config.collisionRadius, islands)) {
      continue;
    }

    const occupied = enemies.some((enemy) => {
      if (enemy.health <= 0) {
        return false;
      }

      const distance = Math.hypot(
        point.x - enemy.x,
        point.y - enemy.y
      );

      return distance <= config.collisionRadius * 2;
    });

    if (occupied) {
      continue;
    }

    return {
      x: point.x,
      y: point.y,
      rotation: Math.atan2(
        player.x - point.x,
        -(player.y - point.y)
      ),
      health: config.initialHealth,
      type,
      shotCooldown: config === GAMEPLAY_CONFIG.shooter
        ? GAMEPLAY_CONFIG.shooter.cooldown
        : 0
    };
  }

  // Se todos os pontos estiverem bloqueados, pula esta tentativa.
  return null;
}