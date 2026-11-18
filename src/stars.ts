import { env } from "cloudflare:workers";
import { starRepos } from "./resume-data";

/** Star counts keyed by `owner/name`. */
export type StarCounts = Record<string, number>;

type CachedStars = { fetchedAt: number; counts: StarCounts };

const KV_KEY = "github:stars:v1";
/** How long a cached answer is trusted before GitHub is asked again. */
const FRESH_FOR = 6 * 60 * 60 * 1000;

/** One refresh at a time per isolate, so a burst of requests is one lookup. */
let inFlight: Promise<StarCounts> | undefined;

/**
 * GitHub's unauthenticated API allows 60 requests an hour per IP and a cold
 * cache costs one request per repository. Everyone shares one KV entry, so that
 * budget is only spent when the entry goes stale, not on every visitor.
 */
export function getStarCounts(): Promise<StarCounts> {
	inFlight ??= readOrRefresh().finally(() => {
		inFlight = undefined;
	});
	return inFlight;
}

async function readOrRefresh(): Promise<StarCounts> {
	const cached = await readCache();
	if (cached && Date.now() - cached.fetchedAt < FRESH_FOR) return cached.counts;

	// A partial failure keeps the previous value for the repositories that did
	// not answer, so one flaky request does not wipe the page.
	const counts = await fetchStarCounts(cached?.counts ?? {});
	if (!counts) return cached?.counts ?? {};

	try {
		await env.KV.put(
			KV_KEY,
			JSON.stringify({ fetchedAt: Date.now(), counts }),
			{
				// Kept longer than it is fresh so a failed refresh can still fall back
				// to the last good answer.
				expirationTtl: 60 * 60 * 24 * 30,
			},
		);
	} catch {
		// KV is best-effort; a miss just means one more lookup next time.
	}

	return counts;
}

async function readCache(): Promise<CachedStars | null> {
	try {
		const raw = await env.KV.get(KV_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as CachedStars;
		if (
			typeof parsed?.fetchedAt !== "number" ||
			typeof parsed?.counts !== "object" ||
			parsed.counts === null
		)
			return null;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Returns the merged counts only when at least one repository answered. A repo
 * that has been removed from the project list is dropped rather than kept
 * around forever.
 */
async function fetchStarCounts(
	previous: StarCounts,
): Promise<StarCounts | undefined> {
	const counts: StarCounts = {};
	for (const repo of starRepos)
		if (previous[repo] !== undefined) counts[repo] = previous[repo];

	let answered = 0;
	await Promise.all(
		starRepos.map(async (repo) => {
			try {
				const response = await fetch(`https://api.github.com/repos/${repo}`, {
					headers: {
						Accept: "application/vnd.github+json",
						"User-Agent": "otbeaumont-me",
						"X-GitHub-Api-Version": "2022-11-28",
					},
					// A cold lookup runs during SSR, so do not let one slow repo
					// hold the page open.
					signal: AbortSignal.timeout(5000),
				});
				if (!response.ok) return;

				const body = (await response.json()) as {
					stargazers_count?: unknown;
				};
				if (typeof body.stargazers_count !== "number") return;

				counts[repo] = body.stargazers_count;
				answered++;
			} catch {
				// Keep the previous value for this repository.
			}
		}),
	);

	return answered > 0 ? counts : undefined;
}
