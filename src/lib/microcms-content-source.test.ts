import { describe, expect, it, vi } from "vitest";
import { createMicroCMSContentSource } from "@/lib/microcms-content-source";

const config = { serviceDomain: "canpark", apiKey: "test-api-key" };

function listResponse(contents: unknown[]): Response {
  return new Response(
    JSON.stringify({ contents, totalCount: contents.length, offset: 0, limit: 100 }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

describe("microCMS content source", () => {
  const regularSpot = {
    id: "regular-spot",
    title: "通常記事",
    genreSlug: "roadside-station",
  };
  const testSpot = {
    id: "test-spot",
    title: "テスト記事",
    genreSlug: "connection-test",
  };

  it("includes connection-test articles in development", async () => {
    const source = createMicroCMSContentSource({
      config,
      fetcher: vi.fn(async () => listResponse([regularSpot, testSpot])),
      includeTestContent: true,
    });

    await expect(source.loadSpots()).resolves.toEqual([
      expect.objectContaining({ id: "regular-spot" }),
      expect.objectContaining({ id: "test-spot" }),
    ]);
  });

  it("excludes connection-test articles from production", async () => {
    const source = createMicroCMSContentSource({
      config,
      fetcher: vi.fn(async () => listResponse([regularSpot, testSpot])),
      includeTestContent: false,
    });

    await expect(source.loadSpots()).resolves.toEqual([
      expect.objectContaining({ id: "regular-spot" }),
    ]);
  });
});
