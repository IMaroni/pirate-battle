import { httpClient } from './httpClient';
import type { MatchResult } from '../types/game';
import type { PaginatedResponse } from '../types/api';

export async function getMatchHistory(
  playerId: string,
  page: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<MatchResult>> {
  const response = await httpClient.get<
    PaginatedResponse<MatchResult>
  >('/matches', {
    params: {
      playerId,
      page,
      pageSize: 5
    },
    signal
  });

  return response.data;
}
export async function registerMatch(
  result: MatchResult,
): Promise<MatchResult> {
  const response = await httpClient.post<MatchResult>(
    '/matches',
    result
  );
  return response.data;
}