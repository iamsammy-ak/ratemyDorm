import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec0ff",
          400: "#5ca0ff",
          500: "#2f7dff",
          600: "#1d63f5",
          700: "#1a51e1",
          800: "#1c43b6",
          900: "#1e3d90",
        },
        coral: {
          50: "#fff3f1",
          100: "#ffe3dd",
          200: "#ffc8bb",
          300: "#ff9f87",
          400: "#ff7558",
          500: "#ff5533",
          600: "#f13f1d",
          700: "#c92f14",
          800: "#a62916",
          900: "#892718",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;