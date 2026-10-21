import { downloadNameFor } from "./album";
import { isAuthenticated, uploadsConfigured } from "./auth";
import { getLegacyImage, getPhoto, getPhotoVariant } from "./store";

function decodeSegment(value: string): string | null {
	try {
		return decodeURIComponent(value);
	} catch {
		// A stray `%` in the URL is a bad request, not a Worker error.
		return null;
	}
}

function notFound(): Response {
	return new Response("Not found", { status: 404 });
}

/** Drop the body of a GET response for a HEAD request, keeping the headers. */
function forMethod(request: Request, response: Response): Response {
	if (request.method !== "HEAD") return response;
	return new Response(null, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
}

/**
 * `/addy/photos/<id>/<thumb|display|original>` and the legacy
 * `/addy/imgs/<hash>` endpoint.
 */
export async function handleAddyImage(
	request: Request,
	url: URL,
): Promise<Response> {
	try {
		// Every photo in the album is private. The one public picture is the
		// cover, which is a static asset served from the built site.
		if (uploadsConfigured() && !(await isAuthenticated(request)))
			return new Response("Sign in to see this photo.", {
				status: 401,
				headers: {
					"Cache-Control": "no-store",
					"X-Robots-Tag": "noindex, nofollow",
				},
			});

		if (url.pathname.startsWith("/addy/imgs/")) {
			const hash = decodeSegment(url.pathname.slice("/addy/imgs/".length));
			if (hash === null) return notFound();
			return forMethod(
				request,
				await getLegacyImage(hash, url.searchParams.has("download")),
			);
		}

		const rest = url.pathname.slice("/addy/photos/".length);
		const parts = rest.split("/");
		if (parts.length !== 2) return notFound();
		const id = decodeSegment(parts[0]);
		const variant = parts[1];
		if (id === null) return notFound();

		const resolved = await getPhotoVariant(id, variant);
		if (!resolved) return notFound();

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
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("Accept-Ranges", "none");

		if (url.searchParams.has("download")) {
			const photo = await getPhoto(id);
			const name = photo ? downloadNameFor(photo) : `${id}.jpg`;
			headers.set(
				"Content-Disposition",
				`attachment; filename="${name.replaceAll('"', "")}"`,
			);
		}

		const body = request.method === "HEAD" ? null : resolved.object.body;
		return new Response(body, { headers });
	} catch (error) {
		console.error("Error serving Addy photo:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
