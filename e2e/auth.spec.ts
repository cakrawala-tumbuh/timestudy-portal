/**
 * e2e tests — Authentication (login / logout / redirect).
 */
import { test, expect } from "@playwright/test";
import { ADMIN_USER, ADMIN_PASS, login } from "./helpers";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("shows login form with username, password and submit button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[autocomplete="username"]').fill("admin");
    await page.locator('input[autocomplete="current-password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();
    await expect(
      page.getByText(/username atau password salah/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("logs in successfully with valid credentials and lands on dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("logs out via header menu and redirects to login", async ({ page }) => {
    await login(page);
    // Click the logout button in the header
    await page.getByRole("button", { name: /keluar|logout|sign out/i }).click();
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test("authenticated user on /login is redirected to dashboard", async ({ page }) => {
    await login(page);
    await page.goto("/login");
    await expect(page).toHaveURL(/dashboard/);
  });
});
