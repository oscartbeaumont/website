import { createMemo, createSignal, For, Show } from "solid-js";
import {
	formatDay,
	groupPlaces,
	type PlaceGroup,
	projectPlaces,
} from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

const MAP_WIDTH = 620;
const MAP_HEIGHT = 460;

export function Places(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	canUpload: boolean;
	loading: boolean;
}) {
	const places = createMemo(() => groupPlaces(props.photos));
	const [selectedKey, setSelectedKey] = createSignal<string | null>(null);
	const selected = createMemo(
		() => places().find((place) => place.key === selectedKey()) ?? null,
	);

	const projected = createMemo(() =>
		projectPlaces(places(), MAP_WIDTH, MAP_HEIGHT),
	);

	type ProjectedPlace = PlaceGroup & { x: number; y: number };

	type MapPin = {
		x: number;
		y: number;
		primary: ProjectedPlace;
		members: ProjectedPlace[];
		labelX: number;
		labelY: number;
		anchor: "middle" | "start" | "end";
	};

	/** Group pins that would sit on top of each other, then keep labels apart. */
	const pins = createMemo(() => {
		const grouped: MapPin[] = [];
		for (const place of [...projected()].sort(
			(a, b) => b.photos.length - a.photos.length,
		)) {
			const near = grouped.find(
				(pin) => Math.hypot(pin.x - place.x, pin.y - place.y) <= 34,
			);
			if (near) {
				near.members.push(place);
				near.x =
					near.members.reduce((sum, member) => sum + member.x, 0) /
					near.members.length;
				near.y =
					near.members.reduce((sum, member) => sum + member.y, 0) /
					near.members.length;
				continue;
			}
			grouped.push({
				x: place.x,
				y: place.y,
				primary: place,
				members: [place],
				labelX: place.x,
				labelY: place.y - 32,
				anchor: "middle",
			});
		}

		const used: Array<{ x: number; y: number; w: number; h: number }> = [];
		for (const pin of grouped) {
			const label =
				pin.members.length > 1
					? `${pin.primary.name} +${pin.members.length - 1}`
					: pin.primary.name;
			const w = Math.max(52, label.length * 7.2);
			const options = [
				{ x: pin.x, y: pin.y - 32, anchor: "middle" as const },
				{ x: pin.x, y: pin.y + 42, anchor: "middle" as const },
				{ x: pin.x + 16, y: pin.y + 6, anchor: "start" as const },
				{ x: pin.x - 16, y: pin.y + 6, anchor: "end" as const },
			];
			for (const option of options) {
				const left =
					option.anchor === "middle"
						? option.x - w / 2
						: option.anchor === "start"
							? option.x
							: option.x - w;
				const box = { x: left, y: option.y - 12, w, h: 16 };
				const overlaps = used.some(
					(other) =>
						box.x < other.x + other.w &&
						box.x + box.w > other.x &&
						box.y < other.y + other.h &&
						box.y + box.h > other.y,
				);
				if (!overlaps) {
					pin.labelX = option.x;
					pin.labelY = option.y;
					pin.anchor = option.anchor;
					used.push(box);
					break;
				}
			}
		}
		return grouped;
	});

	const toggle = (key: string) =>
		setSelectedKey(selectedKey() === key ? null : key);

	const route = createMemo(() =>
		[...pins()]
			.sort((a, b) =>
				(a.primary.first ?? "").localeCompare(b.primary.first ?? ""),
			)
			.map((pin, index) => `${index === 0 ? "M" : "L"} ${pin.x} ${pin.y}`)
			.join(" "),
	);

	return (
		<>
			<div class="section-head">
				<div>
					<p class="kicker">Places</p>
					<h2 class="section-title">Our trail</h2>
				</div>
				<p class="section-meta">
					<Show when={!props.loading} fallback="Finding the pins…">
						{places().length} places · not to scale
					</Show>
				</p>
			</div>

			<Show
				when={!props.loading && places().length > 0}
				fallback={
					<Show when={!props.loading}>
						<div class="empty-card">
							<Icon name="pin" size={30} />
							<h3>No pins yet</h3>
							<p>
								Photos carry their location quietly. When one knows where it was
								taken, a pin appears here — and we can name the place.
							</p>
							<Show when={props.canUpload}>
								<button
									class="button solid"
									type="button"
									onClick={props.onUpload}
								>
									<Icon name="upload" size={16} />
									Add a photo with a place
								</button>
							</Show>
						</div>
					</Show>
				}
			>
				<div class="places-layout">
					<div class="trail-card">
						<div class="trail-head">
							<p class="kicker">A drawing, not a map</p>
							<span>
								{places().length} {places().length === 1 ? "place" : "places"}
							</span>
						</div>
						<div class="trail-map">
							<svg
								viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
								role="img"
								aria-label="An approximate drawing of the places our photos were taken"
							>
								<Show when={pins().length > 1}>
									<path class="trail-route" d={route()} />
								</Show>
								<For each={pins()}>
									{(pin) => (
										<g
											class={[
												"trail-pin",
												{ active: selectedKey() === pin.primary.key },
											]}
										>
											<circle class="trail-halo" cx={pin.x} cy={pin.y} r={24} />
											<circle class="trail-dot" cx={pin.x} cy={pin.y} r={7} />
											<text
												class="trail-label"
												x={pin.labelX}
												y={pin.labelY}
												text-anchor={pin.anchor}
											>
												{pin.primary.name}
												{pin.members.length > 1
													? ` +${pin.members.length - 1}`
													: ""}
											</text>
										</g>
									)}
								</For>
							</svg>
							<For each={pins()}>
								{(pin) => (
									<button
										type="button"
										class={[
											"trail-hit",
											{ active: selectedKey() === pin.primary.key },
										]}
										style={`left:${(pin.x / MAP_WIDTH) * 100}%;top:${(pin.y / MAP_HEIGHT) * 100}%`}
										onClick={() => toggle(pin.primary.key)}
										aria-label={`Show photos from ${pin.primary.name}`}
										title={pin.primary.name}
									/>
								)}
							</For>
						</div>
						<p class="trail-note">
							Not to scale. Drawn from the coordinates that came with the
							photos, with the names rounded to the nearest town. Pins that land
							on top of each other share a dot.
						</p>
					</div>

					<div class="places-grid">
						<For each={places()}>
							{(place) => (
								<button
									type="button"
									class={[
										"place-card",
										{ active: selectedKey() === place.key },
									]}
									aria-pressed={selectedKey() === place.key ? "true" : "false"}
									onClick={() => toggle(place.key)}
								>
									<div class="place-cover">
										<img
											src={place.cover.thumbUrl}
											alt=""
											loading="lazy"
											decoding="async"
										/>
									</div>
									<div class="place-info">
										<span class="place-name">{place.name}</span>
										<span class="place-meta">
											{place.photos.length}{" "}
											{place.photos.length === 1 ? "photo" : "photos"}
											<Show when={place.last}>
												{" · "}
												{formatDay(place.last)}
											</Show>
										</span>
									</div>
								</button>
							)}
						</For>
					</div>
				</div>

				<Show when={selected()}>
					{(place) => (
						<section class="place-detail">
							<div class="place-detail-head">
								<div>
									<p class="kicker">Showing</p>
									<h3>{place().name}</h3>
								</div>
								<button
									type="button"
									class="link-button"
									onClick={() => setSelectedKey(null)}
								>
									Show every place
								</button>
							</div>
							<div class="mini-pile">
								<For each={place().photos}>
									{(photo) => (
										<button
											type="button"
											onClick={() => props.onOpen(photo, place().photos)}
											aria-label={
												photo.caption
													? `Open ${photo.caption}`
													: "Open this photo"
											}
										>
											<img
												src={photo.thumbUrl}
												alt={photo.caption || "A memory of us"}
												loading="lazy"
												decoding="async"
											/>
										</button>
									)}
								</For>
							</div>
						</section>
					)}
				</Show>
			</Show>
		</>
	);
}
