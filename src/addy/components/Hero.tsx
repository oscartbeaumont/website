import { createSignal, Show } from "solid-js";
import { formatDay, START_LONG } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

type HeroProps = {
	photos: AddyPhoto[];
	days: number;
	places: number | null;
	anniversary: string | null;
	onShuffle: () => void;
	onTimeline: () => void;
	onUpload: () => void;
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
						A<span>&amp;</span>O
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
 * The signed-in page. Same split, but the left half is the newest photo and
 * the right half is where the album actually stands.
 */
function HomeHero(props: HeroProps) {
	const featured = () => props.photos[0] ?? null;

	return (
		<section class="split split-home" id="top">
			<div class="split-photo">
				<Show
					when={featured()}
					fallback={
						<div class="split-empty">
							<Icon name="camera" size={28} />
							<p>Your first photo goes here.</p>
							<span>Snapshot, portrait, or something silly.</span>
						</div>
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
						</button>
					)}
				</Show>
			</div>

			<div class="split-panel">
				<div class="split-top">
					<p class="split-label">
						{featured()?.takenAt
							? formatDay(featured()?.takenAt ?? null)
							: "The first roll"}
					</p>
				</div>

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

					<div class="split-actions">
						<button
							class="button solid"
							type="button"
							onClick={props.onShuffle}
						>
							<Icon name="sparkle" size={16} />
							Surprise me
						</button>
						<button
							class="button line"
							type="button"
							onClick={props.onTimeline}
						>
							Read our timeline
						</button>
						<button class="button quiet" type="button" onClick={props.onUpload}>
							<Icon name="upload" size={15} />
							Add photos
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
