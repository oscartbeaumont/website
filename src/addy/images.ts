import {
	downloadName,
	getLegacyImage,
	getPhoto,
	getPhotoVariant,
} from "./store";

/**
 * `/addy/photos/<id>/<thumb|display|original>` and the legacy
 * `/addy/imgs/<hash>` endpoint.
 */
export async function handleAddyImage(
	_request: Request,
	url: URL,
): Promise<Response> {
	if (url.pathname.startsWith("/addy/imgs/"))
		return getLegacyImage(
			decodeURIComponent(url.pathname.slice("/addy/imgs/".length)),
			url.searchParams.has("download"),
		);

	const rest = url.pathname.slice("/addy/photos/".length);
	const parts = rest.split("/");
	if (parts.length !== 2) return new Response("Not found", { status: 404 });
	const id = decodeURIComponent(parts[0]);
	const variant = parts[1];

	const resolved = await getPhotoVariant(id, variant);
	if (!resolved) return new Response("Not found", { status: 404 });

	const headers = new Headers();
	headers.set("Content-Type", resolved.contentType);
	headers.set(
		"Cache-Control",
		resolved.immutable
			? "public, max-age=31536000, immutable"
			: "public, max-age=300",
	);
	if (resolved.immutable)
		headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=31536000");
	headers.set("ETag", resolved.object.httpEtag);
	headers.set("Content-Length", String(resolved.object.size));
	headers.set("X-Robots-Tag", "noindex, nofollow");
	headers.set("Accept-Ranges", "none");

	if (url.searchParams.has("download")) {
		const photo = await getPhoto(id);
		const name = photo ? downloadName(photo) : `${id}.jpg`;
		headers.set(
			"Content-Disposition",
			`attachment; filename="${name.replaceAll('"', "")}"`,
		);
	}

	return new Response(resolved.object.body, { headers });
}
