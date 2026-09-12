import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0B1526",
          900: "#12203D",
          800: "#1B2E52",
          700: "#243A66",
          600: "#33507F",
        },
        flame: {
          600: "#B8420F",
          500: "#C1440E",
          400: "#D45A24",
        },
        gold: {
          600: "#96701F",
          500: "#B8862B",
          400: "#CBA352",
        },
        parchment: {
          50: "#FAFAF8",
          100: "#F2F1EC",
          200: "#E7E4DA",
        },
      },
      fontFamily: {
        display: ["var(--font-source-serif)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
