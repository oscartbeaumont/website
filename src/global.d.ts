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

// https://fontsource.org/docs/getting-started/faq#cannot-find-module-fontsourcefont-name-or-its-corresponding-type-declarations
declare module "*.css";
declare module "@fontsource/*" {}
declare module "@fontsource-variable/*" {}
