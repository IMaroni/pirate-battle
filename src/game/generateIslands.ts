import { CONFIG_ARENA } from '../config/configArena';
import type { IslandState } from '../types/game';

export function generateIslands(
  seed: number = Date.now()
): IslandState[] {
  let randomState = seed >>> 0;

  function random(): number {
    // A mesma semente produz as mesmas posições.
    randomState = (
      Math.imul(randomState, 1664525) + 1013904223
    ) >>> 0;

    return randomState / 4294967296;
  }

  const variation = CONFIG_ARENA.islandPositionVariation;

  return CONFIG_ARENA.islandAreas.map((area) => ({
    x: area.x + (random() * 2 - 1) * variation,
    y: area.y + (random() * 2 - 1) * variation,
    radius: area.radius
  }));
}