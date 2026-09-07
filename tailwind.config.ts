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
        background: "#0d1117",
        surface: "#161b22",
        "surface-light": "#1a2332",
        border: "#30363d",
        accent: "#58a6ff",
        green: "#3fb950",
        amber: "#d29922",
        red: "#f85149",
        "text-primary": "#e6edf3",
        "text-secondary": "#8b949e",
      },
    },
  },
  plugins: [],
};
export default config;
