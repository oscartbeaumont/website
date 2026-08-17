declare module "virtual:_headers" {
	// Must match definition in `vite-plugin-headers.ts`
	export interface HeadersConfig {
		[path: string]: {
			[header: string]: string;
		};
	}

	const headers: HeadersConfig;
	export default headers;
}

declare module "virtual:solid-manifest" {
	import type { AssetManifest } from "@solidjs/web";
	const manifest: AssetManifest;
	export default manifest;
}

// https://fontsource.org/docs/getting-started/faq#cannot-find-module-fontsourcefont-name-or-its-corresponding-type-declarations
declare module "*.css";
declare module "@fontsource/*" {}
declare module "@fontsource-variable/*" {}

declare module "virtual:icons/*" {
	import type { ComponentProps } from "@solidjs/web";
	import type { Element } from "solid-js";

	const component: (props: ComponentProps<"svg">) => Element;
	export default component;
}

declare module "~icons/*" {
	import type { ComponentProps } from "@solidjs/web";
	import type { Element } from "solid-js";

	const component: (props: ComponentProps<"svg">) => Element;
	export default component;
}
