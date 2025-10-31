import { createMiddleware } from "@solidjs/start/middleware";
import _headers from "virtual:_headers";

export default createMiddleware({
  onBeforeResponse: (event) => {
    for (const [header, value] of Object.entries(_headers["/*"]))
      event.response.headers.set(header, value);
  },
});
