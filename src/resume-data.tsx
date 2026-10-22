import type { JSX } from "@solidjs/web";

import imageUrl from "./assets/logo.jpeg";
import mattraxLogoUrl from "./assets/matrax-logo.png";
import spectaLogoUrl from "./assets/specta-logo.png";
import spotistatsLogoUrl from "./assets/spotistats-logo.png";
import { RspcLogo, SpectaLogo } from "./components/icons";

type Icon = (props: { class: string }) => JSX.Element;
type Logo = (props: { class?: string }) => JSX.Element;

export const profile = {
	name: "Oscar Beaumont",
	photo: imageUrl,
	role: "Software Engineer",
	location: "Perth, Western Australia",
	homeLocation: "Western Australia",
	locationHref: "https://maps.app.goo.gl/5F1tMoTEUg9WpGXW8",
	email: "oscar@otbeaumont.me",
	phone: "+61 475 424 548",
	phoneHref: "+61475424548",
	website: "otbeaumont.me",
	websiteHref: "https://otbeaumont.me",
	github: {
		label: "github.com/oscartbeaumont",
		href: "https://github.com/oscartbeaumont",
	},
	linkedin: {
		label: "linkedin.com/in/oscartbeaumont",
		href: "https://linkedin.com/in/oscartbeaumont",
	},
	twitter: {
		label: "@oscartbeaumont",
		href: "https://twitter.com/oscartbeaumont",
	},
	/** The year the professional work history starts, used to age the summary. */
	careerStart: 2020,
	summary: (years: number) =>
		`Self-taught software engineer with ${years}+ years of professional experience, building tools that make technology more useful. I work across the whole stack — from polished web and desktop interfaces to Rust cores, FFI layers and peer-to-peer networking — and enjoy the hard debugging problems in between.`,
} as const;

export function yearsOfExperience(now = new Date()) {
	return Math.max(0, now.getFullYear() - profile.careerStart);
}

export type Social = {
	title: string;
	href: string;
	icon: Icon;
	iconClass: string;
	animation: string;
};

export const socials: Social[] = [
	{
		title: "GitHub",
		href: "https://github.com/oscartbeaumont",
		icon: IconLogosGithubIcon,
		iconClass: "brightness-0 group-hover:brightness-100 dark:invert w-5 h-5",
		animation: "motion-safe:animate-[fadeIn_0.3s_0s_both]",
	},
	{
		title: "Twitter",
		href: "https://twitter.com/oscartbeaumont",
		icon: IconLogosTwitter,
		iconClass:
			"brightness-0 group-hover:brightness-100 dark:invert dark:group-hover:invert-0 w-5 h-5",
		animation: "motion-safe:animate-[fadeIn_0.3s_0.2s_both]",
	},
	{
		title: "LinkedIn",
		href: "https://linkedin.com/in/oscartbeaumont",
		icon: IconLogosLinkedinIcon,
		iconClass:
			"brightness-0 group-hover:brightness-100 dark:invert dark:group-hover:invert-0 w-5 h-5",
		animation: "motion-safe:animate-[fadeIn_0.3s_0.4s_both]",
	},
	{
		title: "Blog",
		href: "https://dev.to/oscartbeaumont",
		icon: IconSimpleIconsDevdotto,
		iconClass:
			"brightness-0 group-hover:brightness-100 dark:invert dark:group-hover:invert-0 w-5 h-5",
		animation: "motion-safe:animate-[fadeIn_0.3s_0.6s_both]",
	},
];

export type Skill = {
	name: string;
	href: string;
	logo: Icon;
	group:
		| "Languages"
		| "Frontend & tooling"
		| "Desktop & native"
		| "Backend & platform";
	/** Whether it appears in the homepage marquee. */
	featured?: boolean;
};

export const skills: Skill[] = [
	{
		name: "TypeScript",
		href: "https://www.typescriptlang.org",
		logo: IconLogosTypescriptIcon,
		group: "Languages",
		featured: true,
	},
	{
		name: "Rust",
		href: "https://www.rust-lang.org",
		logo: IconVscodeIconsFileTypeRust,
		group: "Languages",
		featured: true,
	},
	{ name: "Go", href: "https://go.dev", logo: IconLogosGo, group: "Languages" },
	{
		name: "Python",
		href: "https://www.python.org",
		logo: IconLogosPython,
		group: "Languages",
	},

	{
		name: "SolidJS",
		href: "https://www.solidjs.com",
		logo: IconLogosSolidjsIcon,
		group: "Frontend & tooling",
		featured: true,
	},
	{
		name: "React",
		href: "https://react.dev",
		logo: IconLogosReact,
		group: "Frontend & tooling",
	},
	{
		name: "Svelte",
		href: "https://svelte.dev",
		logo: IconLogosSvelteIcon,
		group: "Frontend & tooling",
	},
	{
		name: "Next.js",
		href: "https://nextjs.org",
		logo: IconLogosNextjsIcon,
		group: "Frontend & tooling",
	},
	{
		name: "Tailwind CSS",
		href: "https://tailwindcss.com",
		logo: IconLogosTailwindcssIcon,
		group: "Frontend & tooling",
		featured: true,
	},
	{
		name: "TanStack Query",
		href: "https://tanstack.com/query",
		logo: IconSimpleIconsTanstack,
		group: "Frontend & tooling",
		featured: true,
	},
	{
		name: "Vite",
		href: "https://vitejs.dev",
		logo: IconLogosVitejs,
		group: "Frontend & tooling",
		featured: true,
	},

	{
		name: "Tauri",
		href: "https://tauri.app",
		logo: IconLogosTauri,
		group: "Desktop & native",
		featured: true,
	},
	{
		name: "Electron",
		href: "https://www.electronjs.org",
		logo: IconLogosElectron,
		group: "Desktop & native",
	},
	{
		name: "React Native",
		href: "https://reactnative.dev",
		logo: IconLogosReact,
		group: "Desktop & native",
	},
	{
		name: "wgpu",
		href: "https://wgpu.rs",
		logo: IconSimpleIconsWgpu,
		group: "Desktop & native",
	},

	{
		name: "tRPC",
		href: "https://trpc.io",
		logo: IconLogosTrpc,
		group: "Backend & platform",
		featured: true,
	},
	{
		name: "Drizzle ORM",
		href: "https://orm.drizzle.team",
		logo: IconCatppuccinDrizzleOrm,
		group: "Backend & platform",
		featured: true,
	},
	{
		name: "PlanetScale",
		href: "https://planetscale.com",
		logo: IconSimpleIconsPlanetscale,
		group: "Backend & platform",
		featured: true,
	},
	{
		name: "PostHog",
		href: "https://posthog.com",
		logo: IconLogosPosthogIcon,
		group: "Backend & platform",
		featured: true,
	},
	{
		name: "Effect",
		href: "https://effect.website",
		logo: IconLogosEffect,
		group: "Backend & platform",
		featured: true,
	},
];

export const skillGroups = [
	"Languages",
	"Frontend & tooling",
	"Desktop & native",
	"Backend & platform",
] as const;

export type Technology = { name: string; logo: Icon };
export type ExperienceTechnology = Technology | "split";

export type Experience = {
	company: string;
	href?: string;
	position: string;
	period: string;
	/** Rich description used by the homepage. Lazy so SSR doesn't evaluate JSX at module scope. */
	description: () => JSX.Element;
	/** Condensed, plain-text achievements used by the resume. */
	highlights: string[];
	/** Extra technologies worth listing on the resume that don't have homepage chips. */
	resumeTech: string[];
	/** Colours the company name on hover on the homepage. */
	companyClass: string;
	technologies?: ExperienceTechnology[];
	logo?: string;
	logoClass?: string;
};

export const experience: Experience[] = [
	{
		company: "Zephyr Cloud",
		href: "https://zephyr-cloud.io",
		position: "Platform Engineer",
		period: "Jun 2026 — Nov 2026",
		description: () => (
			<>
				Zephyr Cloud builds infrastructure to deploy Module Federation and micro
				frontends, taking applications from code to globally available in under
				a second. We are also working on{" "}
				<a
					href="https://theaiplatform.app"
					target="_blank"
					rel="noopener"
					class="font-medium text-neutral-800 dark:text-neutral-200 hover:underline"
				>
					The AI Platform
				</a>{" "}
				a superapp for multi-agent, multi-human communication for maximizing
				human potential across the entire organization.
			</>
		),
		highlights: [
			"Built deployment infrastructure for Module Federation and micro frontends, taking applications from code to globally available in under a second.",
			"Worked across platform and product on The AI Platform, a superapp for multi-agent, multi-human communication.",
		],
		resumeTech: ["TypeScript", "Module Federation", "Micro frontends"],
		companyClass: "group-hover:text-black dark:group-hover:text-white",
	},
	{
		company: "Cap.so",
		href: "https://cap.so",
		position: "Contractor — Full Stack",
		period: "Jul 2025 — Nov 2025",
		description: () =>
			"Cap is an open source screen recording and sharing tool. I worked on the desktop application and web backend including working with GPU shaders to render higher quality cursors, building a tracking system for the progress of uploading files, overhauling the recording flow GUI, and moving the camera preview to native GPU rendering.",
		highlights: [
			"Worked on the desktop app and web backend for an open-source screen recording and sharing tool.",
			"Used GPU shaders to render higher-quality cursors and moved the camera preview to native GPU rendering.",
			"Built upload progress tracking and overhauled the recording flow GUI.",
		],
		resumeTech: [
			"Tauri",
			"wgpu",
			"Solid",
			"Tailwind CSS",
			"Next.js",
			"PostHog",
		],
		companyClass: "group-hover:text-[#2663EB]",
		technologies: [
			{ name: "Tauri", logo: IconLogosTauri },
			{ name: "wgpu", logo: IconSimpleIconsWgpu },
			{ name: "Solid", logo: IconLogosSolidjsIcon },
			{ name: "Tailwind", logo: IconLogosTailwindcssIcon },
			{ name: "Next", logo: IconLogosNextjsIcon },
			{ name: "PostHog", logo: IconLogosPosthogIcon },
		],
	},
	{
		company: "CrabNebula",
		href: "https://crabnebula.dev",
		position: "Contractor — Full Stack",
		period: "Apr 2025 — Jun 2025",
		description: () =>
			"I worked on client projects, conducted Rust training sessions and contributed to open-source. I contributed to an AI chat-based computer automation application built in Tauri and also conducted training sessions for a 8-15 person development team on using Tauri and Rust effectively.",
		highlights: [
			"Delivered client projects and contributed to open source, including an AI chat-based computer automation app built with Tauri.",
			"Ran Rust and Tauri training sessions for an 8–15 person development team.",
		],
		resumeTech: ["Rust", "Tauri", "TypeScript"],
		companyClass: "group-hover:text-[#C790FF]",
	},
	{
		company: "Spacedrive",
		href: "https://spacedrive.com",
		position: "Founding Engineer — Full Stack",
		period: "May 2022 — May 2024",
		description: () =>
			"Building the file manager for the future. I worked on building the desktop application, Rust core for filesystem operations and peer to peer networking system. I also developed the system for us to ship our Rust core inside a React Native app.",
		highlights: [
			"Built the desktop app, the Rust core for filesystem operations and the peer-to-peer networking system.",
			"Designed the system that ships the Rust core inside a React Native app, including the FFI layer.",
		],
		resumeTech: ["Rust", "Tauri", "React", "React Native", "Tailwind CSS"],
		companyClass:
			"group-hover:bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 bg-clip-text group-hover:text-transparent",
		technologies: [
			{ name: "Tauri", logo: IconLogosTauri },
			{ name: "React", logo: IconLogosReact },
			{ name: "Tailwind", logo: IconLogosTailwindcssIcon },
			{ name: "React Native", logo: IconLogosReact },
		],
	},
	{
		company: "Freelancer",
		position: "Contractor — Full Stack",
		period: "Aug 2020 — May 2022",
		description: () =>
			"I worked with multiple clients to bring their vision to life. I built multiple Windows Device Management servers, a car dash camera manager application in Electron and worked on a modern web interface for managing a telephony system.",
		highlights: [
			"Built Windows device management servers, an Electron dashcam manager and a modern web interface for a telephony system.",
			"Worked directly with clients to turn their requirements into shipped software.",
		],
		resumeTech: [
			"Go",
			"Windows",
			"Electron",
			"Svelte",
			"Next.js",
			"Tailwind CSS",
			"Python",
		],
		companyClass:
			"group-hover:text-neutral-700 dark:group-hover:text-neutral-300",
		technologies: [
			{ name: "Windows", logo: IconLogosMicrosoftWindowsIcon },
			{ name: "Go", logo: IconLogosGo },
			"split",
			{ name: "Electron", logo: IconLogosElectron },
			{ name: "Svelte", logo: IconLogosSvelteIcon },
			"split",
			{ name: "Next", logo: IconLogosNextjsIcon },
			{ name: "Tailwind", logo: IconLogosTailwindcssIcon },
			{ name: "Python", logo: IconLogosPython },
		],
	},
];

export type ProjectSubsection = {
	name: string;
	href: string;
	logo?: Logo;
	deprecated?: boolean;
};

export type Project = {
	name: string;
	description: string;
	href: string;
	logo: string;
	logoClass?: string;
	links?: { href: string; title: string; icon: Icon }[];
	subsections?: ProjectSubsection[];
};

export const projects: Project[] = [
	{
		name: "Specta",
		description: "Rust crates for building better web apps",
		href: "https://specta.dev",
		logo: spectaLogoUrl,
		links: [
			{
				href: "https://discord.com/invite/JgqH8b4ycw",
				title: "Discord",
				icon: IconLogosDiscordIcon,
			},
			{
				href: "https://github.com/specta-rs",
				title: "GitHub",
				icon: IconLogosGithubIcon,
			},
		],
		subsections: [
			{
				name: "specta",
				href: "https://github.com/specta-rs/specta",
				logo: SpectaLogo,
			},
			{
				name: "tauri-specta",
				href: "https://github.com/specta-rs/tauri-specta",
				logo: IconLogosTauri,
			},
			{
				name: "tauri-plugin-midi",
				href: "https://github.com/specta-rs/tauri-plugin-midi",
				logo: IconSimpleIconsMidi,
			},
			{
				name: "rspc",
				href: "https://github.com/specta-rs/rspc",
				logo: RspcLogo,
				deprecated: true,
			},
		],
	},
	{
		name: "Mattrax",
		description:
			"Manage all your Windows, Apple and Android devices from one simple dashboard",
		href: "https://mattrax.app",
		logo: mattraxLogoUrl,
		logoClass: "dark:invert",
		links: [
			{
				href: "https://discord.gg/WPBHmDSfAn",
				title: "Discord",
				icon: IconLogosDiscordIcon,
			},
			{
				href: "https://github.com/mattrax",
				title: "GitHub",
				icon: IconLogosGithubIcon,
			},
		],
	},
	{
		name: "Spotistats",
		description: "Analyse and backup your music on Spotify",
		href: "https://spotistats.otbeaumont.me",
		logo: spotistatsLogoUrl,
		links: [
			{
				href: "https://github.com/oscartbeaumont/spotistats",
				title: "GitHub",
				icon: IconLogosGithubIcon,
			},
		],
	},
];

export type Education = {
	qualification: string;
	institution: string;
	period: string;
	location: string;
};

export const education: Education[] = [
	{
		qualification: "High School Diploma",
		institution: "Bunbury Cathedral Grammar School",
		period: "2020",
		location: "Bunbury, WA",
	},
];

export type Award = {
	title: string;
	year: string;
};

export const awards: Award[] = [
	{ title: "ADF Future Innovators Award", year: "2020" },
];
