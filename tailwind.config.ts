import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { deep: "#0a0a1f", card: "#141433", iris: "#818cf8", lime: "#a3e635", edge: "#2a2a55" },
      fontFamily: { mono: ["var(--font-mono)", "Consolas", "monospace"], display: ["var(--font-display)", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
