import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc5c5",
          300: "#ff9d9d",
          400: "#ff6464",
          500: "#ff2d2d",
          600: "#ed1515",
          700: "#c80d0d",
          800: "#a50f0f",
          900: "#881414",
          950: "#4b0505",
        },
        surface: {
          DEFAULT: "#0f1117",
          card:    "#1a1d27",
          border:  "#2a2e3d",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
