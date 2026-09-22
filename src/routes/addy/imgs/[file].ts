import { env } from "cloudflare:workers";
export async function getAddyImage(fileName: string) {
	if (!fileName) return new Response("File name is required", { status: 400 });

	try {
		const object = await env.DATA.get(`addy/${fileName}`);
		if (!object) return new Response("File not found", { status: 404 });

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		// These objects are immutable and keyed by filename, so let the edge CDN
		// hold onto them instead of re-reading R2 on every request.
		headers.set("Cache-Control", "public, max-age=31536000, immutable");
		headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=31536000");
		headers.set("ETag", object.httpEtag);
		headers.set("X-Robots-Tag", "noindex, nofollow");

		return new Response(object.body, { headers });
	} catch (error) {
		console.error("Error fetching file from R2:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
