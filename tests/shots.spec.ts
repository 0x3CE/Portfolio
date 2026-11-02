import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';

const pages = [
  { name: 'home-en', path: '/en/' },
  { name: 'home-fr', path: '/fr/' },
  { name: 'styleguide', path: '/styleguide/' },
];

for (const page of pages) {
  test(`capture ${page.name}`, async ({ page: browserPage }, testInfo) => {
    const response = await browserPage.goto(page.path, { waitUntil: 'networkidle' });

    // /styleguide n'existe pas dans un build de production : on le saute sans échouer.
    if (page.name === 'styleguide' && !existsSync('out/styleguide/index.html')) {
      test.skip(true, 'styleguide stripped from this build');
    }

    expect(response?.status()).toBe(200);
    await browserPage.screenshot({
      path: `screenshots/${testInfo.project.name}-${page.name}.png`,
      fullPage: true,
    });
  });
}
