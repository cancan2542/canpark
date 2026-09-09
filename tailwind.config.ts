import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        mist: "#edf3f1",
        pine: "#1f5b49",
        amber: "#e2a84b",
        water: "#327aa1",
        clay: "#a45f45",
      },
    },
  },
  plugins: [],
};

export default config;
