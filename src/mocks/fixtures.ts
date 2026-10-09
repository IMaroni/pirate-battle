import type { GameSettings } from '../types/game';
import type { RankingEntry } from '../types/api';

const players = [
  { id: 'charles', name: 'Gold D. Roger', score: 20 },
  { id: 'edward', name: 'White Beard', score: 18 },
  { id: 'anne', name: 'Captain Shanks', score: 15 },
  { id: 'samuel', name: 'Monkey D. Luffy', score: 10 },
  { id: 'jack', name: 'Jack Sparrow', score: 5 },
  { id: 'henry', name: 'Black Pearl', score: 1 }
];

export function createRankingFixtures(
  settings: GameSettings
): RankingEntry[] {
  return players.map((player, index) => ({
    id:
      `fixture-${player.id}-` +
      `${settings.durationSeconds}-${settings.enemySpawnInterval}`,
    playerId: player.id,
    playerName: player.name,
    position: index + 1,
    endedAt: '2026-10-08T12:00:00.000Z',
    score: player.score,
    durationSeconds: settings.durationSeconds,
    endReason: 'time-up',
    settings: { ...settings }
  }));
}