import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GameSettings } from '../types/game';
import { getRanking } from '../api/rankingApi';
import './RankingPanel.css';

interface RankingPanelProps {
  settings: GameSettings;
}

export function RankingPanel({ settings }: RankingPanelProps) {
  const [page, setPage] = useState(1);

  const rankingQuery = useQuery({
    // Cada página e config tem seu próprio cache.
    queryKey: [
      'ranking',
      settings.durationSeconds,
      settings.enemySpawnInterval,
      page
    ],
    queryFn: ({ signal }) => {
      return getRanking(settings, page, signal);
    },
  });

  if (rankingQuery.isPending) {
    return <p role="status">Loading ranking...</p>;
  }

  if (rankingQuery.isError && !rankingQuery.data) {
    return (
      <div>
        <p role="alert">Unable to load the ranking.</p>
        <button onClick={() => void rankingQuery.refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  const ranking = rankingQuery.data;

  if (!ranking) {
    return null;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(ranking.total / ranking.pageSize)
  );

  return (
    <section className="ranking-panel" aria-label="Ranking">
      <h2>Ranking</h2>
      <p>
        Duration: {settings.durationSeconds}s ·
        Spawn interval: {settings.enemySpawnInterval}s
      </p>
      {rankingQuery.isFetching && (
        <p role="status">Updating ranking...</p>
      )}
      {rankingQuery.isError && (
        <p role="alert">
          Unable to refresh. Showing the last available ranking.
        </p>
      )}
      {ranking.items.length === 0 ? (
        <p>No matches found for this configuration.</p>
      ) : (
        <table>
          <caption>Scores for the selected configuration</caption>
          <thead>
            <tr>
              <th scope="col">Position</th>
              <th scope="col">Player</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.items.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.position}</td>
                <td>{entry.playerName}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="ranking-pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}