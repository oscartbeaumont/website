const FOCUSABLE =
	'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bring an element into view without moving the page behind an overlay. The
 * document is scroll-locked while an overlay is open, so the only thing this
 * can scroll is the overlay's own box — which is what is wanted when the
 * keyboard has just taken half the screen.
 */
function revealInsideOverlay(element: HTMLElement) {
	requestAnimationFrame(() => {
		if (!element.isConnected) return;
		element.scrollIntoView({ block: "nearest", inline: "nearest" });
	});
}

/**
 * Keep Tab inside an overlay, move focus somewhere sensible on open, and hand
 * it back to whatever was focused before when the overlay goes away.
 *
 * Overlays can stack (the edit sheet opens over the lightbox), so the trap only
 * acts while focus is already inside its own container. The overlay underneath
 * then stays out of the way instead of fighting for focus.
 */
export function trapFocus(
	container: HTMLElement | undefined,
	preferred?: HTMLElement | undefined,
): () => void {
	const previous = document.activeElement as HTMLElement | null;
	const items = () => {
		if (!container) return [];
		return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
			(element) =>
				element.offsetParent !== null || element === document.activeElement,
		);
	};

	const initial =
		preferred ??
		container?.querySelector<HTMLElement>(
			"input:not([type='file']), textarea, select",
		);
	// Focus without letting the browser scroll to it: it scrolls the *layout*
	// viewport, which on a phone means the page behind the sheet moves and the
	// field still ends up under the keyboard. The sheet is sized against the
	// visual viewport instead, and the element is revealed inside its own
	// scroll container below.
	const target = initial ?? items()[0];
	target?.focus({ preventScroll: true });
	if (target) revealInsideOverlay(target);

	const onKey = (event: KeyboardEvent) => {
		if (event.key !== "Tab" || !container) return;
		if (!container.contains(document.activeElement)) return;
		const focusable = items();
		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}
		const current = document.activeElement as HTMLElement;
		const index = focusable.indexOf(current);
		if (event.shiftKey && index <= 0) {
			event.preventDefault();
			focusable.at(-1)?.focus();
		} else if (!event.shiftKey && index === focusable.length - 1) {
			event.preventDefault();
			focusable[0].focus();
		}
	};

	document.addEventListener("keydown", onKey);
	return () => {
		document.removeEventListener("keydown", onKey);
		if (previous?.isConnected) previous.focus();
	};
}
