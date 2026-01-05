// https://gist.github.com/intrnl/fc797aeaebafc12911e50debca13b0a2

import { createEffect, createRoot, onMount } from "solid-js";
import {
	createMutable,
	modifyMutable,
	reconcile,
	type StoreNode,
} from "solid-js/store";

const parse = (raw: string | null, initialValue: any) => {
	if (raw === null) {
		return initialValue;
	}

	try {
		const persisted = JSON.parse(raw);

		return persisted == null ? initialValue : persisted;
	} catch {
		return initialValue;
	}
};

export const createMutableLocalStorage = <T extends StoreNode = object>(
	name: string,
	initialValue?: T,
): T => {
	// Always start with initialValue to avoid hydration mismatches
	const mutable = createMutable<T>(initialValue ?? ({} as T));

	let writable = false; // Don't write to localStorage until we've loaded from it

	// Load from localStorage after mount to avoid hydration mismatches
	if (!import.meta.env.SSR) {
		onMount(() => {
			const stored = parse(localStorage.getItem(name), null);
			if (stored !== null)
				modifyMutable(mutable, reconcile(stored, { merge: true }));
			writable = true; // Now we can start writing changes
		});
	}

	createRoot(() => {
		createEffect((changed: boolean) => {
			if (!import.meta.env.SSR) {
				const json = JSON.stringify(mutable);
				if (writable && changed) localStorage.setItem(name, json);
			}
			return true;
		}, false);
	});

	if (!import.meta.env.SSR && typeof window !== "undefined")
		window.addEventListener("storage", (ev) => {
			if (ev.key === name) {
				// Prevent our own effects from running, since this is already persisted.
				writable = false;

				modifyMutable(
					mutable,
					reconcile(parse(ev.newValue, initialValue ?? {}), { merge: true }),
				);

				writable = true;
			}
		});

	return mutable;
};
