/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./server/static/**/*.{html,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("@catppuccin/tailwindcss")({
    prefix: "",
    defaultFlavour: "mocha",
  })],
}

