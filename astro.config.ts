import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel/static";
import mdx from "@astrojs/mdx";
import remarkCodeTitles from "remark-code-titles";

// https://astro.build/config
export default defineConfig({
  site: "https://otbeaumont.me",
  compressHTML: true,
  adapter: vercel(),
  markdown: { remarkPlugins: [remarkCodeTitles] },
  integrations: [
    sitemap(),
    tailwind({
      configFile: "./tailwind.config.js",
    }),
    solidJs(),
    mdx(),
  ],
  server: {
    port: 3008,
  }
});
