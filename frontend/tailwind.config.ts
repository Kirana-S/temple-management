import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff8f0",
          100: "#ffecd4",
          200: "#ffd4a0",
          300: "#ffb85c",
          400: "#ff9500",
          500: "#e67e00",
          600: "#cc6600",
          700: "#a35200",
          800: "#7a3d00",
          900: "#522900",
        },
        golden: {
          50: "#fffef0",
          100: "#fffbd4",
          200: "#fff5a0",
          300: "#ffed5c",
          400: "#ffe000",
          500: "#ccb300",
          600: "#997800",
          700: "#664f00",
          800: "#4d3b00",
          900: "#332700",
        },
        maroon: {
          50: "#fdf2f4",
          100: "#fbe5e9",
          200: "#f5c6ce",
          300: "#ed9aa7",
          400: "#e06478",
          500: "#cc3251",
          600: "#b01d3c",
          700: "#8b0000",
          800: "#6b0000",
          900: "#4a0000",
        },
        temple: {
          bg: "#fdf8f0",
          card: "#ffffff",
          border: "#f0e0c0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
