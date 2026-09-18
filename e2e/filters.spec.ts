import { test, expect } from './fixtures';

test.describe('Atlas filters', () => {
  test('applying a recommendation-tier filter changes the visible grid count', async ({ page }) => {
    await page.goto('/atlas');

    const searchInput = page.getByLabel('Cari grid');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });

    const counter = page.locator('span[aria-live="polite"]');
    await expect(counter).toBeVisible();
    await expect(counter).toContainText('grid terlihat');

    const beforeText = (await counter.textContent()) ?? '';

    const tierSelect = page.getByLabel('Tingkat Rekomendasi');
    await expect(tierSelect).toBeVisible();
    const options = await tierSelect.locator('option').allTextContents();
    const r1Option = options.find(o => o.trim().startsWith('R1'));
    test.skip(!r1Option, 'No R1 option present in this data snapshot');

    await tierSelect.selectOption({ label: r1Option! });

    await expect(counter).not.toHaveText(beforeText, { timeout: 15_000 });
    await expect(counter).toContainText('grid terlihat');

    const resetButton = page.getByRole('button', { name: 'Hapus Filter & Pencarian' });
    await resetButton.click();
    await expect(tierSelect).toHaveValue('');
  });

  test('grid search narrows the results down to a single match', async ({ page }) => {
    await page.goto('/atlas');

    const searchInput = page.getByLabel('Cari grid');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });

    const counter = page.locator('span[aria-live="polite"]');
    await searchInput.fill('MHK_R0237_C0166');

    await expect(counter).toContainText('1 grid terlihat', { timeout: 20_000 });
  });
});
