export type PhotoExif = {
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
};

const EMPTY: PhotoExif = { takenAt: null, lat: null, lng: null };

/**
 * A small JPEG EXIF reader. We only need the date it was taken and where, so
 * this avoids shipping a full metadata library to the browser.
 */
export async function readExif(file: File): Promise<PhotoExif> {
	if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return EMPTY;
	try {
		const buffer = await file.slice(0, 512 * 1024).arrayBuffer();
		return parseJpeg(new DataView(buffer));
	} catch {
		return EMPTY;
	}
}

type Entry = { tag: number; type: number; count: number; value: number };

const TYPE_SIZE: Record<number, number> = {
	1: 1,
	2: 1,
	3: 2,
	4: 4,
	5: 8,
	7: 1,
	9: 4,
	10: 8,
};

function parseJpeg(view: DataView): PhotoExif {
	if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return EMPTY;
	let offset = 2;
	while (offset + 4 <= view.byteLength) {
		if (view.getUint8(offset) !== 0xff) {
			offset++;
			continue;
		}
		const marker = view.getUint8(offset + 1);
		if (
			marker === 0xd8 ||
			marker === 0x01 ||
			(marker >= 0xd0 && marker <= 0xd7)
		) {
			offset += 2;
			continue;
		}
		if (marker === 0xda || marker === 0xd9) break;
		const length = view.getUint16(offset + 2);
		if (length < 2 || offset + 2 + length > view.byteLength) break;
		if (
			marker === 0xe1 &&
			view.getUint32(offset + 4) === 0x45786966 &&
			view.getUint16(offset + 8) === 0
		)
			return parseTiff(view, offset + 10);
		offset += 2 + length;
	}
	return EMPTY;
}

function parseTiff(view: DataView, base: number): PhotoExif {
	if (base + 8 > view.byteLength) return EMPTY;
	const little = view.getUint16(base) === 0x4949;
	const u16 = (offset: number) => view.getUint16(offset, little);
	const u32 = (offset: number) => view.getUint32(offset, little);
	if (u16(base + 2) !== 0x2a) return EMPTY;

	const readIfd = (relative: number): Entry[] => {
		const start = base + relative;
		if (start + 2 > view.byteLength) return [];
		const count = u16(start);
		const entries: Entry[] = [];
		for (let index = 0; index < count; index++) {
			const entry = start + 2 + index * 12;
			if (entry + 12 > view.byteLength) break;
			const type = u16(entry + 2);
			const length = TYPE_SIZE[type];
			if (!length) continue;
			const fieldCount = u32(entry + 4);
			const byteSize = length * fieldCount;
			const value = byteSize <= 4 ? entry + 8 : base + u32(entry + 8);
			if (value < 0 || value + byteSize > view.byteLength) continue;
			entries.push({
				tag: u16(entry),
				type,
				count: fieldCount,
				value,
			});
		}
		return entries;
	};

	const ascii = (entry: Entry): string => {
		let text = "";
		for (let index = 0; index < entry.count; index++) {
			const code = view.getUint8(entry.value + index);
			if (code === 0) break;
			text += String.fromCharCode(code);
		}
		return text.trim();
	};

	const rationals = (entry: Entry): number[] => {
		const values: number[] = [];
		for (let index = 0; index < entry.count; index++) {
			const divisor = u32(entry.value + index * 8 + 4);
			if (divisor === 0) continue;
			values.push(u32(entry.value + index * 8) / divisor);
		}
		return values;
	};

	const ifd0 = readIfd(u32(base + 4));
	let exifIfd = -1;
	let gpsIfd = -1;
	for (const entry of ifd0) {
		if (entry.tag === 0x8769) exifIfd = u32(entry.value);
		if (entry.tag === 0x8825) gpsIfd = u32(entry.value);
	}

	let takenAt: string | null = null;
	if (exifIfd >= 0) {
		const exif = readIfd(exifIfd);
		const date = exif.find((entry) => entry.tag === 0x9003);
		const offsetEntry = exif.find((entry) => entry.tag === 0x9011);
		if (date)
			takenAt = normaliseDate(
				ascii(date),
				offsetEntry ? ascii(offsetEntry) : null,
			);
	}

	let lat: number | null = null;
	let lng: number | null = null;
	if (gpsIfd >= 0) {
		const gps = readIfd(gpsIfd);
		const find = (tag: number) => gps.find((entry) => entry.tag === tag);
		const latRef = find(0x0001);
		const latValue = find(0x0002);
		const lngRef = find(0x0003);
		const lngValue = find(0x0004);
		if (latValue) {
			const values = rationals(latValue);
			if (values.length >= 3) {
				lat = values[0] + values[1] / 60 + values[2] / 3600;
				if (latRef && ascii(latRef).toUpperCase() === "S") lat = -lat;
			}
		}
		if (lngValue) {
			const values = rationals(lngValue);
			if (values.length >= 3) {
				lng = values[0] + values[1] / 60 + values[2] / 3600;
				if (lngRef && ascii(lngRef).toUpperCase() === "W") lng = -lng;
			}
		}
		if (lat !== null && (!Number.isFinite(lat) || Math.abs(lat) > 90))
			lat = null;
		if (lng !== null && (!Number.isFinite(lng) || Math.abs(lng) > 180))
			lng = null;
		if (lat === null || lng === null) {
			lat = null;
			lng = null;
		}
		if (!takenAt) {
			const date = find(0x001d);
			const time = find(0x0007);
			if (date && time)
				takenAt = normaliseDate(
					`${ascii(date).replaceAll(":", "-")} ${ascii(time)}`,
					null,
				);
		}
	}

	return { takenAt, lat, lng };
}

function normaliseDate(value: string, offset: string | null): string | null {
	const match =
		/^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
			value.trim(),
		);
	if (!match) return null;
	const [, year, month, day, hour, minute, second = "00"] = match;
	const numbers = [year, month, day, hour, minute, second].map(Number);
	const [y, m, d, h, min, s] = numbers;
	if (
		y < 1990 ||
		y > new Date().getFullYear() + 1 ||
		m < 1 ||
		m > 12 ||
		d < 1 ||
		d > 31 ||
		h > 23 ||
		min > 59 ||
		s > 59
	)
		return null;
	const zone =
		offset && /^[+-]\d{2}:\d{2}$/.test(offset.trim()) ? offset.trim() : "";
	return `${year}-${month}-${day}T${hour}:${minute}:${second}${zone}`;
}
