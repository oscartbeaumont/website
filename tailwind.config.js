module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{astro,svelte,js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      minWidth: {
        "32px": "32px",
      },
      screens: {
        ttiny: "473px",
        tiny: "530px",
      },
    },
  },
};
