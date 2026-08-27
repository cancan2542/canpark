import { describe, expect, it } from "vitest";
import { getLegacyHostRedirects, getSiteUrl, LEGACY_PRODUCTION_HOST } from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("uses the current production URL when no URL is configured", () => {
    expect(getSiteUrl(undefined).href).toBe(`https://${LEGACY_PRODUCTION_HOST}/`);
  });

  it("accepts a production origin with a trailing slash", () => {
    expect(getSiteUrl("https://canpark.example/").origin).toBe("https://canpark.example");
  });

  it.each([
    "ftp://canpark.example",
    "https://user:password@canpark.example",
    "https://canpark.example/path",
    "https://canpark.example/?query=value",
    "https://canpark.example/#section",
  ])("rejects a URL that is not a bare HTTP(S) origin: %s", (siteUrl) => {
    expect(() => getSiteUrl(siteUrl)).toThrow("NEXT_PUBLIC_SITE_URL");
  });
});

describe("getLegacyHostRedirects", () => {
  it("does not redirect while the legacy host is still canonical", () => {
    expect(getLegacyHostRedirects(`https://${LEGACY_PRODUCTION_HOST}`)).toEqual([]);
  });

  it("redirects every path on the legacy host to the configured canonical origin", () => {
    expect(getLegacyHostRedirects("https://canpark.example")).toEqual([
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
        destination: "https://canpark.example/:path*",
        permanent: true,
      },
    ]);
  });
});
