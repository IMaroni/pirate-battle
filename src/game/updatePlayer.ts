import type { PlayerState } from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';
import { CONFIG_ARENA } from '../config/configArena';
import type { IslandState } from '../types/game';
import { hitsIsland } from './islandCollision';

export function updatePlayer(
  player: PlayerState,
  Keys: Set<string>,
  deltaSeconds: number,
  islands: IslandState[]
): void {
  const {
    moveSpeed,
    reverseMoveSpeed,
    rotationSpeed,
    collisionRadius
  } = GAMEPLAY_CONFIG.player;

  const turningLeft = Keys.has('KeyA') || Keys.has('ArrowLeft');
  const turningRight = Keys.has('KeyD') || Keys.has('ArrowRight');
  const movingForward = Keys.has('KeyW') || Keys.has('ArrowUp');
  const movingBackward = Keys.has('KeyS') || Keys.has('ArrowDown');

  if (turningLeft) {
    player.rotation -= rotationSpeed * deltaSeconds;
  }

  if (turningRight) {
    player.rotation += rotationSpeed * deltaSeconds;
  }
  // Avanço vale 1, ré vale -1. Se ambos estiverem pressionados, vale 0.
  const moveDirection = Number(movingForward) - Number(movingBackward);

  if (moveDirection === 0) {
    return;
  }

  const speed = moveDirection > 0 ? moveSpeed : reverseMoveSpeed;

  const move =
    speed * moveDirection * deltaSeconds;

  // A mesma direção do navio é usada nos dois sentidos.
  let nextX = player.x + Math.sin(player.rotation) * move;
  let nextY = player.y - Math.cos(player.rotation) * move;

  // Mantém o círculo do navio dentro da arena.
  nextX = Math.max(
    collisionRadius,
    Math.min(CONFIG_ARENA.width - collisionRadius, nextX),
  );

  nextY = Math.max(
    collisionRadius,
    Math.min(CONFIG_ARENA.height - collisionRadius, nextY),
  );

  // Bloqueia a posição pretendida se ela encostar em uma ilha.
  if (hitsIsland(nextX, nextY, collisionRadius, islands)) {
    return;
  }

  player.x = nextX;
  player.y = nextY;
}