import { Container, Sprite } from 'pixi.js';
import type { TextureFrames } from './loadGameAssets';

export function updateShipSkin(
  container: Container,
  textures: TextureFrames,
  health: number,
  maximumHealth: number,
): void {
    const ship = container.children[0];
    const healthRatio = health / maximumHealth;
    if (!(ship instanceof Sprite)) {
      return;
    }
  
    if (healthRatio > 2 / 3) {
      ship.texture = textures[0];
    } else if (healthRatio > 1 / 3) {
      ship.texture = textures[1];
    } else {
      ship.texture = textures[2];
    }
}