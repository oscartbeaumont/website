// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
), event => {
  const nonce = crypto.randomUUID();

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

  return { nonce };
});
