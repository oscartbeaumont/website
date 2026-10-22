import { env } from "cloudflare:workers";

/**
 * Turn rounded coordinates into a friendly place name. Only two decimal
 * places (~1 km) ever leave the Worker, and results are cached in KV.
 */
export async function reverseGeocode(
	lat: number,
	lng: number,
): Promise<string | null> {
	const roundedLat = Number(lat.toFixed(2));
	const roundedLng = Number(lng.toFixed(2));
	const key = `addy:geo:${roundedLat},${roundedLng}`;

	try {
		const cached = await env.KV.get(key);
		if (cached) return cached;
	} catch {
		// KV is best-effort; a miss just means one more lookup.
	}

	try {
		const url = new URL("https://nominatim.openstreetmap.org/reverse");
		url.searchParams.set("format", "jsonv2");
		url.searchParams.set("lat", String(roundedLat));
		url.searchParams.set("lon", String(roundedLng));
		url.searchParams.set("zoom", "12");
		url.searchParams.set("addressdetails", "1");
		url.searchParams.set("accept-language", "en");

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"hireareallycutemodel.com/1.0 (a small personal photo album)",
			},
			signal: AbortSignal.timeout(4_000),
		});
		if (!response.ok) return null;
		const data = (await response.json()) as {
			address?: Record<string, string>;
		};
		const address = data.address ?? {};
		const name =
			address.city ||
			address.town ||
			address.village ||
			address.suburb ||
			address.hamlet ||
			address.county ||
			address.state_district ||
			address.state;
		if (!name) return null;

		try {
			await env.KV.put(key, name, { expirationTtl: 60 * 60 * 24 * 90 });
		} catch {
			// Ignore cache writes.
		}
		return name;
	} catch {
		return null;
	}
}

export function coordinateLabel(lat: number, lng: number): string {
	const latitude = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
	const longitude = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? "E" : "W"}`;
	return `${latitude}, ${longitude}`;
}

/**
 * Turn a place name someone typed into coordinates, so a photo without GPS
 * still gets a pin. Nominatim's first hit for an ambiguous string is often a
 * shop or a street, and a wrong pin is worse than no pin, so anything smaller
 * than a settlement is thrown away.
 */
const SETTLEMENT_TYPES = new Set([
	"continent",
	"country",
	"state",
	"region",
	"province",
	"county",
	"municipality",
	"city",
	"town",
	"village",
	"hamlet",
	"borough",
	"city_district",
	"district",
	"suburb",
	"quarter",
	"neighbourhood",
	"island",
	"archipelago",
	"administrative",
	"boundary",
	"place",
]);

export async function forwardGeocode(place: string): Promise<{
	lat: number;
	lng: number;
} | null> {
	const query = place.trim().slice(0, 120);
	if (query.length < 3) return null;
	const key = `addy:geocode:${query.toLowerCase()}`;

	try {
		const cached = await env.KV.get(key);
		if (cached) {
			const [lat, lng] = cached.split(",").map(Number);
			return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
		}
	} catch {
		// KV is best-effort; a miss just means one more lookup.
	}

	try {
		const url = new URL("https://nominatim.openstreetmap.org/search");
		url.searchParams.set("format", "jsonv2");
		url.searchParams.set("q", query);
		url.searchParams.set("limit", "5");
		url.searchParams.set("accept-language", "en");

		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"hireareallycutemodel.com/1.0 (a small personal photo album)",
			},
			signal: AbortSignal.timeout(4_000),
		});
		if (!response.ok) return null;
		const results = (await response.json()) as Array<{
			lat?: string;
			lon?: string;
			addresstype?: string;
		}>;
		const first = results?.find(
			(result) =>
				typeof result.addresstype === "string" &&
				SETTLEMENT_TYPES.has(result.addresstype),
		);
		if (!first?.lat || !first?.lon) return null;
		const lat = Number(first.lat);
		const lng = Number(first.lon);
		if (
			!Number.isFinite(lat) ||
			!Number.isFinite(lng) ||
			Math.abs(lat) > 90 ||
			Math.abs(lng) > 180
		)
			return null;

		try {
			await env.KV.put(key, `${lat},${lng}`, {
				expirationTtl: 60 * 60 * 24 * 90,
			});
		} catch {
			// Ignore cache writes.
		}
		return { lat, lng };
	} catch {
		return null;
	}
}
