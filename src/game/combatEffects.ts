import { Graphics } from 'pixi.js';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';

type EffectType = 'shot' | 'impact';

export interface CombatEffect {
  graphic: Graphics;
  elapsedSeconds: number;
  durationSeconds: number;
}

export function createCombatEffect(
  type: EffectType,
  x: number,
  y: number
): CombatEffect {
  const config = GAMEPLAY_CONFIG.effects;

  const radius =
    type === 'shot' ? config.shotRadius : config.impactRadius;

  const durationSeconds =
    type === 'shot' ? config.shotDuration : config.impactDuration;

  const graphic = new Graphics()
    .circle(0, 0, radius)
    .fill({
      color: type === 'shot' ? 0xffe08a : 0xff8c42,
      alpha: 0.8
    });

  graphic.position.set(x, y);

  return {
    graphic,
    elapsedSeconds: 0,
    durationSeconds
  };
}

export function updateCombatEffects(
  effects: CombatEffect[],
  deltaSeconds: number
): CombatEffect[] {
  return effects.filter((effect) => {
    effect.elapsedSeconds += deltaSeconds;

    if (effect.elapsedSeconds >= effect.durationSeconds) {
      effect.graphic.destroy();
      return false;
    }

    const progress =
      effect.elapsedSeconds / effect.durationSeconds;

    // Expande e apaga o efeito gradualmente.
    effect.graphic.scale.set(1 + progress * 0.7);
    effect.graphic.alpha = 1 - progress;

    return true;
  });
}