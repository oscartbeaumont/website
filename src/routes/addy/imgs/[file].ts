import { env } from "cloudflare:workers";

const PREFIX = "addy/";

export type AddyImage = {
	/** Content hash (the R2 object's ETag) used in the public image URL. */
	hash: string;
	/** The object key relative to the `addy/` prefix. */
	name: string;
};

/** Lists the Addy images together with their content hashes. */
export async function listAddyImages(): Promise<AddyImage[]> {
	const listed = await env.DATA.list({ prefix: PREFIX });
	return listed.objects
		// Ignore folder placeholders such as the `addy/` object itself.
		.filter(
			(object) => object.key.length > PREFIX.length && !object.key.endsWith("/"),
		)
		.map((object) => ({
			hash: object.etag,
			name: object.key.slice(PREFIX.length),
		}));
}

export async function getAddyImage(hash: string) {
	if (!hash) return new Response("Image hash is required", { status: 400 });

	try {
		// The URL normally carries the content hash, so resolve it to the object
		// key. Fall back to the plain filename so already-cached pages that use
		// the old URLs keep working.
		const images = await listAddyImages();
		const image =
			images.find((entry) => entry.hash === hash) ??
			images.find((entry) => entry.name === hash);
		if (!image) return new Response("File not found", { status: 404 });

		const object = await env.DATA.get(PREFIX + image.name);
		if (!object) return new Response("File not found", { status: 404 });

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		if (image.hash === hash) {
			// Content-addressed, so the response can never go stale.
			headers.set("Cache-Control", "public, max-age=31536000, immutable");
			headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=31536000");
		} else {
			// A legacy filename URL is not content-addressed, so don't cache it.
			headers.set("Cache-Control", "no-cache");
		}
		headers.set("ETag", object.httpEtag);
		headers.set("X-Robots-Tag", "noindex, nofollow");

		return new Response(object.body, { headers });
	} catch (error) {
		console.error("Error fetching file from R2:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
