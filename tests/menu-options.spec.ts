import { test, expect } from '@playwright/test';

test('saves options and keeps them after refreshing', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', {
    name: 'Options',
    exact: true,
  }).click();

  await page.getByLabel('Game session time (seconds)').fill('90');
  await page.getByLabel('Enemy spawn time (seconds)').fill('4');

  await page.getByRole('button', {
    name: 'Save Settings',
    exact: true,
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Pirate Battle', exact: true }),
  ).toBeVisible();

  await expect(page.getByText('Settings saved!', {
    exact: true,
  })).toBeVisible();

  await page.reload();

  await page.getByRole('button', {
    name: 'Options',
    exact: true,
  }).click();

  await expect(
    page.getByLabel('Game session time (seconds)'),
  ).toHaveValue('90');

  await expect(
    page.getByLabel('Enemy spawn time (seconds)'),
  ).toHaveValue('4');
});

test('opens history, switches tabs and returns to the menu', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', {
    name: 'Match History',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog', {
    name: "Captain's Log",
  });

  await expect(dialog).toBeVisible();

  await expect(
    dialog.getByRole('tab', { name: 'Match History' }),
  ).toHaveAttribute('aria-selected', 'true');

  await dialog.getByRole('tab', {
    name: 'Ranking',
    exact: true,
  }).click();

  await expect(
    dialog.getByRole('tab', { name: 'Ranking', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');

  await dialog.getByRole('button', {
    name: 'Main Menu',
    exact: true,
  }).click();

  await expect(dialog).toHaveCount(0);

  await expect(
    page.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Match History', exact: true }),
  ).toBeFocused();
});

test('rejects invalid options without saving them', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', {
    name: 'Options',
    exact: true,
  }).click();

  const durationInput = page.getByLabel(
    'Game session time (seconds)',
  );

  const spawnInput = page.getByLabel(
    'Enemy spawn time (seconds)',
  );

  const saveButton = page.getByRole('button', {
    name: 'Save Settings',
    exact: true,
  });

  await durationInput.fill('190');
  await saveButton.click();

  await expect.poll(() =>
    durationInput.evaluate((element: HTMLInputElement) => {
      return element.validity.rangeOverflow;
    }),
  ).toBe(true);
  
  await expect(
    page.getByRole('heading', { name: 'Options', exact: true }),
  ).toBeVisible();

  await durationInput.fill('90');
  await spawnInput.fill('0');
  await saveButton.click();

  await expect.poll(() =>
    spawnInput.evaluate((element: HTMLInputElement) => {
      return element.validity.rangeUnderflow;
    }),
  ).toBe(true);

  await page.getByRole('button', {
    name: 'Main Menu',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'Options',
    exact: true,
  }).click();

  await expect(durationInput).toHaveValue('60');
  await expect(spawnInput).toHaveValue('3');
});