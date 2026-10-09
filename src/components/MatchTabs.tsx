import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { GameSettings } from '../types/game';
import { RankingPanel } from './RankingPanel';
import { HistoryPanel } from './HistoryPanel';
import './MatchTabs.css';

export type MatchTab = 'ranking' | 'history';

interface MatchTabsProps {
  settings: GameSettings;
  initialTab: MatchTab;
}

export function MatchTabs({ settings, initialTab }: MatchTabsProps) {
  const [activeTab, setActiveTab] = useState<MatchTab>(initialTab);

  const rankingButtonRef = useRef<HTMLButtonElement>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    let nextTab: MatchTab;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      nextTab = activeTab === 'ranking' ? 'history' : 'ranking';
    } else if (event.key === 'Home') {
      nextTab = 'ranking';
    } else if (event.key === 'End') {
      nextTab = 'history';
    } else {
      return;
    }

    event.preventDefault();
    setActiveTab(nextTab);

    if (nextTab === 'ranking') {
      rankingButtonRef.current?.focus();
    } else {
      historyButtonRef.current?.focus();
    }
  }

  return (
    <div className="match-tabs">
      <div
        className="match-tab-buttons"
        role="tablist"
        aria-label="Match records"
      >
        <button
          ref={rankingButtonRef}
          id={`${id}-ranking-tab`}
          role="tab"
          aria-selected={activeTab === 'ranking'}
          aria-controls={`${id}-ranking-panel`}
          tabIndex={activeTab === 'ranking' ? 0 : -1}
          onClick={() => setActiveTab('ranking')}
          onKeyDown={handleTabKeyDown}
        >
          Ranking
        </button>
        <button
          ref={historyButtonRef}
          id={`${id}-history-tab`}
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls={`${id}-history-panel`}
          tabIndex={activeTab === 'history' ? 0 : -1}
          onClick={() => setActiveTab('history')}
          onKeyDown={handleTabKeyDown}
        >
          Match History
        </button>
      </div>
      <div
        id={`${id}-ranking-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-ranking-tab`}
        hidden={activeTab !== 'ranking'}
        tabIndex={0}
      >
        {activeTab === 'ranking' && (
          <RankingPanel settings={settings} />
        )}
      </div>
      <div
        id={`${id}-history-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-history-tab`}
        hidden={activeTab !== 'history'}
        tabIndex={0}
      >
        {activeTab === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
}