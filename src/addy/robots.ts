/**
 * The album is private, and nothing about it should ever turn up in a search
 * result. Two mechanisms say so, because they cover different things: the
 * `<meta name="robots">` tag covers the HTML a crawler has already decided to
 * parse, and this header covers everything else it fetches — images, JSON,
 * redirects and errors — which is the only way to keep an image out of image
 * search.
 */
export const NO_INDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex";

/**
 * The standalone album domain serves the album and nothing else, so no part of
 * it has any business being crawled. This is served instead of Cloudflare's
 * managed `robots.txt`, which allows the whole domain.
 *
 * `otbeaumont.me` keeps the managed file: only its `/addy` path is private
 * there, and a hand-written replacement would lose the crawler policy that
 * comes with the managed one.
 */
export const ALBUM_ROBOTS = `# This domain is one private photo album. There is nothing
# here to index, and everything behind the sign-in needs a password.
User-agent: *
Disallow: /
`;
