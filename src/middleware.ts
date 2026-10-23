import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";
import { getRequestEvent } from "@solidjs/web";
import { handleAddyApi } from "./addy/api";
import { isAuthenticated } from "./addy/auth";
import { handleAddyCover, handleAddyImage } from "./addy/images";
import { manifestResponse } from "./addy/manifest";
import { listLegacyForApi } from "./addy/store";
import { isAddySite } from "./host";
import { handlePostHog } from "./routes/ph_4DkU/[...rest]";

export default async function middleware(
	request: Request,
	next: () => Response | Promise<Response>,
) {
	const url = new URL(request.url);
	if (url.pathname.startsWith("/ph_4DkU/"))
		return preventCaching(
			await handlePostHog(request, url.pathname.slice("/ph_4DkU/".length)),
		);
	if (url.pathname.startsWith("/addy/api/")) return handleAddyApi(request, url);
	// The album's Home Screen metadata, built per host so an installed app
	// reopens where it was installed from.
	if (
		url.pathname === "/manifest.webmanifest" &&
		(request.method === "GET" || request.method === "HEAD")
	)
		return manifestResponse(isAddySite());
	// The cover is the one album image a logged-out visitor may see, so it is
	// served before any of the private image routes below.
	if (
		(request.method === "GET" || request.method === "HEAD") &&
		url.pathname === "/addy/cover"
	)
		return handleAddyCover(request);
	if (request.method === "GET" && url.pathname === "/addy/imgs.json") {
		if (!(await isAuthenticated(request)))
			return new Response("Sign in first.", { status: 401 });
		return Response.json(await listLegacyForApi(), {
			headers: {
				"Cache-Control": "no-store",
				"X-Robots-Tag": "noindex, nofollow",
			},
		});
	}
	if (
		(request.method === "GET" || request.method === "HEAD") &&
		(url.pathname.startsWith("/addy/imgs/") ||
			url.pathname.startsWith("/addy/photos/"))
	)
		return handleAddyImage(request, url);

	const nonce = randomBytes(16).toString("base64");
	getRequestEvent()!.locals.nonce = nonce;
	// The album renders its signed-in or signed-out page on the server, so a
	// visitor with a session cookie never sees the lock screen flash past. The
	// standalone Addy site serves it from `/` as well as `/addy`.
	const albumPath =
		url.pathname === "/addy" || (url.pathname === "/" && isAddySite());
	if (albumPath)
		getRequestEvent()!.locals.addyAuthenticated =
			await isAuthenticated(request);
	const response = await next();
	const addyPage = ["/addy", "/"].includes(url.pathname);
	response.headers.set(
		"Content-Security-Policy",
		[
			`default-src 'none'`,
			import.meta.env.DEV
				? `script-src 'self' 'unsafe-inline'`
				: `script-src 'strict-dynamic' 'nonce-${nonce}'`,
			addyPage
				? `img-src 'self' blob: data: https://tiles.openfreemap.org`
				: url.pathname === "/invoicer"
					? `img-src 'self' data:`
					: `img-src 'self'`,
			`style-src 'self' 'unsafe-inline'`,
			`font-src 'self'`,
			addyPage
				? `connect-src 'self' https://tiles.openfreemap.org; worker-src 'self' blob:; child-src blob:`
				: `connect-src 'self'`,
			// `manifest-src` falls back to `default-src`, which is `'none'`, so the
			// album's Home Screen metadata has to be allowed by name.
			addyPage ? `manifest-src 'self'` : "",
		]
			.filter(Boolean)
			.join(";"),
	);
	// `/` is host-specific: the Addy domain serves the Addy page while
	// `otbeaumont.me` serves the homepage. Workers Caching keys by path, not
	// host, so `Vary: Host` partitions the cache per domain.
	//
	// The album is deliberately left out. Its HTML depends on the session
	// cookie, and the Workers cache is consulted before this code runs with a
	// key that does not include `Cookie`, so a stored copy would be handed to
	// the next visitor — signed in or not. It also counts the days since 20
	// June 2025, which a year-long stored copy would freeze.
	const cacheablePage =
		request.method === "GET" &&
		response.status === 200 &&
		!albumPath &&
		["/", "/brand", "/addy", "/invoicer", "/resume"].includes(url.pathname);
	response.headers.set(
		"Cache-Control",
		cacheablePage ? "no-cache, no-transform" : "no-store, no-transform",
	);
	if (cacheablePage) {
		response.headers.set(
			"Cloudflare-CDN-Cache-Control",
			"public, max-age=31536000",
		);
		response.headers.append("Vary", "Host");
	}
	for (const [header, value] of Object.entries(_headers["/*"]))
		response.headers.set(header, value);
	const pageExists = ["/", "/brand", "/addy", "/invoicer", "/resume"].includes(
		url.pathname,
	);
	if (!pageExists && response.status === 200)
		return new Response(response.body, {
			status: 404,
			statusText: "Not Found",
			headers: response.headers,
		});
	return response;
}

function preventCaching(response: Response) {
	// Some upstream responses (for example `fetch` results from PostHog) have
	// immutable headers, so copy them into a fresh, mutable Response.
	const headers = new Headers(response.headers);
	headers.set("Cache-Control", "no-store");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
