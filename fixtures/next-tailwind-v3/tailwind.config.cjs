/** @type {import('tailwindcss').Config} */
const path = require("node:path");

module.exports = {
  content: [path.join(__dirname, "pages/**/*.{js,ts,jsx,tsx}")],
  presets: [require("@hywork/ui/tailwind/v3-preset.cjs")],
};
