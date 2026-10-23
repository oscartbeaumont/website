import "maplibre-gl/dist/maplibre-gl.css";
import type {
	Map as MapLibreMap,
	Marker as MapLibreMarker,
	MarkerOptions,
} from "maplibre-gl";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	Show,
} from "solid-js";
import { formatDay, groupPlaces, type PlaceGroup } from "../album";
import { lockBodyScroll } from "../scroll-lock";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const HOME = { center: [115.6, -31.6] as [number, number], zoom: 1.45 };
/**
 * How close two pins have to be on screen before their names would print over
 * each other. Only the name is hidden: every pin stays where it belongs.
 */
const CROWDED_PX = 46;
/** Photos shown in the pile; the rest are counted on the badge. */
const PILE = 3;

export function Places(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	loading: boolean;
}) {
	const places = createMemo(() => groupPlaces(props.photos));
	const [selectedKey, setSelectedKey] = createSignal<string | null>(null);
	const [expanded, setExpanded] = createSignal(false);
	const [ready, setReady] = createSignal(false);
	const [failed, setFailed] = createSignal(false);
	const selected = createMemo(
		() => places().find((place) => place.key === selectedKey()) ?? null,
	);

	let container: HTMLDivElement | undefined;
	let mapWrap: HTMLDivElement | undefined;
	let map: MapLibreMap | undefined;
	let MarkerClass: { new (options: MarkerOptions): MapLibreMarker } | undefined;
	let markers = new Map<
		string,
		{ marker: MapLibreMarker; element: HTMLElement }
	>();
	let markerSignature = "";
	let releaseScroll: (() => void) | undefined;
	let booted = false;
	let disposed = false;

	const coarsePointer = () =>
		typeof window !== "undefined" &&
		window.matchMedia("(pointer: coarse)").matches;

	const onKey = (event: KeyboardEvent) => {
		if (event.key === "Escape" && expanded()) setExpanded(false);
	};

	onCleanup(() => {
		disposed = true;
		document.removeEventListener("keydown", onKey);
		window.removeEventListener("resize", resize);
		releaseScroll?.();
		for (const entry of markers.values()) entry.marker.remove();
		markers = new Map();
		map?.remove();
		map = undefined;
	});

	const resize = () => {
		map?.resize();
		// Screen positions decide what clusters, so the pins are rebuilt too.
		syncMarkers();
	};

	/**
	 * How much of the map the photo sheet covers, so the pin a place opens onto
	 * lands above it rather than behind it.
	 */
	const sheetPadding = () =>
		Math.round((container?.clientHeight ?? 420) * 0.46);

	const selectPlace = (place: PlaceGroup) => {
		setSelectedKey(place.key);
		if (map) {
			const bottom = sheetPadding();
			map.flyTo({
				center: [place.lng, place.lat],
				zoom: Math.max(map.getZoom(), 12),
				padding: { top: 20, bottom, left: 20, right: 20 },
				duration: 1200,
				essential: true,
			});
		}
		// The list of places sits under the map on a phone, so opening one from
		// there has to bring the map back into view.
		requestAnimationFrame(() =>
			mapWrap?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
		);
	};

	const resetGlobe = () => {
		setSelectedKey(null);
		map?.flyTo({
			center: HOME.center,
			zoom: HOME.zoom,
			duration: 1400,
			essential: true,
		});
	};

	/**
	 * Open on the places rather than on the whole planet: they are all in one
	 * corner of it, and a globe would stack every pin on the same pixel.
	 */
	const fitPlaces = () => {
		if (!map) return;
		const list = places();
		if (list.length === 0) return;
		const lngs = list.map((place) => place.lng);
		const lats = list.map((place) => place.lat);
		map.fitBounds(
			[
				[Math.min(...lngs), Math.min(...lats)],
				[Math.max(...lngs), Math.max(...lats)],
			],
			{ padding: 64, maxZoom: 11, duration: 0 },
		);
	};

	const pinLabel = (place: PlaceGroup) =>
		`${place.name}, ${place.photos.length} ${
			place.photos.length === 1 ? "photo" : "photos"
		}`;

	/**
	 * One pin per place, standing on that place's own coordinates — never a
	 * point averaged with a neighbour, so a photo is only ever drawn where it
	 * was taken. The pile is the place's newest photos and the badge counts the
	 * ones the pile could not show.
	 */
	const pinElement = (place: PlaceGroup) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "map-pin place";
		button.title = pinLabel(place);
		button.setAttribute("aria-label", pinLabel(place));

		const photos = place.photos.slice(-PILE);
		const stack = document.createElement("span");
		stack.className = "map-pin-stack";
		for (const photo of photos) {
			const image = document.createElement("img");
			image.className = "map-pin-photo";
			image.src = photo.thumbUrl;
			image.alt = "";
			image.loading = "lazy";
			image.decoding = "async";
			stack.appendChild(image);
		}
		button.appendChild(stack);

		if (place.photos.length > photos.length) {
			const badge = document.createElement("span");
			badge.className = "map-pin-count";
			badge.textContent = String(place.photos.length);
			button.appendChild(badge);
		}
		const name = document.createElement("span");
		name.className = "map-pin-name";
		name.textContent = place.name;
		button.appendChild(name);

		button.addEventListener("click", (event) => {
			event.stopPropagation();
			selectPlace(place);
		});
		return button;
	};

	const syncMarkers = () => {
		const Ctor = MarkerClass;
		if (!map || !Ctor || disposed) return;
		const instance = map;
		const list = places();
		const signature = list
			.map((place) => `${place.key}:${place.photos.length}`)
			.join("|");
		// Rebuilding re-fetches the thumbnails, so only do it when the places
		// themselves changed.
		if (signature !== markerSignature) {
			markerSignature = signature;
			for (const entry of markers.values()) entry.marker.remove();
			markers = new Map();
			// The busiest place goes on last, so a pile of them opens the one
			// with the most behind it.
			for (const place of [...list].sort(
				(a, b) => a.photos.length - b.photos.length,
			)) {
				const element = pinElement(place);
				const marker = new Ctor({ element, anchor: "center" })
					.setLngLat([place.lng, place.lat])
					.addTo(instance);
				markers.set(place.key, { marker, element });
			}
		}

		// A pin with a neighbour on top of it keeps quiet about its name, so a
		// pile does not print every name over the others.
		const points = list.map((place) => ({
			key: place.key,
			...instance.project([place.lng, place.lat]),
		}));
		for (const point of points) {
			const crowded = points.some(
				(other) =>
					other.key !== point.key &&
					Math.hypot(other.x - point.x, other.y - point.y) < CROWDED_PX,
			);
			markers
				.get(point.key)
				?.element.classList.toggle("map-pin-crowded", crowded);
		}
	};

	/** Built from the element's ref: by then it is attached and has a size. */
	const boot = () => {
		if (booted || disposed || typeof window === "undefined" || !container)
			return;
		booted = true;
		document.addEventListener("keydown", onKey);
		window.addEventListener("resize", resize);
		let styleReady = false;
		const failTimer = window.setTimeout(() => {
			if (!styleReady) setFailed(true);
		}, 20_000);

		void import("maplibre-gl")
			.then(({ Map, Marker, NavigationControl, setWorkerUrl }) => {
				if (disposed || !container) return;
				MarkerClass = Marker;
				// MapLibre v6 ships its worker as a separate module. Vite emits the
				// `?url` asset, so point the library at that copy explicitly.
				setWorkerUrl(mapWorkerUrl);
				const instance = new Map({
					container,
					style: MAP_STYLE,
					center: HOME.center,
					zoom: HOME.zoom,
					minZoom: 0.7,
					maxZoom: 17,
					renderWorldCopies: false,
					attributionControl: false,
					// On a phone one finger belongs to the page: it scrolls, and the
					// map takes two. The full-screen map turns this back off, because
					// there the map is the whole page.
					cooperativeGestures: coarsePointer(),
				});
				map = instance;
				instance.addControl(
					new NavigationControl({ showCompass: false, visualizePitch: false }),
					"bottom-right",
				);

				instance.on("load", () => {
					if (disposed) return;
					styleReady = true;
					window.clearTimeout(failTimer);
					instance.setProjection({ type: "globe" });
					instance.on("click", () => setSelectedKey(null));
					instance.on("moveend", syncMarkers);
					fitPlaces();
					setReady(true);
					syncMarkers();
				});

				instance.on("error", (event) => {
					// A missing tile or sprite shouldn't blank the whole section.
					console.warn("Addy map", event.error);
				});
			})
			.catch((error) => {
				console.warn("Addy map failed to load", error);
				setFailed(true);
			});
	};

	createEffect(
		() => places(),
		() => {
			// A new album means new pins even if the grouping happens to match.
			markerSignature = "";
			syncMarkers();
		},
	);

	const toggleExpanded = () => {
		const next = !expanded();
		setExpanded(next);
		if (next) releaseScroll = lockBodyScroll();
		else releaseScroll?.();
		if (next) map?.cooperativeGestures.disable();
		else if (coarsePointer()) map?.cooperativeGestures.enable();
		requestAnimationFrame(() => {
			map?.resize();
			syncMarkers();
		});
	};

	return (
		<>
			<div class="section-head">
				<div>
					<p class="kicker">Places</p>
					<h2 class="section-title">Where we've been</h2>
				</div>
				<p class="section-meta">
					<Show when={!props.loading} fallback="Finding the pins…">
						{places().length} {places().length === 1 ? "place" : "places"} ·
						every one of them
					</Show>
				</p>
			</div>

			<Show
				when={!props.loading && places().length > 0}
				fallback={
					<Show when={!props.loading}>
						<div class="empty-card">
							<Icon name="compass" size={30} />
							<h3>No pins yet</h3>
							<p>
								A photo only lands here when it still knows where it was taken.
								Phones keep that quietly inside the file, and we read it on the
								way in.
							</p>
							<button
								class="button solid"
								type="button"
								onClick={props.onUpload}
							>
								<Icon name="upload" size={16} />
								Add a photo with a place
							</button>
						</div>
					</Show>
				}
			>
				<div class={["world", { "world-expanded": expanded() }]}>
					<div class="world-map-wrap" ref={mapWrap}>
						<div
							ref={(element) => {
								container = element;
								requestAnimationFrame(boot);
							}}
							class="world-map"
							role="application"
							aria-label="A globe of the places our photos were taken"
						/>
						<Show when={!ready() && !failed()}>
							<div class="world-loading">
								<span class="spinner" />
								Spinning up the globe…
							</div>
						</Show>
						<Show when={failed()}>
							<div class="world-loading">
								<p>The map couldn't load. The list beside it still works.</p>
							</div>
						</Show>
						<div class="world-tools">
							<button
								type="button"
								class="button line small"
								onClick={toggleExpanded}
							>
								<Icon name={expanded() ? "close" : "compass"} size={15} />
								{expanded() ? "Close map" : "Expand map"}
							</button>
							<button
								type="button"
								class="button line small"
								onClick={resetGlobe}
							>
								Back to the globe
							</button>
						</div>
						<p class="world-credit">
							©{" "}
							<a
								href="https://www.openstreetmap.org/copyright"
								target="_blank"
								rel="noreferrer"
							>
								OpenStreetMap
							</a>{" "}
							·{" "}
							<a
								href="https://openfreemap.org"
								target="_blank"
								rel="noreferrer"
							>
								OpenFreeMap
							</a>
						</p>

						{/* Opened by a pin: every photo of that place, on the map it
						    was taken from. */}
						<Show when={selected()}>
							{(place) => (
								<div
									class="map-sheet"
									role="dialog"
									aria-label={`${place().name}, ${place().photos.length} photos`}
								>
									<div class="map-sheet-head">
										<div>
											<p class="kicker">Showing</p>
											<h3>{place().name}</h3>
											<p class="map-sheet-meta">
												{place().photos.length}{" "}
												{place().photos.length === 1 ? "photo" : "photos"}
												<Show when={place().last}>
													{" · "}
													{formatDay(place().last)}
												</Show>
											</p>
										</div>
										<button
											type="button"
											class="icon-button"
											onClick={() => setSelectedKey(null)}
											aria-label="Close these photos"
										>
											<Icon name="close" size={16} />
										</button>
									</div>
									<div class="map-sheet-grid">
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
								</div>
							)}
						</Show>
					</div>

					<div class="world-side">
						<div class="world-side-head">
							<p class="kicker">Tap a pile to open it</p>
							<p>
								Every pin is the photos from one place, standing on the spot
								they were taken. Tap one to see them all. Where two places are
								close together their pins overlap, and zooming in pulls them
								apart.
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
										aria-pressed={
											selectedKey() === place.key ? "true" : "false"
										}
										onClick={() => selectPlace(place)}
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
				</div>
			</Show>
		</>
	);
}
