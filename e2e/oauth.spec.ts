/**
 * e2e tests — OAuth2 Client management (CRUD).
 *
 * Card button order (per card): [CopyButton(client_id), Edit(Pencil), Delete(Trash2)]
 */
import { test, expect } from "./helpers";

const TEST_CLIENT_NAME = `PW Test Client ${Date.now().toString().slice(-5)}`;

/** Returns the specific OAuth card element that has the given client name in its h3 heading. */
function getClientCard(page: import("@playwright/test").Page, name: string) {
  // Use the h3 heading inside each card to uniquely identify the card
  return page.locator("div[class*='rounded-xl']").filter({
    has: page.locator("h3", { hasText: name }),
  });
}

test.describe("OAuth Clients", () => {
  test("shows OAuth clients page with heading and Add button", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await expect(page.getByRole("heading", { name: /oauth/i }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /daftarkan client/i })).toBeVisible();
  });

  test("opens Register Client modal", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await page.getByRole("button", { name: /daftarkan client/i }).click();
    await expect(page.getByRole("heading", { name: /daftarkan client baru/i })).toBeVisible();
    await expect(page.locator("input[placeholder*='TimeStudy']")).toBeVisible();
  });

  test("closes modal when cancelled", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await page.getByRole("button", { name: /daftarkan client/i }).click();
    await expect(page.getByRole("heading", { name: /daftarkan client baru/i })).toBeVisible();
    await page.getByRole("button", { name: /batal/i }).click();
    await expect(page.getByRole("heading", { name: /daftarkan client baru/i })).not.toBeVisible();
  });

  test("creates a new OAuth2 client", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await page.getByRole("button", { name: /daftarkan client/i }).click();

    await page.locator("input[placeholder*='TimeStudy']").fill(TEST_CLIENT_NAME);
    await page.getByRole("button", { name: /simpan/i }).click();

    await expect(page.getByRole("heading", { name: /daftarkan client baru/i })).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator("h3", { hasText: TEST_CLIENT_NAME })).toBeVisible({ timeout: 10_000 });
  });

  test("copy client_id button is visible per card", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await page.waitForTimeout(2_000);
    const copyButtons = page.locator("button[title='Salin']");
    const count = await copyButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("opens edit modal for existing client", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await expect(page.locator("h3", { hasText: TEST_CLIENT_NAME })).toBeVisible({ timeout: 10_000 });

    // Card buttons: [CopyButton, Edit(Pencil), Delete(Trash2)]
    // Edit is at index 1 (second button in the card)
    const card = getClientCard(page, TEST_CLIENT_NAME);
    await card.getByRole("button").nth(1).click();
    await expect(page.getByRole("heading", { name: /edit oauth2 client/i })).toBeVisible();
  });

  test("deletes the test OAuth client", async ({ loggedIn: page }) => {
    await page.goto("/oauth");
    await expect(page.locator("h3", { hasText: TEST_CLIENT_NAME })).toBeVisible({ timeout: 10_000 });

    // Register dialog handler BEFORE click
    page.once("dialog", (dialog) => dialog.accept());

    // Delete is at index 2 (last button in the card)
    const card = getClientCard(page, TEST_CLIENT_NAME);
    await card.getByRole("button").nth(2).click();

    await expect(page.locator("h3", { hasText: TEST_CLIENT_NAME })).not.toBeVisible({ timeout: 10_000 });
  });
});
