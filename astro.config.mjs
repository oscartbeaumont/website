// @ts-check
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

/** @type {import('astro').AstroUserConfig} */
export default {
  site: "https://otbeaumont.me",
  compressHTML: true,
  integrations: [
    sitemap(),
    svelte(),
    tailwind({
      configFile: "./tailwind.config.js",
    }),
  ],
};
