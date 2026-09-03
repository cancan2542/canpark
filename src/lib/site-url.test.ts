import { describe, expect, it } from "vitest";
import {
  getCanonicalHostRedirects,
  getSiteUrl,
  LEGACY_PRODUCTION_HOST,
  PRODUCTION_SITE_ORIGIN,
  WWW_PRODUCTION_HOST,
} from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("uses the canonical production URL", () => {
    expect(getSiteUrl().origin).toBe(PRODUCTION_SITE_ORIGIN);
  });
});

describe("getCanonicalHostRedirects", () => {
  it("redirects every path on non-canonical hosts to the apex domain", () => {
    expect(getCanonicalHostRedirects()).toEqual([
      {
        source: "/:path*",
        has: [{ type: "host", value: WWW_PRODUCTION_HOST }],
        destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
        destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
        permanent: true,
      },
    ]);
  });
});
