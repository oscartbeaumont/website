import { strToU8, Zip, ZipPassThrough } from "fflate";
import { downloadNameFor } from "./album";
import { type PhotoExif, readExif } from "./exif";
import type { AddyPhoto } from "./store";

export type SessionState = {
	authenticated: boolean;
};

async function errorMessage(response: Response): Promise<string> {
	try {
		const data = (await response.json()) as { error?: string };
		if (data?.error) return data.error;
	} catch {
		// Fall through to the status message.
	}
	return `Something went wrong (${response.status}).`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			accept: "application/json",
			...(init?.body ? { "content-type": "application/json" } : {}),
			...init?.headers,
		},
		cache: "no-store",
	});
	if (!response.ok) throw new Error(await errorMessage(response));
	return (await response.json()) as T;
}

export async function fetchPhotos(): Promise<{
	photos: AddyPhoto[];
	locked: boolean;
	coverId: string | null;
}> {
	return request("/addy/api/photos");
}

export async function fetchSession(): Promise<SessionState> {
	return request("/addy/api/session");
}

/**
 * Ask the server what a set of coordinates is called. The lookups go through
 * the Worker so the map provider sees one well-behaved client, and so the
 * answer is cached for the next photo taken in the same spot.
 */
export async function lookupPlace(
	lat: number,
	lng: number,
): Promise<string | null> {
	const data = await request<{ place: string | null }>(
		`/addy/api/location?lat=${lat}&lng=${lng}`,
	);
	return data.place ?? null;
}

export async function setCover(id: string): Promise<string> {
	const data = await request<{ coverId: string }>("/addy/api/cover", {
		method: "POST",
		body: JSON.stringify({ id }),
	});
	return data.coverId;
}

export async function clearCover(): Promise<void> {
	await request("/addy/api/cover", { method: "DELETE" });
}

export async function login(password: string): Promise<void> {
	await request("/addy/api/session", {
		method: "POST",
		body: JSON.stringify({ password }),
	});
}

export async function logout(): Promise<void> {
	await request("/addy/api/session", { method: "DELETE" });
}

export type PhotoPatch = {
	caption?: string;
	takenAt?: string | null;
	place?: string | null;
	lat?: number | null;
	lng?: number | null;
};

export async function patchPhoto(
	id: string,
	patch: PhotoPatch,
): Promise<AddyPhoto> {
	const data = await request<{ photo: AddyPhoto }>(
		`/addy/api/photos/${encodeURIComponent(id)}`,
		{ method: "PATCH", body: JSON.stringify(patch) },
	);
	return data.photo;
}

export async function removePhoto(id: string): Promise<void> {
	await request(`/addy/api/photos/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});
}

export type PreparedPhoto = {
	file: File;
	previewUrl: string;
	display: Blob;
	thumb: Blob;
	width: number;
	height: number;
	exif: PhotoExif;
};

const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

async function toJpeg(
	bitmap: ImageBitmap,
	maxEdge: number,
	quality: number,
): Promise<Blob> {
	const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	const context = canvas.getContext("2d");
	if (!context) throw new Error("This browser can't prepare photos.");
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) =>
				blob
					? resolve(blob)
					: reject(new Error("This browser couldn't prepare that photo.")),
			"image/jpeg",
			quality,
		);
	});
}

/** Read the date/place, make a display copy and a thumbnail, all locally. */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
	if (file.size > MAX_UPLOAD_BYTES)
		throw new Error(`${file.name} is larger than 40 MB.`);
	if (!file.type.startsWith("image/"))
		throw new Error(`${file.name} isn't an image.`);

	let bitmap: ImageBitmap;
	try {
		// `from-image` is the spec default, but naming it keeps portrait iPhone
		// photos upright on browsers that don't apply EXIF orientation on their own.
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {
		throw new Error(
			`We couldn't open ${file.name}. JPEG, PNG and WebP work best.`,
		);
	}

	try {
		const [display, thumb, exif] = await Promise.all([
			toJpeg(bitmap, 2048, 0.86),
			toJpeg(bitmap, 720, 0.8),
			readExif(file),
		]);
		const previewUrl = URL.createObjectURL(thumb);
		return {
			file,
			previewUrl,
			display,
			thumb,
			width: bitmap.width,
			height: bitmap.height,
			exif,
		};
	} finally {
		bitmap.close();
	}
}

/**
 * The upload is the one request worth watching: a roll of phone photos can be
 * a hundred megabytes over a hotel connection. `fetch` cannot report how much
 * of a request body has gone out, so this one goes through XHR, whose upload
 * events can.
 */
export function uploadPhoto(
	prepared: PreparedPhoto,
	fields: { caption: string; takenAt: string | null; place: string },
	onProgress?: (fraction: number) => void,
): Promise<AddyPhoto> {
	const form = new FormData();
	form.append(
		"meta",
		JSON.stringify({
			caption: fields.caption,
			takenAt: fields.takenAt,
			place: fields.place,
			lat: prepared.exif.lat,
			lng: prepared.exif.lng,
			width: prepared.width,
			height: prepared.height,
		}),
	);
	form.append("original", prepared.file, prepared.file.name);
	form.append("display", prepared.display, "display.jpg");
	form.append("thumb", prepared.thumb, "thumb.jpg");

	return new Promise<AddyPhoto>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/addy/api/photos");
		xhr.responseType = "json";
		xhr.upload.addEventListener("progress", (event) => {
			if (event.lengthComputable && event.total > 0)
				onProgress?.(event.loaded / event.total);
		});
		xhr.addEventListener("load", () => {
			const data = xhr.response as {
				photo?: AddyPhoto;
				error?: string;
			} | null;
			if (xhr.status >= 200 && xhr.status < 300 && data?.photo) {
				onProgress?.(1);
				resolve(data.photo);
				return;
			}
			reject(new Error(data?.error ?? `Something went wrong (${xhr.status}).`));
		});
		xhr.addEventListener("error", () =>
			reject(new Error("The upload was cut off. Try again?")),
		);
		xhr.addEventListener("abort", () =>
			reject(new Error("That upload was cancelled.")),
		);
		xhr.send(form);
	});
}

export function downloadPhoto(photo: AddyPhoto) {
	const link = document.createElement("a");
	link.href = photo.downloadUrl;
	link.download = "";
	document.body.appendChild(link);
	link.click();
	link.remove();
}

/** Download a web-sized copy of everything, with a captions file, as a zip. */
export async function downloadAlbum(
	photos: AddyPhoto[],
	onProgress: (done: number, total: number) => void,
): Promise<{ skipped: number }> {
	// The zip is streamed together as the photos arrive instead of holding a
	// second full copy of every file until the end. That matters once the album
	// runs into the hundreds.
	const chunks: Uint8Array<ArrayBuffer>[] = [];
	let zipError: Error | null = null;
	const zip = new Zip((error, data) => {
		if (error) {
			zipError = error;
			return;
		}
		if (data.length > 0) chunks.push(data as Uint8Array<ArrayBuffer>);
	});

	const today = new Date();
	const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	const photoNotes: string[] = [];
	const used = new Set<string>();
	let skipped = 0;

	for (let index = 0; index < photos.length; index++) {
		const photo = photos[index];
		onProgress(index, photos.length);
		try {
			const response = await fetch(photo.displayUrl, { cache: "force-cache" });
			if (!response.ok) {
				skipped++;
				continue;
			}
			const bytes = new Uint8Array(await response.arrayBuffer());
			let name = downloadNameFor(photo, "display");
			let suffix = 2;
			while (used.has(name)) {
				name = name.replace(/(\.[a-z0-9]+)$/i, `-${suffix}$1`);
				suffix++;
			}
			used.add(name);
			const entry = new ZipPassThrough(name);
			zip.add(entry);
			entry.push(bytes, true);
			const where = [photo.place, photo.takenAt?.slice(0, 10) ?? "undated"]
				.filter(Boolean)
				.join(" · ");
			photoNotes.push(
				`${name}\n  ${photo.caption || "(no caption)"}\n${where ? `  ${where}` : ""}`,
			);
		} catch {
			skipped++;
		}
	}

	if (skipped === photos.length)
		throw new Error("Couldn't fetch any of the photos. Try again in a moment.");

	onProgress(photos.length, photos.length);
	const captionText = [
		"Addy & me",
		`${photos.length - skipped} photos, packed ${stamp}`,
		"These are web-sized copies. The originals are still on the site.",
		...photoNotes,
	].join("\n\n");
	const captionEntry = new ZipPassThrough("captions.txt");
	zip.add(captionEntry);
	captionEntry.push(strToU8(captionText), true);
	zip.end();
	if (zipError) {
		throw new Error(
			"Couldn't pack the album. Try downloading a few photos at a time.",
		);
	}

	const blob = new Blob(chunks, { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "addy-and-me-photos.zip";
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
	return { skipped };
}
