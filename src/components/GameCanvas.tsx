import './GameCanvas.css';
import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, type Container } from 'pixi.js';
import { CONFIG_ARENA } from '../config/configArena'
import { createPlayer } from '../game/createPlayer'
import { createKeyboardInput } from '../game/createKeyBoardInput';
import { updatePlayer } from '../game/updatePlayer';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';
import { createPlayerProjectile } from '../game/createPlayerProjectile';
import { updateProjectiles } from '../game/updateProjectiles';
import { createSideProjectiles } from '../game/createSideProjectiles';
import { updateEnemy } from '../game/updateEnemy';
import type { GameStats, GameSettings, EnemyState, PlayerState, ProjectileState, MatchResult, MatchEndReason } from '../types/game';
import { createCombatEffect, updateCombatEffects, type CombatEffect } from '../game/combatEffects';
import { createExplosion, updateExplosions, type ExplosionEffect } from '../game/explosions';
import { resolveCombat } from '../game/resolveCombat';
import { tableHealth } from '../game/tableHealth';
import { createEnemy } from '../game/createEnemy';
import { updateShooter } from '../game/updateShooter';
import { loadGameAssets } from '../game/loadGameAssets';
import { updateShipSkin } from '../game/updateShipSkin';
import { TouchControls } from './TouchControls';
import { createIsland } from '../game/createIsland';
import { createWater } from '../game/createWater';
import { generateIslands } from '../game/generateIslands';
import { installGameTestBridge } from '../game/testBridge';
import { createTableHealth, loadTableHealthTextures, type TableHealth } from '../game/createTableHealth';


interface GameCanvasProps {
  settings: GameSettings;
  onStatsChange: (stats: GameStats) => void;
  onFinish: (result: MatchResult) => void;
}

interface EnemyEntity {
  state: EnemyState;
  graphic: Container;
  tableHealth: TableHealth;
}

export function GameCanvas({ settings, onStatsChange, onFinish }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Guarda as opções usadas nesta partida.
  const matchSettingsRef = useRef<GameSettings>({ ...settings });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const pauseGameRef = useRef<(() => void) | null>(null);
  const resumeGameRef = useRef<(() => void) | null>(null);
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const pauseDialogRef = useRef<HTMLDialogElement>(null);
  const touchPointersRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    const dialog = pauseDialogRef.current;

    if (!dialog) {
      return;
    }

    if (isPaused) {
      if (!dialog.open) {
        dialog.showModal();
      }

      resumeButtonRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();

      // Devolve o teclado para a arena após fechar a modal.
      const canvas = containerRef.current?.querySelector('canvas');
      canvas?.focus();
    }
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current
    const matchSettings = matchSettingsRef.current;

    if (!container) {
      return;
    }

    const app = new Application();
    let cancelled = false;
    let initialized = false;
    let destroyInput: (() => void) | null = null;
    let removeTestBridge: (() => void) | null = null;
    let removePauseListeners: (() => void) | null = null;
    

    async function initArena(arenaContainer: HTMLDivElement) { 
      try {
        await app.init({
          width: CONFIG_ARENA.width,
          height: CONFIG_ARENA.height,
          backgroundColor: CONFIG_ARENA.backgroundColor,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        })

        initialized = true;

        // Se já saímos desta inicialização, libera o PixiJS.
        if (cancelled) {
          app.destroy(true, { children: true });
          return;
        }

        const textures = await loadGameAssets();

        // A limpeza já destrói a aplicação se sairmos durante o carregamento.
        if (cancelled) {
          return;
        }


        let enemies: EnemyEntity[] = [];
        let spawnElapsed = 0;
        let spawnIndex = 0;
        let score = 0;
        let elapsedSeconds = 0;
        let displayedTime = matchSettings.durationSeconds;
        let finished = false;
        let paused = false;
        let skipNextFrame = false;
        let projectiles: ProjectileState[] = [];
        let frontCooldown = 0;
        let leftCooldown = 0;
        let rightCooldown = 0;
        let explosions: ExplosionEffect[] = [];
        let combatEffects: CombatEffect[] = [];
        const keyboardInput = createKeyboardInput(app.canvas);
        const params = new URLSearchParams(window.location.search);
        const testMode = params.get('testMode') === '1';
        const islands = testMode
          ? generateIslands(1234)
          : generateIslands();
        destroyInput = keyboardInput.destroy;

        function pauseMatch(): void {
          if (finished || paused) {
            return;
          }
          paused = true;
        
          // Descarta comandos que estavam pressionados.
          keyboardInput.pressedKeys.clear();
          touchPointersRef.current.clear();
        
          setIsPaused(true);
        }

        function resumeMatch(): void {
          if (finished || !paused || document.hidden) {
            return;
          }
        
          // Não reaproveita teclas pressionadas durante a pausa.
          keyboardInput.pressedKeys.clear();
          touchPointersRef.current.clear();
        
          paused = false;
          skipNextFrame = true;
        
          setIsPaused(false);
          app.canvas.focus();
        }

        function handleVisibilityChange(): void {
          if (document.hidden) {
            pauseMatch();
          }
        }

        // Disponibiliza as funções para os botões do React.
        pauseGameRef.current = pauseMatch;
        resumeGameRef.current = resumeMatch;

        window.addEventListener('blur', pauseMatch);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        removePauseListeners = () => {
          window.removeEventListener('blur', pauseMatch);
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange,
          );
        };

        arenaContainer.appendChild(app.canvas);
        // Ajusta a exibição sem mudar as coordenadas internas da arena.
        app.canvas.style.width = '100%';
        app.canvas.style.height = 'auto';

        const projectileGraphics = new Map<ProjectileState, Graphics>();

        const water = await createWater();

        // Evita adicionar o draw se a pessoa já saiu da partida.
        if (cancelled) {
          water.destroy();
          return;
        }

        app.stage.addChild(water);

        const healthBarTextures = await loadTableHealthTextures();

        if (cancelled) {
          return;
        }

        for (const islandState of islands) {
          const islandGraphic = await createIsland(islandState);
        
          // Destrói somente o draw criado, caso a partida seja fechada.
          if (cancelled) {
            islandGraphic.destroy({ children: true });
            return;
          }
        
          app.stage.addChild(islandGraphic);
        }

        const player = createPlayer(textures.player);

        player.position.set(
          CONFIG_ARENA.playerStart.x,
          CONFIG_ARENA.playerStart.y,
        );

        app.stage.addChild(player);

        const playerState: PlayerState = {
          x: CONFIG_ARENA.playerStart.x,
          y: CONFIG_ARENA.playerStart.y,
          rotation: 0,
          health: GAMEPLAY_CONFIG.player.initialHealth
        };
        
        app.canvas.tabIndex = 0;
        app.canvas.setAttribute(
          'aria-label',
          'Game arena. Use W to move forward and A or D to turn.',
        );

        destroyInput = keyboardInput.destroy;
        app.canvas.focus();

        function addProjectiles(newProjectiles: ProjectileState[]): void {
          for (const projectile of newProjectiles) {
            projectiles.push(projectile);
          
            // Cria o draw correspondente ao projétil.
            const graphic = new Graphics()
              .circle(0, 0, projectile.radius)
              .fill(projectile.owner === 'enemy' ? 0xff6b6b : 0xffe08a);
          
            graphic.position.set(projectile.x, projectile.y);
          
            app.stage.addChild(graphic);
            projectileGraphics.set(projectile, graphic);
            // Mostra um clarão no tiro.
            const shotEffect = createCombatEffect(
              'shot',
              projectile.x,
              projectile.y,
            );

            combatEffects.push(shotEffect);
            app.stage.addChild(shotEffect.graphic);
          }
        }

        const playerTableHealth = createTableHealth(healthBarTextures);
        app.stage.addChild(playerTableHealth.container);

        function spawnEnemy(): void {
          const enemyState = createEnemy(
            playerState,
            enemies.map((enemy) => enemy.state),
            spawnIndex,
            islands,
          );
          spawnIndex += 1;
          // Se não houver um ponto seguro no mar, não cria inimigos.
          if (!enemyState) {
            return;
          }
        
          const graphic = createPlayer(textures[enemyState.type]);
          graphic.position.set(enemyState.x, enemyState.y);
          graphic.rotation = enemyState.rotation;
        
          const enemyTableHealth = createTableHealth(healthBarTextures);

          app.stage.addChild(graphic, enemyTableHealth.container);

          enemies.push({
            state: enemyState,
            graphic,
            tableHealth: enemyTableHealth,
          });
        }

        // Começa com um inimigo e cria os próximos pelo intervalo determinado pelo usuario.
        spawnEnemy();

        // Restaura o painel em uma nova partida.
        onStatsChange({
          health: playerState.health,
          score,
          remainingSeconds: displayedTime,
        });

        function finishMatch(endReason: MatchEndReason): void {
          if (finished) {
            return;
          }
        
          finished = true;
          keyboardInput.pressedKeys.clear();
          touchPointersRef.current.clear();
          app.ticker.stop();
        
          const result: MatchResult = {
            id: crypto.randomUUID(),
            playerId: 'local-player',
            endedAt: new Date().toISOString(),
            score,
            durationSeconds: elapsedSeconds,
            endReason,
            settings: { ...matchSettings },
          };
        
          onFinish(result);
        }

        removeTestBridge = installGameTestBridge(() => ({
          player: playerState,
          enemies: enemies.map((enemy) => enemy.state),
          projectiles,
          islands,
          elapsedSeconds,
          paused,
          pressedKeys: [...keyboardInput.pressedKeys],
        }));

        app.ticker.add((ticker) => {
          const Keys = new Set<string>([
            ...keyboardInput.pressedKeys,
            ...touchPointersRef.current.values(),
          ]);

          // Verifica antes de executar qualquer ação.
          if (playerState.health <= 0) {
            return;
          }
          if (finished || paused) {
            return;
          }
          if (skipNextFrame) {
            skipNextFrame = false;
            return;
          }

          // Não simula além do tempo restante da partida.
          const deltaSeconds = Math.min(
            ticker.deltaMS / 1000,
            matchSettings.durationSeconds - elapsedSeconds,
          )

          elapsedSeconds += deltaSeconds;

          updatePlayer(playerState, Keys, deltaSeconds, islands);
        
          player.position.set(playerState.x, playerState.y);
          player.rotation = playerState.rotation;

          // Conta apenas o tempo das atualizações da simulação.
          spawnElapsed += deltaSeconds;

          while (spawnElapsed >= matchSettings.enemySpawnInterval) {
            spawnElapsed -= matchSettings.enemySpawnInterval;
            spawnEnemy();
          }

          for (const enemy of enemies) {
            updateEnemy(enemy.state, playerState, deltaSeconds, islands);
          
            const shot = updateShooter(
              enemy.state,
              playerState,
              deltaSeconds,
            );
            if (shot) {
              addProjectiles([shot]);
            }
          }

          // Reduz o tempo de espera das armas.
          frontCooldown = Math.max(0, frontCooldown - deltaSeconds);
          leftCooldown = Math.max(0, leftCooldown - deltaSeconds);
          rightCooldown = Math.max(0, rightCooldown - deltaSeconds);
        
          if (Keys.has('Space') && frontCooldown === 0) {
            const projectile = createPlayerProjectile(playerState);
          
            addProjectiles([projectile]);
            frontCooldown = GAMEPLAY_CONFIG.frontWeapon.cooldown;
          }
        
          if (Keys.has('KeyQ') && leftCooldown === 0) {
            const shots = createSideProjectiles(playerState, 'left');
          
            addProjectiles(shots);
            leftCooldown = GAMEPLAY_CONFIG.sideArm.cooldown;
          }
        
          if (Keys.has('KeyE') && rightCooldown === 0) {
            const shots = createSideProjectiles(playerState, 'right');
          
            addProjectiles(shots);
            rightCooldown = GAMEPLAY_CONFIG.sideArm.cooldown;
          }
        
          projectiles = updateProjectiles(projectiles, deltaSeconds, islands);
          const previousHealth = playerState.health;
          const previousScore = score;

          const combatResult = resolveCombat(playerState, enemies.map((enemy) => enemy.state),projectiles );

          projectiles = combatResult.projectiles;
          score += combatResult.scoreIncrease;

          for (const hit of combatResult.hits) {
            const impactEffect = createCombatEffect(
              'impact',
              hit.x,
              hit.y,
            );
            combatEffects.push(impactEffect);
            app.stage.addChild(impactEffect.graphic);
          }

          updateShipSkin(player, textures.player, playerState.health, GAMEPLAY_CONFIG.player.initialHealth);

          tableHealth(playerTableHealth, playerState.x, playerState.y, playerState.health, GAMEPLAY_CONFIG.player.initialHealth);

          const remainingSeconds = Math.max(
            0,
            Math.ceil(matchSettings.durationSeconds - elapsedSeconds)
          );

          // Atualiza o React quando os valores visíveis mudarem.
          if (
            playerState.health !== previousHealth ||
            score !== previousScore ||
            remainingSeconds !== displayedTime
          ) {
            displayedTime = remainingSeconds;
          
            onStatsChange({
              health: playerState.health,
              score,
              remainingSeconds
            });
          }

          enemies = enemies.filter((enemy) => {
            if (enemy.state.health <= 0) {
              const explosion = createExplosion(
                textures.explosion,
                enemy.state.x,
                enemy.state.y
              );

              explosions.push(explosion);
              app.stage.addChild(explosion.sprite);
              // Remove o navio e sua barra da cena e libera os desenhos.
              enemy.graphic.destroy({ children: true });
              enemy.tableHealth.container.destroy({ children: true });
              return false;
            }
          
            enemy.graphic.position.set(
              enemy.state.x,
              enemy.state.y
            );
          
            enemy.graphic.rotation = enemy.state.rotation;
          
            tableHealth(
              enemy.tableHealth,
              enemy.state.x,
              enemy.state.y,
              enemy.state.health,
              GAMEPLAY_CONFIG[enemy.state.type].initialHealth
            );
            
            updateShipSkin(
              enemy.graphic,
              textures[enemy.state.type],
              enemy.state.health,
              GAMEPLAY_CONFIG[enemy.state.type].initialHealth
            );

            return true;
          });
          explosions = updateExplosions(explosions, deltaSeconds);

          combatEffects = updateCombatEffects(
            combatEffects,
            deltaSeconds
          );
        
          const activeProjectiles = new Set(projectiles);
        
          for (const [projectile, graphic] of projectileGraphics) {
            // Remove o draw quando o projétil deixa de existir.
            if (!activeProjectiles.has(projectile)) {
              graphic.destroy();
              projectileGraphics.delete(projectile);
              continue;
            }
          
            graphic.position.set(projectile.x, projectile.y);
          }

          if (playerState.health <= 0) {
            finishMatch('player-dead');
          } else if (elapsedSeconds >= matchSettings.durationSeconds) {
            finishMatch('time-up');
          }
        });

        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError('Unable to initialize the arena. Return to the menu and try again.');
        }
      }
    }

    void initArena(container);

    return () => {
      // Impede uma inicialização pendente.
      cancelled = true;
    
      destroyInput?.();
      removePauseListeners?.();
      removeTestBridge?.();
    
      pauseGameRef.current = null;
      resumeGameRef.current = null;
    
      // Remove o canvas e libera os draws.
      if (initialized) {
        app.destroy(true, { children: true });
      }
    };
    
  }, [onStatsChange, onFinish])

  function handleTouchPress(key: string, pointerId: number): void {
    touchPointersRef.current.set(pointerId, key);
  }

  function handleTouchRelease(pointerId: number): void {
    touchPointersRef.current.delete(pointerId);
  }

  return (
    <div className="arena-wrapper">
      {loading && <p role="status">Preparing the arena...</p>}
      {error && <p role="alert">{error}</p>}
      <div className="game-controls">
        <button
          type="button"
          disabled={loading || Boolean(error) || isPaused}
          onClick={() => pauseGameRef.current?.()}
        >
          Pause
        </button>
      </div>
        
      <dialog
        ref={pauseDialogRef}
        className="pause-panel"
        aria-labelledby="pause-title"
        onCancel={(event) => {
          event.preventDefault();
          resumeGameRef.current?.();
        }}
      >
        <h2 id="pause-title">Game paused</h2>
        <p>Select Resume to continue.</p>
      
        <button
          ref={resumeButtonRef}
          type="button"
          onClick={() => resumeGameRef.current?.()}
        >
          Resume
        </button>
      </dialog>

      <div
        ref={containerRef}
        className="game-canvas"
        role="img"
        aria-label="Naval arena with water and an island in the center"
      />
      <TouchControls
        disabled={loading || Boolean(error) || isPaused}
        onPress={handleTouchPress}
        onRelease={handleTouchRelease}
      />
    </div>
  )
}
