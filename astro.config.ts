import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import remarkCodeTitles from "remark-code-titles";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://otbeaumont.me",
  compressHTML: true,
  output: "static",
  adapter: vercel(),
  markdown: { remarkPlugins: [remarkCodeTitles] },
  integrations: [sitemap(), solidJs(), mdx()],
  server: {
    port: 3008,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
