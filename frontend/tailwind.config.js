/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        surface: "#252525",
        "surface-hover": "#2a2a2a",
        border: "#333333",
        primary: "#a78bfa",
        "primary-hover": "#8b5cf6",
        secondary: "#c4b5fd",
        accent: "#a78bfa",
        "text-primary": "#e5e5e5",
        "text-secondary": "#a0a0a0",
        "text-muted": "#737373",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["JetBrains Mono", "Fira Code", "monospace"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
