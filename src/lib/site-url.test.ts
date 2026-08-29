import { describe, expect, it } from "vitest";
import {
  getLegacyHostRedirects,
  getSiteUrl,
  LEGACY_PRODUCTION_HOST,
  PRODUCTION_SITE_ORIGIN,
} from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("uses the canonical production URL", () => {
    expect(getSiteUrl().origin).toBe(PRODUCTION_SITE_ORIGIN);
  });
});

describe("getLegacyHostRedirects", () => {
  it("redirects every path on the legacy host to the canonical origin", () => {
    expect(getLegacyHostRedirects()).toEqual([
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PRODUCTION_HOST }],
        destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
        permanent: true,
      },
    ]);
  });
});
