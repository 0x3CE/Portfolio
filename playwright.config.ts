import { defineConfig, devices } from '@playwright/test';

/** Captures desktop 1440px et mobile 390px, servies depuis `out/`. */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npx --yes serve out -l 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      // iPhone 14 par défaut en WebKit : on garde Chromium pour n'installer qu'un moteur.
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
        channel: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
