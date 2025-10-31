import { createMiddleware } from "@solidjs/start/middleware";
import { randomBytes } from "node:crypto";
import _headers from "virtual:_headers";

export default createMiddleware({
  onRequest: (event) => {
    const nonce = randomBytes(16).toString("base64");
    event.locals.nonce = nonce;
    event.response.headers.set(
      "Content-Security-Policy",
      [
        `default-src 'none'`,
        `script-src 'nonce-${nonce}'`,
        `img-src 'self'`,
        `style-src 'self' 'unsafe-inline'`,
        `font-src 'self'`,
        `connect-src 'self'`
      ].join(";")
    );
  },
  onBeforeResponse: (event) => {
    for (const [header, value] of Object.entries(_headers["/*"]))
      event.response.headers.set(header, value);
  },
});
