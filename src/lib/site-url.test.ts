import { describe, expect, it } from "vitest";
import {
  getCanonicalHostRedirects,
  getSiteUrl,
  LEGACY_PRODUCTION_HOST,
  PRODUCTION_SITE_ORIGIN,
} from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("uses the canonical production URL", () => {
    expect(getSiteUrl().origin).toBe(PRODUCTION_SITE_ORIGIN);
  });
});

describe("getCanonicalHostRedirects", () => {
  it("redirects every path on the legacy host to the apex domain", () => {
    expect(getCanonicalHostRedirects()).toEqual([
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
        destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
        permanent: true,
      },
    ]);
  });
});
