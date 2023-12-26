const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{astro,svelte,js,jsx,ts,tsx,md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["RalewayVariable", "Raleway", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
