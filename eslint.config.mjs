import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

const config = [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [
      ".astro/**",
      ".next/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "public/maps/**",
    ],
  },
];

export default config;
