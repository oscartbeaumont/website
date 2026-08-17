// https://gist.github.com/intrnl/fc797aeaebafc12911e50debca13b0a2

import { createEffect, createRoot, createStore, type Store } from "solid-js";

function parse<T>(raw: string | null, initialValue: T): T {
	if (raw === null) return initialValue;
	try {
		return JSON.parse(raw) ?? initialValue;
	} catch {
		return initialValue;
	}
}

export const createMutableLocalStorage = <T extends object>(
	name: string,
	initialValue: T,
): T => {
	const [store, setStore] = createStore<any>(
		import.meta.env.SSR
			? initialValue
			: parse(localStorage.getItem(name), initialValue),
	);
	const proxies = new WeakMap<object, object>();
	const mutable = wrap(store as object, []) as T;

	function wrap(value: object, path: PropertyKey[]): object {
		const cached = proxies.get(value);
		if (cached) return cached;
		const proxy = new Proxy(value, {
			get(target, key) {
				const child = Reflect.get(target, key);
				if (Array.isArray(target) && key === "push")
					return (...items: unknown[]) =>
						setStore((draft) => getAtPath(draft, path).push(...items));
				if (Array.isArray(target) && key === "splice")
					return (...args: [number, number, ...unknown[]]) =>
						setStore((draft) => getAtPath(draft, path).splice(...args));
				return child && typeof child === "object"
					? wrap(child, [...path, key])
					: child;
			},
			set(_target, key, value) {
				setStore((draft) => {
					getAtPath(draft, path)[key] = value;
				});
				return true;
			},
		});
		proxies.set(value, proxy);
		return proxy;
	}

	if (!import.meta.env.SSR) {
		createRoot(() => {
			createEffect(
				() => JSON.stringify(store),
				(json) => localStorage.setItem(name, json),
			);
		});
		window.addEventListener("storage", (event) => {
			if (event.key === name)
				setStore(() => parse(event.newValue, initialValue));
		});
	}

	return mutable;
};

function getAtPath(root: Store<object>, path: PropertyKey[]): any {
	return path.reduce<any>((value, key) => value[key], root);
}
