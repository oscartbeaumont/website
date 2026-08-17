// This endpoint proxies requests to PostHog's API.
// It has a random name to make blocking less likely.

export async function handlePostHog(request: Request, rest: string) {
	const requestUrl = new URL(request.url);
	// Determine target hostname based on static or dynamic ingestion
	const hostname = requestUrl.pathname.startsWith("/ph_4DkU/static/")
		? "us-assets.i.posthog.com" // change us to eu for EU Cloud
		: "us.i.posthog.com"; // change us to eu for EU Cloud

	// Build external URL
	const url = new URL(requestUrl);
	url.protocol = "https:";
	url.hostname = hostname;
	url.port = "443";
	url.pathname = `/${rest}`;

	const headers = new Headers(request.headers);
	headers.set("Accept-Encoding", "");
	headers.set("host", hostname);

	// Proxy the request to the external host
	return await fetch(url.toString(), {
		method: request.method,
		headers,
		body: request.body,
		// @ts-expect-error: not valid in types but this is a thing
		duplex: "half",
	});
}
