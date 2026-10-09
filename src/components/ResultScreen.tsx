import type { MatchResult } from '../types/game';
import './ResultScreen.css';
import { MatchRegistration } from './MatchRegistration';
import type { RegistrationStatus } from '../hooks/useMatchRegistration';

interface ResultScreenProps {
  result: MatchResult;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  registrationStatus: RegistrationStatus;
  onRegister: (result: MatchResult) => void;
}

export function ResultScreen({
  result,
  onPlayAgain,
  onMainMenu,
  registrationStatus,
  onRegister
}: ResultScreenProps) {
  const endMessage =
    result.endReason === 'time-up'
      ? 'Time is up!'
      : 'Your ship was destroyed!';

  return (
    <div className="result-screen">
      <h1>Match finished</h1>
      <p>{endMessage}</p>
      <dl className="result-details">
        <div>
          <dt>Score</dt>
          <dd>{result.score}</dd>
        </div>
        <div>
          <dt>Time played</dt>
          <dd>{result.durationSeconds.toFixed(1)} seconds</dd>
        </div>
      </dl>
      <MatchRegistration
          result={result}
          status={registrationStatus}
          onRegister={onRegister}
      />
      <div className="result-actions">
        <button onClick={onPlayAgain}>
          Play Again
        </button>
        <button onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </div>
  );
}