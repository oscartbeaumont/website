import type { JSX } from "@solidjs/web";

export type IconName =
	| "arrow-left"
	| "arrow-right"
	| "close"
	| "download"
	| "upload"
	| "pencil"
	| "trash"
	| "lock"
	| "sparkle"
	| "moon"
	| "sun"
	| "pin"
	| "check"
	| "camera"
	| "compass"
	| "star";

const paths: Record<IconName, () => JSX.Element> = {
	"arrow-left": () => <path d="M15 5l-7 7 7 7" />,
	"arrow-right": () => <path d="M9 5l7 7-7 7" />,
	close: () => <path d="M6 6l12 12M18 6L6 18" />,
	download: () => (
		<>
			<path d="M12 3v12" />
			<path d="M7 10l5 5 5-5" />
			<path d="M4 20h16" />
		</>
	),
	upload: () => (
		<>
			<path d="M12 20V8" />
			<path d="M7 13l5-5 5 5" />
			<path d="M4 4h16" />
		</>
	),
	pencil: () => (
		<>
			<path d="M4 20l4-1 10-10-3-3L5 16l-1 4z" />
			<path d="M13.5 6.5l3 3" />
		</>
	),
	trash: () => (
		<>
			<path d="M4 7h16" />
			<path d="M9 7V4h6v3" />
			<path d="M6 7l1 13h10l1-13" />
		</>
	),
	lock: () => (
		<>
			<rect x="5" y="10" width="14" height="10" rx="2" />
			<path d="M8 10V7a4 4 0 018 0v3" />
		</>
	),
	sparkle: () => (
		<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
	),
	moon: () => <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
	sun: () => (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
		</>
	),
	pin: () => (
		<>
			<path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
			<circle cx="12" cy="10" r="2.5" />
		</>
	),
	check: () => <path d="M4 12l5 5L20 6" />,
	camera: () => (
		<>
			<path d="M4 8h3l2-3h6l2 3h3v11H4z" />
			<circle cx="12" cy="13" r="4" />
		</>
	),
	compass: () => (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
		</>
	),
	star: () => (
		<path d="M12 4l2.4 5.2 5.6.7-4.1 3.9 1 5.6-4.9-2.8-4.9 2.8 1-5.6L4 9.9l5.6-.7L12 4z" />
	),
};

export function Icon(props: {
	name: IconName;
	size?: number;
	class?: string;
}): JSX.Element {
	return (
		<svg
			class={props.class}
			width={props.size ?? 20}
			height={props.size ?? 20}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			{paths[props.name]()}
		</svg>
	);
}
