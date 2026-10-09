export interface GameSettings {
  durationSeconds: number;
  enemySpawnInterval: number;
}

export interface PlayerState {
  x: number;
  y: number;
  rotation: number;
  health: number;
}

export interface ProjectileState {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  radius: number;
  shotDamage: number;
  remainingSeconds: number;
  owner: 'player' | 'enemy';
}

export type ShotSide = 'left' | 'right';

export interface EnemyState extends PlayerState {
  type: 'chaser' | 'shooter';
}

export interface GameStats {
  health: number;
  score: number;
  remainingSeconds: number;
}

export type MatchEndReason = 'time-up' | 'player-dead';

export interface MatchResult {
  id: string;
  playerId: string;
  endedAt: string;
  score: number;
  durationSeconds: number;
  endReason: MatchEndReason;
  settings: GameSettings;
}

export interface EnemyState extends PlayerState {
  type: 'chaser' | 'shooter';
  shotCooldown: number;
}

export interface CombatHit {
  x: number;
  y: number;
}

export interface IslandState {
  x: number;
  y: number;
  radius: number;
}