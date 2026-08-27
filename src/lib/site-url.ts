export const LEGACY_PRODUCTION_HOST = "canpark-xi.vercel.app";
const DEFAULT_SITE_URL = `https://${LEGACY_PRODUCTION_HOST}`;

export function getSiteUrl(
  configuredUrl = process.env.NEXT_PUBLIC_SITE_URL,
  deploymentEnvironment = process.env.VERCEL_ENV,
): URL {
  const siteUrl = new URL(configuredUrl?.trim() || DEFAULT_SITE_URL);

  if (!["http:", "https:"].includes(siteUrl.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https");
  }

  if (
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin without credentials, path, query, or hash",
    );
  }

  if (
    deploymentEnvironment === "production" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(siteUrl.hostname)
  ) {
    return new URL(DEFAULT_SITE_URL);
  }

  return siteUrl;
}

export function getLegacyHostRedirects(configuredUrl = process.env.NEXT_PUBLIC_SITE_URL) {
  const siteUrl = getSiteUrl(configuredUrl);

  if (siteUrl.hostname === LEGACY_PRODUCTION_HOST) {
    return [];
  }

  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: LEGACY_PRODUCTION_HOST }],
      destination: `${siteUrl.origin}/:path*`,
      permanent: true,
    },
  ];
}
