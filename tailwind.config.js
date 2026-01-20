/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta de cores customizada - LexiCard
        primary: {
          50: "#f0f4ff",
          100: "#e6ecff",
          400: "#4F46E5", // Indigo - Primary
          500: "#4F46E5",
          600: "#4339ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          400: "#10B981", // Emerald - Success
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          400: "#EF4444", // Red - Error
          500: "#EF4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        background: {
          50: "#F8FAFC", // Slate 50 - Background
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
      },
      fontFamily: {
        // Tipografia Inter
        inter: ["Inter"],
        "inter-bold": ["Inter_700Bold"],
        "inter-regular": ["Inter_400Regular"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      transitionDuration: {
        300: "300ms",
      },
    },
  },
  plugins: [],
};
