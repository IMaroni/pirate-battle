import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMatchHistory } from '../api/matchApi';
import './HistoryPanel.css';

export function HistoryPanel() {
  const [page, setPage] = useState(1);
  const playerId = 'local-player';

  const historyQuery = useQuery({
    queryKey: ['history', playerId, page],

    queryFn: ({ signal }) => {
      return getMatchHistory(playerId, page, signal);
    }
  });

  if (historyQuery.isPending) {
    return <p role="status">Loading match history...</p>;
  }

  if (historyQuery.isError && !historyQuery.data) {
    return (
      <div>
        <p role="alert">Unable to load match history.</p>

        <button onClick={() => void historyQuery.refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  const history = historyQuery.data;
  if (!history) {
    return null;
  }
  const totalPages = Math.max(
    1,
    Math.ceil(history.total / history.pageSize),
  );

  return (
    <section className="history-panel" aria-label="Match history">
      <h2>Match History</h2>

      {historyQuery.isFetching && (
        <p role="status">Updating match history...</p>
      )}

      {historyQuery.isError && (
        <p role="alert">
          Unable to refresh. Showing the last available history.
        </p>
      )}

      {history.items.length === 0 ? (
        <p>No matches recorded yet.</p>
      ) : (
        <ul className="history-list">
          {history.items.map((match) => (
            <li key={match.id}>
              <time dateTime={match.endedAt}>
                {new Date(match.endedAt).toLocaleString('en-US')}
              </time>
              <p>
                Score: {match.score} ·
                Duration: {match.durationSeconds.toFixed(1)}s
              </p>
              <p>
                {match.endReason === 'time-up'
                  ? 'Time is up'
                  : 'Ship destroyed'}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="history-pagination">
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