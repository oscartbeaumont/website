import { env } from "cloudflare:workers";

export const SESSION_COOKIE = "addy_session";
const SESSION_DAYS = 30;
const encoder = new TextEncoder();

function secret(): string | null {
	const value = (env as unknown as { ADDY_PASSWORD?: string }).ADDY_PASSWORD;
	return value && value.length > 0 ? value : null;
}

export function uploadsConfigured(): boolean {
	return secret() !== null;
}

async function sessionKey(password: string): Promise<CryptoKey> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		encoder.encode(`addy-session:${password}`),
	);
	return crypto.subtle.importKey(
		"raw",
		digest,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

function toBase64Url(bytes: ArrayBuffer): string {
	let binary = "";
	for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
	const padded = value.replaceAll("-", "+").replaceAll("_", "/");
	const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return bytes.buffer as ArrayBuffer;
}

/** A signed, expiring token. The password is the signing key. */
export async function createSessionToken(): Promise<string | null> {
	const password = secret();
	if (!password) return null;
	const expires = Date.now() + SESSION_DAYS * 86_400_000;
	const payload = String(expires);
	const signature = await crypto.subtle.sign(
		"HMAC",
		await sessionKey(password),
		encoder.encode(payload),
	);
	return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(
	token: string | undefined,
): Promise<boolean> {
	if (!token) return false;
	const password = secret();
	if (!password) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature || !/^\d+$/.test(payload)) return false;
	if (Number(payload) < Date.now()) return false;
	try {
		return await crypto.subtle.verify(
			"HMAC",
			await sessionKey(password),
			fromBase64Url(signature),
			encoder.encode(payload),
		);
	} catch {
		return false;
	}
}

export function readCookie(request: Request, name: string): string | undefined {
	const header = request.headers.get("cookie");
	if (!header) return undefined;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key !== name) continue;
		try {
			return decodeURIComponent(rest.join("="));
		} catch {
			// A malformed cookie is just an anonymous visitor, not an error.
			return undefined;
		}
	}
	return undefined;
}

export async function isAuthenticated(request: Request): Promise<boolean> {
	return verifySessionToken(readCookie(request, SESSION_COOKIE));
}

export async function passwordMatches(candidate: string): Promise<boolean> {
	const password = secret();
	if (!password) return false;
	const [a, b] = await Promise.all([
		crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
		crypto.subtle.digest("SHA-256", encoder.encode(password)),
	]);
	const left = new Uint8Array(a);
	const right = new Uint8Array(b);
	let diff = left.length ^ right.length;
	for (let index = 0; index < Math.min(left.length, right.length); index++)
		diff |= left[index] ^ right[index];
	return diff === 0;
}

export function sessionCookie(token: string, secure: boolean): string {
	const parts = [
		`${SESSION_COOKIE}=${encodeURIComponent(token)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Strict",
		`Max-Age=${SESSION_DAYS * 86_400}`,
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}

export function clearSessionCookie(secure: boolean): string {
	const parts = [
		`${SESSION_COOKIE}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Strict",
		"Max-Age=0",
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}

/** A small KV-backed limiter so the password isn't guessable at speed. */
export async function loginAllowed(ip: string): Promise<boolean> {
	try {
		const key = `addy:login:${ip}`;
		const current = Number.parseInt((await env.KV.get(key)) ?? "0", 10);
		if (current >= 12) return false;
		await env.KV.put(key, String(current + 1), { expirationTtl: 900 });
		return true;
	} catch {
		return true;
	}
}

export function isSameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return true;
	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
}
