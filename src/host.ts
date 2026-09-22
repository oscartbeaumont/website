import { getRequestEvent, isServer } from "@solidjs/web";

/**
 * The standalone Addy site. The `website` Worker owns this custom domain and
 * serves the Addy page from its root.
 */
export const ADDY_HOST = "hireareallycutemodel.com";

/** The request's hostname (without a port) on both the server and the client. */
export function requestHostname(): string {
	if (isServer) {
		const event = getRequestEvent();
		const host = event?.request.headers.get("host") ?? event?.request.url ?? "";
		return new URL(host.includes("://") ? host : `http://${host}`).hostname;
	}
	return window.location.hostname;
}

/** Whether the current request is for the standalone Addy site. */
export function isAddySite(): boolean {
	const hostname = requestHostname().toLowerCase();
	return hostname === ADDY_HOST || hostname === `www.${ADDY_HOST}`;
}
