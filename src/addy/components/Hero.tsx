import { createMemo, createSignal, Show } from "solid-js";
import { START_LONG } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";
import { PhotoPlate } from "./PhotoPlate";

type HeroProps = {
	photos: AddyPhoto[];
	/** True until the album has been fetched, so the page can hold its shape. */
	loading: boolean;
	days: number;
	places: number | null;
	anniversary: string | null;
	onOpen: (photo: AddyPhoto) => void;
	onLogin: () => void;
	locked: boolean;
	coverUrl: string;
};

export function Hero(props: HeroProps) {
	return (
		<Show when={props.locked} fallback={<HomeHero {...props} />}>
			<LockedHero {...props} />
		</Show>
	);
}

/**
 * The signed-out page: one photo on the left, the days since it started on
 * the right, and a single way in. Everything else is behind the password.
 */
function LockedHero(props: HeroProps) {
	// An album with nothing in it yet has no cover to serve, and a broken image
	// on the one page strangers can see is worse than saying nothing.
	const [missing, setMissing] = createSignal(false);

	return (
		<section class="split split-locked" id="top">
			<div class="split-photo">
				<Show
					when={!missing()}
					fallback={
						<div class="split-empty">
							<Icon name="camera" size={28} />
							<p>Nothing to show yet.</p>
							<span>Check back soon.</span>
						</div>
					}
				>
					<img
						src={props.coverUrl}
						alt="Addy and Oscar"
						loading="eager"
						decoding="async"
						onError={() => setMissing(true)}
					/>
				</Show>
			</div>

			<div class="split-panel">
				<div class="split-top">
					<p class="split-mark">
						Addy <span>&amp;</span> Oscar
					</p>
				</div>

				<div class="split-body">
					<p class="split-number">{props.days.toLocaleString("en-AU")}</p>
					<p class="split-days">
						{props.days === 1 ? "day together" : "days together"}
					</p>
					<span class="split-rule" aria-hidden="true" />
					<p class="split-since">{START_LONG}</p>
					<button
						class="button solid split-signin"
						type="button"
						onClick={props.onLogin}
					>
						<Icon name="lock" size={14} />
						Sign in
					</button>
				</div>

				<p class="split-credit">Made by Oscar, mostly on crack.</p>
			</div>
		</section>
	);
}

/**
 * The signed-in page. Same split, but the left half is one photo from the
 * album — a random one, so the front of it feels like opening the album rather
 * than reading a feed — and the right half is where the album actually stands.
 */
function HomeHero(props: HeroProps) {
	// Held until the album changes underneath it, so the picture does not
	// reshuffle every time something re-renders.
	let chosenId: string | null = null;
	const featured = createMemo(() => {
		const list = props.photos;
		if (list.length === 0) return null;
		if (chosenId === null || !list.some((photo) => photo.id === chosenId))
			chosenId = list[Math.floor(Math.random() * list.length)].id;
		return list.find((photo) => photo.id === chosenId) ?? null;
	});

	return (
		<section class="split split-home" id="top">
			<div class="split-photo">
				<Show
					when={featured()}
					fallback={
						// Nothing rather than "your first photo goes here": the album is
						// still being fetched, and telling someone their album is empty
						// while it loads is worse than an empty frame.
						<Show when={!props.loading}>
							<div class="split-empty">
								<Icon name="camera" size={28} />
								<p>Your first photo goes here.</p>
								<span>Snapshot, portrait, or something silly.</span>
							</div>
						</Show>
					}
				>
					{(photo) => (
						<button
							type="button"
							class="split-photo-button"
							onClick={() => props.onOpen(photo())}
							aria-label={
								photo().caption ? `Open ${photo().caption}` : "Open this photo"
							}
						>
							<img
								src={photo().thumbUrl}
								alt={photo().caption || "A memory of us"}
								width={photo().width ?? undefined}
								height={photo().height ?? undefined}
								loading="eager"
								decoding="async"
								style={{
									"aspect-ratio":
										photo().width && photo().height
											? `${photo().width} / ${photo().height}`
											: undefined,
								}}
							/>
							<PhotoPlate photo={photo()} />
						</button>
					)}
				</Show>
			</div>

			<div class="split-panel">
				<div class="split-body">
					<Show when={props.anniversary}>
						{(label) => (
							<p class="anniversary">
								<span aria-hidden="true">❤</span> {label()}
							</p>
						)}
					</Show>
					<p class="split-eyebrow">Est. 20 June 2025 · Perth</p>
					<h1 class="split-title">
						Addy <em>&amp; Oscar</em>
					</h1>
					<p class="split-line">
						A home for the photos that deserve more than a camera roll.
					</p>
					<p class="split-sub">
						Aquariums, garlic bread, and the long way home. Still going.
					</p>

					<div class="split-stats">
						<div class="split-stat">
							<b>{props.days.toLocaleString("en-AU")}</b>
							<span>{props.days === 1 ? "day together" : "days together"}</span>
						</div>
						<div class="split-stat">
							<b>{props.photos.length || "—"}</b>
							<span>
								{props.photos.length === 1 ? "photo kept" : "photos kept"}
							</span>
						</div>
						<div class="split-stat">
							<b>{props.places ?? "—"}</b>
							<span>{props.places === 1 ? "place" : "places"}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
