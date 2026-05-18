import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07070a",
        panel: "#111116",
        line: "rgba(255,255,255,0.1)",
      },
      boxShadow: {
        glow: "0 20px 70px rgba(99, 102, 241, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
