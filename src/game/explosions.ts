import { Sprite } from 'pixi.js';
import type { TextureFrames } from './loadGameAssets';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';

export interface ExplosionEffect {
  sprite: Sprite;
  textures: TextureFrames;
  elapsedSeconds: number;
}

export function createExplosion(
  textures: TextureFrames,
  x: number,
  y: number
): ExplosionEffect {
  const sprite = new Sprite(textures[0]);

  sprite.anchor.set(0.5);
  sprite.position.set(x, y);

  const originalSize = Math.max(
    textures[0].width,
    textures[0].height
  );

  sprite.scale.set(
    GAMEPLAY_CONFIG.effects.explosionSize / originalSize,
  );

  return {
    sprite,
    textures,
    elapsedSeconds: 0
  };
}

export function updateExplosions(
  effects: ExplosionEffect[],
  deltaSeconds: number
): ExplosionEffect[] {
  const duration = GAMEPLAY_CONFIG.effects.explosionDuration;

  return effects.filter((effect) => {
    effect.elapsedSeconds += deltaSeconds;

    if (effect.elapsedSeconds >= duration) {
      effect.sprite.destroy();
      return false;
    }
    
    const progress = effect.elapsedSeconds / duration;
    // Troca as imagens conforme o efeito avança.
    const frameIndex: 0 | 1 | 2 =
      progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2;
    effect.sprite.texture = effect.textures[frameIndex];
    // Faz a explosão desaparecer gradualmente.
    effect.sprite.alpha = 1 - progress;

    return true;
  });
}