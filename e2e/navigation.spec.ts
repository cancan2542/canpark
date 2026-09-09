import { expect, test } from "@playwright/test";

test("top page does not render hard-coded spots", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "都道府県から探す", level: 1 })).toBeVisible();
  await expect(page.getByText("車中泊スポットとハザード確認メモ")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "免責事項を確認する" })).toHaveCount(0);
  const japanMap = page.getByTestId("japan-map");
  await expect(japanMap).toBeVisible();
  const mapBox = await japanMap.boundingBox();
  const viewportWidth = page.viewportSize()?.width;
  expect(mapBox?.width).toBe(viewportWidth && viewportWidth >= 992 ? 960 : (viewportWidth ?? 32) - 32);

  await expect(page.locator("main article")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "山梨県の記事を見る" })).toHaveCount(0);

  await page.goto("/prefectures/yamanashi");
  await expect(page.getByRole("heading", { name: "山梨県" })).toBeVisible();
  await expect(page.getByTestId("prefecture-map")).toBeVisible();
  await expect(page.getByTestId("prefecture-map").getByRole("link")).toHaveCount(0);

  await page.getByRole("link", { name: "富士河口湖町" }).click();
  await expect(page.getByRole("heading", { name: "富士河口湖町" })).toBeVisible();
  await expect(page.getByText("ハザード確認済みスポット: 0件")).toBeVisible();
  await expect(page.locator('a[href^="/spots/"]')).toHaveCount(0);
});

test("disclaimer page is reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "免責事項" }).first().click();
  await expect(page.getByRole("heading", { name: "免責事項" })).toBeVisible();
});
