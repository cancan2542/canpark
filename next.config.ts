import type { NextConfig } from "next";
import { getCanonicalHostRedirects } from "./src/lib/site-url";

const nextConfig: NextConfig = {
  output: "standalone",
  redirects: async () => getCanonicalHostRedirects(),
};

export default nextConfig;
