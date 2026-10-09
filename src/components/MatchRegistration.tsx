import type { MatchResult } from '../types/game';
import type { RegistrationStatus } from '../hooks/useMatchRegistration';
import './MatchRegistration.css';

interface MatchRegistrationProps {
  result: MatchResult;
  status: RegistrationStatus;
  onRegister: (result: MatchResult) => void;
}

export function MatchRegistration({
  result,
  status,
  onRegister
}: MatchRegistrationProps) {
  return (
    <div className="match-registration">
      {status === 'pending' && (
        <p role="status">Registering match...</p>
      )}
      {status === 'saved' && (
        <p role="status">Match registered!</p>
      )}
      {status === 'error' && (
        <p role="alert">
          Registration incomplete. Retry when available.
        </p>
      )}
      {status === 'idle' && (
        <p>The result is available on this device.</p>
      )}
      {(status === 'error' || status === 'idle') && (
        <button
          type="button"
          onClick={() => onRegister(result)}
        >
          {status === 'error' ? 'Try Again' : 'Confirm Registration'}
        </button>
      )}
    </div>
  );
}