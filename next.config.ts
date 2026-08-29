import type { NextConfig } from "next";
import { getLegacyHostRedirects } from "./src/lib/site-url";

const nextConfig: NextConfig = {
  output: "standalone",
  redirects: async () => getLegacyHostRedirects(),
};

export default nextConfig;
