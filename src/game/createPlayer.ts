import { Container, Sprite } from 'pixi.js';
import type { TextureFrames } from './loadGameAssets';

export function createPlayer(textures: TextureFrames): Container {
  const player = new Container();
  const ship = new Sprite(textures[0]);

  ship.anchor.set(0.5);

  const shipHeight = 54;
  ship.scale.set(shipHeight / textures[0].height);

  // Corrige a direção original da imagem.
  ship.rotation = Math.PI;

  player.addChild(ship);

  return player;
}