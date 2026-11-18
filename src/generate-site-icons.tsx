// Browser tab icons for the site itself. The album has its own artwork in
// `generate-addy-icons.tsx`; these are derived from the brand illustration so
// the mark in a tab matches the one on `/brand`.
//
//   tsx src/generate-site-icons.tsx
//
// The files are imported through Vite rather than served from `public/`, so
// changing the artwork produces a new hashed URL and no browser keeps the old
// icon. Safari on iOS only reads the PNG `apple-touch-icon`; it ignores the ICO
// that desktop tabs are happy with, which is why a site with just a favicon.ico
// shows the generic placeholder in the tab switcher.
//
// The pragmas pick React's automatic JSX runtime for this file alone: the
// project compiles Solid's JSX everywhere else, and the renderer wants React
// elements.

/** @jsxRuntime automatic */
/** @jsxImportSource react */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "@takumi-rs/image-response";
import type { ReactElement } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The illustration is mostly white, so the touch icon sits on a faint grey
 * rather than transparent: iOS fills transparency with black, and a white
 * shirt on white disappears.
 */
const PAPER = "#f4f4f5";

const logo = `data:image/png;base64,${readFileSync(
	join(__dirname, "assets/brand/logo.png"),
).toString("base64")}`;

function artwork(
	size: number,
	share: number,
	background?: string,
): ReactElement {
	const mark = Math.round(size * share);
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				...(background ? { backgroundColor: background } : {}),
			}}
		>
			<img src={logo} width={mark} height={mark} alt="" />
		</div>
	);
}

async function write(
	path: string,
	element: ReactElement,
	size: number,
): Promise<number> {
	const response = new ImageResponse(element, {
		width: size,
		height: size,
		format: "png",
	});
	const bytes = Buffer.from(await response.arrayBuffer());
	writeFileSync(path, bytes);
	return bytes.length;
}

async function main() {
	const outDir = join(__dirname, "assets/favicon");
	mkdirSync(outDir, { recursive: true });

	// A tab icon has no mask to survive, so the mark can fill the tile; iOS
	// rounds the corners of the touch icon, so it needs a margin.
	const icons: Array<[string, number, number, string?]> = [
		["favicon-32.png", 32, 1, undefined],
		["apple-touch-icon.png", 180, 0.84, PAPER],
	];

	let bytes = 0;
	for (const [name, size, share, background] of icons)
		bytes += await write(
			join(outDir, name),
			artwork(size, share, background),
			size,
		);
	console.log(`✓ ${icons.length} site icons (${Math.round(bytes / 1024)} KB)`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
