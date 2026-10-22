import { createMemo, createSignal, For, onSettled, Show } from "solid-js";
import { formatDay, photoTilt } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

type PileItem = { photo: AddyPhoto; order: number };

function columnCountFor(width: number): number {
	if (width <= 780) return 2;
	if (width <= 1100) return 3;
	return 4;
}

function PhotoCard(props: {
	item: PileItem;
	list: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
}) {
	const photo = () => props.item.photo;
	return (
		<figure class="pile-item" style={`--tilt: ${photoTilt(photo().id)}deg`}>
			<button
				type="button"
				class="photo-button"
				onClick={() => props.onOpen(photo(), props.list)}
				aria-label={
					photo().caption ? `Open ${photo().caption}` : "Open this photo"
				}
			>
				<img
					src={photo().thumbUrl}
					alt={photo().caption || "A memory of us"}
					width={photo().width ?? undefined}
					height={photo().height ?? undefined}
					loading={!photo().legacy && props.item.order < 6 ? "eager" : "lazy"}
					decoding="async"
					style={{
						"aspect-ratio":
							photo().width && photo().height
								? `${photo().width} / ${photo().height}`
								: undefined,
					}}
				/>
				<Show when={photo().legacy}>
					<span class="first-roll">first roll</span>
				</Show>
				<span class="photo-open" aria-hidden="true">
					Open
				</span>
			</button>
			<figcaption>
				<span class="caption">
					{photo().caption ||
						photo().place ||
						(photo().legacy ? "From the first roll" : "One for the pile")}
				</span>
				<span class="caption-meta">
					{photo().legacy && !photo().takenAt
						? "first roll"
						: formatDay(photo().takenAt)}
				</span>
			</figcaption>
		</figure>
	);
}

export function Gallery(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	loading: boolean;
}) {
	const [columnCount, setColumnCount] = createSignal(4);

	onSettled(() => {
		if (typeof window === "undefined") return;
		const update = () => setColumnCount(columnCountFor(window.innerWidth));
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	});

	/**
	 * Distribute into real columns instead of CSS multi-columns. CSS columns
	 * balance by height, which can hoist an old photo to the top of the pile.
	 * Here the newest photo is always first in the first column, and each
	 * subsequent photo goes to whichever column is currently shortest.
	 */
	const columns = createMemo(() => {
		const buckets = Array.from({ length: columnCount() }, () => ({
			height: 0,
			items: [] as PileItem[],
		}));
		props.photos.forEach((photo, order) => {
			let target = buckets[0];
			for (const bucket of buckets)
				if (bucket.height < target.height) target = bucket;
			target.items.push({ photo, order });
			const ratio =
				photo.width && photo.height
					? photo.height / photo.width
					: photo.legacy
						? 0.75
						: 1.2;
			target.height += ratio + 0.12;
		});
		return buckets.map((bucket) => bucket.items);
	});

	return (
		<>
			<div class="section-head">
				<div>
					<p class="kicker">Gallery</p>
					<h2 class="section-title">The pile</h2>
				</div>
				<p class="section-meta">
					<Show when={!props.loading} fallback="Fetching the good ones…">
						{props.photos.length}{" "}
						{props.photos.length === 1 ? "photo" : "photos"} · the good bits
					</Show>
				</p>
			</div>

			<Show
				when={!props.loading}
				fallback={
					<div class="pile" aria-hidden="true">
						<For each={[0, 1, 2, 3, 4, 5, 6, 7]}>
							{(index) => (
								<div
									class="pile-skeleton"
									style={{
										"aspect-ratio": index % 3 === 0 ? "4 / 5" : "1 / 1",
									}}
								/>
							)}
						</For>
					</div>
				}
			>
				<Show
					when={props.photos.length > 0}
					fallback={
						<div class="empty-card">
							<Icon name="camera" size={30} />
							<h3>The pile is empty</h3>
							<p>
								Add the first photo. It lands here with its date, and we can
								argue about the caption later.
							</p>
							<button
								class="button solid"
								type="button"
								onClick={props.onUpload}
							>
								<Icon name="upload" size={16} />
								Add the first one
							</button>
						</div>
					}
				>
					<div class="pile" style={`--pile-cols: ${columnCount()}`}>
						<For each={columns()}>
							{(column) => (
								<div class="pile-col">
									<For each={column}>
										{(item) => (
											<PhotoCard
												item={item}
												list={props.photos}
												onOpen={props.onOpen}
											/>
										)}
									</For>
								</div>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</>
	);
}
