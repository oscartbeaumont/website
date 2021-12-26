module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{astro,svelte,js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      screens: {
        ttiny: "473px",
        tiny: "530px",
      },
    },
  },
};
