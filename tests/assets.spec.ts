import { test, expect } from '@playwright/test';

test('shows an asset error and allows another attempt', async ({
  page,
  context
}) => {
  let blockShipImage = true;

  await context.route(
    '**/assets/png/default/ships/ship_5.png',
    async (route) => {
      if (blockShipImage) {
        await route.abort();
        return;
      }
      await route.continue();
    },
  );

  await page.goto('/');
  await page.getByRole('button', {
    name: 'Play',
    exact: true,
  }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Unable to initialize the arena. Return to the menu and try again.',
    { timeout: 15000 },
  );

  await page.getByRole('button', {
    name: 'Main Menu',
    exact: true,
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Pirate Battle',
      exact: true,
    }),
  ).toBeVisible();

  blockShipImage = false;

  await page.getByRole('button', {
    name: 'Play',
    exact: true
  }).click();
  await expect(
    page.getByText('Preparing the arena...', { exact: true }),
  ).toBeHidden({ timeout: 15000 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  const canvas = page.locator('.game-canvas canvas');
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
});