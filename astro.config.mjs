// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
  renderers: ["@astrojs/renderer-svelte"],
  buildOptions: {
    site: "https://otbeaumont.me",
    sitemap: true,
  },
  devOptions: {
    tailwindConfig: "./tailwind.config.js",
  },
});
