import type {
  PlayerState,
  EnemyState,
  ProjectileState,
  IslandState,
} from '../types/game';

export interface GameTestSnapshot {
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  islands: IslandState[];
  elapsedSeconds: number;
  paused: boolean;
  pressedKeys: string[];
}

interface GameTestBridge {
  getSnapshot: () => GameTestSnapshot;
}

// Informa ao TypeScript qual propriedade disponibilizamos no navegador.
declare global {
  interface Window {
    gameTest?: GameTestBridge;
  }
}

export function installGameTestBridge(
  readState: () => GameTestSnapshot,
): () => void {
  const params = new URLSearchParams(window.location.search);

  if (params.get('testMode') !== '1') {
    return () => {};
  }

  const bridge: GameTestBridge = {
    // Retorna uma cópia para não expor os objetos usados pela simulação.
    getSnapshot: () => structuredClone(readState()),
  };

  window.gameTest = bridge;

  return () => {
    // Não remove uma ponte criada por uma inicialização mais recente.
    if (window.gameTest === bridge) {
      delete window.gameTest;
    }
  };
}