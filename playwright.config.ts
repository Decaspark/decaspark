import { defineConfig } from '@playwright/test';

const executablePath = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4210',
    trace: 'on-first-retry',
    launchOptions: executablePath
      ? {
          executablePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }
      : undefined,
  },
  webServer: {
    command: 'PORT=4210 HOST=127.0.0.1 node dist/decaspark/server/server.mjs',
    url: 'http://127.0.0.1:4210',
    reuseExistingServer: !process.env['CI'],
    timeout: 30000,
  },
});
