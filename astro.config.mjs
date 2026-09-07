import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://canpark.blog",
  output: "static",
  build: {
    format: "directory",
  },
});
