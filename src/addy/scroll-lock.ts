/**
 * Lock page scrolling while an overlay is open.
 *
 * `overflow: hidden` on the body is what stops the page moving: CSS hands the
 * body's overflow to the viewport, so the document stops being scrollable
 * without losing where it was. The scroll position is checked on the way out
 * anyway — iOS has been known to drop it when the body stops scrolling, and the
 * page reappearing at the top after closing a photo is exactly the kind of state
 * this is here to prevent.
 *
 * Overlays can stack (the edit sheet opens on top of the lightbox), and they
 * can close out of order, so the original value is restored by the last one out
 * rather than by whoever opened first.
 */
let locks = 0;
let previous = "";
let openingY = 0;

export function lockBodyScroll(): () => void {
	if (locks === 0) {
		previous = document.body.style.overflow;
		openingY = window.scrollY;
		document.body.style.overflow = "hidden";
	}
	locks++;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		locks = Math.max(0, locks - 1);
		if (locks > 0) return;
		document.body.style.overflow = previous;
		if (Math.abs(window.scrollY - openingY) > 1) window.scrollTo(0, openingY);
	};
}
