import { useState } from 'react';
import type { FormEvent } from 'react';
import type { GameSettings } from '../types/game';
import './OptionsScreen.css';
import {
  validSettings,
  SETTINGS_LIMITS
} from '../config/gameSettings';

interface OptionsScreenProps {
  settings: GameSettings,
  onSave: (settings: GameSettings) => void,
  onBack: () => void
}

export function OptionsScreen({
  settings,
  onSave,
  onBack
}: OptionsScreenProps) {
  const [duration, setDuration] = useState(
    String(settings.durationSeconds)
  );

  const [spawnInterval, setSpawnInterval] = useState(
    String(settings.enemySpawnInterval)
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const newSettings: GameSettings = {
      durationSeconds: Number(duration),
      enemySpawnInterval: Number(spawnInterval)
    }

    if (!validSettings(newSettings)) {
      setError(
        'Use whole numbers: game session time must be between 60 and 180 seconds, and enemy spawn time between 1 and 10 seconds.'
      );
      return
    }
    try {
      onSave(newSettings);
    } catch {
      setError('Unable to save settings. Please try again.');
    }
  }

  return (
    <>
      <h1>Options</h1>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label htmlFor="session-duration">
          Game session time (seconds)
        </label>
        <input
          id="session-duration"
          type="number"
          min={SETTINGS_LIMITS.minSessionDuration}
          max={SETTINGS_LIMITS.maxSessionDuration}
          step={1}
          required
          value={duration}
          onChange={(event) => {
            setDuration(event.target.value)
            setError('')
            setSuccess('')
          }}
        />
        <label htmlFor="spawn-interval">
          Enemy spawn time (seconds)
        </label>
        <input
          id="spawn-interval"
          type="number"
          min={SETTINGS_LIMITS.minSpawnInterval}
          max={SETTINGS_LIMITS.maxSpawnInterval}
          step={1}
          required
          value={spawnInterval}
          onChange={(event) => {
            setSpawnInterval(event.target.value)
            setError('')
            setSuccess('')
          }}
        />
        <p>Changes apply to new matches.</p>
          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}
        <button type="submit">Save Settings</button>
        <button type="button" onClick={onBack}>
          Main Menu
        </button>
      </form>
    </>
  )
}
