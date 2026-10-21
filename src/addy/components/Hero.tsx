import { For, Show } from "solid-js";
import { START_LABEL } from "../album";
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
	canUpload: boolean;
	locked: boolean;
	coverUrl: string;
};

export function Hero(props: HeroProps) {
	return (
		<Show when={props.locked} fallback={<UnlockedHero {...props} />}>
			<DateStampHero {...props} />
		</Show>
	);
}

/**
 * The signed-out page. One photo, the date it started, the days since, and
 * one way in. Everything else is hidden until the password is entered.
 */
function DateStampHero(props: HeroProps) {
	return (
		<section class="date-stamp" id="top">
			<p class="ds-kicker">The day it started</p>
			<h1 class="ds-date">{START_LABEL}</h1>
			<div class="ds-rule" aria-hidden="true" />
			<div class="ds-body">
				<figure class="ds-photo">
					<img
						src={props.coverUrl}
						alt="Addy and Oscar"
						loading="eager"
						decoding="async"
					/>
				</figure>
				<div class="ds-copy">
					<p class="ds-number">{props.days.toLocaleString("en-AU")}</p>
					<p class="ds-days">
						{props.days === 1 ? "day together" : "days together"}
					</p>
					<p class="ds-line">A private album. Just for us.</p>
					<div class="ds-actions">
						<button class="button solid" type="button" onClick={props.onLogin}>
							<Icon name="lock" size={14} />
							Sign in
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

function UnlockedHero(props: HeroProps) {
	const featured = () => {
		// The original first roll is still full-size PNGs. Until there are proper
		// uploads, show one large print instead of loading three of them at once.
		if (props.photos.length > 0 && props.photos.every((photo) => photo.legacy))
			return props.photos.slice(0, 1);
		return props.photos.slice(0, 3);
	};
	const positions = [2, 1, 3];

	return (
		<section class="hero" id="top">
			<div class="hero-copy">
				<Show when={props.anniversary}>
					{(label) => (
						<p class="anniversary">
							<span aria-hidden="true">❤</span> {label()}
						</p>
					)}
				</Show>
				<p class="eyebrow">Est. 20 June 2025 · Perth</p>
				<h1 class="hero-title">Addy</h1>
				<p class="hero-amp">&amp; me.</p>
				<p class="hero-sub">
					A home for the photos that deserve more than a camera roll.
				</p>
				<p class="hero-note-copy">
					Aquariums, garlic bread, and the long way home. Still going.
				</p>

				<div class="stats">
					<div class="stat">
						<b>{props.days.toLocaleString("en-AU")}</b>
						<span>{props.days === 1 ? "day together" : "days together"}</span>
					</div>
					<div class="stat">
						<b>{props.photos.length || "—"}</b>
						<span>
							{props.photos.length === 1 ? "photo kept" : "photos kept"}
						</span>
					</div>
					<div class="stat">
						<b>{props.places ?? "—"}</b>
						<span>{props.places === 1 ? "place" : "places"}</span>
					</div>
				</div>

				<div class="hero-actions">
					<button class="button solid" type="button" onClick={props.onShuffle}>
						<Icon name="sparkle" size={16} />
						Surprise me
					</button>
					<button class="button line" type="button" onClick={props.onTimeline}>
						Read our timeline
					</button>
					<Show when={props.canUpload}>
						<button class="button quiet" type="button" onClick={props.onUpload}>
							<Icon name="upload" size={15} />
							Add photos
						</button>
					</Show>
				</div>
			</div>

			<div class="hero-stack">
				<Show when={featured().length > 0} fallback={<EmptyStack />}>
					<For each={featured()}>
						{(photo, index) => (
							<button
								type="button"
								class={[
									"stack-photo",
									`stack-${positions[index()] ?? 3}`,
									{ solo: featured().length === 1 },
								]}
								onClick={() => props.onOpen(photo)}
								aria-label={
									photo.caption ? `Open ${photo.caption}` : "Open this photo"
								}
							>
								<img
									src={photo.thumbUrl}
									alt={photo.caption || "A memory of us"}
									width={photo.width ?? undefined}
									height={photo.height ?? undefined}
									loading={index() === 0 ? "eager" : "lazy"}
									decoding="async"
									style={{
										"aspect-ratio":
											photo.width && photo.height
												? `${photo.width} / ${photo.height}`
												: undefined,
									}}
								/>
							</button>
						)}
					</For>
					<span class="stack-tape" aria-hidden="true" />
					<span class="stack-note" aria-hidden="true">
						the good bits
					</span>
				</Show>
			</div>
		</section>
	);
}

function EmptyStack() {
	return (
		<div class="stack-empty">
			<Icon name="camera" size={28} />
			<p>Your first photo goes here.</p>
			<span>Snapshot, portrait, or something silly.</span>
		</div>
	);
}
