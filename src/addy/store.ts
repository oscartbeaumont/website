import { env } from "cloudflare:workers";

/** An image key relative to the `addy/` prefix. */
const LEGACY_PREFIX = "addy/";
const MEDIA_PREFIX = "addy/media/";
const META_PREFIX = "addy/meta/";

const LEGACY_TYPES: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	gif: "image/gif",
	heic: "image/heic",
	avif: "image/avif",
};

/**
 * The original nine photos, in the order they were hand-picked for the old
 * page. They live directly under `addy/` and have no metadata sidecar unless
 * someone edits them.
 */
export const LEGACY_ORDER = [
	"IMG_5752.png",
	"IMG_6406.png",
	"IMG_6849.png",
	"IMG_7050.png",
	"IMG_7295.png",
	"IMG_7579.png",
	"IMG_6367.png",
	"IMG_7309.png",
	"IMG_5946.png",
];

/** A photo as returned by the API and rendered by the page. */
export type AddyPhoto = {
	id: string;
	caption: string;
	/** Local time from EXIF, e.g. `2026-02-14T18:32:00+08:00`. */
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
	place: string | null;
	width: number | null;
	height: number | null;
	bytes: number | null;
	createdAt: string;
	originalName: string | null;
	legacy: boolean;
	/** Position in the hand-picked first roll, if this is a legacy photo. */
	legacyRank: number | null;
	thumbUrl: string;
	displayUrl: string;
	downloadUrl: string;
};

/** The JSON sidecar stored next to each photo in R2. */
export type PhotoMeta = {
	id: string;
	caption: string;
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
	place: string | null;
	width: number | null;
	height: number | null;
	bytes: number | null;
	contentType: string;
	createdAt: string;
	originalName: string | null;
};

export type LegacyImage = {
	/** Content hash (the R2 object's ETag) used in the public image URL. */
	hash: string;
	name: string;
	uploaded: string;
	size: number;
};

const META_ID = /^(photo|legacy)-[A-Za-z0-9._-]{1,120}$/;

export function isPhotoId(value: string): boolean {
	return META_ID.test(value);
}

export function legacyId(name: string): string {
	return `legacy-${name}`;
}

export function legacyName(id: string): string | null {
	if (!id.startsWith("legacy-")) return null;
	const name = id.slice("legacy-".length);
	return /^[A-Za-z0-9._-]+$/.test(name) ? name : null;
}

async function listLegacyImages(): Promise<LegacyImage[]> {
	const images: LegacyImage[] = [];
	let cursor: string | undefined;
	do {
		const listed = await env.DATA.list({ prefix: LEGACY_PREFIX, cursor });
		for (const object of listed.objects) {
			if (object.key.length === LEGACY_PREFIX.length) continue;
			if (object.key.startsWith(MEDIA_PREFIX)) continue;
			if (object.key.startsWith(META_PREFIX)) continue;
			if (object.key.endsWith("/")) continue;
			images.push({
				name: object.key.slice(LEGACY_PREFIX.length),
				hash: object.etag,
				uploaded: object.uploaded.toISOString(),
				size: object.size,
			});
		}
		cursor = listed.truncated ? listed.cursor : undefined;
	} while (cursor);

	const rank = new Map(LEGACY_ORDER.map((name, index) => [name, index]));
	return images.sort(
		(a, b) =>
			(rank.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
				(rank.get(b.name) ?? Number.MAX_SAFE_INTEGER) ||
			a.name.localeCompare(b.name),
	);
}

/**
 * Sidecars carry a base64 copy of themselves in R2 custom metadata, which the
 * list API returns for free. That keeps listing the album at two R2 requests
 * instead of one per photo (important on the Workers free plan).
 */
function encodeMetaHeader(meta: PhotoMeta): string | null {
	try {
		const bytes = new TextEncoder().encode(JSON.stringify(meta));
		if (bytes.byteLength > 1400) return null;
		let binary = "";
		for (const byte of bytes) binary += String.fromCharCode(byte);
		return btoa(binary);
	} catch {
		return null;
	}
}

function decodeMetaHeader(value: string): PhotoMeta | null {
	try {
		const binary = atob(value);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		const meta = JSON.parse(new TextDecoder().decode(bytes)) as PhotoMeta;
		return meta?.id && isPhotoId(meta.id) ? meta : null;
	} catch {
		return null;
	}
}

async function listMeta(): Promise<PhotoMeta[]> {
	const metas: PhotoMeta[] = [];
	const missing: string[] = [];
	let cursor: string | undefined;
	do {
		const listed = await env.DATA.list({
			prefix: META_PREFIX,
			cursor,
			include: ["customMetadata"],
		});
		for (const object of listed.objects) {
			if (!object.key.endsWith(".json")) continue;
			const header = object.customMetadata?.meta;
			const meta = header ? decodeMetaHeader(header) : null;
			if (meta) metas.push(meta);
			else missing.push(object.key);
		}
		cursor = listed.truncated ? listed.cursor : undefined;
	} while (cursor);

	// Older sidecars (and unusually long captions) need one read each.
	const objects = await Promise.all(missing.map((key) => env.DATA.get(key)));
	for (const object of objects) {
		if (!object) continue;
		try {
			const meta = (await object.json()) as PhotoMeta;
			if (meta?.id && isPhotoId(meta.id)) metas.push(meta);
		} catch {
			// A corrupt sidecar shouldn't take down the whole album.
		}
	}
	return metas;
}

function toPhoto(meta: PhotoMeta, legacy?: LegacyImage): AddyPhoto {
	const urls = legacy
		? {
				thumbUrl: `/addy/imgs/${legacy.hash}`,
				displayUrl: `/addy/imgs/${legacy.hash}`,
				downloadUrl: `/addy/imgs/${legacy.hash}?download=1`,
			}
		: {
				thumbUrl: `/addy/photos/${meta.id}/thumb`,
				displayUrl: `/addy/photos/${meta.id}/display`,
				downloadUrl: `/addy/photos/${meta.id}/original?download=1`,
			};
	const rank = legacy ? LEGACY_ORDER.indexOf(legacy.name) : -1;
	return {
		id: meta.id,
		caption: meta.caption ?? "",
		takenAt: meta.takenAt ?? null,
		lat: meta.lat ?? null,
		lng: meta.lng ?? null,
		place: meta.place ?? null,
		width: meta.width ?? null,
		height: meta.height ?? null,
		bytes: meta.bytes ?? legacy?.size ?? null,
		createdAt: meta.createdAt,
		originalName: meta.originalName ?? legacy?.name ?? null,
		legacy: Boolean(legacy),
		legacyRank: legacy ? (rank >= 0 ? rank : LEGACY_ORDER.length) : null,
		...urls,
	};
}

function legacyPhoto(image: LegacyImage, meta?: PhotoMeta): AddyPhoto {
	const fallback: PhotoMeta = {
		id: legacyId(image.name),
		caption: "",
		takenAt: null,
		lat: null,
		lng: null,
		place: null,
		width: null,
		height: null,
		bytes: image.size,
		contentType: "image/png",
		createdAt: image.uploaded,
		originalName: image.name,
	};
	return toPhoto(meta ?? fallback, image);
}

let cache: { at: number; photos: AddyPhoto[] } | null = null;
const CACHE_MS = 15_000;

export function invalidatePhotoCache() {
	cache = null;
}

/** Every photo, newest first. Legacy photos stay in their curated order. */
export async function listPhotos(force = false): Promise<AddyPhoto[]> {
	if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.photos;

	const [metas, legacy] = await Promise.all([listMeta(), listLegacyImages()]);
	const legacyByName = new Map(legacy.map((image) => [image.name, image]));
	const legacyMetas = new Map<string, PhotoMeta>();
	const photos: AddyPhoto[] = [];

	for (const meta of metas) {
		const name = legacyName(meta.id);
		const image = name ? legacyByName.get(name) : undefined;
		if (name) {
			if (!image) continue;
			legacyMetas.set(meta.id, meta);
			continue;
		}
		photos.push(toPhoto(meta));
	}
	for (const image of legacy) {
		const id = legacyId(image.name);
		photos.push(legacyPhoto(image, legacyMetas.get(id)));
	}

	photos.sort((a, b) => {
		if (a.legacy && b.legacy) return 0;
		if (a.legacy !== b.legacy) return a.legacy ? 1 : -1;
		return (b.takenAt ?? b.createdAt).localeCompare(a.takenAt ?? a.createdAt);
	});
	cache = { at: Date.now(), photos };
	return photos;
}

export async function getPhoto(id: string): Promise<AddyPhoto | null> {
	if (!isPhotoId(id)) return null;
	const name = legacyName(id);
	if (name) {
		const legacy = await listLegacyImages();
		const image = legacy.find((entry) => entry.name === name);
		if (!image) return null;
		const meta = await readMeta(id);
		return legacyPhoto(image, meta ?? undefined);
	}
	// Read the sidecar directly: edits and deletes must never be judged
	// against the short-lived listing cache.
	const meta = await readMeta(id);
	return meta ? toPhoto(meta) : null;
}

export async function readMeta(id: string): Promise<PhotoMeta | null> {
	const object = await env.DATA.get(`${META_PREFIX}${id}.json`);
	if (!object) return null;
	try {
		return (await object.json()) as PhotoMeta;
	} catch {
		return null;
	}
}

export async function writeMeta(meta: PhotoMeta): Promise<void> {
	const header = encodeMetaHeader(meta);
	await env.DATA.put(`${META_PREFIX}${meta.id}.json`, JSON.stringify(meta), {
		httpMetadata: { contentType: "application/json" },
		...(header ? { customMetadata: { meta: header } } : {}),
	});
	invalidatePhotoCache();
}

export async function createPhoto(input: {
	caption: string;
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
	place: string | null;
	width: number | null;
	height: number | null;
	originalName: string;
	contentType: string;
	original: File;
	display: File;
	thumb: File;
}): Promise<AddyPhoto> {
	const id = `photo-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`;
	const base = `${MEDIA_PREFIX}${id}`;

	await Promise.all([
		env.DATA.put(`${base}/original`, input.original.stream(), {
			httpMetadata: {
				contentType: input.contentType,
				cacheControl: "public, max-age=31536000, immutable",
			},
		}),
		env.DATA.put(`${base}/display.jpg`, input.display.stream(), {
			httpMetadata: {
				contentType: "image/jpeg",
				cacheControl: "public, max-age=31536000, immutable",
			},
		}),
		env.DATA.put(`${base}/thumb.jpg`, input.thumb.stream(), {
			httpMetadata: {
				contentType: "image/jpeg",
				cacheControl: "public, max-age=31536000, immutable",
			},
		}),
	]);

	const meta: PhotoMeta = {
		id,
		caption: input.caption,
		takenAt: input.takenAt,
		lat: input.lat,
		lng: input.lng,
		place: input.place,
		width: input.width,
		height: input.height,
		bytes: input.original.size,
		contentType: input.contentType,
		createdAt: new Date().toISOString(),
		originalName: input.originalName,
	};
	await writeMeta(meta);
	return toPhoto(meta);
}

export async function deletePhoto(id: string): Promise<boolean> {
	if (legacyName(id)) return false;
	const base = `${MEDIA_PREFIX}${id}`;
	// The sidecar is the source of truth for the listing, so remove it first.
	// If an image delete then fails we leave a few unreferenced bytes behind
	// instead of a tile whose photos have vanished.
	await env.DATA.delete(`${META_PREFIX}${id}.json`);
	invalidatePhotoCache();
	await Promise.all([
		env.DATA.delete(`${base}/original`),
		env.DATA.delete(`${base}/display.jpg`),
		env.DATA.delete(`${base}/thumb.jpg`),
	]);
	return true;
}

/** Resolve a photo variant to an R2 object plus response metadata. */
export async function getPhotoVariant(
	id: string,
	variant: string,
): Promise<{
	object: R2ObjectBody;
	contentType: string;
	immutable: boolean;
} | null> {
	if (variant !== "thumb" && variant !== "display" && variant !== "original")
		return null;

	const name = legacyName(id);
	if (name) {
		const images = await listLegacyImages();
		const image = images.find((entry) => entry.name === name);
		if (!image) return null;
		const object = await env.DATA.get(`${LEGACY_PREFIX}${image.name}`);
		if (!object) return null;
		return {
			object,
			contentType: object.httpMetadata?.contentType ?? "image/png",
			immutable: true,
		};
	}

	if (!isPhotoId(id)) return null;
	const key =
		variant === "original"
			? `${MEDIA_PREFIX}${id}/original`
			: `${MEDIA_PREFIX}${id}/${variant}.jpg`;
	const object = await env.DATA.get(key);
	if (!object) return null;
	const meta = variant === "original" ? await readMeta(id) : null;
	return {
		object,
		contentType:
			meta?.contentType ?? object.httpMetadata?.contentType ?? "image/jpeg",
		immutable: true,
	};
}

/** The legacy image endpoint used by already-shared links. */
export async function getLegacyImage(hash: string, download = false) {
	if (!hash) return new Response("Image hash is required", { status: 400 });

	const images = await listLegacyImages();
	const image =
		images.find((entry) => entry.hash === hash) ??
		images.find((entry) => entry.name === hash);
	if (!image) return new Response("File not found", { status: 404 });

	const object = await env.DATA.get(`${LEGACY_PREFIX}${image.name}`);
	if (!object) return new Response("File not found", { status: 404 });

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	if (!headers.has("Content-Type")) {
		// Some of the first roll was uploaded without content metadata. The
		// old endpoint relied on R2 too, but an explicit type keeps old links
		// rendering and downloading correctly everywhere.
		const extension = image.name.split(".").pop()?.toLowerCase() ?? "";
		const type = LEGACY_TYPES[extension];
		if (type) headers.set("Content-Type", type);
	}
	if (image.hash === hash) {
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=31536000");
	} else {
		headers.set("Cache-Control", "no-cache");
	}
	headers.set("ETag", object.httpEtag);
	headers.set("X-Robots-Tag", "noindex, nofollow");
	headers.set("X-Content-Type-Options", "nosniff");
	if (download)
		headers.set(
			"Content-Disposition",
			`attachment; filename="${image.name.replaceAll('"', "")}"`,
		);
	return new Response(object.body, { headers });
}

export async function listLegacyForApi(): Promise<LegacyImage[]> {
	return listLegacyImages();
}
