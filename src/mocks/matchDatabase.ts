import type { MatchResult } from '../types/game';
import { validMatchResult } from '../storage/matchStorage';

const STORAGE_KEY = 'pirate-battle-confirmed-matches';

export function getConfirmedMatches(): MatchResult[] {
  try {
    const savedMatches = localStorage.getItem(STORAGE_KEY);

    if (!savedMatches) {
      return [];
    }

    const parsedMatches: unknown = JSON.parse(savedMatches);

    if (!Array.isArray(parsedMatches)) {
      return [];
    }

    return parsedMatches.filter(validMatchResult);
  } catch {
    return [];
  }
}

export function registerConfirmedMatch(
  result: MatchResult,
): MatchResult {
  const matches = getConfirmedMatches();
  // Reenvio da mesma partida recupera o registro.
  const existingMatch = matches.find((match) => {
    return match.id === result.id;
  });

  if (existingMatch) {
    return existingMatch;
  }

  matches.push(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  return result;
}