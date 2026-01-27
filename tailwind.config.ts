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
        primary: {
          DEFAULT: "#5B7FFF",
          purple: "#8B7FFF",
        },
        accent: {
          yellow: "#D4A574",
          orange: "#E89C6F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
