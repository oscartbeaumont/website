module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{astro,svelte,js,jsx,ts,tsx,md,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        ttiny: "473px",
        tiny: "530px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
