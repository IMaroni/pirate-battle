import { useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  NETWORK_SCENARIOS,
  getNetworkScenario,
  setNetworkScenario,
  validNetworkScenario,
  resetDemoData,
  type NetworkScenario,
} from '../mocks/networkScenarios';
import './NetworkPanel.css';

const scenarioDescriptions: Record<NetworkScenario, string> = {
  success: 'Requests succeed normally. Use this mode for regular gameplay.',
  empty: 'Ranking and history return empty lists. Saved records are preserved.',
  slow:'Requests take about two seconds. Use this mode to check loading messages.', 'variable-latency': 'Requests use different delays to test how the interface handles late responses.',
  timeout: 'Responses take longer than the client timeout, causing requests to fail.', 'connection-error': 'Requests fail as if the network connection were unavailable.',
    'http-400':
      'Requests return HTTP 400 to simulate a rejected request.',
    'http-500':
      'Requests return HTTP 500 to simulate a server failure.',
    'ranking-error':
      'Only ranking requests fail. History and match registration remain available.',
    'history-error':
      'Only history queries fail. Ranking and match registration remain available.',
    'registration-error':
      'Match registration fails. Complete a match, then restore Success and retry the pending submission.',
    'timeout-after-save':
      'The match is saved, but its first response arrives too late. Retrying must recover the same record without duplication.'
};

interface NetworkPanelProps {
  onApply: () => void;
}

export function NetworkPanel({ onApply }: NetworkPanelProps) {
  const [scenario, setScenario] = useState(getNetworkScenario);
  const queryClient = useQueryClient();
  const selectId = useId();

  function handleApplyScenario(): void {
    // Salva o cenário somente depois da confirmação.
    setNetworkScenario(scenario);
    void queryClient.invalidateQueries({
      queryKey: ['ranking']
    });
    void queryClient.invalidateQueries({
      queryKey: ['history']
    });
    onApply();
  }

  return (
    <div className="network-panel">
      <p>
        These controls simulate ranking and history API conditions
        using MSW. They do not change gameplay rules.
      </p>
      <label htmlFor={selectId}>Simulation Scenario</label>
      <select
        id={selectId}
        value={scenario}
        aria-describedby={`${selectId}-description`}
        onChange={(event) => {
          const value = event.target.value;
          if (validNetworkScenario(value)) {
            setScenario(value);
          }
        }}
      >
        {NETWORK_SCENARIOS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <p
        id={`${selectId}-description`}
        className="network-description"
        role="status"
      >
        {scenarioDescriptions[scenario]}
      </p>
      <p>
        Choose a scenario and select Apply scenario to activate it
        and return to the menu. Main Menu closes without applying
        your changes.
      </p>
      <p className="network-reset-description">
        Reset deletes confirmed matches, pending submissions and
        the last result, restores Success and reloads the page.
        Game options are preserved.
      </p>
      <div className="buttonsNetwork">
        <button
          type="button"
          className="network-reset-button"
          onClick={() => {
            resetDemoData();
            window.location.reload();
          }}
        >
          Delete demo data and reset
        </button>
        <button 
          type="button" 
          onClick={handleApplyScenario}
          className="network-apply-actions"
        >
          Apply scenario
        </button>
      </div>
    </div>
  );
}