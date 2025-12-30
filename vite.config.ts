import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { vitePlugin as OGPlugin } from "@solid-mediakit/og/unplugin";
import Icons from "unplugin-icons/vite";
import { headersPlugin } from "./src/vite-plugin-headers";
import path from "node:path";

export default defineConfig({
  plugins: [
    solidStart({
      middleware: "./src/middleware.ts"
    }),
    OGPlugin(),
    tailwindcss(),
    Icons({
      compiler: 'solid',
      autoInstall: true,
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    headersPlugin(),
  ],
  resolve: {
    alias: {
      html2canvas: path.resolve(__dirname, "node_modules/html2canvas-pro"),
    },
  },
});
