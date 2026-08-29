export const LEGACY_PRODUCTION_HOST = "canpark-xi.vercel.app";
export const PRODUCTION_SITE_ORIGIN = "https://www.canpark.blog";

export function getSiteUrl(): URL {
  return new URL(PRODUCTION_SITE_ORIGIN);
}

export function getLegacyHostRedirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: LEGACY_PRODUCTION_HOST }],
      destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
      permanent: true,
    },
  ];
}
