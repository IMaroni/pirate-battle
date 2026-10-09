import { test, expect } from '@playwright/test';
import type { GameTestSnapshot } from '../src/game/testBridge';

test('moves, reverses, rotates and fires the three weapons', async ({ page }) => {
await page.clock.install({
  time: new Date('2026-01-01T00:00:00Z'),
});

await page.goto('/?testMode=1');
await page.clock.pauseAt(
  new Date('2026-01-02T00:00:00Z'),
);

await page.getByRole('button', {
  name: 'Play',
  exact: true,
}).click();

  await expect(
    page.getByText('Preparing the arena...', { exact: true }),
  ).toBeHidden({ timeout: 15000 });

  await expect(page.getByRole('alert')).toHaveCount(0);

  async function readState(): Promise<GameTestSnapshot> {
    return page.evaluate(() => {
      if (!window.gameTest) {
        throw new Error('Game test mode is unavailable.');
      }

      return window.gameTest.getSnapshot();
    });
  }

    async function holdKey(
      key: string,
      milliseconds: number,
    ): Promise<void> {
      await canvas.focus();
      await expect(canvas).toBeFocused();
      await page.keyboard.down(key);

      try {
        const before = await readState();
        expect(before.paused).toBe(false);
        expect(before.pressedKeys).toContain(key);
        await page.clock.runFor(milliseconds);
        const after = await readState();
        expect(after.paused).toBe(false);
        expect(after.pressedKeys).toContain(key);
      } finally {
        await page.keyboard.up(key);
      }
    }

  const canvas = page.locator('.game-canvas canvas');

  await expect(canvas).toBeVisible();
  const pauseTime = await page.evaluate(() => Date.now() + 100);
  await page.clock.pauseAt(pauseTime);
  await canvas.focus();
  await expect(canvas).toBeFocused();
  const initial = await readState();
  await holdKey('KeyW', 150);
  const forward = await readState();
  expect(forward.player.y).toBeLessThan(initial.player.y);
  await holdKey('KeyS', 150);
  const reverse = await readState();
  expect(reverse.player.y).toBeGreaterThan(forward.player.y);
  await holdKey('KeyD', 150);
  const rotated = await readState();
  expect(rotated.player.rotation).toBeGreaterThan(
    reverse.player.rotation,
  );

  await holdKey('Space', 32);
  const frontShots = (await readState()).projectiles.filter(
    (projectile) => projectile.owner === 'player',
  );

  expect(frontShots.length).toBeGreaterThanOrEqual(1);
  await holdKey('KeyQ', 32);

  const leftShots = (await readState()).projectiles.filter(
    (projectile) => projectile.owner === 'player',
  );

  expect(leftShots.length).toBeGreaterThanOrEqual(
    frontShots.length + 3,
  );

  await holdKey('KeyE', 32);

  const rightShots = (await readState()).projectiles.filter(
    (projectile) => projectile.owner === 'player',
  );

  expect(rightShots.length).toBeGreaterThanOrEqual(
    leftShots.length + 3
  );
});