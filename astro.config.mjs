// @ts-check
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

/** @type {import('astro').AstroUserConfig} */
export default {
  integrations: [
    svelte(),
    tailwind({
      config: {
        path: "./tailwind.config.js",
        applyAstroPreset: false,
      },
    }),
  ],
  buildOptions: {
    site: "https://otbeaumont.me",
    sitemap: true,
  },
};
