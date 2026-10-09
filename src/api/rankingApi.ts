import { httpClient } from './httpClient';
import type { GameSettings } from '../types/game';
import type {
  PaginatedResponse,
  RankingEntry
} from '../types/api';

export async function getRanking(
  settings: GameSettings,
  page: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<RankingEntry>> {
  const response = await httpClient.get<
    PaginatedResponse<RankingEntry>
  >('/ranking', {
    params: {
      page,
      pageSize: 5,
      durationSeconds: settings.durationSeconds,
      enemySpawnInterval: settings.enemySpawnInterval
    },
    signal
  });

  return response.data;
}