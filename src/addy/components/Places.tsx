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
/** How close two places have to be on screen before they share one pin. */
const CLUSTER_PX = 78;
/** Photos shown in the pile; the rest are counted on the badge. */
const PILE = 3;

type Pin = {
	signature: string;
	kind: "place" | "cluster";
	places: PlaceGroup[];
	photos: AddyPhoto[];
	/** Every photo in the pin, including the ones the pile cannot show. */
	count: number;
	center: [number, number];
};

/**
 * Group the places that would land on top of each other at the current zoom, so
 * a pin is always something you can hit with a thumb.
 */
function pinsFor(
	places: PlaceGroup[],
	project: (lngLat: [number, number]) => { x: number; y: number },
): Pin[] {
	const groups: Array<{ x: number; y: number; places: PlaceGroup[] }> = [];
	for (const place of places) {
		const point = project([place.lng, place.lat]);
		const near = groups.find(
			(group) => Math.hypot(group.x - point.x, group.y - point.y) < CLUSTER_PX,
		);
		if (near) near.places.push(place);
		else groups.push({ x: point.x, y: point.y, places: [place] });
	}

	return groups.map((group) => {
		const single = group.places.length === 1;
		return {
			signature: `${single ? "place" : "cluster"}:${group.places
				.map((place) => place.key)
				.join(",")}`,
			kind: single ? "place" : "cluster",
			places: group.places,
			// One place shows its newest photos; a cluster shows one photo from
			// each place it is standing in for.
			photos: single
				? group.places[0].photos.slice(-PILE)
				: group.places.slice(0, PILE).map((place) => place.cover),
			count: group.places.reduce((sum, place) => sum + place.photos.length, 0),
			center: [
				group.places.reduce((sum, place) => sum + place.lng, 0) /
					group.places.length,
				group.places.reduce((sum, place) => sum + place.lat, 0) /
					group.places.length,
			],
		};
	});
}

/**
 * Rough metres between two points — enough to pick a zoom, not a measurement.
 */
function metresBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
	const x =
		(aLng - bLng) * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180)) * 111_320;
	const y = (aLat - bLat) * 111_320;
	return Math.hypot(x, y);
}

/**
 * The zoom at which a group this wide comes apart into separate pins, so one
 * tap on a cluster is worth more than a nudge. Web Mercator halves the world
 * every zoom level, which is all the arithmetic needs.
 */
function zoomToSeparate(pin: Pin, pixels: number): number {
	let widest = 0;
	for (const a of pin.places)
		for (const b of pin.places)
			widest = Math.max(widest, metresBetween(a.lat, a.lng, b.lat, b.lng));
	const metresPerPixel = Math.max(widest, 1) / pixels;
	return Math.log2(
		(156_543.03392 * Math.cos((pin.center[1] * Math.PI) / 180)) /
			metresPerPixel,
	);
}

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
	let markers: MapLibreMarker[] = [];
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
		for (const marker of markers) marker.remove();
		markers = [];
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

	const openCluster = (pin: Pin) => {
		if (!map) return;
		const target = zoomToSeparate(pin, CLUSTER_PX * 2);
		// Past this the pins cannot be pulled apart any further, so open the
		// busiest place instead of zooming into nothing.
		if (!Number.isFinite(target) || map.getZoom() >= 15) {
			selectPlace(pin.places[0]);
			return;
		}
		map.easeTo({
			center: pin.center,
			zoom: Math.min(Math.max(target, map.getZoom() + 0.8), 15.5),
			duration: 1100,
			essential: true,
		});
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

	const pinLabel = (pin: Pin) => {
		if (pin.kind === "place")
			return `${pin.places[0].name}, ${pin.count} ${
				pin.count === 1 ? "photo" : "photos"
			}`;
		return `${pin.places.length} places, ${pin.count} ${
			pin.count === 1 ? "photo" : "photos"
		}`;
	};

	/** One pin: a pile of photos, a count when there are more, and the name. */
	const pinElement = (pin: Pin) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = `map-pin ${pin.kind}`;
		button.title = pinLabel(pin);
		button.setAttribute("aria-label", pinLabel(pin));

		const stack = document.createElement("span");
		stack.className = "map-pin-stack";
		for (const photo of pin.photos) {
			const image = document.createElement("img");
			image.className = "map-pin-photo";
			image.src = photo.thumbUrl;
			image.alt = "";
			image.loading = "lazy";
			image.decoding = "async";
			stack.appendChild(image);
		}
		button.appendChild(stack);

		if (pin.kind === "cluster" || pin.count > pin.photos.length) {
			const badge = document.createElement("span");
			badge.className = "map-pin-count";
			badge.textContent = String(pin.count);
			button.appendChild(badge);
		}
		if (pin.kind === "place") {
			const name = document.createElement("span");
			name.className = "map-pin-name";
			name.textContent = pin.places[0].name;
			button.appendChild(name);
		}

		button.addEventListener("click", (event) => {
			event.stopPropagation();
			if (pin.kind === "place") selectPlace(pin.places[0]);
			else openCluster(pin);
		});
		return button;
	};

	const syncMarkers = () => {
		const Ctor = MarkerClass;
		if (!map || !Ctor || disposed) return;
		const instance = map;
		const pins = pinsFor(places(), (lngLat) => instance.project(lngLat));
		const signature = pins.map((pin) => pin.signature).join("|");
		// Rebuilding re-fetches the thumbnails, so only do it when the grouping
		// actually changed.
		if (signature === markerSignature) return;
		markerSignature = signature;
		for (const marker of markers) marker.remove();
		markers = pins.map((pin) =>
			new Ctor({ element: pinElement(pin), anchor: "center" })
				.setLngLat(pin.center)
				.addTo(instance),
		);
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
					instance.jumpTo({ center: HOME.center, zoom: HOME.zoom });
					instance.on("click", () => setSelectedKey(null));
					instance.on("moveend", syncMarkers);
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
						{places().length} {places().length === 1 ? "place" : "places"} · the
						whole globe
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
								Every pin is the photos from one place. Tap it to see them all;
								pins that land on top of each other gather into a cluster, and
								tapping one of those zooms in until they come apart.
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
