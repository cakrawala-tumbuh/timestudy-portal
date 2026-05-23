/**
 * e2e tests — Respondents management (CRUD).
 */
import { test, expect } from "./helpers";

const TEST_RESP_ID = `PW-${Date.now().toString().slice(-5)}`;
const TEST_RESP_NAME = "Playwright Tester";

test.describe("Respondents", () => {
  test("shows respondents list page with header and Add button", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await expect(page.getByRole("heading", { name: /responden/i }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /tambah responden/i })).toBeVisible();
  });

  test("opens Add Respondent modal", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await page.getByRole("button", { name: /tambah responden/i }).click();
    // Modal heading is h2 — use role heading to avoid strict-mode conflict with button
    await expect(page.getByRole("heading", { name: "Tambah Responden" })).toBeVisible();
    await expect(page.locator("input[placeholder='R-001']")).toBeVisible();
  });

  test("closes modal when cancelled", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await page.getByRole("button", { name: /tambah responden/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Responden" })).toBeVisible();
    await page.getByRole("button", { name: /batal/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Responden" })).not.toBeVisible();
  });

  test("creates a new respondent", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await page.getByRole("button", { name: /tambah responden/i }).click();
    await expect(page.getByRole("heading", { name: "Tambah Responden" })).toBeVisible();

    await page.locator("input[placeholder='R-001']").fill(TEST_RESP_ID);
    await page.locator("input[placeholder='Nama Responden']").fill(TEST_RESP_NAME);
    // PIN is required for new respondent
    await page.locator("input[placeholder='Min. 4 karakter']").fill("1234");

    await page.getByRole("button", { name: /simpan/i }).click();

    // Modal closes and new respondent appears in list
    await expect(page.getByRole("heading", { name: "Tambah Responden" })).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(TEST_RESP_ID)).toBeVisible({ timeout: 10_000 });
  });

  test("shows search input and filters list", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    // Placeholder from component: "Cari kode atau nama…"
    const searchInput = page.locator("input[placeholder='Cari kode atau nama\u2026']");
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill(TEST_RESP_ID);
    await expect(page.getByText(TEST_RESP_ID)).toBeVisible({ timeout: 10_000 });
  });

  test("opens edit modal for existing respondent", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await expect(page.getByText(TEST_RESP_ID)).toBeVisible({ timeout: 10_000 });
    // In the AKSI column: first button = Pencil (edit), second = Trash (delete)
    const row = page.locator("tr", { hasText: TEST_RESP_ID });
    await row.getByRole("button").first().click();
    await expect(page.getByRole("heading", { name: "Edit Responden" })).toBeVisible();
  });

  test("deletes the test respondent", async ({ loggedIn: page }) => {
    await page.goto("/respondents");
    await expect(page.getByText(TEST_RESP_ID)).toBeVisible({ timeout: 10_000 });

    // Register dialog handler BEFORE click
    page.once("dialog", (dialog) => dialog.accept());

    const row = page.locator("tr", { hasText: TEST_RESP_ID });
    // Second button in AKSI column = Trash (delete)
    await row.getByRole("button").last().click();

    await expect(page.getByText(TEST_RESP_ID)).not.toBeVisible({ timeout: 10_000 });
  });
});
