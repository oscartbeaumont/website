import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [solidStart(), tailwindcss(), cloudflare({ viteEnvironment: { name: "ssr" } })],
  // resolve: {
  //   alias: {
  //     html2canvas: path.resolve(__dirname, "node_modules/html2canvas-pro"),
  //   },
  // },
});
