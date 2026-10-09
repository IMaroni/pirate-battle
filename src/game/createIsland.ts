import {
  Assets,
  Container,
  Graphics,
  Sprite,
  type Texture
} from 'pixi.js';
import type { IslandState } from '../types/game';

export async function createIsland(islandState: IslandState): Promise<Container> {
  const [sandTexture, grassTexture, palmTexture, rockTexture,] = await Promise.all([
    Assets.load<Texture>('/assets/png/default/tiles/tile_18.png'),
    Assets.load<Texture>('/assets/png/default/tiles/tile_23.png'),
    Assets.load<Texture>('/assets/png/default/tiles/tile_71.png'),
    Assets.load<Texture>('/assets/png/default/tiles/tile_49.png')]);

  const island = new Container();
  const radius = islandState.radius;

  island.position.set(islandState.x, islandState.y);

  const sand = new Sprite(sandTexture);

  sand.anchor.set(0.5);
  sand.width = radius * 2;
  sand.height = radius * 2;

  const sandMask = new Graphics()
    .circle(0, 0, radius)
    .fill(0xffffff);

  island.addChild(sand, sandMask);
  sand.mask = sandMask;

  const grassRadius = radius - 18;
  const grass = new Sprite(grassTexture);

  grass.anchor.set(0.5);
  grass.width = grassRadius * 2;
  grass.height = grassRadius * 2;

  const grassMask = new Graphics()
    .circle(0, 0, grassRadius)
    .fill(0xffffff);

  island.addChild(grass, grassMask);
  grass.mask = grassMask;

  const palm = new Sprite(palmTexture);

  palm.anchor.set(0.5);

  const palmScale = 52 / Math.max(
    palmTexture.width,
    palmTexture.height,
  );

  palm.scale.set(palmScale);

  palm.position.set(-radius * 0.2, -radius * 0.15);
  island.addChild(palm);

  const smallPalm = new Sprite(palmTexture);

  smallPalm.anchor.set(0.5);
  smallPalm.scale.set(palmScale * 0.65);
  smallPalm.position.set(radius * 0.3, radius * 0.2);
  smallPalm.rotation = 0.5;

  island.addChild(smallPalm);

  const rock = new Sprite(rockTexture);

  rock.anchor.set(0.5);

  const rockScale = 26 / Math.max(
    rockTexture.width,
    rockTexture.height,
  );

  rock.scale.set(rockScale);
  rock.position.set(-radius * 0.3, radius * 0.3);

  island.addChild(rock);

  return island;
}