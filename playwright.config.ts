import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Every test drives the same heavy WebGL map (large GeoJSON load + canvas
  // paint). Running them in parallel starves each browser of CPU/GPU time
  // and makes the map-render-dependent assertions flaky; serial execution
  // costs under a minute total for this suite and removes that flakiness.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1300 },
  },
  projects: [
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1440, height: 1300 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
