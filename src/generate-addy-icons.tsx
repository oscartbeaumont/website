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
const PRINT = "#fffdf8";
const INK = "#2b2320";
const ACCENT = "#a84c36";
const TAPE = "#d9c79c99";

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
 * The mark on a photo print, taped to the paper — the same thing the album does
 * to a photo when it stacks one, so the Home Screen icon is made of the app's
 * own material rather than being a logo that happens to match it.
 *
 * `share` is how much of the tile the print takes. iOS masks a Home Screen icon
 * into a squircle and an Android maskable icon is cropped to a circle, so both
 * need more paper around the print than a square splash does.
 */
function artwork(tile: number, share: number) {
	const size = Math.round(tile * share);
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: PAPER,
			}}
		>
			<div style={{ position: "relative", display: "flex" }}>
				<div
					style={{
						width: `${size}px`,
						height: `${size}px`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: PRINT,
						boxShadow: `0 ${Math.round(size * 0.03)}px ${Math.round(
							size * 0.07,
						)}px #2b232029`,
						transform: "rotate(-4deg)",
					}}
				>
					<span
						style={{
							fontFamily: "Caveat",
							fontSize: `${Math.round(size * 0.44)}px`,
							lineHeight: 1,
							color: INK,
						}}
					>
						A<span style={{ color: ACCENT }}>&amp;</span>O
					</span>
				</div>
				<div
					style={{
						position: "absolute",
						top: `${-Math.round(size * 0.03)}px`,
						left: "50%",
						width: `${Math.round(size * 0.34)}px`,
						height: `${Math.round(size * 0.065)}px`,
						backgroundColor: TAPE,
						transform: "rotate(-1.4deg) translate(-50%, 0)",
					}}
				/>
			</div>
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
	// reads the manifest. The maskable one keeps the print well inside the
	// circle Android crops it to.
	const icons: Array<[string, number, number]> = [
		["apple-touch-icon.png", 180, 0.68],
		["icon-192.png", 192, 0.68],
		["icon-512.png", 512, 0.68],
		["icon-maskable-512.png", 512, 0.56],
	];

	let bytes = 0;
	for (const [name, size, share] of icons)
		bytes += await write(
			join(publicDir, name),
			artwork(size, share),
			size,
			size,
		);
	console.log(`✓ ${icons.length} Home Screen icons`);

	let images = 0;
	for (const size of DEVICE_SIZES) {
		for (const orientation of ["portrait", "landscape"] as Orientation[]) {
			const [width, height] = splashPixels(size, orientation);
			// Sized off the short edge so the print reads the same in both
			// orientations, and centred well inside the safe area.
			const share = 0.46;
			bytes += await write(
				join(splashDir, splashFileName(size, orientation)),
				artwork(Math.min(width, height), share),
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
