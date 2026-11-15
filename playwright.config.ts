import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 8000
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4000',
    viewport: { width: 1280, height: 720 },
    locale: 'ar-EG'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
      },
    },
  ],
  webServer: {
    command: 'node dist/ClinicFlow_frontend/server/server.mjs',
    url: 'http://localhost:4000/alnoor/login',
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      PORT: '4000',
      HOST: '0.0.0.0'
    }
  },
});
