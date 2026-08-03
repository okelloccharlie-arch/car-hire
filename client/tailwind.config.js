/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#d9e3f2",
          500: "#2f4a73",
          600: "#243a5c",
          700: "#1a2c46",
          800: "#111d30",
          900: "#0b1420",
        },
        amber: {
          400: "#f3a13a",
          500: "#e8892a",
          600: "#c96f1a",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
