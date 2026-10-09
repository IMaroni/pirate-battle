import type {
  EnemyState,
  PlayerState,
  ProjectileState,
} from '../types/game';
import { GAMEPLAY_CONFIG } from '../config/gamePlayConfig';
import { type CombatHit } from '../types/game'; 

interface CombatResult {
  projectiles: ProjectileState[];
  scoreIncrease: number;
}

interface CombatResult {
  projectiles: ProjectileState[];
  scoreIncrease: number;
  hits: CombatHit[];
}

export function resolveCombat(
  player: PlayerState,
  enemies: EnemyState[],
  projectiles: ProjectileState[],
): CombatResult {
  let scoreIncrease = 0;
  const hits: CombatHit[] = [];

  const remainingProjectiles = projectiles.filter((projectile) => {
    // Depois da morte, nenhum outro tiro aplica dano ou pontua.
    if (player.health <= 0) {
      return true;
    }

    if (projectile.owner === 'enemy') {
      const distance = Math.hypot(
        projectile.x - player.x,
        projectile.y - player.y,
      );
    
      const hitPlayer =
        distance <=
        projectile.radius + GAMEPLAY_CONFIG.player.collisionRadius;
    
      if (!hitPlayer) {
        return true;
      }
    
      player.health = Math.max(
        0,
        player.health - projectile.shotDamage,
      );
      // Informa onde aconteceu o impacto para a renderização.
      hits.push({
        x: projectile.x,
        y: projectile.y,
      });
    
      // Remove o tiro imediatamente após acertar.
      return false;
    }

    // Procura um inimigo vivo atingido por este tiro.
    const hitEnemy = enemies.find((enemy) => {
      if (enemy.health <= 0) {
        return false;
      }

      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y,
      );

      return (
        distance <=
        projectile.radius + GAMEPLAY_CONFIG[enemy.type].collisionRadius
      );
    });

    if (!hitEnemy) {
      return true;
    }

    hitEnemy.health = Math.max(
      0,
      hitEnemy.health - projectile.shotDamage,
    );

    if (hitEnemy.health === 0) {
      scoreIncrease += 1;
    }

    // Informa onde aconteceu o impacto para a renderização.
    hits.push({
      x: projectile.x,
      y: projectile.y,
    });
    // Um tiro atinge somente um inimigo e depois desaparece.
    return false;
  });

  for (const enemy of enemies) {
    if (player.health <= 0) {
      break;
    }

    if (enemy.health <= 0 || enemy.type !== 'chaser') {
      continue;
    }

    const distance = Math.hypot(
      player.x - enemy.x,
      player.y - enemy.y,
    );

    const contactDistance =
      GAMEPLAY_CONFIG.player.collisionRadius +
      GAMEPLAY_CONFIG.chaser.collisionRadius;

    if (distance <= contactDistance) {
      player.health = Math.max(
        0,
        player.health - GAMEPLAY_CONFIG.chaser.hitDamage,
      );

      // O impacto destrói o Chaser sem gerar pontos.
      enemy.health = 0;
    }
  }

  return {
    projectiles: remainingProjectiles,
    scoreIncrease,
    hits,
  };
}