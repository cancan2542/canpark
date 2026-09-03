export const LEGACY_PRODUCTION_HOST = "canpark-xi.vercel.app";
export const PRODUCTION_SITE_ORIGIN = "https://canpark.blog";

export function getSiteUrl(): URL {
  return new URL(PRODUCTION_SITE_ORIGIN);
}

// The www alias is redirected at the Vercel domain layer. Keeping that rule
// here as well can create a loop while Vercel still points the apex to www.
export function getCanonicalHostRedirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: LEGACY_PRODUCTION_HOST }],
      destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
      permanent: true,
    },
  ];
}
