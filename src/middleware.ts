import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";
import { getRequestEvent } from "@solidjs/web";
import { getAddyImage } from "./routes/addy/imgs/[file]";
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
	if (request.method === "GET" && url.pathname.startsWith("/addy/imgs/"))
		return preventCaching(
			await getAddyImage(
				decodeURIComponent(url.pathname.slice("/addy/imgs/".length)),
			),
		);

	const nonce = randomBytes(16).toString("base64");
	getRequestEvent()!.locals.nonce = nonce;
	const response = await next();
	response.headers.set(
		"Content-Security-Policy",
		[
			`default-src 'none'`,
			import.meta.env.DEV
				? `script-src 'self' 'unsafe-inline'`
				: `script-src 'strict-dynamic' 'nonce-${nonce}'`,
			url.pathname === "/invoicer" ? `img-src 'self' data:` : `img-src 'self'`,
			`style-src 'self' 'unsafe-inline'`,
			`font-src 'self'`,
			`connect-src 'self'`,
		].join(";"),
	);
	const cacheablePage =
		request.method === "GET" &&
		response.status === 200 &&
		["/", "/brand", "/addy", "/invoicer"].includes(url.pathname);
	response.headers.set(
		"Cache-Control",
		cacheablePage ? "no-cache, no-transform" : "no-store, no-transform",
	);
	if (cacheablePage)
		response.headers.set(
			"Cloudflare-CDN-Cache-Control",
			"public, max-age=31536000",
		);
	for (const [header, value] of Object.entries(_headers["/*"]))
		response.headers.set(header, value);
	const pageExists = ["/", "/brand", "/addy", "/invoicer"].includes(url.pathname);
	if (!pageExists && response.status === 200)
		return new Response(response.body, {
			status: 404,
			statusText: "Not Found",
			headers: response.headers,
		});
	return response;
}

function preventCaching(response: Response) {
	response.headers.set("Cache-Control", "no-store");
	return response;
}
