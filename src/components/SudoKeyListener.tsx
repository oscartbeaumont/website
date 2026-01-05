import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, onCleanup } from "solid-js";

const SEQUENCE = "!sudo";
const TIMEOUT = 3000; // 3 seconds

export function SudoKeyListener() {
	const navigate = useNavigate();
	const [keyBuffer, setKeyBuffer] = createSignal("");
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const resetBuffer = () => {
		setKeyBuffer("");
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		// Ignore if user is typing in an input field
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement ||
			(event.target as HTMLElement).contentEditable === "true"
		) {
			return;
		}

		// Ignore modifier keys
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

		const key = event.key;
		const currentBuffer = keyBuffer();

		// Add the new key to the buffer
		const newBuffer = currentBuffer + key;
		setKeyBuffer(newBuffer);

		// Reset timeout
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(resetBuffer, TIMEOUT);

		// Check if we have the complete sequence
		if (newBuffer === SEQUENCE) {
			resetBuffer();
			navigate("/sudo");
			return;
		}

		// Keep only the last characters that could be part of the sequence
		if (newBuffer.length > SEQUENCE.length) {
			setKeyBuffer(newBuffer.slice(-SEQUENCE.length));
		}

		// If the current buffer doesn't match the beginning of the sequence, reset
		if (!SEQUENCE.startsWith(newBuffer)) {
			resetBuffer();
		}
	};

	onMount(() => {
		document.addEventListener("keydown", handleKeyDown);
	});

	onCleanup(() => {
		document.removeEventListener("keydown", handleKeyDown);
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
	});

	// This component doesn't render anything
	return null;
}
