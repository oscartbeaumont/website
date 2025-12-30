import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { vitePlugin as OGPlugin } from "@solid-mediakit/og/unplugin";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import Icons from "unplugin-icons/vite";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import { defineConfig } from "vite";
import { headersPlugin } from "./src/vite-plugin-headers";

export default defineConfig({
	plugins: [
		solidStart(),
		OGPlugin(),
		tailwindcss(),
		FixedAutoImport({
			dts: "src/auto-imports.d.ts",
			resolvers: [
				IconsResolver({
					prefix: "Icon",
					extension: "jsx",
				}),
			],
		}),
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

// Auto import plugin doesn't like module ids that have query params
function FixedAutoImport(options: any) {
	const autoimport = AutoImport(options);

	const wrapTransform = (fn: any) => (src: any, id: any) => {
		const pathname = id.startsWith("/") ? new URL(`file://${id}`).pathname : id;
		return fn(src, pathname);
	};

	// @ts-expect-error
	if (typeof autoimport.transform === "function") {
		// @ts-expect-error
		autoimport.transform = wrapTransform(autoimport.transform);
		// @ts-expect-error
	} else if (typeof autoimport.transform === "object") {
		// @ts-expect-error
		autoimport.transform = wrapTransform(autoimport.transform.handler);
	}

	return autoimport;
}
