export default {
  plugins: {
    "@tailwindcss/postcss": {}, // <-- v4 plugin
    autoprefixer: {},
    "postcss-px-to-viewport": {
      viewportWidth: 375,
      unitPrecision: 6,
      viewportUnit: "vw",
      propList: ["*"],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: /node_modules|tailwind|@tailwindcss/i, // don't convert Tailwind/3rd libs
    },
  },
}
