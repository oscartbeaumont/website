/**
 * Lock page scrolling while an overlay is open.
 *
 * Overlays can stack (the edit sheet opens on top of the lightbox), and they
 * can close out of order, so the original value has to be restored by the last
 * one out rather than by whoever opened first.
 */
let locks = 0;
let previous = "";

export function lockBodyScroll(): () => void {
	if (locks === 0) {
		previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
	}
	locks++;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		locks = Math.max(0, locks - 1);
		if (locks === 0) document.body.style.overflow = previous;
	};
}
