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
