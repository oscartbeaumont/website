/**
 * The screen sizes iOS asks for a startup image, in CSS points, portrait.
 *
 * Pixel dimensions are points × DPR, and a landscape image swaps the two. There
 * is one row per unique triple — a dozen models share each one — because a
 * duplicate row would emit a second `<link>` for the same image. Source:
 * ios-resolution.com, checked 2026-09-04.
 */
export type DeviceSize = {
	width: number;
	height: number;
	dpr: number;
};

export const DEVICE_SIZES: readonly DeviceSize[] = [
	// iPhone
	{ width: 320, height: 568, dpr: 2 },
	{ width: 375, height: 667, dpr: 2 },
	{ width: 414, height: 736, dpr: 3 },
	{ width: 375, height: 812, dpr: 3 },
	{ width: 414, height: 896, dpr: 2 },
	{ width: 414, height: 896, dpr: 3 },
	{ width: 390, height: 844, dpr: 3 },
	{ width: 428, height: 926, dpr: 3 },
	{ width: 393, height: 852, dpr: 3 },
	{ width: 430, height: 932, dpr: 3 },
	{ width: 402, height: 874, dpr: 3 },
	{ width: 440, height: 956, dpr: 3 },
	{ width: 420, height: 912, dpr: 3 },
	// iPad
	{ width: 768, height: 1024, dpr: 2 },
	{ width: 810, height: 1080, dpr: 2 },
	{ width: 820, height: 1180, dpr: 2 },
	{ width: 744, height: 1133, dpr: 2 },
	{ width: 834, height: 1112, dpr: 2 },
	{ width: 834, height: 1194, dpr: 2 },
	{ width: 834, height: 1210, dpr: 2 },
	{ width: 1024, height: 1366, dpr: 2 },
	{ width: 1032, height: 1376, dpr: 2 },
];

export type Orientation = "portrait" | "landscape";

export type StartupImage = {
	href: string;
	media: string;
};

/**
 * Startup artwork is cached hard per Home Screen entry, so a change to it needs
 * a new URL rather than a rebuild.
 */
export const SPLASH_VERSION = "1";

export function splashFileName(
	size: DeviceSize,
	orientation: Orientation,
): string {
	// No `@`: Cloudflare's asset layer redirects a literal one to its
	// percent-encoded form, which would put a round trip in front of every
	// launch image.
	return `${size.width}x${size.height}-${size.dpr}x-${orientation}.png`;
}

/** The image's pixel dimensions, which are the points scaled by the DPR. */
export function splashPixels(
	size: DeviceSize,
	orientation: Orientation,
): [number, number] {
	const [width, height] =
		orientation === "portrait"
			? [size.width, size.height]
			: [size.height, size.width];
	return [width * size.dpr, height * size.dpr];
}

function media(size: DeviceSize, orientation: Orientation): string {
	// A landscape entry swaps the device dimensions in the query as well.
	const width = orientation === "portrait" ? size.width : size.height;
	const height = orientation === "portrait" ? size.height : size.width;
	return [
		`(device-width: ${width}px)`,
		`(device-height: ${height}px)`,
		`(-webkit-device-pixel-ratio: ${size.dpr})`,
		`(orientation: ${orientation})`,
	].join(" and ");
}

/** Every `<link rel="apple-touch-startup-image">` the album needs. */
export function startupImages(): StartupImage[] {
	const images: StartupImage[] = [];
	for (const size of DEVICE_SIZES)
		for (const orientation of ["portrait", "landscape"] as const)
			images.push({
				href: `/splash/${splashFileName(size, orientation)}?v${SPLASH_VERSION}`,
				media: media(size, orientation),
			});
	return images;
}
