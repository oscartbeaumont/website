import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import type { Plugin } from "vite";
import { promises as fs } from "node:fs";
import { createRequire } from "module";
import vercel from "@astrojs/vercel/edge";
const cjs = createRequire(import.meta.url);
const sharp: typeof import("sharp") = cjs("sharp");

// https://astro.build/config
export default defineConfig({
  site: "https://otbeaumont.me",
  srcDir: "src/astro",
  compressHTML: true,
  output: "server",
  adapter: vercel(),
  integrations: [
    sitemap(),
    tailwind({
      configFile: "./tailwind.config.js",
    }),
    solidJs(),
  ],
  vite: {
    plugins: [imageOptimiserPlugin()],
  },
});

function imageOptimiserPlugin(): Plugin {
  const virtualModuleId = "virtual:optimiser";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "transform-file",

    resolveId(id) {
      const url = new URL(`http://localhost/${id}`);
      if (url.searchParams.has("optimise")) {
        return resolvedVirtualModuleId;
      }
    },

    async transform(src, id) {
      const url = new URL(`http://localhost/${id}`);
      if (url.searchParams.has("optimise")) {
        const fileRaw = await fs.readFile(id.split("?")[0]);

        var output;
        const size = url.searchParams.get("size");
        if (size) {
          const [height, width] = size.split(",");
          output = await sharp(fileRaw)
            .webp()
            .resize(Number(height), Number(width))
            .toBuffer();
        } else {
          output = await sharp(fileRaw).webp().toBuffer();
        }

        return `export default "data:image/webp;base64,${output.toString(
          "base64"
        )}"`;
      }
    },
  };
}
