import { defineConfig, devices } from "@playwright/test";

const DEFAULT_FRONT_PORT = 4000;
const DEFAULT_API_PORT = 3000;
const CI_RETRIES = 2;
const LOCAL_RETRIES = 0;
const CI_WORKERS = 1;

const frontPort = process.env["PORT"] ?? DEFAULT_FRONT_PORT;
const frontUrl = `http://localhost:${frontPort}`;
const apiPort = process.env["API_PORT"] ?? DEFAULT_API_PORT;
const apiUrl = `http://localhost:${apiPort}`;

const resolveRetries = (): number => {
  if (process.env["CI"]) {
    return CI_RETRIES;
  }
  return LOCAL_RETRIES;
};

const resolveWorkers = (): number | undefined => {
  if (process.env["CI"]) {
    return CI_WORKERS;
  }
  return undefined;
};

const workers = resolveWorkers();

export default defineConfig({
  forbidOnly: Boolean(process.env["CI"]),
  fullyParallel: true,
  outputDir: "./reports/test-results",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /health\.api\.spec\.ts/,
    },
    {
      name: "api",
      testMatch: /health\.api\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: apiUrl,
      },
    },
  ],
  reporter: [
    ["json", { outputFile: "./reports/results.json" }],
    ["html", { open: "never", outputFolder: "./reports/html" }],
  ],
  retries: resolveRetries(),
  testDir: "./tests",
  use: {
    baseURL: frontUrl,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "nub run start",
      cwd: "../back",
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      url: `${apiUrl}/api/health`,
    },
    {
      command: "nub run start",
      cwd: "../front",
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      url: frontUrl,
    },
  ],
  ...(workers === undefined ? {} : { workers }),
});
