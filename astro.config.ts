import path from "node:path";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import remarkCodeTitles from "remark-code-titles";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    resolve: {
      alias: {
        html2canvas: path.resolve(__dirname, "node_modules/html2canvas-pro"),
      },
    },
  },
});
