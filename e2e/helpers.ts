/**
 * Shared helpers & fixtures for Playwright e2e tests.
 * Provides a `loggedIn` fixture that navigates to /login and authenticates.
 */
import { test as base, expect, type Page } from "@playwright/test";

export const BASE_URL = "http://localhost:3000";
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "changeme123";

/** Log into the portal and wait until the dashboard is ready. */
export async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[autocomplete="username"]').fill(ADMIN_USER);
  await page.locator('input[autocomplete="current-password"]').fill(ADMIN_PASS);
  await page.locator('button[type="submit"]').click();
  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page).toHaveURL(/dashboard/);
}

/** Fixture: page that is already authenticated. */
export const test = base.extend<{ loggedIn: Page }>({
  loggedIn: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
