import type { TableHealth } from './createTableHealth';

export function tableHealth(
  table: TableHealth,
  x: number,
  y: number,
  health: number,
  maximumHealth: number
): void {
  const healthRatio = maximumHealth > 0
    ? Math.max(0, Math.min(1, health / maximumHealth))
    : 0;

  // Centraliza a imagem de 160 pixels, considerando a escala de 0.35.
  table.container.position.set(x - 28, y - 48);
  table.container.visible = health > 0;

  table.fill.texture = healthRatio <= 0.3
    ? table.textures.red
    : table.textures.green;

  // Recorta o preenchimento sem deformar sua imagem.
  // Estes valores acompanham a área interna do asset fornecido.
  table.fillMask
    .clear()
    .rect(24, 0, 112 * healthRatio, 40)
    .fill(0xffffff);
}