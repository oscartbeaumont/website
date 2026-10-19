import { For, Show } from "solid-js";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

export function Hero(props: {
	photos: AddyPhoto[];
	days: number;
	places: number | null;
	anniversary: string | null;
	onShuffle: () => void;
	onTimeline: () => void;
	onUpload: () => void;
	onOpen: (photo: AddyPhoto) => void;
	canUpload: boolean;
}) {
	const featured = () => props.photos.slice(0, 3);
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
					Aquariums, garlic bread, and the long way home. Started 20 June 2025,
					still going.
				</p>

				<div class="stats">
					<div class="stat">
						<b>{props.days.toLocaleString("en-AU")}</b>
						<span>days together</span>
					</div>
					<div class="stat">
						<b>{props.photos.length || "—"}</b>
						<span>photos kept</span>
					</div>
					<div class="stat">
						<b>{props.places ?? "—"}</b>
						<span>places</span>
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
