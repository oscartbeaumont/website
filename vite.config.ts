import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { visualizer } from "rollup-plugin-visualizer";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { defineConfig, type Plugin } from "vite";
import { headersPlugin } from "./src/vite-plugin-headers.ts";

// Route modules are only reachable through the `virtual:file-routes` module,
// so Vite's dependency scanner never sees their imports. When a dependency is
// first discovered while a request is rendering, Vite re-optimizes and reloads
// mid-render, leaving that request with two copies of `solid-js` (and therefore
// no reactive owner, which breaks every `useContext` call). Pre-bundle
// everything the route modules import so the optimizer never runs late.
const routeDependencies = [
	"@solidjs/meta",
	"@solidjs/router",
	"@solidjs/router/fs",
	"clsx",
	"html2canvas",
	"jspdf",
	"parse-duration",
	"solid-js",
];

/**
 * `@solidjs/vite-plugin` bakes the client build's manifest into the SSR bundle
 * so the server can reference hashed client assets. It finds that manifest via
 * the client environment's output directory, remembered by the plugin instance
 * that built the client — but Vite gives each environment its own plugin
 * instance. `@cloudflare/vite-plugin` relocates the client output to its own
 * assets directory, so the SSR build can't see the manifest and falls back to
 * dev-style URLs (`/src/entry-client.tsx` and `?pick=…` module URLs) that 404
 * in production. Mirror the manifest to the `dist/client` convention the
 * plugin also falls back to, so the SSR bundle points at the real assets.
 */
function clientManifestForSsr(): Plugin {
	const manifestOutput = join("dist", "client", ".vite", "manifest.json");

	return {
		name: "client-manifest-for-ssr",
		apply: "build",
		enforce: "post",
		buildStart() {
			if (this.environment.name === "client") {
				rmSync(dirname(manifestOutput), { recursive: true, force: true });
			}
		},
		writeBundle(options) {
			if (this.environment.name !== "client" || !options.dir) return;
			const manifest = join(options.dir, ".vite", "manifest.json");
			if (!existsSync(manifest)) return;
			mkdirSync(dirname(manifestOutput), { recursive: true });
			copyFileSync(manifest, manifestOutput);
		},
	};
}

export default defineConfig({
	optimizeDeps: { include: routeDependencies },
	environments: {
		ssr: {
			optimizeDeps: { include: routeDependencies },
		},
	},
	plugins: [
		solid({
			start: { middleware: "./src/middleware.ts" },
			ssr: true,
		}),
		fileRoutes(),
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
		clientManifestForSsr(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		headersPlugin(),
		visualizer({
			emitFile: process.env.CI !== undefined,
			filename: "stats.html",
			gzipSize: true,
			brotliSize: true,
		}),
	],
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
