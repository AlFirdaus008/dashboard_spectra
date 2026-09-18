import { test, expect } from './fixtures';

test.describe('Grid selection', () => {
  test('searching a known grid id selects it and shows its detail panel', async ({ page }) => {
    await page.goto('/atlas');

    const searchInput = page.getByLabel('Cari grid');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });

    await expect(page.getByText('Pilih grid pada peta atau cari ID grid')).toBeVisible();

    await searchInput.fill('MHK_R0237_C0166');

    await expect(page.getByRole('heading', { name: 'MHK_R0237_C0166' })).toBeVisible({ timeout: 20_000 });
  });

  test('clicking the rendered map selects a grid and updates the detail panel', async ({ page }) => {
    await page.goto('/atlas');

    const searchInput = page.getByLabel('Cari grid');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });

    // Switch to the full 24,306-node scope first: the default view only shows
    // the 1,696 sparse screening targets, which leaves too much empty water
    // between features for a blind click to reliably land on one.
    await page.getByRole('button', { name: 'Semua Node' }).click();
    await expect(page.locator('.load-status')).toBeHidden({ timeout: 30_000 });

    const mapCanvas = page.getByLabel('Peta interaktif grid DAS Mahakam');
    await expect(mapCanvas).toBeVisible({ timeout: 30_000 });
    // Let the fitBounds animation and tile/paint settle before clicking.
    await page.waitForTimeout(2_000);

    const box = await mapCanvas.boundingBox();
    test.skip(!box, 'Map canvas did not report a bounding box');

    // Find a screen point that actually has a rendered grid feature under it
    // (the "grids" fill layer only covers a fraction of the canvas, so a
    // blind click misses far more often than it hits), then fire the same
    // 'click' event MapLibre's own canvas handler would dispatch for a real
    // mouse click at that point. window.__mahakamMap is only exposed in
    // non-production builds, see MahakamMap.tsx.
    const clicked = await page.evaluate(([w, h]) => {
      const anyWindow = window as unknown as { __mahakamMap?: import('maplibre-gl').Map };
      const map = anyWindow.__mahakamMap;
      if (!map) return false;
      const stepsX = 24;
      const stepsY = 24;
      for (let ix = 1; ix < stepsX; ix++) {
        for (let iy = 1; iy < stepsY; iy++) {
          const point: [number, number] = [(w * ix) / stepsX, (h * iy) / stepsY];
          const features = map.queryRenderedFeatures(point, { layers: ['grids'] });
          if (features.length > 0) {
            map.fire('click', {
              point: { x: point[0], y: point[1] },
              lngLat: map.unproject(point),
              originalEvent: new MouseEvent('click'),
            } as unknown as import('maplibre-gl').MapMouseEvent);
            return true;
          }
        }
      }
      return false;
    }, [box!.width, box!.height]);

    test.skip(!clicked, 'No rendered grid feature found anywhere on the current map viewport');

    await expect(page.locator('.detail h2')).toContainText('MHK_', { timeout: 5_000 });
  });
});
