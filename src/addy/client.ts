import { strToU8, zipSync } from "fflate";
import { downloadNameFor } from "./album";
import { type PhotoExif, readExif } from "./exif";
import type { AddyPhoto } from "./store";

export type SessionState = {
	authenticated: boolean;
	configured: boolean;
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
	configured: boolean;
}> {
	return request("/addy/api/photos");
}

export async function fetchSession(): Promise<SessionState> {
	return request("/addy/api/session");
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

export async function uploadPhoto(
	prepared: PreparedPhoto,
	fields: { caption: string; takenAt: string | null; place: string },
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

	const response = await fetch("/addy/api/photos", {
		method: "POST",
		body: form,
		cache: "no-store",
	});
	if (!response.ok) throw new Error(await errorMessage(response));
	const data = (await response.json()) as { photo: AddyPhoto };
	return data.photo;
}

export function downloadPhoto(photo: AddyPhoto) {
	const link = document.createElement("a");
	link.href = photo.downloadUrl;
	link.download = "";
	link.click();
}

/** Download a web-sized copy of everything, with a captions file, as a zip. */
export async function downloadAlbum(
	photos: AddyPhoto[],
	onProgress: (done: number, total: number) => void,
): Promise<void> {
	const files: Record<string, Uint8Array> = {};
	const captions = [
		"Addy & me",
		`${photos.length} photos downloaded ${new Date().toISOString().slice(0, 10)}`,
		"",
	];
	const used = new Set<string>();

	for (let index = 0; index < photos.length; index++) {
		const photo = photos[index];
		onProgress(index, photos.length);
		const response = await fetch(photo.displayUrl, { cache: "force-cache" });
		if (!response.ok) continue;
		let name = downloadNameFor(photo);
		let suffix = 2;
		while (used.has(name)) {
			name = name.replace(/(\.[a-z0-9]+)$/i, `-${suffix}$1`);
			suffix++;
		}
		used.add(name);
		files[name] = new Uint8Array(await response.arrayBuffer());
		captions.push(
			`${name}\n  ${photo.caption || "(no caption)"}\n  ${[photo.place, photo.takenAt?.slice(0, 10)].filter(Boolean).join(" · ")}`,
		);
	}
	onProgress(photos.length, photos.length);
	files["captions.txt"] = strToU8(captions.join("\n\n"));
	const zipped = zipSync(files, { level: 0 });
	const blob = new Blob([zipped], { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "addy-and-me-photos.zip";
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
