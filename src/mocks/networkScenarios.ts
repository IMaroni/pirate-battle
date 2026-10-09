import { delay, HttpResponse } from 'msw';

export type NetworkScenario = 'success'
  | 'empty'
  | 'slow'
  | 'variable-latency'
  | 'timeout'
  | 'connection-error'
  | 'http-400'
  | 'http-500'
  | 'ranking-error'
  | 'history-error'
  | 'registration-error'
  | 'timeout-after-save';

type ApiResource = 'ranking' | 'history' | 'register';

const STORAGE_KEY = 'pirate-battle-network-scenario';

export const NETWORK_SCENARIOS: {
  value: NetworkScenario;
  label: string;
}[] = [
  { value: 'success', label: 'Success' },
  { value: 'empty', label: 'Empty lists' },
  { value: 'slow', label: 'Slow responses' },
  { value: 'variable-latency', label: 'Variable latency' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'connection-error', label: 'Connection error' },
  { value: 'http-400', label: 'HTTP 400' },
  { value: 'http-500', label: 'HTTP 500' },
  { value: 'ranking-error', label: 'Ranking unavailable' },
  { value: 'history-error', label: 'History unavailable' },
  { value: 'registration-error', label: 'Registration unavailable' },
  { value: 'timeout-after-save', label: 'Timeout after saving' }
];

const requestCounts: Record<ApiResource, number> = {
  ranking: 0,
  history: 0,
  register: 0
};

const timedOutMatches = new Set<string>();

export function validNetworkScenario(
  value: unknown,
): value is NetworkScenario {
  return NETWORK_SCENARIOS.some((scenario) => {
    return scenario.value === value;
  });
}

export function getNetworkScenario(): NetworkScenario {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (validNetworkScenario(saved)) {
      return saved;
    }
  } catch {
    // Usa o cenário default se não conseguir ler a escolha.
  }

  return 'success';
}

export function setNetworkScenario(
  scenario: NetworkScenario,
): void {
  localStorage.setItem(STORAGE_KEY, scenario);

  // Reinicia a sequência para reproduzir o mesmo comportamento.
  requestCounts.ranking = 0;
  requestCounts.history = 0;
  requestCounts.register = 0;
  timedOutMatches.clear();
}

export async function simulateNetwork(
  resource: ApiResource,
  scenario: NetworkScenario
): Promise<Response | null> {
  const requestIndex = requestCounts[resource];
  requestCounts[resource] += 1;

  if (scenario === 'connection-error') {
    return HttpResponse.error();
  }

  if (scenario === 'slow') {
    await delay(2000);
  } else if (scenario === 'timeout') {
    // Nosso Axios espera no máximo cinco segundos.
    await delay(6500);
  } else if (scenario === 'variable-latency') {
    const delays = [1400, 100, 700];
    await delay(delays[requestIndex % delays.length] ?? 300);
  } else {
    await delay(300);
  }

  if (scenario === 'http-400') {
    return HttpResponse.json(
      { message: 'Simulated bad request.' },
      { status: 400 }
    );
  }

  const resourceUnavailable =
    (scenario === 'ranking-error' && resource === 'ranking') ||
    (scenario === 'history-error' && resource === 'history') ||
    (scenario === 'registration-error' && resource === 'register');

  if (scenario === 'http-500' || resourceUnavailable) {
    return HttpResponse.json(
      { message: 'Simulated service failure.' },
      { status: 500 }
    );
  }

  return null;
}

export async function simulateAfterSave(
  matchId: string,
  scenario: NetworkScenario
): Promise<void> {
  if ( scenario !== 'timeout-after-save' || timedOutMatches.has(matchId)) {
    return;
  }

  // Só a primeira resposta desta partida sofre timeout.
  timedOutMatches.add(matchId);
  await delay(6500);
}

export function resetDemoData(): void {
  localStorage.removeItem('pirate-battle-confirmed-matches');
  localStorage.removeItem('pirate-battle-pending-matches');
  localStorage.removeItem('pirate-battle-last-match');

  setNetworkScenario('success');
}