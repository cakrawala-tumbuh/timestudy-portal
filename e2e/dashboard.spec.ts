/**
 * e2e tests — Dashboard page.
 */
import { test, expect } from "./helpers";

test.describe("Dashboard", () => {
  test("shows KPI stat cards", async ({ loggedIn: page }) => {
    await page.goto("/dashboard");
    // Dashboard has stat cards with numeric values
    await expect(page.locator("text=/total responden|responden aktif|total log|log hari ini/i").first()).toBeVisible({ timeout: 10_000 });
  });

  test("renders the bar chart area", async ({ loggedIn: page }) => {
    await page.goto("/dashboard");
    // Recharts renders a SVG
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 10_000 });
  });

  test("shows navigation sidebar with all menu items", async ({ loggedIn: page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /responden/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /log harian/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /oauth/i })).toBeVisible();
  });

  test("sidebar links navigate to correct pages", async ({ loggedIn: page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /responden/i }).click();
    await expect(page).toHaveURL(/respondents/);
  });
});
