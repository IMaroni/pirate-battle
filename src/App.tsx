import './App.css';
import { useEffect, useCallback, useRef, useState } from 'react';
import type { GameSettings } from './types/game';
import { loadSettings, saveSettings } from './config/gameSettings';
import { OptionsScreen } from './components/OptionsScreen';
import { GameCanvas } from './components/GameCanvas.tsx';
import type { GameStats } from './types/game';
import { GAMEPLAY_CONFIG } from './config/gamePlayConfig';
import type { MatchResult } from './types/game';
import { ResultScreen } from './components/ResultScreen';
import { loadLastMatch, saveLastMatch } from './storage/matchStorage';
import { Toast } from './components/Toast';
import { MatchTabs } from './components/MatchTabs';
import { useMatchRegistration } from './hooks/useMatchRegistration';
import { NetworkPanel } from './components/NetworkPanel';
import { Modal } from './components/Modal';
import type { MatchTab } from './components/MatchTabs';

type MenuDialog = MatchTab | 'network' | null;
type Screen = 'menu' | 'game' | 'options'| 'result';

function App() {
  const [menuDialog, setMenuDialog] = useState<MenuDialog>(null);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(loadLastMatch);
  const [screen, setScreen] = useState<Screen>(matchResult ? 'result' : 'menu');
  const [resultStorageError, setResultStorageError] = useState('');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [gameStats, setGameStats] = useState<GameStats>({ health: GAMEPLAY_CONFIG.player.initialHealth, score: 0, remainingSeconds: settings.durationSeconds});
  const { statuses, submitMatch } = useMatchRegistration();
  const menuDialogButtonRef = useRef<HTMLButtonElement | null>(null);

  function closeMenuDialog(): void {
    const openingButton = menuDialogButtonRef.current;
    setMenuDialog(null);

    // Espera a modal sair da tela antes de devolver o foco.
    window.requestAnimationFrame(() => {
      openingButton?.focus();
    });
  }


  const handleFinishMatch = useCallback((result: MatchResult) => {
    setMatchResult(result);
    setResultStorageError('');
  
    try {
      saveLastMatch(result);
    } catch {
      // O resultado mesmo se não conseguir salvar.
      setResultStorageError(
        'Unable to save the result on this device. It may be lost after refreshing.',
      );
    }
    submitMatch(result);
    setScreen('result');
  }, [submitMatch]);

  function handleSaveSettings(newSettings: GameSettings): void {
    // Só volta ao menu depois que funcionar.
    saveSettings(newSettings);
    setSettings(newSettings);

    setScreen('menu');
    setSettingsMessage('Settings saved!');
  }

  useEffect(() => {
    if (!settingsMessage) {
      return;
    }

    // Remove a confirmação depois de três segundos.
    const timeoutId = window.setTimeout(() => {
      setSettingsMessage('');
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [settingsMessage]);

  return (
    <main className="app">
      {settingsMessage && (
        <Toast message={settingsMessage} />
      )}
      <section className={screen === 'game' ? 'panel game-panel' : 'panel'}>
        {screen === 'menu' && (
          <>
            <p className="subtitle">A naval survival game</p>
            <h1>Pirate Battle</h1>

            <p>
              Sail between islands, battle enemy ships and survive!
            </p>

            <div className="menu-actions">
              <button onClick={() => setScreen('game')}>
                Play
              </button>

              <button onClick={() => setScreen('options')}>
                Options
              </button>
            </div>
            <div className="menu-record-actions">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(event) => {
                  menuDialogButtonRef.current = event.currentTarget;
                  setMenuDialog('ranking');
                }}
              >
                Ranking
              </button>

              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(event) => {
                menuDialogButtonRef.current = event.currentTarget;
                setMenuDialog('history');
              }}
              >
                Match History
              </button>
            </div>

            <button
              type="button"
              className="network-test-button"
              aria-haspopup="dialog"
              onClick={(event) => {
                menuDialogButtonRef.current = event.currentTarget;
                setMenuDialog('network');
              }}
            >
              Network tests
            </button>

            {(menuDialog === 'ranking' || menuDialog === 'history') && (
              <Modal
                title="Captain's Log"
                onClose={closeMenuDialog}
              >
                <MatchTabs
                  settings={settings}
                  initialTab={menuDialog}
                />
              </Modal>
            )}

            {menuDialog === 'network' && (
              <Modal
                title="Network tests"
                onClose={closeMenuDialog}
              >
                <NetworkPanel onApply={closeMenuDialog} />
              </Modal>
            )}
          </>
        )}

        {screen === 'game' && (
          <>
            <h1>Battle</h1>
          <p>
            Move: W or ↑ · Reverse: S or ↓ ·Turn: A or ← and D or → · Fire: Space · Left fire: Q · Right fire: E
          </p>

          <p role="status">
            Health: {gameStats.health} ·
            Score: {gameStats.score} ·
            Time: {gameStats.remainingSeconds}s
          </p>

          <GameCanvas
            settings={settings}
            onStatsChange={setGameStats}
            onFinish={handleFinishMatch}
          />
        
            <button onClick={() => setScreen('menu')}>
              Main Menu
            </button>
          </>
        )}

        {screen === 'options' && (
          <OptionsScreen
            settings={settings}
            onSave={handleSaveSettings}
            onBack={() => setScreen('menu')}
          />
        )}
        
      {screen === 'result' && matchResult && (
        <>
          {resultStorageError && (
            <p role="alert">{resultStorageError}</p>
          )}

          <ResultScreen
            result={matchResult}
            onPlayAgain={() => setScreen('game')}
            onMainMenu={() => setScreen('menu')}
            registrationStatus={statuses[matchResult.id] ?? 'idle'}
            onRegister={submitMatch}
          />
        </>
      )}
      </section>
    </main>
  )
}

export default App;