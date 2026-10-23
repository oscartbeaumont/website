const NON_TEXT_INPUTS = new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset",
]);

/** Whether focusing this element is what brings the keyboard up. */
export function opensKeyboard(element: Element | null): boolean {
	if (element instanceof HTMLInputElement)
		return !NON_TEXT_INPUTS.has(element.type);
	return (
		element instanceof HTMLTextAreaElement ||
		(element instanceof HTMLElement && element.isContentEditable)
	);
}

/**
 * Mirror the visual viewport into `--visual-viewport-height`.
 *
 * iOS opens the keyboard without resizing the layout viewport: `dvh` and every
 * percentage height keep the height they had, so a sheet sized in `dvh` keeps
 * its fields behind the keyboard, and the page underneath ends up scrolled
 * somewhere nobody asked for. The visual viewport is the only thing that
 * reports the room that is actually left.
 *
 * The value is in layout pixels: multiplying by the scale converts a zoomed
 * viewport back to the units the rest of the stylesheet uses, and a pinch-zoom
 * is left alone entirely rather than chased.
 */
export function trackVisualViewport(): () => void {
	const root = document.documentElement;
	const viewport = window.visualViewport;

	const apply = (height: number) => {
		const next = `${Math.round(height)}px`;
		if (root.style.getPropertyValue("--visual-viewport-height") !== next)
			root.style.setProperty("--visual-viewport-height", next);
	};

	const update = () => {
		if (!viewport || viewport.scale > 1) return;
		apply(viewport.height * viewport.scale);
	};

	// `blur` lands before the keyboard has finished going away, so the height is
	// put back from the layout viewport instead of waiting for a resize event
	// that arrives a frame or two later. Focus moving straight to another field
	// means the keyboard is staying, so that case is left alone.
	const onBlur = (event: FocusEvent) => {
		if (!opensKeyboard(event.target as Element | null)) return;
		requestAnimationFrame(() => {
			if (!opensKeyboard(document.activeElement)) apply(root.clientHeight);
		});
	};

	update();
	viewport?.addEventListener("resize", update);
	viewport?.addEventListener("scroll", update);
	window.addEventListener("blur", onBlur, true);
	window.addEventListener("orientationchange", update);

	return () => {
		viewport?.removeEventListener("resize", update);
		viewport?.removeEventListener("scroll", update);
		window.removeEventListener("blur", onBlur, true);
		window.removeEventListener("orientationchange", update);
	};
}
