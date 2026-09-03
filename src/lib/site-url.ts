export const LEGACY_PRODUCTION_HOST = "canpark-xi.vercel.app";
export const WWW_PRODUCTION_HOST = "www.canpark.blog";
export const PRODUCTION_SITE_ORIGIN = "https://canpark.blog";

export function getSiteUrl(): URL {
  return new URL(PRODUCTION_SITE_ORIGIN);
}

export function getCanonicalHostRedirects() {
  return [WWW_PRODUCTION_HOST, LEGACY_PRODUCTION_HOST].map((host) => ({
    source: "/:path*",
    has: [{ type: "host" as const, value: host }],
    destination: `${PRODUCTION_SITE_ORIGIN}/:path*`,
    permanent: true,
  }));
}
