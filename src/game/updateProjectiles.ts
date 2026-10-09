import type {
  ProjectileState,
  IslandState,
} from '../types/game';
import { CONFIG_ARENA } from '../config/configArena';
import { hitsIsland } from './islandCollision';

export function updateProjectiles(
  projectiles: ProjectileState[],
  deltaSeconds: number,
  islands: IslandState[]
): ProjectileState[] {
  return projectiles.filter((projectile) => {
    projectile.remainingSeconds -= deltaSeconds;

    projectile.x += projectile.speedX * deltaSeconds;
    projectile.y += projectile.speedY * deltaSeconds;

    const outsideArena =
      projectile.x < projectile.radius ||
      projectile.x > CONFIG_ARENA.width - projectile.radius ||
      projectile.y < projectile.radius ||
      projectile.y > CONFIG_ARENA.height - projectile.radius;

    // Guarda o resultado da verificação: true ou false.
    const hitIsland = hitsIsland(
      projectile.x,
      projectile.y,
      projectile.radius,
      islands
    );

    // Mantém somente os tiros ativos que não atingiram uma ilha.
    return (
      projectile.remainingSeconds > 0 &&
      !outsideArena &&
      !hitIsland
    );
  });
}