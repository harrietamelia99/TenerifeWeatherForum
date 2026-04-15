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
        sky: "#9fe7f5",
        mid: "#429ebd",
        deep: "#053f5c",
        sun: "#f7ad19",
        bg: "#f0fbfe",
        surface: "#ffffff",
        border: "#c8eef7",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontWeight: {
        "300": "300",
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-delay": "float 10s ease-in-out 2s infinite",
        "float-slow": "float 12s ease-in-out 4s infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "count-up": "countUp 1s ease-out forwards",
        "gradient-shift": "gradientShift 12s ease infinite",
        ticker: "ticker 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "33%": { transform: "translateY(-20px) scale(1.02)" },
          "66%": { transform: "translateY(10px) scale(0.98)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
