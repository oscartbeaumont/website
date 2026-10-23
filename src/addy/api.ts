import {
	clearSessionCookie,
	createSessionToken,
	isAuthenticated,
	isSameOrigin,
	loginAllowed,
	passwordConfigured,
	passwordMatches,
	sessionCookie,
} from "./auth";
import { readExif } from "./exif";
import { forwardGeocode, reverseGeocode } from "./geocode";
import { NO_INDEX } from "./robots";
import {
	clearCover,
	createPhoto,
	deletePhoto,
	getPhoto,
	isPhotoId,
	legacyName,
	listPhotos,
	type PhotoMeta,
	pinnedCoverSource,
	readMeta,
	readOriginalHead,
	setCoverFromPhoto,
	writeMeta,
} from "./store";

const JSON_HEADERS = {
	"Cache-Control": "no-store, no-transform",
	"Content-Type": "application/json; charset=utf-8",
	"X-Robots-Tag": NO_INDEX,
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
		if (path === "session" && method === "GET") return json({ authenticated });

		if (path === "session" && method === "POST") {
			if (!passwordConfigured())
				return fail(
					"The album isn't switched on. Set ADDY_PASSWORD and try again.",
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
			if (!token)
				return fail("The album isn't switched on. Set ADDY_PASSWORD.", 503);
			return json({ authenticated: true }, 200, {
				"Set-Cookie": sessionCookie(token, url.protocol === "https:"),
			});
		}

		if (path === "session" && method === "DELETE")
			return json({ authenticated: false }, 200, {
				"Set-Cookie": clearSessionCookie(url.protocol === "https:"),
			});

		if (path === "photos" && method === "GET") {
			// The album is private. A logged-out visitor gets nothing but the
			// single cover photo, which has its own public endpoint — not even
			// which photo is on the front page, since that is the id needed to
			// fetch it.
			if (!authenticated)
				return json({ photos: [], locked: true, coverId: null });
			// Signed-in visitors get an authoritative list so a photo that was
			// just uploaded (on another isolate) is never missing after a refresh.
			const photos = await listPhotos(true);
			return json({
				photos,
				locked: false,
				coverId: await pinnedCoverSource(),
			});
		}

		if (path === "cover" && method === "POST") {
			if (!authenticated) return fail("Log in first.", 401);
			const data = await body(request);
			const id = typeof data.id === "string" ? data.id : "";
			if (!isPhotoId(id)) return fail("Unknown photo.", 404);
			if (!(await setCoverFromPhoto(id))) return fail("Unknown photo.", 404);
			return json({ coverId: id });
		}

		if (path === "cover" && method === "DELETE") {
			if (!authenticated) return fail("Log in first.", 401);
			await clearCover();
			return json({ coverId: null });
		}

		if (path === "location" && method === "GET") {
			if (!authenticated) return fail("Log in first.", 401);
			const lat = cleanNumber(url.searchParams.get("lat"), -90, 90);
			const lng = cleanNumber(url.searchParams.get("lng"), -180, 180);
			if (lat === null || lng === null)
				return fail("Those coordinates don't look right.");
			return json({ place: await reverseGeocode(lat, lng) });
		}

		/**
		 * Fill in the date, place and pin on photos that are missing them, by
		 * reading the stored original and asking the map. Batched because a
		 * Worker gets a limited number of subrequests per call, and idempotent
		 * because the photos that carry no location at all come back unchanged.
		 */
		if (path === "backfill" && method === "POST") {
			if (!authenticated) return fail("Log in first.", 401);
			const data = await body(request);
			const requested = cleanNumber(data.limit, 1, 12);
			const limit = requested === null ? 6 : Math.floor(requested);
			const photos = await listPhotos(true);
			// A photo with coordinates only needs a name; one with a name only
			// needs a pin; one with neither needs luck.
			const weight = (photo: { lat: number | null; place: string | null }) =>
				(photo.lat === null ? 0 : 2) + (photo.place ? 1 : 0);
			const pending = photos
				.filter(
					(photo) => !photo.place || photo.lat === null || photo.lng === null,
				)
				.sort((a, b) => weight(b) - weight(a));

			// One outing leaves several photos a few minutes apart in the same
			// place. When a file carries no location of its own — a screenshot, or
			// something that came through a chat app — the nearest photo in time is
			// the best answer there is, as long as it is close enough to still be
			// that outing rather than a different day out.
			const OUTING = 3 * 60 * 60 * 1000;
			// Some timestamps carry an offset and some do not, because the upload
			// form's date field offers no timezone. Everything in this album
			// happened on one clock, so a bare timestamp is read as that clock
			// rather than as UTC, which would put it eight hours out and hide the
			// neighbour it belongs to.
			const momentOf = (takenAt: string): number | null => {
				const text = /[Zz]|[+-]\d{2}:\d{2}$/.test(takenAt)
					? takenAt
					: takenAt.length === 10
						? `${takenAt}T00:00:00+08:00`
						: `${takenAt}+08:00`;
				const at = new Date(text).getTime();
				return Number.isNaN(at) ? null : at;
			};
			const placed: Array<{ lat: number; lng: number; at: number }> = [];
			for (const photo of photos) {
				if (photo.lat === null || photo.lng === null || !photo.takenAt)
					continue;
				const at = momentOf(photo.takenAt);
				if (at === null) continue;
				placed.push({ lat: photo.lat, lng: photo.lng, at });
			}
			const neighbourFor = (takenAt: string | null) => {
				if (!takenAt) return null;
				const at = momentOf(takenAt);
				if (at === null) return null;
				let best: { lat: number; lng: number } | null = null;
				let closest = OUTING;
				for (const other of placed) {
					const gap = Math.abs(other.at - at);
					if (gap < closest) {
						closest = gap;
						best = other;
					}
				}
				return best;
			};

			const results: Array<{
				id: string;
				place: string | null;
				lat: number | null;
				lng: number | null;
				found: string[];
			}> = [];

			for (const photo of pending.slice(0, limit)) {
				const meta = await readMeta(photo.id);
				let lat = photo.lat;
				let lng = photo.lng;
				let place = photo.place;
				let takenAt = photo.takenAt;
				const found: string[] = [];

				if (lat === null || lng === null || place === null) {
					// The file is the only thing that cannot be wrong, so look at
					// it before believing there is nothing left to find.
					const head = await readOriginalHead(photo.id);
					const exif = head ? await readExif(head) : null;
					if (exif) {
						if (
							(lat === null || lng === null) &&
							exif.lat !== null &&
							exif.lng !== null
						) {
							lat = exif.lat;
							lng = exif.lng;
							found.push("gps");
						}
						if (takenAt === null && exif.takenAt) {
							takenAt = exif.takenAt;
							found.push("date");
						}
					}
				}

				if (lat === null && lng === null) {
					const neighbour = neighbourFor(takenAt);
					if (neighbour) {
						lat = neighbour.lat;
						lng = neighbour.lng;
						found.push("nearby");
					}
				}

				if (place === null && lat !== null && lng !== null) {
					place = await reverseGeocode(lat, lng);
					if (place) found.push("place");
				}
				if (lat === null && place !== null) {
					const point = await forwardGeocode(place);
					if (point) {
						lat = point.lat;
						lng = point.lng;
						found.push("pin");
					}
				}

				if (found.length > 0) {
					await writeMeta({
						id: photo.id,
						caption: meta?.caption ?? photo.caption,
						takenAt,
						lat,
						lng,
						place,
						width: meta?.width ?? photo.width,
						height: meta?.height ?? photo.height,
						bytes: meta?.bytes ?? photo.bytes,
						contentType:
							meta?.contentType ?? (photo.legacy ? "image/png" : "image/jpeg"),
						createdAt: meta?.createdAt ?? photo.createdAt,
						originalName: meta?.originalName ?? photo.originalName,
					});
				}
				results.push({ id: photo.id, place, lat, lng, found });
			}

			return json({
				pending: pending.length,
				processed: results.length,
				resolved: results.filter((result) => result.found.length > 0).length,
				remaining: Math.max(0, pending.length - results.length),
				results,
			});
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

			// Read the date and place straight out of the uploaded original. The
			// browser sends what it found too, but the file is the only thing we
			// can vouch for, so its coordinates win where the two disagree.
			const exif = await readExif(original);

			let lat = cleanCoord(exif.lat ?? meta.lat, 90);
			let lng = cleanCoord(exif.lng ?? meta.lng, 180);
			if (lat === undefined || lng === undefined)
				return fail("Those coordinates don't look right.");
			if ((lat === null) !== (lng === null)) {
				// Half a location is no location. Keep the photo, drop the pin.
				lat = null;
				lng = null;
			}

			// A typed place beats the one we would guess from the coordinates,
			// but it is also all we have when the file carried no GPS: geocode
			// it so the photo still lands somewhere on the map.
			let place = cleanText(meta.place, MAX_PLACE) || null;
			if (lat !== null && lng !== null) {
				if (!place) place = await reverseGeocode(lat, lng);
			} else if (place) {
				const found = await forwardGeocode(place);
				if (found) {
					lat = found.lat;
					lng = found.lng;
				}
			}

			// The upload form is prefilled from EXIF and can be edited, so what
			// the browser sent wins; EXIF is the fallback when it sent nothing.
			let takenAt = cleanDate(meta.takenAt);
			if (
				takenAt === null &&
				typeof meta.takenAt === "string" &&
				meta.takenAt.trim() !== ""
			)
				return fail("That date doesn't look right.");
			if (takenAt === null) takenAt = cleanDate(exif.takenAt);

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
			return json({ photo }, 201);
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
			if ("place" in data && !coordinatesChanged && meta.place) {
				// Renaming a photo that never had a pin is the one case where a
				// place name is the only location we have. Give it coordinates.
				if (meta.lat === null || meta.lng === null) {
					const found = await forwardGeocode(meta.place);
					if (found) {
						meta.lat = found.lat;
						meta.lng = found.lng;
					}
				}
			}

			await writeMeta(meta);
			const photo = (await getPhoto(id)) ?? existing;
			return json({ photo });
		}

		if (path.startsWith("photos/") && method === "DELETE") {
			if (!authenticated) return fail("Log in first.", 401);
			const id = decodeSegment(path.slice("photos/".length));
			if (id === null || !isPhotoId(id)) return fail("Unknown photo.", 404);
			if (legacyName(id))
				return fail("The first-roll photos are kept safe.", 409);
			const removed = await deletePhoto(id);
			if (!removed) return fail("Unknown photo.", 404);
			// A pinned cover holds a copy of the photo, so it would otherwise
			// outlive the photo it was copied from.
			if ((await pinnedCoverSource()) === id) await clearCover();
			return json({ ok: true });
		}

		return fail("Not found.", 404);
	} catch (error) {
		console.error("Addy API error", error);
		return fail("Something went wrong on our end.", 500);
	}
}
