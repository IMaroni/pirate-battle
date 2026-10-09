import type { GameSettings } from '../types/game';

const STORAGE_KEY = 'pirate-battle-settings';

export const SETTINGS_LIMITS = {
  minSessionDuration: 60,
  maxSessionDuration: 180,
  minSpawnInterval: 1,
  maxSpawnInterval: 10
}

export const DEFAULT_SETTINGS: GameSettings = {
  durationSeconds: 60,
  enemySpawnInterval: 3
}

export function validSettings(value: unknown): value is GameSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    !('durationSeconds' in value) ||
    !('enemySpawnInterval' in value)
  ) {
    return false;
  }

  const duration = value.durationSeconds;
  const interval = value.enemySpawnInterval;

  return (
    typeof duration === 'number' &&
    Number.isInteger(duration) &&
    duration >= SETTINGS_LIMITS.minSessionDuration &&
    duration <= SETTINGS_LIMITS.maxSessionDuration &&
    typeof interval === 'number' &&
    Number.isInteger(interval) &&
    interval >= SETTINGS_LIMITS.minSpawnInterval &&
    interval <= SETTINGS_LIMITS.maxSpawnInterval
  );
}

export function loadSettings(): GameSettings {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);

    if (!savedSettings) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsedSettings = JSON.parse(savedSettings);

    if (validSettings(parsedSettings)) {
      return parsedSettings;
    }
  } catch {
    // Se invalido, usa as configs padrõess.
  }

  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}


