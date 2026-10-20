import type { AddyPhoto } from "./store";

export const START = new Date("2025-06-20T00:00:00+08:00");
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3).toUpperCase());

type Parts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
};

/** Read the local wall-clock parts out of a stored date, without timezone drift. */
export function dateParts(value: string | null | undefined): Parts | null {
	if (!value) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
	if (!match) return null;
	const [, year, month, day, hour = "0", minute = "0"] = match;
	return {
		year: Number(year),
		month: Number(month),
		day: Number(day),
		hour: Number(hour),
		minute: Number(minute),
	};
}

export function monthKey(value: string | null): string | null {
	const parts = dateParts(value);
	return parts ? `${parts.year}-${String(parts.month).padStart(2, "0")}` : null;
}

export function formatMonth(key: string): string {
	const [year, month] = key.split("-");
	return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDay(value: string | null): string {
	const parts = dateParts(value);
	return parts
		? `${parts.day} ${MONTHS_SHORT[parts.month - 1]} ${parts.year}`
		: "Undated";
}

export function formatTime(value: string | null): string | null {
	const parts = dateParts(value);
	if (!parts) return null;
	return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function daysTogether(now: Date): number {
	return Math.max(
		0,
		Math.floor((now.getTime() - START.getTime()) / 86_400_000),
	);
}

/** Perth is UTC+8 all year, so a fixed offset is enough for a wall-clock date. */
const PERTH_OFFSET_MS = 8 * 60 * 60 * 1000;

function perthDay(date: Date): { year: number; month: number; day: number } {
	const shifted = new Date(date.getTime() + PERTH_OFFSET_MS);
	return {
		year: shifted.getUTCFullYear(),
		month: shifted.getUTCMonth(),
		day: shifted.getUTCDate(),
	};
}

/** Keep the old site's anniversary rules: only on the same day of the month. */
export function anniversaryLabel(now: Date): string | null {
	if (now.getTime() < START.getTime()) return null;
	const start = perthDay(START);
	const today = perthDay(now);
	if (today.day !== start.day) return null;
	const months = (today.year - start.year) * 12 + (today.month - start.month);
	const years = today.year - start.year;
	if (today.month === start.month && years >= 1)
		return `Happy ${years}-year anniversary`;
	if (months >= 1) return `Happy ${months}-month anniversary`;
	return null;
}

export function sortedNewest(photos: AddyPhoto[]): AddyPhoto[] {
	return [...photos].sort((a, b) => {
		// Dated photos are chronological; undated ones fall to the end with the
		// first roll, regardless of when their files happened to be uploaded.
		if (a.takenAt && b.takenAt) return b.takenAt.localeCompare(a.takenAt);
		if (a.takenAt) return -1;
		if (b.takenAt) return 1;
		if (a.legacy !== b.legacy) return a.legacy ? 1 : -1;
		// The first roll was hand-picked, so keep its order rather than the
		// order the files happened to reach R2.
		if (a.legacy && b.legacy)
			return (a.legacyRank ?? 999) - (b.legacyRank ?? 999);
		return b.createdAt.localeCompare(a.createdAt);
	});
}

export type MonthGroup = {
	key: string;
	label: string;
	photos: AddyPhoto[];
};

export function groupByMonth(photos: AddyPhoto[]): {
	months: MonthGroup[];
	undated: AddyPhoto[];
} {
	const dated = photos.filter((photo) => photo.takenAt);
	const undated = photos.filter((photo) => !photo.takenAt);
	dated.sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));
	const groups = new Map<string, AddyPhoto[]>();
	for (const photo of dated) {
		const key = monthKey(photo.takenAt);
		if (!key) continue;
		const group = groups.get(key);
		if (group) group.push(photo);
		else groups.set(key, [photo]);
	}
	return {
		months: [...groups.entries()].map(([key, group]) => ({
			key,
			label: formatMonth(key),
			photos: group,
		})),
		undated: undated.sort((a, b) => {
			if (a.legacy && b.legacy)
				return (a.legacyRank ?? 999) - (b.legacyRank ?? 999);
			if (a.legacy !== b.legacy) return a.legacy ? -1 : 1;
			return (a.takenAt ?? a.createdAt).localeCompare(b.takenAt ?? b.createdAt);
		}),
	};
}

export type PlaceGroup = {
	key: string;
	name: string;
	lat: number;
	lng: number;
	photos: AddyPhoto[];
	first: string | null;
	last: string | null;
	cover: AddyPhoto;
};

const KM_PER_DEGREE = 111.32;

function distanceKm(
	aLat: number,
	aLng: number,
	bLat: number,
	bLng: number,
): number {
	const x =
		(aLng - bLng) *
		Math.cos(((aLat + bLat) / 2) * (Math.PI / 180)) *
		KM_PER_DEGREE;
	const y = (aLat - bLat) * KM_PER_DEGREE;
	return Math.hypot(x, y);
}

export function coordinateLabel(lat: number, lng: number): string {
	return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? "E" : "W"}`;
}

/**
 * Group photos that were taken near each other. A new pin starts when a photo
 * is more than 5 km from every place already found, which keeps neighbouring
 * suburbs separate without splitting one afternoon into three pins.
 */
export function groupPlaces(photos: AddyPhoto[]): PlaceGroup[] {
	const located = photos.filter(
		(photo): photo is AddyPhoto & { lat: number; lng: number } =>
			typeof photo.lat === "number" && typeof photo.lng === "number",
	);
	const clusters: Array<{
		lat: number;
		lng: number;
		photos: Array<AddyPhoto & { lat: number; lng: number }>;
	}> = [];

	for (const photo of located.sort((a, b) =>
		(a.takenAt ?? a.createdAt).localeCompare(b.takenAt ?? b.createdAt),
	)) {
		const existing = clusters.find(
			(cluster) =>
				distanceKm(cluster.lat, cluster.lng, photo.lat, photo.lng) <= 5,
		);
		if (existing) {
			existing.photos.push(photo);
			existing.lat =
				existing.photos.reduce((sum, entry) => sum + entry.lat, 0) /
				existing.photos.length;
			existing.lng =
				existing.photos.reduce((sum, entry) => sum + entry.lng, 0) /
				existing.photos.length;
		} else {
			clusters.push({
				lat: photo.lat,
				lng: photo.lng,
				photos: [photo],
			});
		}
	}

	return clusters
		.map((cluster) => {
			const counts = new Map<string, number>();
			for (const photo of cluster.photos)
				if (photo.place)
					counts.set(photo.place, (counts.get(photo.place) ?? 0) + 1);
			const name =
				[...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
				coordinateLabel(cluster.lat, cluster.lng);
			const dates = cluster.photos
				.map((photo) => photo.takenAt)
				.filter((date): date is string => Boolean(date))
				.sort();
			const newest = sortedNewest(cluster.photos)[0];
			return {
				key: `${cluster.lat.toFixed(2)},${cluster.lng.toFixed(2)}`,
				name,
				lat: cluster.lat,
				lng: cluster.lng,
				photos: cluster.photos,
				first: dates[0] ?? null,
				last: dates.at(-1) ?? null,
				cover: newest,
			};
		})
		.sort((a, b) => b.photos.length - a.photos.length);
}

/** A tiny equirectangular projection for the "our trail" drawing. */
export function projectPlaces(
	places: PlaceGroup[],
	width: number,
	height: number,
	padding = 54,
): Array<PlaceGroup & { x: number; y: number }> {
	if (places.length === 0) return [];
	const lats = places.map((place) => place.lat);
	const lngs = places.map((place) => place.lng);
	const meanLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
	const cos = Math.max(0.2, Math.cos((meanLat * Math.PI) / 180));
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const spanLat = Math.max(maxLat - minLat, 0.06);
	const spanLng = Math.max((maxLng - minLng) * cos, 0.06);
	const scale = Math.min(
		(width - padding * 2) / spanLng,
		(height - padding * 2) / spanLat,
	);
	const offsetX = (width - spanLng * scale) / 2;
	const offsetY = (height - spanLat * scale) / 2;
	return places.map((place) => ({
		...place,
		x: offsetX + (place.lng - minLng) * cos * scale,
		y: offsetY + (maxLat - place.lat) * scale,
	}));
}

export function photoTilt(id: string): number {
	let hash = 0;
	for (let index = 0; index < id.length; index++)
		hash = (hash * 31 + id.charCodeAt(index)) % 997;
	return ((hash % 28) - 14) / 10;
}

/** The tail of an id, safe to use in a file name (legacy ids contain dots). */
function idSuffix(id: string): string {
	if (id.startsWith("legacy-"))
		return id
			.slice("legacy-".length)
			.replace(/\.[^.]+$/, "")
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "");
	return id
		.replace(/[^a-z0-9]/gi, "")
		.slice(-6)
		.toLowerCase();
}

/**
 * A friendly file name for a photo. `variant` matters: the album zip contains
 * web-sized JPEG copies, while a single-photo download is the original file,
 * so the extension has to match the bytes it is attached to.
 */
export function downloadNameFor(
	photo: AddyPhoto,
	variant: "original" | "display" = "original",
): string {
	const date = (photo.takenAt ?? "").slice(0, 10) || "undated";
	const place = (photo.place ?? "memory")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40);
	const original = photo.originalName ?? "";
	const rawExtension = original.includes(".")
		? (original.split(".").pop()?.toLowerCase() ?? "")
		: "";
	const extension =
		variant === "display"
			? photo.legacy
				? /^[a-z0-9]{2,5}$/.test(rawExtension)
					? rawExtension
					: "png"
				: "jpg"
			: /^[a-z0-9]{2,5}$/.test(rawExtension)
				? rawExtension
				: photo.legacy
					? "png"
					: "jpg";
	return `${date}-${place || "memory"}-${idSuffix(photo.id)}.${extension}`;
}
