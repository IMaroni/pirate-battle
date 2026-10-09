import { http, HttpResponse, delay } from 'msw';
import type { MatchResult } from '../types/game';
import type { PaginatedResponse, RankingEntry } from '../types/api';
import { validSettings } from '../config/gameSettings';
import { validMatchResult } from '../storage/matchStorage';
import { createRankingFixtures } from './fixtures';
import { getConfirmedMatches, registerConfirmedMatch } from './matchDatabase';
import { getNetworkScenario, simulateNetwork, simulateAfterSave } from './networkScenarios';

function readPagination(url: URL) {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '5');

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 20
  ) {
    return null;
  }

  return { page, pageSize };
}

export const handlers = [
  http.get('/api/ranking', async ({ request }) => {
    const scenario = getNetworkScenario();

    const simulatedError = await simulateNetwork(
      'history',
      scenario,
    );

    if (simulatedError) {
      return simulatedError;
    }

    const url = new URL(request.url);
    const pagination = readPagination(url);

    const settings = {
      durationSeconds: Number(
        url.searchParams.get('durationSeconds') ?? '60'
      ),
      enemySpawnInterval: Number(
        url.searchParams.get('enemySpawnInterval') ?? '3'
      ),
    };

    if (!pagination || !validSettings(settings)) {
      return HttpResponse.json(
        { message: 'Invalid ranking parameters.' },
        { status: 400 }
      );
    }

    // Compara somente partidas com as mesmas opções.
    const confirmedMatches = getConfirmedMatches().filter((match) => {
      return (
        match.settings.durationSeconds === settings.durationSeconds &&
        match.settings.enemySpawnInterval === settings.enemySpawnInterval
      );
    });

    const playerEntries: RankingEntry[] = confirmedMatches.map((match) => ({
      ...match,
      playerName:
        match.playerId === 'local-player' ? 'You' : match.playerId,
      position: 0
    }));

    const ranking = scenario === 'empty' ? [] : [ ...createRankingFixtures(settings), ...playerEntries ];

    // Desempate: data mais antiga e, depois, identificador.
    ranking.sort((first, second) => {
      return (
        second.score - first.score ||
        first.endedAt.localeCompare(second.endedAt) ||
        first.id.localeCompare(second.id)
      );
    });

    const positionedRanking = ranking.map((entry, index) => ({
      ...entry,
      position: index + 1
    }));

    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;

    const response: PaginatedResponse<RankingEntry> = {
      items: positionedRanking.slice(start, start + pageSize),
      page,
      pageSize,
      total: positionedRanking.length
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/matches', async ({ request }) => {
    const scenario = getNetworkScenario();

    const simulatedError = await simulateNetwork(
      'history',
      scenario
    );

    if (simulatedError) {
      return simulatedError;
    }

    const url = new URL(request.url);
    const pagination = readPagination(url);
    const playerId = url.searchParams.get('playerId');

    if (!pagination || !playerId) {
      return HttpResponse.json(
        { message: 'Invalid history parameters.' },
        { status: 400 }
      );
    }

    const matches =
      scenario === 'empty'
        ? []
        : getConfirmedMatches()
            .filter((match) => match.playerId === playerId)
            .sort((first, second) => {
              return (
                second.endedAt.localeCompare(first.endedAt) ||
                first.id.localeCompare(second.id)
              );
            });

    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;

    const response: PaginatedResponse<MatchResult> = {
      items: matches.slice(start, start + pageSize),
      page,
      pageSize,
      total: matches.length
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/matches', async ({ request }) => {
    const scenario = getNetworkScenario();
    const simulatedError = await simulateNetwork( 'register', scenario );

    if (simulatedError) {
      return simulatedError;
    }
    
    if (simulatedError) {
      return simulatedError;
    }
    try {
      const body: unknown = await request.json();
      if (!validMatchResult(body)) {
        return HttpResponse.json(
          { message: 'Invalid match result.' },
          { status: 400 }
        );
      }

      const confirmedMatch = registerConfirmedMatch(body);
      // Confirma antes da resposta; reenvios não duplicam o registro.
      await simulateAfterSave(confirmedMatch.id, scenario);
      await delay(300);
      return HttpResponse.json(confirmedMatch);
    } catch {
      return HttpResponse.json(
        { message: 'Unable to register the match.' },
        { status: 500 }
      );
    }
  }),
];