// import type { HeadersConfig } from "./src/vite-plugin-headers";

declare module 'virtual:_headers' {
  interface HeadersConfig {
    [path: string]: {
      [header: string]: string;
    };
  }

  const headers: HeadersConfig;
  export default headers;
}
