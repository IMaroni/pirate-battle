import type { MatchResult } from '../types/game';
import { validMatchResult } from './matchStorage';

const STORAGE_KEY = 'pirate-battle-pending-matches';

export function getPendingMatches(): MatchResult[] {
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

export function queueMatch(result: MatchResult): void {
  const matches = getPendingMatches();
  // Não adiciona a mesma partida duas vezes à fila.
  if (matches.some((match) => match.id === result.id)) {
    return;
  }

  matches.push(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function removePendingMatch(matchId: string): void {
  const matches = getPendingMatches().filter((match) => {
    return match.id !== matchId;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}