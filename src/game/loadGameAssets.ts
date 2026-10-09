import { Assets, type Texture } from 'pixi.js';

// Cada conjunto tem exatamente três imagens.
export type TextureFrames = [Texture, Texture, Texture];

export interface ShipTextures {
  player: TextureFrames;
  chaser: TextureFrames;
  shooter: TextureFrames;
  explosion: TextureFrames;
}

async function loadShipFrames(
  healthy: number,
  damaged: number,
  critical: number
): Promise<TextureFrames> {
  const path = '/assets/png/default/ships';

  return Promise.all([
    Assets.load<Texture>(`${path}/ship_${healthy}.png`),
    Assets.load<Texture>(`${path}/ship_${damaged}.png`),
    Assets.load<Texture>(`${path}/ship_${critical}.png`)
  ]);
}

export async function loadGameAssets(): Promise<ShipTextures> {
  const effectsPath = '/assets/png/default/effects';

 const [player, chaser, shooter, explosion] = await Promise.all([
    loadShipFrames(5, 11, 17),
    loadShipFrames(2, 8, 14),
    loadShipFrames(3, 9, 15),
  
    Promise.all([
      Assets.load<Texture>(`${effectsPath}/explosion_1.png`),
      Assets.load<Texture>(`${effectsPath}/explosion_2.png`),
      Assets.load<Texture>(`${effectsPath}/explosion_3.png`)
    ]),
  ]);

  return {
    player,
    chaser,
    shooter,
    explosion,
  };
}