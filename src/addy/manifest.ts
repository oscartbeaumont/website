import { artworkUrl } from "./devices";
import { NO_INDEX } from "./robots";

/**
 * The album's web app manifest.
 *
 * It is built per request rather than shipped as a file because `start_url` and
 * `scope` are the one part that cannot be shared: the standalone Addy domain
 * serves the album from its root, while `otbeaumont.me` serves it from `/addy`.
 * A home screen app installed from either has to reopen where it was installed
 * from.
 *
 * iOS reads little of this — `display`, the name and the icons are the parts
 * that matter — and takes the status bar and theme colour from the CSS instead.
 * The rest is here for everything else that reads a manifest.
 */
export function addyManifest(standaloneSite: boolean) {
	const base = standaloneSite ? "/" : "/addy";
	return {
		id: base,
		name: "Addy & Oscar",
		short_name: "A&O",
		description:
			"A small photo album for Addy and Oscar. The good bits, in the order they happened.",
		start_url: base,
		scope: base,
		display: "standalone",
		orientation: "any",
		background_color: "#f7f1e5",
		theme_color: "#f7f1e5",
		icons: [
			{ src: artworkUrl("/icon-192.png"), sizes: "192x192", type: "image/png" },
			{ src: artworkUrl("/icon-512.png"), sizes: "512x512", type: "image/png" },
			{
				src: artworkUrl("/icon-maskable-512.png"),
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}

export function manifestResponse(standaloneSite: boolean): Response {
	return new Response(JSON.stringify(addyManifest(standaloneSite)), {
		headers: {
			"Content-Type": "application/manifest+json; charset=utf-8",
			// The body depends on the host, and the cache key does not include
			// it, so the CDN has to be told.
			"Cache-Control": "public, max-age=3600",
			Vary: "Host",
			"X-Robots-Tag": NO_INDEX,
		},
	});
}
