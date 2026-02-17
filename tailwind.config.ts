import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        slate: "#f4f4f0",
        ember: "#ff5e00",
        moss: "#0d5a40"
      }
    }
  },
  plugins: []
};

export default config;
