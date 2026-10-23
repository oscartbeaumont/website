import { getRequestEvent, HydrationScript, isServer } from "@solidjs/web";
import type { ParentProps } from "solid-js";
import { isAddySite } from "./host";

export default function Document(props: ParentProps<{ nonce?: string }>) {
	const pathname = isServer
		? new URL(getRequestEvent()!.request.url).pathname
		: window.location.pathname;

	/**
	 * The album is the one page that opts into the whole screen. Its top bar and
	 * footer carry the notch and the home indicator themselves, so it needs
	 * `viewport-fit=cover` — without it every `env(safe-area-inset-*)` in its
	 * stylesheet resolves to `0px` and the bar slides under the clock on the
	 * phones that have one.
	 *
	 * The rest of the site keeps the automatic insets: nothing else is built to
	 * paint under the bars, and the standalone Addy domain serves the album from
	 * its root.
	 */
	const album = pathname === "/addy" || (pathname === "/" && isAddySite());

	return (
		<html lang="en" class="dark:bg-gray-900 scheme-light dark:scheme-dark">
			<head>
				<meta charset="utf-8" />
				<meta
					name="viewport"
					content={
						album
							? "width=device-width, initial-scale=1, viewport-fit=cover"
							: "width=device-width, initial-scale=1"
					}
				/>
				{pathname !== "/invoicer" && (
					<script
						nonce={props.nonce}
						textContent={`(()=>{const m=localStorage.getItem("kb-color-mode")||"system";document.documentElement.dataset.kbTheme=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m})()`}
					/>
				)}
				<HydrationScript nonce={props.nonce} />
				<script type="module" src="/src/entry-client.tsx" nonce={props.nonce} />
			</head>
			{/* The class is what lets the album colour the page behind itself, so
			    overscroll shows paper rather than the browser's white. */}
			<body class={album ? "addy-page" : undefined}>{props.children}</body>
		</html>
	);
}
