/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          1: "#704232",
          2: "#7E5446",
          3: "#97766A",
        },
        gray: {
          1: "#f9fafb",
          2: "#fafafa",
        },
        red: {
          1: "#da1e37",
          2: "#ff4d4f",
        },
        green: {
          1: "#49cc90",
        },
        disabled: {
          1: "rgba(0, 0, 0, 0.25)",
          2: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },
  plugins: [],
};
