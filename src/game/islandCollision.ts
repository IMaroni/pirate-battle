import type { IslandState } from '../types/game';

export function hitsIsland(
  x: number,
  y: number,
  radius: number,
  islands: IslandState[],
): boolean {
  return islands.some((island) => {
    const distance = Math.hypot(
      x - island.x,
      y - island.y,
    );

    return distance <= radius + island.radius;
  });
}