// Home Screen icons and launch screens are pregenerated rather than rendered on
// request, the same way the OpenGraph image is: one artwork source, every size
// derived from it, nothing to keep in sync by hand.
//
//   tsx src/generate-addy-icons.tsx
//
// The pragmas pick React's automatic JSX runtime for this file alone: the
// project compiles Solid's JSX everywhere else, and the renderer wants React
// elements.

/** @jsxRuntime automatic */
/** @jsxImportSource react */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "@takumi-rs/image-response";
import type { ReactElement } from "react";
import {
	DEVICE_SIZES,
	type Orientation,
	splashFileName,
	splashPixels,
} from "./addy/devices";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The album's own palette, matching `.addy` in `routes/addy/addy.css`. */
const PAPER = "#f7f1e5";
const INK = "#2b2320";
const ACCENT = "#a84c36";

const caveat = readFileSync(
	join(
		__dirname,
		"../node_modules/@fontsource/caveat/files/caveat-latin-400-normal.woff2",
	),
);

const fonts = [
	{ name: "Caveat", data: caveat, weight: 400 as const, style: "normal" },
];

/**
 * The wordmark on paper. `share` is how much of the tile the mark takes: iOS
 * masks a Home Screen icon into a squircle and an Android maskable icon is
 * cropped to a circle, so both need more room around the mark than a square
 * splash does.
 */
function mark(tile: number, share: number) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: PAPER,
				color: INK,
				fontFamily: "Caveat",
				fontSize: `${Math.round(tile * share)}px`,
				lineHeight: 1,
			}}
		>
			A<span style={{ color: ACCENT }}>&amp;</span>O
		</div>
	);
}

async function write(
	path: string,
	element: ReactElement,
	width: number,
	height: number,
) {
	const response = new ImageResponse(element, {
		width,
		height,
		format: "png",
		fonts,
	});
	const bytes = Buffer.from(await response.arrayBuffer());
	writeFileSync(path, bytes);
	return bytes.length;
}

async function main() {
	const publicDir = join(__dirname, "../public");
	const splashDir = join(publicDir, "splash");
	// A device that has been dropped should take its image with it.
	rmSync(splashDir, { recursive: true, force: true });
	mkdirSync(splashDir, { recursive: true });

	// 180 is what iOS asks for; the 192 and 512 pair is for everything else that
	// reads the manifest.
	const icons: Array<[string, number, number]> = [
		["apple-touch-icon.png", 180, 0.46],
		["icon-192.png", 192, 0.46],
		["icon-512.png", 512, 0.46],
		["icon-maskable-512.png", 512, 0.34],
	];

	let bytes = 0;
	for (const [name, size, share] of icons)
		bytes += await write(join(publicDir, name), mark(size, share), size, size);
	console.log(`✓ ${icons.length} Home Screen icons`);

	let images = 0;
	for (const size of DEVICE_SIZES) {
		for (const orientation of ["portrait", "landscape"] as Orientation[]) {
			const [width, height] = splashPixels(size, orientation);
			// Sized off the short edge so the mark reads the same in both
			// orientations, and centred well inside the safe area.
			const share = 0.26;
			bytes += await write(
				join(splashDir, splashFileName(size, orientation)),
				mark(Math.min(width, height), share),
				width,
				height,
			);
			images++;
		}
	}
	console.log(`✓ ${images} startup images (${Math.round(bytes / 1024)} KB)`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
