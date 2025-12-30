import type { ParentProps } from "solid-js";
import { Layout } from "./index";

export default function Brand() {
	return (
		<Layout>
			<Header />
			<Assets />
		</Layout>
	);
}

const Header = () => (
	<header class="mb-8">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 mb-4 text-sm font-medium"
		>
			<span>←</span>
			<span>Back to Home</span>
		</a>
		<h1 class="text-5xl md:text-6xl font-bold mb-3 tracking-tight text-gray-900 dark:text-gray-100">
			Brand Assets
		</h1>
		<p class="text-xl text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
			Logos, photos, and other media assets
		</p>
	</header>
);

const SectionTitle = (props: ParentProps) => (
	<h2 class="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-8">
		{props.children}
	</h2>
);

interface Asset {
	filename: string;
	path: string;
	type: "image" | "vector" | "other";
}

const assets: Asset[] = [
	{
		filename: "OscarBeaumontLogo-White.png",
		path: "/assets/OscarBeaumontLogo-White.png",
		type: "image",
	},
	{
		filename: "OscarBeaumontLogo.ai",
		path: "/assets/OscarBeaumontLogo.ai",
		type: "vector",
	},
	{
		filename: "OscarBeaumontLogo.png",
		path: "/assets/OscarBeaumontLogo.png",
		type: "image",
	},
	{ filename: "logo-splat.gif", path: "/assets/logo-splat.gif", type: "image" },
	{ filename: "logo.gif", path: "/assets/logo.gif", type: "image" },
	{ filename: "logo.ico", path: "/assets/logo.ico", type: "image" },
	{ filename: "logo.png", path: "/assets/logo.png", type: "image" },
	{
		filename: "me-original.jpg",
		path: "/assets/me-original.jpg",
		type: "image",
	},
	{ filename: "me.jpg", path: "/assets/me.jpg", type: "image" },
	{ filename: "me2.jpg", path: "/assets/me2.jpg", type: "image" },
	{
		filename: "minecraft-skin.png",
		path: "/assets/minecraft-skin.png",
		type: "image",
	},
	{ filename: "oscar-tall.jpg", path: "/assets/oscar-tall.jpg", type: "image" },
	{ filename: "oscar.jpg", path: "/assets/oscar.jpg", type: "image" },
	{ filename: "smaller.png", path: "/assets/smaller.png", type: "image" },
	{ filename: "wallpaper.jpeg", path: "/assets/wallpaper.jpeg", type: "image" },
	{ filename: "wallpaper2.jpg", path: "/assets/wallpaper2.jpg", type: "image" },
];

const Assets = () => (
	<section class="pb-8">
		<SectionTitle>Available Assets</SectionTitle>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{assets.map((asset) => (
				<AssetCard asset={asset} />
			))}
		</div>
	</section>
);

const AssetCard = (props: { asset: Asset }) => (
	<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-200 bg-white dark:bg-gray-800">
		<div class="bg-gray-50 dark:bg-gray-900/50 p-4 flex items-center justify-center min-h-[200px] border-b border-gray-100 dark:border-gray-700">
			{props.asset.type === "image" ? (
				<img
					src={props.asset.path}
					alt={props.asset.filename}
					class="max-h-[180px] max-w-full object-contain"
				/>
			) : (
				<div class="flex items-center justify-center text-gray-400 dark:text-gray-500">
					<span class="text-4xl">{getFileIcon(props.asset.type)}</span>
				</div>
			)}
		</div>
		<div class="p-4">
			<div
				class="font-medium text-gray-900 dark:text-gray-100 mb-3 truncate"
				title={props.asset.filename}
			>
				{props.asset.filename}
			</div>
			<div class="flex gap-2">
				<a
					href={props.asset.path}
					download={props.asset.filename}
					class="flex-1 text-center px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
				>
					Download
				</a>
				<a
					href={props.asset.path}
					target="_blank"
					rel="noopener"
					class="flex-1 text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
				>
					View
				</a>
			</div>
		</div>
	</div>
);

function getFileIcon(type: string): string {
	switch (type) {
		case "vector":
			return "📐";
		case "image":
			return "🖼️";
		default:
			return "📄";
	}
}
