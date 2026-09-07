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
        background: "#0b100b",
        surface: "#101510",
        "surface-light": "#141b13",
        "surface-hover": "#1a2518",
        border: "#2a3a1e",
        "border-light": "#263322",
        "border-accent": "#34432a",
        accent: "#7d9154",
        "accent-light": "#a9b97a",
        green: "#3fb950",
        amber: "#d29922",
        red: "#f85149",
        "text-primary": "#edf2e7",
        "text-secondary": "#7c8b65",
        "text-muted": "#5a6b48",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
