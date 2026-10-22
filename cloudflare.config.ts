import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "website",
		compatibilityDate: "2026-07-28",
		compatibilityFlags: ["nodejs_compat"],
		entrypoint: "virtual:solid-ssr-handler",
		cache: {
			enabled: true,
		},
		observability: {
			enabled: true,
			issues: {
				enabled: true,
			},
		},
		domains: ["otbeaumont.me", "hireareallycutemodel.com"],
		env: {
			KV: bindings.kv({
				id: "131c4d5399294486a5a08727949aea35",
			}),
			DATA: bindings.r2({
				name: "website-data",
			}),
			// Declared so local development can supply it from `.dev.vars`;
			// the deployed Worker gets the real secret.
			ADDY_PASSWORD: bindings.secret(),
		},
	},
});
