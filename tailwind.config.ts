import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        muted: "#667085",
        line: "#d9e2ec",
        surface: "#f7f8f5",
        accent: "#256f5b",
        coral: "#d35d47"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(24, 33, 47, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
