import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { vitePlugin as OGPlugin } from "@solid-mediakit/og/unplugin";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { headersPlugin } from "./src/vite-plugin-headers";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
	plugins: [
		solidStart(),
		OGPlugin(),
		tailwindcss(),
		Icons({
			compiler: "solid",
			autoInstall: true,
		}),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		headersPlugin(),
		visualizer({
			emitFile: true,
			filename: "stats.html",
			gzipSize: true,
			brotliSize: true,
		}),
	],
	resolve: {
		alias: {
			html2canvas: path.resolve(__dirname, "node_modules/html2canvas-pro"),
		},
	},
});
