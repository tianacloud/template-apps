import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/browser',
  workers: 1,
  timeout: 45_000,
  use: { baseURL: 'http://127.0.0.1:4189',viewport: { width: 1440,height: 1000 },trace: 'retain-on-failure' },
  webServer: { command: 'node tests/browser/server.mjs',url: 'http://127.0.0.1:4189',reuseExistingServer: false,timeout: 60_000 },
});
