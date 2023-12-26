import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel/static";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://otbeaumont.me",
  compressHTML: true,
  adapter: vercel(),
  integrations: [
    sitemap(),
    tailwind({
      configFile: "./tailwind.config.js",
    }),
    solidJs(),
    mdx(),
  ],
});
