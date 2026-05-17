// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: "class",
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         background: "#0A0A0F",
//         surface: "#13131F",
//         "surface-hover": "#1A1A2E",
//         border: "#1E293B",
//         primary: "#39FF14",
//         "primary-hover": "#2DD412",
//         secondary: "#00F0FF",
//         accent: "#3B82F6",
//         "text-primary": "#FFFFFF",
//         "text-secondary": "#94A3B8",
//         "text-muted": "#64748B",
//         success: "#10B981",
//         warning: "#FFB800",
//         danger: "#EF4444",
//       },
//       fontFamily: {
//         sans: ["Inter", "system-ui", "sans-serif"],
//         mono: ["JetBrains Mono", "monospace"],
//       },
//       borderRadius: {
//         sm: "4px",
//         DEFAULT: "6px",
//         md: "8px",
//         lg: "12px",
//       },
//       animation: {
//         "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
//         glow: "glow 2s ease-in-out infinite alternate",
//       },
//       keyframes: {
//         glow: {
//           "0%": { boxShadow: "0 0 5px #39FF14, 0 0 10px #39FF14" },
//           "100%": { boxShadow: "0 0 20px #39FF14, 0 0 30px #39FF14" },
//         },
//       },
//     },
//   },
//   plugins: [],
// };

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
