import { expect, test } from "@playwright/test";

test("top page links through regional navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /地図から/ })).toBeVisible();
  await expect(page.getByTestId("site-map")).toBeVisible();

  await page.getByRole("link", { name: "山梨県" }).click();
  await expect(page.getByRole("heading", { name: "山梨県" })).toBeVisible();

  await page.getByRole("link", { name: "富士河口湖町" }).click();
  await expect(page.getByRole("heading", { name: "富士河口湖町" })).toBeVisible();

  await page.getByRole("link", { name: "道の駅 かつやま" }).click();
  await expect(page.getByRole("heading", { name: "道の駅 かつやま" })).toBeVisible();
  await expect(page.getByText("ハザード確認")).toBeVisible();
  await expect(page.getByText("現地Tips")).toBeVisible();
  await expect(page.getByRole("link", { name: "免責事項を確認する" })).toBeVisible();
});

test("disclaimer page is reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "免責事項" }).first().click();
  await expect(page.getByRole("heading", { name: "免責事項" })).toBeVisible();
});
