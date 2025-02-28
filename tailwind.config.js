/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin-slow 4s linear infinite',
        'ray-expand': 'ray-expand 2s ease-in-out infinite',
        'twinkle': 'twinkle 1.5s ease-in-out infinite',
      },

      // colors: {
      //   tx: "#ff5733", // Set your desired color value
      // },

    },
  },
  plugins: [],
}
