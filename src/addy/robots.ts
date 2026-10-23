/**
 * The album is private, and nothing about it should ever turn up in a search
 * result. Two mechanisms say so, because they cover different things: the
 * `<meta name="robots">` tag covers the HTML a crawler has already decided to
 * parse, and this header covers everything else it fetches — the HTML response
 * itself, images, JSON, redirects and errors — which is the only way to keep an
 * image out of image search.
 *
 * A `robots.txt` would be the wrong tool here even if it were available:
 * blocking the crawl stops a crawler from ever *seeing* the `noindex`, and a
 * URL that is linked from somewhere else can still end up in results without
 * one. Cloudflare also prepends its managed `robots.txt` to whatever this
 * Worker serves on these zones, and its `Allow: /` wins the tie against a
 * `Disallow: /` — so the header and the meta tag are the whole mechanism.
 */
export const NO_INDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex";
