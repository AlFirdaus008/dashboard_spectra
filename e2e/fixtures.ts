import { test as base, expect } from '@playwright/test';

// Every Atlas test opens on a fresh browser profile, which would otherwise
// trigger the first-visit OnboardingGuide overlay and block every subsequent
// click. Pre-seed its dismissal flag before the app's own scripts run.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('mahakam_atlas_onboarding_dismissed', 'true');
    });
    await use(page);
  },
});

export { expect };
