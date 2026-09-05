import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";
import { getCanonicalHostRedirects } from "./src/lib/site-url";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
  redirects: async () => getCanonicalHostRedirects(),
};

export default nextConfig;
