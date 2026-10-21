import type { FeatureCollection, Point } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
	GeoJSONSource,
	MapGeoJSONFeature,
	Map as MapLibreMap,
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

type PlaceProperties = {
	key: string;
	name: string;
	count: number;
};

type PlaceSource = FeatureCollection<Point, PlaceProperties>;

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const HOME = { center: [115.6, -31.6] as [number, number], zoom: 1.45 };

function sourceFor(places: PlaceGroup[]): PlaceSource {
	return {
		type: "FeatureCollection",
		features: places.map((place) => ({
			type: "Feature",
			geometry: { type: "Point", coordinates: [place.lng, place.lat] },
			properties: {
				key: place.key,
				name: place.name,
				count: place.photos.length,
			},
		})),
	};
}

export function Places(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	canUpload: boolean;
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
	let map: MapLibreMap | undefined;
	let releaseScroll: (() => void) | undefined;
	let booted = false;
	let disposed = false;

	const onKey = (event: KeyboardEvent) => {
		if (event.key === "Escape" && expanded()) setExpanded(false);
	};
	const resize = () => map?.resize();

	onCleanup(() => {
		disposed = true;
		document.removeEventListener("keydown", onKey);
		window.removeEventListener("resize", resize);
		releaseScroll?.();
		map?.remove();
		map = undefined;
	});

	const focusPlace = (place: PlaceGroup, zoom = 12) => {
		setSelectedKey(place.key);
		map?.flyTo({
			center: [place.lng, place.lat],
			zoom: Math.max(map.getZoom(), zoom),
			duration: 1400,
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
			.then(({ Map, NavigationControl, setWorkerUrl }) => {
				if (disposed || !container) return;
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
					instance.addSource("places", {
						type: "geojson",
						data: sourceFor(places()),
						cluster: true,
						clusterRadius: 46,
						clusterMaxZoom: 9,
					});
					instance.addLayer({
						id: "place-clusters",
						type: "circle",
						source: "places",
						filter: ["has", "point_count"],
						paint: {
							"circle-color": "#a84c36",
							"circle-opacity": 0.16,
							"circle-radius": [
								"step",
								["get", "point_count"],
								26,
								2,
								34,
								5,
								42,
							],
							"circle-stroke-color": "#a84c36",
							"circle-stroke-opacity": 0.32,
							"circle-stroke-width": 1,
						},
					});
					instance.addLayer({
						id: "place-cluster-count",
						type: "symbol",
						source: "places",
						filter: ["has", "point_count"],
						layout: {
							"text-field": ["get", "point_count_abbreviated"],
							"text-font": ["Noto Sans Bold"],
							"text-size": 12,
						},
						paint: {
							"text-color": "#7d3524",
						},
					});
					instance.addLayer({
						id: "place-points",
						type: "circle",
						source: "places",
						filter: ["!", ["has", "point_count"]],
						paint: {
							"circle-color": "#a84c36",
							"circle-radius": 7,
							"circle-stroke-color": "#fffbf3",
							"circle-stroke-width": 2.5,
						},
					});
					instance.addLayer({
						id: "place-labels",
						type: "symbol",
						source: "places",
						filter: ["!", ["has", "point_count"]],
						minzoom: 6,
						layout: {
							"text-field": ["get", "name"],
							"text-font": ["Noto Sans Regular"],
							"text-size": 12,
							"text-offset": [0, 1.2],
							"text-anchor": "top",
							"text-allow-overlap": false,
						},
						paint: {
							"text-color": "#2b2320",
							"text-halo-color": "#f7f1e5",
							"text-halo-width": 2,
						},
					});

					const zoomTo = (feature: MapGeoJSONFeature) => {
						const source = instance.getSource<GeoJSONSource>("places");
						const clusterId = feature.properties?.cluster_id;
						if (!source || typeof clusterId !== "number") return;
						void source
							.getClusterExpansionZoom(clusterId)
							.then((zoom: number) =>
								instance.easeTo({
									center: (feature.geometry as Point).coordinates as [
										number,
										number,
									],
									zoom: Math.max(zoom + 0.6, 4.5),
									duration: 1200,
								}),
							);
					};

					instance.on("click", "place-clusters", (event) => {
						const feature = event.features?.[0];
						if (feature) zoomTo(feature);
					});
					instance.on("click", "place-points", (event) => {
						const feature = event.features?.[0];
						const key = feature?.properties?.key;
						const place = places().find((entry) => entry.key === key);
						if (place) focusPlace(place);
					});
					instance.on("click", (event) => {
						const hits = instance.queryRenderedFeatures(event.point, {
							layers: ["place-clusters", "place-points"],
						});
						if (hits.length === 0) setSelectedKey(null);
					});
					for (const layer of ["place-clusters", "place-points"]) {
						instance.on("mouseenter", layer, () => {
							instance.getCanvas().style.cursor = "pointer";
						});
						instance.on("mouseleave", layer, () => {
							instance.getCanvas().style.cursor = "";
						});
					}

					setReady(true);
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
		() => sourceFor(places()),
		(data) => {
			map?.getSource<GeoJSONSource>("places")?.setData(data);
		},
	);

	const toggleExpanded = () => {
		const next = !expanded();
		setExpanded(next);
		if (next) releaseScroll = lockBodyScroll();
		else releaseScroll?.();
		requestAnimationFrame(() => map?.resize());
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
				<div class={["world", { "world-expanded": expanded() }]}>
					<div class="world-map-wrap">
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
								<p>The map couldn't load. The list below still works.</p>
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
					</div>

					<div class="world-side">
						<div class="world-side-head">
							<p class="kicker">Click a pin to zoom in</p>
							<p>
								Pins that land on top of each other gather into a cluster. Tap
								one to open it up, then keep going right down to the street.
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
										onClick={() => focusPlace(place)}
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
