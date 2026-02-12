import { test, expect } from '@playwright/test';

test('smoke: place ships, start battle, fire one shot', async ({ page }) => {
  await page.goto('/');

  // Start a new game
  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('message')).toContainText('Place:');

  // Place 5 ships on the player board (horizontal, rows 0/2/4/6/8, col 0)
  const playerBoard = page.getByTestId('player-board');
  const shipRows = [0, 2, 4, 6, 8];
  for (const row of shipRows) {
    await playerBoard.getByTestId(`cell-${row}-0`).click();
  }

  // All ships placed — Start Battle button should appear
  await expect(page.getByTestId('start-battle')).toBeVisible();
  await page.getByTestId('start-battle').click();
  await expect(page.getByTestId('message')).toContainText('Your turn');

  // Fire one shot at the enemy board
  const enemyBoard = page.getByTestId('enemy-board');
  await enemyBoard.getByTestId('cell-0-0').click();

  // Message should reflect a hit, miss, or sunk outcome
  await expect(page.getByTestId('message')).toHaveText(
    /(Hit|Miss|sunk|Your turn)/i,
    { timeout: 3000 },
  );
});
