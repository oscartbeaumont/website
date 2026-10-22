export type PhotoExif = {
	takenAt: string | null;
	lat: number | null;
	lng: number | null;
};

const EMPTY: PhotoExif = { takenAt: null, lat: null, lng: null };

/**
 * Read the date it was taken and where, in the browser.
 *
 * JPEG keeps this in an APP1 EXIF block. iPhone PNG exports keep the same
 * information in two places instead: a PNG `eXIf` chunk and an XMP packet in
 * an `iTXt` chunk. Both are common enough that the album has to understand
 * them, otherwise perfectly ordinary phone photos arrive with no place.
 */
export async function readExif(file: File): Promise<PhotoExif> {
	const isJpeg = /jpe?g/i.test(file.type) || /\.jpe?g$/i.test(file.name);
	const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
	if (!isJpeg && !isPng) return EMPTY;
	try {
		const buffer = await file.slice(0, 512 * 1024).arrayBuffer();
		const view = new DataView(buffer);
		return isPng ? parsePng(view) : parseJpeg(view);
	} catch {
		return EMPTY;
	}
}

function chunkType(view: DataView, offset: number): string {
	return (
		String.fromCharCode(view.getUint8(offset)) +
		String.fromCharCode(view.getUint8(offset + 1)) +
		String.fromCharCode(view.getUint8(offset + 2)) +
		String.fromCharCode(view.getUint8(offset + 3))
	);
}

/** Read the PNG `eXIf` and XMP `iTXt` chunks, merging what each one knows. */
function parsePng(view: DataView): PhotoExif {
	if (view.byteLength < 8 || view.getUint32(0) !== 0x89504e47) return EMPTY;
	let offset = 8;
	let exif: PhotoExif = EMPTY;
	let xmp = "";
	while (offset + 12 <= view.byteLength) {
		const length = view.getUint32(offset);
		if (length > view.byteLength || offset + 12 + length > view.byteLength)
			break;
		const type = chunkType(view, offset + 4);
		if (type === "eXIf" && length >= 8) {
			const bytes = new Uint8Array(
				view.buffer,
				view.byteOffset + offset + 8,
				length,
			);
			exif = parseTiff(
				new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
				0,
			);
		} else if (type === "iTXt") {
			const bytes = new Uint8Array(
				view.buffer,
				view.byteOffset + offset + 8,
				length,
			);
			const text = new TextDecoder().decode(bytes);
			if (text.includes("XML:com.adobe.xmp")) xmp = text;
		} else if (type === "IEND") {
			break;
		}
		offset += 12 + length;
	}

	const packet = parseXmp(xmp);
	const lat = exif.lat ?? packet.lat;
	const lng = exif.lng ?? packet.lng;
	return {
		takenAt: exif.takenAt ?? packet.takenAt,
		lat: lat !== null && lng !== null ? lat : null,
		lng: lat !== null && lng !== null ? lng : null,
	};
}

function xmpTag(xmp: string, name: string): string | null {
	const match = new RegExp(`<exif:${name}>([^<]*)</exif:${name}>`).exec(xmp);
	return match ? match[1].trim() : null;
}

function xmpCoordinate(value: string | null): number | null {
	if (!value) return null;
	const match =
		/^(\d+),(\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?))?\s*([NSEW])?$/i.exec(value);
	if (!match) return null;
	const [, degrees, minutes, seconds, ref] = match;
	let number =
		Number(degrees) +
		Number(minutes) / 60 +
		(seconds ? Number(seconds) / 3600 : 0);
	if (!Number.isFinite(number)) return null;
	if (ref && /[SW]/i.test(ref)) number = -number;
	return number;
}

/** XMP timestamps are UTC; the album's clock is Perth (UTC+8) all year. */
function perthTime(value: string | null): string | null {
	if (!value) return null;
	const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
	if (Number.isNaN(date.getTime())) return null;
	const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
	return `${shifted.toISOString().slice(0, 19)}+08:00`;
}

function parseXmp(xmp: string): PhotoExif {
	if (!xmp) return EMPTY;
	const lat = xmpCoordinate(xmpTag(xmp, "GPSLatitude"));
	const lng = xmpCoordinate(xmpTag(xmp, "GPSLongitude"));
	const date = xmpTag(xmp, "DateTimeOriginal");
	const takenAt = date
		? `${date.slice(0, 19).replace(" ", "T")}+08:00`
		: perthTime(xmpTag(xmp, "GPSTimeStamp"));
	const validLat = lat !== null && Math.abs(lat) <= 90 ? lat : null;
	const validLng = lng !== null && Math.abs(lng) <= 180 ? lng : null;
	return {
		takenAt,
		lat: validLat,
		lng: validLat === null ? null : validLng,
	};
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
