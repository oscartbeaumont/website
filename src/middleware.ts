import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";
import { getRequestEvent } from "@solidjs/web";
import { handleAddyApi } from "./addy/api";
import { handleAddyImage } from "./addy/images";
import { listLegacyForApi } from "./addy/store";
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
	if (request.method === "GET" && url.pathname === "/addy/imgs.json")
		return Response.json(await listLegacyForApi(), {
			headers: {
				"Cache-Control": "no-store",
				"X-Robots-Tag": "noindex, nofollow",
			},
		});
	if (
		request.method === "GET" &&
		(url.pathname.startsWith("/addy/imgs/") ||
			url.pathname.startsWith("/addy/photos/"))
	)
		return handleAddyImage(request, url);

	const nonce = randomBytes(16).toString("base64");
	getRequestEvent()!.locals.nonce = nonce;
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
				? `img-src 'self' blob: data:`
				: url.pathname === "/invoicer"
					? `img-src 'self' data:`
					: `img-src 'self'`,
			`style-src 'self' 'unsafe-inline'`,
			`font-src 'self'`,
			`connect-src 'self'`,
		].join(";"),
	);
	// `/` is host-specific: the Addy domain serves the Addy page while
	// `otbeaumont.me` serves the homepage. Workers Caching keys by path, not
	// host, so `Vary: Host` partitions the cache per domain.
	const cacheablePage =
		request.method === "GET" &&
		response.status === 200 &&
		["/", "/brand", "/addy", "/invoicer"].includes(url.pathname);
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
	const pageExists = ["/", "/brand", "/addy", "/invoicer"].includes(
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
