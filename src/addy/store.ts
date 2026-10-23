import { env } from "cloudflare:workers";

/** An image key relative to the `addy/` prefix. */
const LEGACY_PREFIX = "addy/";
const MEDIA_PREFIX = "addy/media/";
const META_PREFIX = "addy/meta/";
/**
 * The one picture the logged-out landing page is allowed to show. It lives in
 * R2 rather than in the repository so it is not part of a public checkout.
 */
const COVER_KEY = "addy/cover";

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
			if (object.key === COVER_KEY) continue;
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

/** The date and place of a photo, as flat R2 custom metadata values. */
function locationMetadata(meta: PhotoMeta): Record<string, string> {
	return {
		id: meta.id,
		takenAt: meta.takenAt ?? "",
		lat: meta.lat === null ? "" : String(meta.lat),
		lng: meta.lng === null ? "" : String(meta.lng),
		place: meta.place ?? "",
	};
}

/** Read back what `locationMetadata` wrote. */
function metadataLocation(custom: Record<string, string> | undefined): {
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
	place: string | null;
} | null {
	if (!custom) return null;
	const lat = custom.lat === "" ? null : Number(custom.lat);
	const lng = custom.lng === "" ? null : Number(custom.lng);
	if (lat !== null && !Number.isFinite(lat)) return null;
	if (lng !== null && !Number.isFinite(lng)) return null;
	return {
		takenAt: custom.takenAt ? custom.takenAt : null,
		lat,
		lng,
		place: custom.place ? custom.place : null,
	};
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

/**
 * The first stretch of a stored original. EXIF always sits at the front, so
 * there is no reason to pull a 40 MB photo through the Worker to read it.
 */
export async function readOriginalHead(id: string): Promise<File | null> {
	const name = legacyName(id);
	const key = name
		? `${LEGACY_PREFIX}${name}`
		: `${MEDIA_PREFIX}${id}/original`;
	const object = await env.DATA.get(key, {
		range: { offset: 0, length: 512 * 1024 },
	});
	if (!object) return null;
	return new File([await object.arrayBuffer()], name ?? "original", {
		type: object.httpMetadata?.contentType ?? "",
	});
}

export async function readMeta(id: string): Promise<PhotoMeta | null> {
	const object = await env.DATA.get(`${META_PREFIX}${id}.json`);
	if (object) {
		try {
			return (await object.json()) as PhotoMeta;
		} catch {
			// Fall through to the copy stored on the photo itself.
		}
	}
	// The sidecar is gone or unreadable. The image still carries the date and
	// place written at upload time, so a photo reached by id can still be
	// edited, downloaded and pinned. It cannot put the photo back in the
	// listing, which is built from the sidecars alone.
	const name = legacyName(id);
	if (name) return null;
	const head = await env.DATA.head(`${MEDIA_PREFIX}${id}/display.jpg`);
	const located = metadataLocation(head?.customMetadata);
	if (!head || !located) return null;
	return {
		id,
		caption: "",
		takenAt: located.takenAt,
		lat: located.lat,
		lng: located.lng,
		place: located.place,
		width: null,
		height: null,
		bytes: head.size,
		contentType: "image/jpeg",
		createdAt: head.uploaded.toISOString(),
		originalName: null,
	};
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

	// Every stored object carries the photo's date and place as R2 metadata,
	// not just the JSON sidecar, so the location stays attached to the bytes it
	// belongs to. The sidecar is still the record that edits rewrite; these
	// copies keep the values from upload time.
	const located = locationMetadata(meta);

	await Promise.all([
		env.DATA.put(`${base}/original`, input.original.stream(), {
			httpMetadata: {
				contentType: input.contentType,
				cacheControl: "public, max-age=31536000, immutable",
			},
			customMetadata: located,
		}),
		env.DATA.put(`${base}/display.jpg`, input.display.stream(), {
			httpMetadata: {
				contentType: "image/jpeg",
				cacheControl: "public, max-age=31536000, immutable",
			},
			customMetadata: located,
		}),
		env.DATA.put(`${base}/thumb.jpg`, input.thumb.stream(), {
			httpMetadata: {
				contentType: "image/jpeg",
				cacheControl: "public, max-age=31536000, immutable",
			},
			customMetadata: located,
		}),
	]);

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
	return {
		object,
		// The type was recorded on the object at upload time, so serving a
		// variant never needs a second read of the JSON sidecar.
		contentType: object.httpMetadata?.contentType ?? "image/jpeg",
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
		headers.set("Cache-Control", "private, max-age=31536000, immutable");
	} else {
		headers.set("Cache-Control", "private, no-cache");
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

export type CoverImage = {
	object: R2ObjectBody;
	contentType: string;
	/** The photo the cover was pinned to, when it was pinned to one. */
	source: string | null;
};

/**
 * The single picture the logged-out landing page shows. It is the object
 * pinned at `addy/cover` and nothing else: no photo is published by accident,
 * and the front page does not move when someone uploads a new one.
 */
export async function getCover(): Promise<CoverImage | null> {
	const pinned = await env.DATA.get(COVER_KEY);
	if (!pinned) return null;

	const source = pinned.customMetadata?.source ?? null;
	// The cover is a copy of a photo. If that photo has since been deleted the
	// copy has to go too, rather than outliving it on the front page.
	if (source !== null && !(await getPhoto(source))) {
		await env.DATA.delete(COVER_KEY);
		return null;
	}

	return {
		object: pinned,
		contentType: pinned.httpMetadata?.contentType ?? "image/jpeg",
		source,
	};
}

/**
 * Which photo is currently pinned as the cover, if any. A pin whose photo has
 * been deleted is dropped here too, so a half-finished delete cannot leave the
 * viewer claiming a photo is on the front page when it is not.
 */
export async function pinnedCoverSource(): Promise<string | null> {
	const head = await env.DATA.head(COVER_KEY);
	const source = head?.customMetadata?.source ?? null;
	if (!source) return null;
	if (await getPhoto(source)) return source;
	await env.DATA.delete(COVER_KEY);
	return null;
}

/** Copy one photo's web-sized image into the cover slot. */
export async function setCoverFromPhoto(id: string): Promise<boolean> {
	const photo = await getPhoto(id);
	if (!photo) return false;
	const variant = await getPhotoVariant(
		id,
		photo.legacy ? "original" : "display",
	);
	if (!variant) return false;
	await env.DATA.put(COVER_KEY, variant.object.body, {
		httpMetadata: {
			contentType: variant.contentType,
			cacheControl: "no-cache",
		},
		customMetadata: { source: id },
	});
	return true;
}

/** Drop the pinned cover, falling back to the newest photo. */
export async function clearCover(): Promise<void> {
	await env.DATA.delete(COVER_KEY);
}
