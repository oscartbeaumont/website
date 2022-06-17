// @ts-check
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

/** @type {import('astro').AstroUserConfig} */
export default {
  site: "https://otbeaumont.me",
  integrations: [
    sitemap(),
    svelte(),
    tailwind({
      config: {
        path: "./tailwind.config.js",
      },
    }),
  ],
};
