/// <reference types="@solidjs/start/env" />

import type { HeadersConfig } from "./vite-plugin-headers";

declare module 'virtual:_headers' {
  const headers: HeadersConfig;
  export default headers;
}
