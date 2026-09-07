import { expect, test } from "@playwright/test";

test("top page links through regional navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /地図から/ })).toBeVisible();
  await expect(page.getByTestId("japan-map")).toBeVisible();

  const yamanashiMapLink = page.getByRole("link", { name: "山梨県の記事を見る" });
  await yamanashiMapLink.focus();
  await expect(yamanashiMapLink.locator("xpath=..").locator(".tooltip")).toBeVisible();
  await expect(yamanashiMapLink.locator("xpath=..").locator(".tooltip")).toContainText("山梨県");

  await yamanashiMapLink.click();
  await expect(page.getByRole("heading", { name: "山梨県" })).toBeVisible();
  await expect(page.getByTestId("prefecture-map")).toBeVisible();

  const mapSpotLink = page.getByRole("link", { name: /道の駅\s*かつやまの記事を読む/ });
  await mapSpotLink.focus();
  await expect(mapSpotLink.locator(".spot-tooltip")).toBeVisible();
  await expect(mapSpotLink.locator(".spot-tooltip")).toHaveText("道の駅 かつやま");

  await page.getByRole("link", { name: "富士河口湖町" }).click();
  await expect(page.getByRole("heading", { name: "富士河口湖町" })).toBeVisible();

  const spotLink = page.locator('a[href^="/spots/"]').first();
  const spotTitle = (await spotLink.textContent())?.trim();
  if (!spotTitle) throw new Error("Spot link title was empty.");
  await spotLink.click();
  await expect(page.getByRole("heading", { name: spotTitle })).toBeVisible();
  await expect(page.getByText("ハザード確認", { exact: true })).toBeVisible();
  await expect(page.getByText("現地Tips")).toBeVisible();
  await expect(page.getByRole("link", { name: "免責事項を確認する" })).toBeVisible();
});

test("reduced motion disables the spot pin drop animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/prefectures/yamanashi");

  const pin = page.getByRole("link", { name: /道の駅\s*かつやまの記事を読む/ });
  await expect(pin).toBeVisible();
  await expect(pin).toHaveCSS("animation-name", "none");
});

test("disclaimer page is reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "免責事項" }).first().click();
  await expect(page.getByRole("heading", { name: "免責事項" })).toBeVisible();
});
