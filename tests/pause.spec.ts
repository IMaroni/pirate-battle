import { test, expect } from '@playwright/test';

test('pauses the match and resumes without counting paused time', async ({ page }) => {

  await page.clock.install();

  await page.goto('/');

  await page.getByRole('button', {
    name: 'Play',
    exact: true,
  }).click();

  const pauseButton = page.getByRole('button', {
    name: 'Pause',
    exact: true,
  });

  await expect(pauseButton).toBeEnabled();
  await expect(page.locator('.game-canvas canvas')).toBeVisible();

  await pauseButton.click();

  const pauseDialog = page.getByRole('dialog', {
    name: 'Game paused',
    exact: true,
  });

  await expect(pauseDialog).toBeVisible();

  const hud = page.getByRole('status', {
    includeHidden: true
  }).filter({
    hasText: 'Health:'
  });

  async function readRemainingTime(): Promise<number> {
    const text = await hud.innerText();
    const match = text.match(/Time:\s*(\d+)s/);

    if (!match) {
      throw new Error('Remaining time was not found in the HUD.');
    }

    return Number(match[1]);
  }

  const pausedHud = await hud.innerText();
  const pausedTime = await readRemainingTime();
  await page.clock.fastForward(10000);
  await expect(hud).toHaveText(pausedHud);
  await expect(pauseDialog).toBeVisible();

  await pauseDialog.getByRole('button', {
    name: 'Resume',
    exact: true,
  }).click();

  await expect(pauseDialog).not.toBeVisible();
  await page.clock.runFor(1500);
  await expect.poll(readRemainingTime).toBeLessThan(pausedTime);
  const resumedTime = await readRemainingTime();
  expect(resumedTime).toBeGreaterThanOrEqual(pausedTime - 3);
});