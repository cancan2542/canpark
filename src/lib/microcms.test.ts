import { describe, expect, it, vi } from "vitest";
import { fetchMicroCMSList, microCMSApiUrl } from "@/lib/microcms";

const config = {
  serviceDomain: "canpark",
  apiKey: "test-api-key",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("microCMS transport", () => {
  it("only builds API URLs from valid service domains and endpoints", () => {
    expect(microCMSApiUrl("canpark", "spots")?.toString()).toBe(
      "https://canpark.microcms.io/api/v1/spots",
    );
    expect(microCMSApiUrl("example.com/path?", "spots")).toBeNull();
    expect(microCMSApiUrl("canpark", "../users")).toBeNull();
  });

  it("requests the expected endpoint with GET and the API key header", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ contents: [{ id: "spot-1" }] }));

    await expect(
      fetchMicroCMSList<{ id: string }>("spots", { config, fetcher }),
    ).resolves.toEqual([{ id: "spot-1" }]);

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://canpark.microcms.io/api/v1/spots"),
      expect.objectContaining({
        method: "GET",
        headers: {
          "X-MICROCMS-API-KEY": "test-api-key",
        },
      }),
    );
  });

  it.each([
    { serviceDomain: undefined, apiKey: "test-api-key" },
    { serviceDomain: "canpark", apiKey: undefined },
  ])("does not make a request when credentials are incomplete", async (incompleteConfig) => {
    const fetcher = vi.fn();

    await expect(
      fetchMicroCMSList("spots", { config: incompleteConfig, fetcher }),
    ).resolves.toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("allows a missing regions endpoint to fall back", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ message: "Not Found" }, 404));

    await expect(
      fetchMicroCMSList("regions", { config, fetcher, allowMissing: true }),
    ).resolves.toBeNull();
  });

  it.each([
    { endpoint: "spots", status: 404, allowMissing: undefined },
    { endpoint: "spots", status: 500, allowMissing: undefined },
    { endpoint: "regions", status: 500, allowMissing: true },
  ])(
    "throws for $endpoint HTTP $status instead of silently falling back",
    async ({ endpoint, status, allowMissing }) => {
      const fetcher = vi.fn(async () => jsonResponse({ message: "request failed" }, status));

      await expect(
        fetchMicroCMSList(endpoint, { config, fetcher, allowMissing }),
      ).rejects.toThrow(`microCMS request failed: ${endpoint}`);
    },
  );

  it("preserves a successful empty contents response", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ contents: [] }));

    await expect(fetchMicroCMSList("spots", { config, fetcher })).resolves.toEqual([]);
  });
});
