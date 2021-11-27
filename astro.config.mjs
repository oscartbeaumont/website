// @ts-check

/** @type {import('astro').AstroUserConfig} */
export default ({
  renderers: ["@astrojs/renderer-svelte"],
  buildOptions: {
    site: "https://otbeaumont.me",
    sitemap: true,
  },
  devOptions: {
    tailwindConfig: "./tailwind.config.js",
  },
});
