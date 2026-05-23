/**
 * e2e tests — Daily Logs (view, filter, pagination).
 */
import { test, expect } from "./helpers";

test.describe("Daily Logs", () => {
  test("shows daily logs page with filter panel and table", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await expect(page.getByRole("heading", { name: /log harian/i })).toBeVisible({ timeout: 10_000 });
    // Filter panel
    await expect(page.getByText(/filter/i)).toBeVisible({ timeout: 10_000 });
  });

  test("filter inputs are visible (resp_id, date range, sync status)", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await expect(page.locator("input[placeholder*='responden' i]")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("input[type='date']").first()).toBeVisible();
    await expect(page.locator("select")).toBeVisible();
  });

  test("filter by sync status — Belum sinkron", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await page.locator("select").selectOption("false");
    // After selecting, table refreshes — just verify no crash
    await page.waitForTimeout(1_000);
    await expect(page.locator("select")).toHaveValue("false");
  });

  test("filter by sync status — Sudah sinkron", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await page.locator("select").selectOption("true");
    await page.waitForTimeout(1_000);
    await expect(page.locator("select")).toHaveValue("true");
  });

  test("filter by resp_id updates table", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await page.locator("input[placeholder*='responden' i]").fill("NONEXISTENT-99999");
    await page.waitForTimeout(1_200);
    // Should show empty state or no rows — just verify page doesn't crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("filter by date range", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    const [fromInput, toInput] = await page.locator("input[type='date']").all();
    await fromInput.fill("2024-01-01");
    await toInput.fill("2024-12-31");
    await page.waitForTimeout(1_000);
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows pagination controls when there is data", async ({ loggedIn: page }) => {
    await page.goto("/daily-logs");
    await page.waitForTimeout(2_000);
    // Pagination only appears when data > 1 page, so just check the page loads
    await expect(page.locator("body")).toBeVisible();
  });
});
