import { env } from "cloudflare:workers";
import type { APIEvent } from "@solidjs/start/server";

export async function GET({ params }: APIEvent) {
	const fileName = params.file;
	if (!fileName) return new Response("File name is required", { status: 400 });

	try {
		const object = await env.DATA.get(`addy/${fileName}`);
		if (!object) return new Response("File not found", { status: 404 });

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("Cache-Control", "public, max-age=31536000");
		headers.set("X-Robots-Tag", "noindex, nofollow");

		return new Response(object.body, { headers });
	} catch (error) {
		console.error("Error fetching file from R2:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
