import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        panel: "#161b22",
        surface: "#0d1117",
        accent: {
          DEFAULT: "#238636",
          hover: "#2ea043",
          blue: "#58a6ff",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
