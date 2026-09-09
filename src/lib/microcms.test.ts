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
    const fetcher = vi.fn(async () =>
      jsonResponse({
        contents: [{ id: "spot-1" }],
        totalCount: 1,
        offset: 0,
        limit: 100,
      }),
    );

    await expect(
      fetchMicroCMSList<{ id: string }>("spots", { config, fetcher }),
    ).resolves.toEqual([{ id: "spot-1" }]);

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://canpark.microcms.io/api/v1/spots?limit=100&offset=0"),
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
    const fetcher = vi.fn(async () =>
      jsonResponse({ contents: [], totalCount: 0, offset: 0, limit: 100 }),
    );

    await expect(fetchMicroCMSList("spots", { config, fetcher })).resolves.toEqual([]);
  });

  it("retrieves all contents across multiple pages", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `spot-${index + 1}`,
    }));
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ contents: firstPage, totalCount: 101, offset: 0, limit: 100 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          contents: [{ id: "spot-101" }],
          totalCount: 101,
          offset: 100,
          limit: 100,
        }),
      );

    const result = await fetchMicroCMSList<{ id: string }>("spots", { config, fetcher });

    expect(result).toHaveLength(101);
    expect(result?.at(-1)).toEqual({ id: "spot-101" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([requestedUrl]) => requestedUrl.toString())).toEqual([
      "https://canpark.microcms.io/api/v1/spots?limit=100&offset=0",
      "https://canpark.microcms.io/api/v1/spots?limit=100&offset=100",
    ]);
  });

  it.each([
    {
      name: "a non-positive limit",
      body: { contents: [{ id: "spot-1" }], totalCount: 2, offset: 0, limit: 0 },
    },
    {
      name: "an offset that does not match the requested page",
      body: { contents: [{ id: "spot-1" }], totalCount: 2, offset: 1, limit: 100 },
    },
    {
      name: "an empty page before totalCount is reached",
      body: { contents: [], totalCount: 1, offset: 0, limit: 100 },
    },
    {
      name: "a partial page before totalCount is reached",
      body: { contents: [{ id: "spot-1" }], totalCount: 101, offset: 0, limit: 100 },
    },
  ])("rejects $name without retrying indefinitely", async ({ body }) => {
    const fetcher = vi.fn(async () => jsonResponse(body));

    await expect(fetchMicroCMSList("spots", { config, fetcher })).rejects.toThrow(
      "microCMS pagination metadata invalid: spots",
    );
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("rejects a repeated offset on a later page without looping", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `spot-${index + 1}`,
    }));
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ contents: firstPage, totalCount: 101, offset: 0, limit: 100 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          contents: [{ id: "spot-101" }],
          totalCount: 101,
          offset: 0,
          limit: 100,
        }),
      );

    await expect(fetchMicroCMSList("spots", { config, fetcher })).rejects.toThrow(
      "microCMS pagination metadata invalid: spots",
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("rejects a changed totalCount on a later page without looping", async () => {
    const page = Array.from({ length: 100 }, (_, index) => ({
      id: `spot-${index + 1}`,
    }));
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ contents: page, totalCount: 201, offset: 0, limit: 100 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ contents: page, totalCount: 301, offset: 100, limit: 100 }),
      );

    await expect(fetchMicroCMSList("spots", { config, fetcher })).rejects.toThrow(
      "microCMS pagination metadata invalid: spots",
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each([null, 42, "unexpected", []])(
    "rejects a non-object response body as invalid pagination metadata: %j",
    async (body) => {
      const fetcher = vi.fn(async () => jsonResponse(body));

      await expect(fetchMicroCMSList("spots", { config, fetcher })).rejects.toThrow(
        "microCMS pagination metadata invalid: spots",
      );
      expect(fetcher).toHaveBeenCalledOnce();
    },
  );
});
