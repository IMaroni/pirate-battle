import type { MatchResult } from './game';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RankingEntry extends MatchResult {
  position: number;
  playerName: string;
}