// @refresh reload

import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";
import { ColorModeScript } from "@kobalte/core";
import { HttpHeader } from "@solidjs/start";
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(
	(event) => (
		<StartServer
			document={({ assets, children, scripts }) => (
				<html lang="en" class="dark:bg-gray-900 scheme-light dark:scheme-dark">
					<head>
						<meta charset="utf-8" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
						{/* TODO: This is a little cursed */}
						{event.nativeEvent.url.pathname !== "/invoicer" && (
							<ColorModeScript storageType="localStorage" nonce={event.nonce} />
						)}

						<HttpHeader name="Cache-Control" value="no-store, no-transform" />

						{assets}
					</head>
					<body>
						<div id="app">{children}</div>

						{scripts}
					</body>
				</html>
			)}
		/>
	),
	(event) => {
		// WWW-Authenticate middleware for /sudo route
		const url = new URL(event.request.url);
		if (url.pathname === "/sudo" || url.pathname.startsWith("/sudo/")) {
			const authHeader = event.request.headers.get("Authorization");

			if (!authHeader || !authHeader.startsWith("Basic ")) {
				// Send 401 Unauthorized with WWW-Authenticate header
				const response = new Response("Unauthorized", {
					status: 401,
					headers: {
						"WWW-Authenticate": 'Basic realm="sudo", charset="UTF-8"',
						"Content-Type": "text/plain",
					},
				});
				throw response;
			}
		}

		// Nonce CSP
		const nonce = randomBytes(16).toString("base64");
		event.response.headers.set(
			"Content-Security-Policy",
			[
				`default-src 'none'`,
				// TODO: `strict-dynamic` is required for `import` to work (required for SPA routing)
				`script-src 'strict-dynamic' 'nonce-${nonce}'`,
				`img-src 'self'`,
				`style-src 'self' 'unsafe-inline'`,
				`font-src 'self'`,
				`connect-src 'self'`,
			].join(";"),
		);

		// Headers
		for (const [header, value] of Object.entries(_headers["/*"]))
			event.response.headers.set(header, value);

		return { nonce };
	},
);
