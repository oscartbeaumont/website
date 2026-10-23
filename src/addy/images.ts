import { downloadNameFor } from "./album";
import { isAuthenticated } from "./auth";
import { NO_INDEX } from "./robots";
import { getCover, getLegacyImage, getPhoto, getPhotoVariant } from "./store";

function decodeSegment(value: string): string | null {
	try {
		return decodeURIComponent(value);
	} catch {
		// A stray `%` in the URL is a bad request, not a Worker error.
		return null;
	}
}

function notFound(): Response {
	return new Response("Not found", {
		status: 404,
		headers: { "X-Robots-Tag": NO_INDEX },
	});
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
		// Every photo in the album is private.
		if (!(await isAuthenticated(request)))
			return new Response("Sign in to see this photo.", {
				status: 401,
				headers: {
					"Cache-Control": "no-store",
					"X-Robots-Tag": NO_INDEX,
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
		// `private`: these bytes are behind the session cookie, and a shared
		// cache is keyed without `Cookie`, so a stored copy would be served to
		// the next visitor. The browser may still keep it.
		headers.set(
			"Cache-Control",
			resolved.immutable
				? "private, max-age=31536000, immutable"
				: "private, max-age=300",
		);
		headers.set("ETag", resolved.object.httpEtag);
		headers.set("Content-Length", String(resolved.object.size));
		headers.set("X-Robots-Tag", NO_INDEX);
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

/**
 * `/addy/cover` — the one picture the logged-out landing page is allowed to
 * show. It is deliberately the only image endpoint with no password, and the
 * only one that answers a logged-out visitor.
 */
export async function handleAddyCover(request: Request): Promise<Response> {
	if (request.method !== "GET" && request.method !== "HEAD")
		return new Response("Method not allowed", {
			status: 405,
			headers: { Allow: "GET, HEAD" },
		});

	try {
		const cover = await getCover();
		if (!cover)
			return new Response("No cover yet", {
				status: 404,
				headers: {
					"Cache-Control": "no-store",
					"X-Robots-Tag": NO_INDEX,
				},
			});

		const headers = new Headers();
		headers.set("Content-Type", cover.contentType);
		// Always revalidate. Pinning a different photo has to show up on the
		// next load, and a 304 is cheap next to serving the wrong picture.
		headers.set("Cache-Control", "no-cache");
		headers.set("ETag", cover.object.httpEtag);
		headers.set("X-Robots-Tag", NO_INDEX);
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("Accept-Ranges", "none");

		if (
			etagMatches(request.headers.get("if-none-match"), cover.object.httpEtag)
		)
			return new Response(null, { status: 304, headers });

		headers.set("Content-Length", String(cover.object.size));
		const body = request.method === "HEAD" ? null : cover.object.body;
		return new Response(body, { headers });
	} catch (error) {
		console.error("Error serving the Addy cover:", error);
		return new Response("Internal server error", { status: 500 });
	}
}

/** Whether an `If-None-Match` header already has this ETag. */
function etagMatches(header: string | null, etag: string): boolean {
	if (!header) return false;
	if (header.trim() === "*") return true;
	return header.split(",").some((candidate) => {
		const value = candidate.trim().replace(/^W\//, "");
		return value === etag || value === etag.replace(/^W\//, "");
	});
}
