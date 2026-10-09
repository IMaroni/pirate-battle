import {
  Assets,
  TilingSprite,
  type Texture
} from 'pixi.js';
import { CONFIG_ARENA } from '../config/configArena';

export async function createWater(): Promise<TilingSprite> {
  const texture = await Assets.load<Texture>(
    '/assets/png/default/tiles/tile_73.png',
  );

  // Repete a textura até preencher toda a arena.
  const water = new TilingSprite({
    texture,
    width: CONFIG_ARENA.width,
    height: CONFIG_ARENA.height
  });

  return water;
}