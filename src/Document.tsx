import { getRequestEvent, HydrationScript, isServer } from "@solidjs/web";
import type { ParentProps } from "solid-js";

export default function Document(props: ParentProps<{ nonce?: string }>) {
	const pathname = isServer
		? new URL(getRequestEvent()!.request.url).pathname
		: window.location.pathname;

	return (
		<html lang="en" class="dark:bg-gray-900 scheme-light dark:scheme-dark">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{pathname !== "/invoicer" && (
					<script
						nonce={props.nonce}
						textContent={`(()=>{const m=localStorage.getItem("kb-color-mode")||"system";document.documentElement.dataset.kbTheme=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m})()`}
					/>
				)}
				<HydrationScript nonce={props.nonce} />
				<script type="module" src="/src/entry-client.tsx" nonce={props.nonce} />
			</head>
			<body>{props.children}</body>
		</html>
	);
}
