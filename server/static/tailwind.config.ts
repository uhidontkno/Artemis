/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("@catppuccin/tailwindcss")({
    defaultFlavour: "mocha",
  }),],
}

