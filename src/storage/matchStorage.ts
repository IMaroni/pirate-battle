import type { MatchResult } from '../types/game';
import { validSettings } from '../config/gameSettings';

const STORAGE_KEY = 'pirate-battle-last-match';

export function validMatchResult(value: unknown): value is MatchResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    !('id' in value) ||
    !('playerId' in value) ||
    !('endedAt' in value) ||
    !('score' in value) ||
    !('durationSeconds' in value) ||
    !('endReason' in value) ||
    !('settings' in value)
  ) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.playerId === 'string' &&
    value.playerId.length > 0 &&
    typeof value.endedAt === 'string' &&
    Number.isFinite(Date.parse(value.endedAt)) &&
    typeof value.score === 'number' &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    typeof value.durationSeconds === 'number' &&
    Number.isFinite(value.durationSeconds) &&
    value.durationSeconds >= 0 &&
    (
      value.endReason === 'time-up' ||
      value.endReason === 'player-dead'
    ) &&
    validSettings(value.settings) &&
    value.durationSeconds <= value.settings.durationSeconds
  );
}

export function loadLastMatch(): MatchResult | null {
  try {
    const savedMatch = localStorage.getItem(STORAGE_KEY);

    if (!savedMatch) {
      return null;
    }

    const parsedMatch = JSON.parse(savedMatch);

    if (validMatchResult(parsedMatch)) {
      return parsedMatch;
    }
  } catch {
    //comentario devido ao lint.nada aqui.
  }

  return null;
}
export function saveLastMatch(result: MatchResult): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}