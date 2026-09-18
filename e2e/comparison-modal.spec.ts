import { test, expect } from './fixtures';

test.describe('Grid comparison modal', () => {
  test('opens with a preset pair, switching presets updates both grid ids, and it closes cleanly', async ({ page }) => {
    await page.goto('/atlas');

    const searchInput = page.getByLabel('Cari grid');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: 'Komparasi 2 Titik' }).click();

    const dialog = page.locator('[role="dialog"][aria-labelledby="compare-modal-title"]');
    await expect(dialog).toBeVisible();

    const gridIds = dialog.locator('.compare-grid-id');
    await expect(gridIds).toHaveCount(2);
    await expect(gridIds.first()).toContainText('MHK_');
    await expect(gridIds.last()).toContainText('MHK_');

    const idsBefore = await gridIds.allTextContents();

    const presetButtons = dialog.locator('.compare-presets-bar button');
    const presetCount = await presetButtons.count();
    test.skip(presetCount < 2, 'Only one preset available to switch between');

    // Click a preset that is not already active (active ones carry the is-active class).
    for (let i = 0; i < presetCount; i++) {
      const classes = (await presetButtons.nth(i).getAttribute('class')) ?? '';
      if (!classes.includes('is-active')) {
        await presetButtons.nth(i).click();
        break;
      }
    }

    const idsAfter = await gridIds.allTextContents();
    expect(idsAfter).not.toEqual(idsBefore);

    await page.getByLabel('Tutup jendela komparasi').click();
    await expect(dialog).toBeHidden();
  });
});
