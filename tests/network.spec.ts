import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function applyScenario(
  page: Page,
  scenario: string,
): Promise<void> {
  await page.getByRole('button', {
    name: 'Network tests',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog', {
    name: 'Network tests',
    exact: true,
  });

  await dialog.getByLabel('Simulation scenario').selectOption(scenario);

  await dialog.getByRole('button', {
    name: 'Apply scenario',
    exact: true,
  }).click();

  await expect(dialog).toHaveCount(0);
}

test('loads ranking and navigates between pages', async ({ page }) => {
  await page.goto('/');
  await applyScenario(page, 'success');

  await page.getByRole('button', {
    name: 'Ranking',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog', {
    name: "Captain's Log",
  });

  const table = dialog.getByRole('table');

  await expect(dialog.getByText('Page 1 of 2', {
    exact: true,
  })).toBeVisible();

  await expect(table.getByRole('row')).toHaveCount(6);

  await dialog.getByRole('button', {
    name: 'Next',
    exact: true,
  }).click();

  await expect(dialog.getByText('Page 2 of 2', {
    exact: true,
  })).toBeVisible();

    await expect(table.getByRole('row')).toHaveCount(2);

    await expect(
      table.getByRole('cell', { name: 'Black Pearl', exact: true }),
    ).toBeVisible();

  await expect(
    dialog.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled();

  await dialog.getByRole('button', {
    name: 'Previous',
    exact: true,
  }).click();

  await expect(table.getByRole('row')).toHaveCount(6);
});

test('shows empty ranking and history messages', async ({ page }) => {
  await page.goto('/');
  await applyScenario(page, 'empty');

  await page.getByRole('button', {
    name: 'Ranking',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog', {
    name: "Captain's Log",
  });

  await expect(
    dialog.getByText('No matches found for this configuration.', {
      exact: true,
    }),
  ).toBeVisible();

  await dialog.getByRole('tab', {
    name: 'Match History',
    exact: true,
  }).click();

  await expect(
    dialog.getByText('No matches recorded yet.', {
      exact: true,
    }),
  ).toBeVisible();
});

test('shows connection errors without blocking gameplay', async ({ page }) => {
  await page.goto('/');
  await applyScenario(page, 'connection-error');

  await page.getByRole('button', {
    name: 'Ranking',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog', {
    name: "Captain's Log",
  });

  await expect(dialog.getByRole('alert')).toHaveText(
    'Unable to load the ranking.',
  );

  await expect(dialog.getByRole('button', {
    name: 'Try Again',
    exact: true,
  })).toBeVisible();

  await dialog.getByRole('tab', {
    name: 'Match History',
    exact: true,
  }).click();

  await expect(dialog.getByRole('alert')).toHaveText(
    'Unable to load match history.',
  );

  await dialog.getByRole('button', {
    name: 'Main Menu',
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'Play',
    exact: true,
  }).click();

    await expect(
      page.getByText('Preparing the arena...', { exact: true }),
    ).toBeHidden({ timeout: 15000 });
    
    await expect(page.getByRole('alert')).toHaveCount(0);
    
    await expect(
      page.locator('.game-canvas canvas'),
    ).toBeVisible();
});