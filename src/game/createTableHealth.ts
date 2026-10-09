import {
  Assets,
  Container,
  Graphics,
  Sprite,
  type Texture
} from 'pixi.js';

export interface TableHealthTextures {
  frame: Texture;
  green: Texture;
  red: Texture;
}

export interface TableHealth {
  container: Container;
  fill: Sprite;
  fillMask: Graphics;
  textures: TableHealthTextures;
}

export async function loadTableHealthTextures(): Promise<TableHealthTextures> {
  const [frame, green, red] = await Promise.all([
    Assets.load<Texture>(
      '/assets/png/default/ui/hud/enemy_health_frame.png'
    ),
    Assets.load<Texture>(
      '/assets/png/default/ui/hud/enemy_health_fill_green.png'
    ),
    Assets.load<Texture>(
      '/assets/png/default/ui/hud/enemy_health_fill_red.png'
    )
  ]);

  return {
    frame,
    green,
    red
  };
}

export function createTableHealth(
  textures: TableHealthTextures
): TableHealth {
  const container = new Container();
  const frame = new Sprite(textures.frame);
  const fill = new Sprite(textures.green);
  const fillMask = new Graphics();
  container.scale.set(0.35);
  // O preenchimento fica por cima do fundo escuro da moldura.
  container.addChild(frame, fill, fillMask);
  fill.mask = fillMask;

  return {
    container,
    fill,
    fillMask,
    textures,
  };
}