import {
	clearSessionCookie,
	createSessionToken,
	isAuthenticated,
	isSameOrigin,
	loginAllowed,
	passwordMatches,
	sessionCookie,
	uploadsConfigured,
} from "./auth";
import { reverseGeocode } from "./geocode";
import {
	createPhoto,
	deletePhoto,
	getPhoto,
	isPhotoId,
	legacyName,
	listPhotos,
	type PhotoMeta,
	readMeta,
	writeMeta,
} from "./store";

const JSON_HEADERS = {
	"Cache-Control": "no-store, no-transform",
	"Content-Type": "application/json; charset=utf-8",
	"X-Robots-Tag": "noindex, nofollow",
};

const MAX_ORIGINAL_BYTES = 40 * 1024 * 1024;
const MAX_DISPLAY_BYTES = 8 * 1024 * 1024;
const MAX_THUMB_BYTES = 2 * 1024 * 1024;
const MAX_CAPTION = 280;
const MAX_PLACE = 80;

function json(
	body: unknown,
	status = 200,
	headers: Record<string, string> = {},
) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...JSON_HEADERS, ...headers },
	});
}

function fail(message: string, status = 400) {
	return json({ error: message }, status);
}

async function body(request: Request): Promise<Record<string, unknown>> {
	try {
		const value = await request.json();
		return value && typeof value === "object"
			? (value as Record<string, unknown>)
			: {};
	} catch {
		return {};
	}
}

function cleanText(value: unknown, max: number): string {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}

/** A path segment is only useful to us if it decodes to something sane. */
function decodeSegment(value: string): string | null {
	try {
		return decodeURIComponent(value);
	} catch {
		return null;
	}
}

function cleanDate(value: unknown): string | null {
	if (typeof value !== "string" || value.trim() === "") return null;
	const text = value.trim();
	if (
		!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(
			text,
		)
	)
		return null;
	return Number.isNaN(new Date(text).getTime()) ? null : text;
}

function cleanNumber(value: unknown, min: number, max: number): number | null {
	const number =
		typeof value === "number"
			? value
			: typeof value === "string" && value.trim() !== ""
				? Number(value)
				: Number.NaN;
	if (!Number.isFinite(number) || number < min || number > max) return null;
	return number;
}

function cleanCoord(value: unknown, limit: number): number | null | undefined {
	if (value === null || value === undefined || value === "") return null;
	const number = cleanNumber(value, -limit, limit);
	return number ?? undefined;
}

async function fileType(file: File): Promise<string | null> {
	const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
	const ascii = (start: number, end: number) =>
		String.fromCharCode(...head.slice(start, end));
	if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff)
		return "image/jpeg";
	if (
		head[0] === 0x89 &&
		ascii(1, 4) === "PNG" &&
		head[4] === 0x0d &&
		head[5] === 0x0a
	)
		return "image/png";
	if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
	if (ascii(0, 4) === "GIF8") return "image/gif";
	if (ascii(4, 8) === "ftyp") {
		const brand = ascii(8, 12);
		if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand))
			return "image/heic";
		if (["avif", "avis"].includes(brand)) return "image/avif";
	}
	return null;
}

export async function handleAddyApi(
	request: Request,
	url: URL,
): Promise<Response> {
	const path = url.pathname.replace(/^\/addy\/api\/?/, "");
	const method = request.method;
	const authenticated = await isAuthenticated(request);

	if (method !== "GET" && !isSameOrigin(request))
		return fail("Cross-site request blocked.", 403);

	try {
		if (path === "session" && method === "GET")
			return json({
				authenticated,
				configured: uploadsConfigured(),
			});

		if (path === "session" && method === "POST") {
			if (!uploadsConfigured())
				return fail(
					"Uploads aren't configured yet. Set ADDY_PASSWORD to turn them on.",
					503,
				);
			const ip =
				request.headers.get("cf-connecting-ip") ??
				request.headers.get("x-forwarded-for") ??
				"local";
			if (!(await loginAllowed(ip)))
				return fail("Too many tries. Give it a few minutes.", 429);
			const data = await body(request);
			const password = typeof data.password === "string" ? data.password : "";
			if (!(await passwordMatches(password)))
				return fail("That's not it. Try again?", 401);
			const token = await createSessionToken();
			if (!token) return fail("Uploads aren't configured yet.", 503);
			return json({ authenticated: true, configured: true }, 200, {
				"Set-Cookie": sessionCookie(token, url.protocol === "https:"),
			});
		}

		if (path === "session" && method === "DELETE")
			return json({ authenticated: false }, 200, {
				"Set-Cookie": clearSessionCookie(url.protocol === "https:"),
			});

		if (path === "photos" && method === "GET") {
			// Signed-in visitors get an authoritative list so a photo that was
			// just uploaded (on another isolate) is never missing after a refresh.
			const photos = await listPhotos(authenticated);
			return json({ photos, configured: uploadsConfigured() });
		}

		if (path === "photos" && method === "POST") {
			if (!authenticated) return fail("Log in first.", 401);
			const length = Number(request.headers.get("content-length") ?? "0");
			if (
				length >
				MAX_ORIGINAL_BYTES + MAX_DISPLAY_BYTES + MAX_THUMB_BYTES + 1_000_000
			)
				return fail("That roll is too big.", 413);

			let form: FormData;
			try {
				form = await request.formData();
			} catch {
				return fail("Couldn't read that upload.", 400);
			}
			const original = form.get("original");
			const display = form.get("display");
			const thumb = form.get("thumb");
			if (!(original instanceof File) || original.size === 0)
				return fail("Choose a photo first.");
			if (!(display instanceof File) || !(thumb instanceof File))
				return fail("Couldn't prepare that photo. Try another one.");
			if (original.size > MAX_ORIGINAL_BYTES)
				return fail("That photo is larger than 40 MB.", 413);
			if (display.size > MAX_DISPLAY_BYTES || thumb.size > MAX_THUMB_BYTES)
				return fail("The prepared image was too large.", 413);

			const [originalType, displayType, thumbType] = await Promise.all([
				fileType(original),
				fileType(display),
				fileType(thumb),
			]);
			if (!originalType) return fail("That file isn't a photo we can read.");
			if (displayType !== "image/jpeg" || thumbType !== "image/jpeg")
				return fail("Couldn't prepare that photo. Try another one.");

			let meta: Record<string, unknown> = {};
			try {
				meta = JSON.parse(String(form.get("meta") ?? "{}"));
			} catch {
				// Defaults below are fine.
			}
			const lat = cleanCoord(meta.lat, 90);
			const lng = cleanCoord(meta.lng, 180);
			if (lat === undefined || lng === undefined)
				return fail("Those coordinates don't look right.");
			if ((lat === null) !== (lng === null))
				return fail("A photo needs both coordinates or neither.");

			let place = cleanText(meta.place, MAX_PLACE) || null;
			if (!place && lat !== null && lng !== null)
				place = await reverseGeocode(lat, lng);

			const takenAt = cleanDate(meta.takenAt);
			if (
				takenAt === null &&
				typeof meta.takenAt === "string" &&
				meta.takenAt.trim() !== ""
			)
				return fail("That date doesn't look right.");

			const photo = await createPhoto({
				caption: cleanText(meta.caption, MAX_CAPTION),
				takenAt,
				lat,
				lng,
				place,
				width: cleanNumber(meta.width, 1, 30_000),
				height: cleanNumber(meta.height, 1, 30_000),
				originalName: original.name.slice(0, 200),
				contentType: originalType,
				original,
				display,
				thumb,
			});
			return json({ photo, configured: true }, 201);
		}

		if (path.startsWith("photos/") && method === "PATCH") {
			if (!authenticated) return fail("Log in first.", 401);
			const id = decodeSegment(path.slice("photos/".length));
			if (id === null || !isPhotoId(id)) return fail("Unknown photo.", 404);
			const existing = await getPhoto(id);
			if (!existing) return fail("Unknown photo.", 404);
			const data = await body(request);

			const meta: PhotoMeta = (await readMeta(id)) ?? {
				id,
				caption: existing.caption,
				takenAt: existing.takenAt,
				lat: existing.lat,
				lng: existing.lng,
				place: existing.place,
				width: existing.width,
				height: existing.height,
				bytes: existing.bytes,
				contentType: existing.legacy ? "image/png" : "image/jpeg",
				createdAt: existing.createdAt,
				originalName: existing.originalName,
			};

			if ("caption" in data)
				meta.caption = cleanText(data.caption, MAX_CAPTION);
			if ("place" in data)
				meta.place = cleanText(data.place, MAX_PLACE) || null;
			if ("takenAt" in data) {
				const takenAt = cleanDate(data.takenAt);
				if (
					takenAt === null &&
					typeof data.takenAt === "string" &&
					data.takenAt.trim() !== ""
				)
					return fail("That date doesn't look right.");
				meta.takenAt = takenAt;
			}
			if ("lat" in data) {
				const lat = cleanCoord(data.lat, 90);
				if (lat === undefined) return fail("That latitude doesn't look right.");
				meta.lat = lat;
			}
			if ("lng" in data) {
				const lng = cleanCoord(data.lng, 180);
				if (lng === undefined)
					return fail("That longitude doesn't look right.");
				meta.lng = lng;
			}
			if ((meta.lat === null) !== (meta.lng === null)) {
				meta.lat = null;
				meta.lng = null;
			}
			const coordinatesChanged = "lat" in data || "lng" in data;
			if (
				coordinatesChanged &&
				!("place" in data) &&
				meta.lat !== null &&
				meta.lng !== null
			) {
				// Keep the name we already had if the lookup can't answer, rather
				// than wiping it on a Nominatim hiccup.
				const name = await reverseGeocode(meta.lat, meta.lng);
				if (name) meta.place = name;
			}

			await writeMeta(meta);
			const photo = (await getPhoto(id)) ?? existing;
			return json({ photo, configured: true });
		}

		if (path.startsWith("photos/") && method === "DELETE") {
			if (!authenticated) return fail("Log in first.", 401);
			const id = decodeSegment(path.slice("photos/".length));
			if (id === null || !isPhotoId(id)) return fail("Unknown photo.", 404);
			if (legacyName(id))
				return fail("The first-roll photos are kept safe.", 409);
			const removed = await deletePhoto(id);
			if (!removed) return fail("Unknown photo.", 404);
			return json({ ok: true });
		}

		return fail("Not found.", 404);
	} catch (error) {
		console.error("Addy API error", error);
		return fail("Something went wrong on our end.", 500);
	}
}
