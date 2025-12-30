// @refresh reload

import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";
import { HttpHeader } from "@solidjs/start";
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(
	() => (
		<StartServer
			document={({ assets, children, scripts }) => (
				<html lang="en">
					<head>
						<meta charset="utf-8" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
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
		// Nonce CSP
		const nonce = randomBytes(16).toString("base64");
		event.response.headers.set(
			"Content-Security-Policy",
			[
				`default-src 'none'`,
				`script-src 'nonce-${nonce}'`,
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
