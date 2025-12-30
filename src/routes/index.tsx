import { useColorMode } from "@kobalte/core";
import { createDateNow } from "@solid-primitives/date";
import { useNavigate } from "@solidjs/router";
import clsx from "clsx";
import {
	createMemo,
	type JSX,
	onCleanup,
	onMount,
	type ParentProps,
	Show,
} from "solid-js";

import LogosDrizzle from "~icons/catppuccin/drizzle-orm";
import HeroDesktop from "~icons/heroicons/computer-desktop-20-solid";
import HeroMoon from "~icons/heroicons/moon-20-solid";
import HeroSun from "~icons/heroicons/sun-20-solid";
import IconDiscord from "~icons/logos/discord-icon";
import LogosElectron from "~icons/logos/electron";
import IconGitHub from "~icons/logos/github-icon";
import LogosGo from "~icons/logos/go";
import IconLinkedIn from "~icons/logos/linkedin-icon";
import LogosWindows from "~icons/logos/microsoft-windows-icon";
import LogosNext from "~icons/logos/nextjs-icon";
import LogosPostHog from "~icons/logos/posthog-icon";
import LogosPython from "~icons/logos/python";
import LogosReact from "~icons/logos/react";
import LogosRust from "~icons/logos/rust";
import LogosSolid from "~icons/logos/solidjs-icon";
import LogosSvelte from "~icons/logos/svelte-icon";
import LogosTailwind from "~icons/logos/tailwindcss-icon";
import LogosTauri from "~icons/logos/tauri";
import LogosTrpc from "~icons/logos/trpc";
import IconTwitter from "~icons/logos/twitter";
import LogosTypescript from "~icons/logos/typescript-icon";
import LogosVite from "~icons/logos/vitejs";
import LogosPlanetscale from "~icons/simple-icons/planetscale";
import LogosTanstack from "~icons/simple-icons/tanstack";
import LogosWgpu from "~icons/simple-icons/wgpu";

import imageUrl from "./assets/logo.jpeg";
import mattraxLogoUrl from "./assets/matrax-logo.png";
import spectaLogoUrl from "./assets/specta-logo.png";

export default function Home() {
	return (
		<Layout>
			<Header />
			<About />
			<WorkingOn />
			<Skills />
			<Experience />
			<Contact />
		</Layout>
	);
}

export const Layout = (props: ParentProps) => (
	<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
		<div class="max-w-4xl mx-auto px-6 pt-12 pb-3 sm:pb-6">
			{props.children}

			<Footer />
		</div>
	</div>
);

function Header() {
	const navigate = useNavigate();

	return (
		<header class="mb-8">
			<div class="flex flex-col md:flex-row items-center gap-8 mb-8">
				<div class="relative">
					<div class="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
					<img
						src={imageUrl}
						alt="Oscar Beaumont"
						class="relative rounded-full h-36 w-36 border-2 border-gray-50 dark:border-gray-800 shadow-sm"
						onContextMenu={(e) => {
							e.preventDefault();
							navigate("/brand");
						}}
					/>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h1 class="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
						Oscar Beaumont
					</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
						Software Engineer{" "}
						<span class="text-md font-light">
							from{" "}
							<a
								href="https://maps.app.goo.gl/5F1tMoTEUg9WpGXW8"
								target="_blank"
								rel="noopener"
								class="hover:text-[#00A5AF]"
							>
								Western Australia
							</a>
						</span>
					</p>
					<div class="flex gap-6 items-center justify-center md:justify-start">
						<SocialLink
							title="GitHub"
							href="https://github.com/oscartbeaumont"
							icon={
								<IconGitHub class="brightness-0 group-hover:brightness-100 dark:invert w-5 h-5" />
							}
							class="motion-safe:animate-[fadeIn_0.3s_0s_both]"
						/>
						<SocialLink
							title="Twitter"
							href="https://twitter.com/oscartbeaumont"
							icon={
								<IconTwitter class="brightness-0 group-hover:brightness-100 dark:invert dark:group-hover:invert-0 w-5 h-5" />
							}
							class="motion-safe:animate-[fadeIn_0.3s_0.2s_both]"
						/>
						<SocialLink
							title="LinkedIn"
							href="https://linkedin.com/in/oscartbeaumont"
							icon={
								<IconLinkedIn class="brightness-0 group-hover:brightness-100 dark:invert dark:group-hover:invert-0 w-5 h-5" />
							}
							class="motion-safe:animate-[fadeIn_0.3s_0.4s_both]"
						/>
					</div>
				</div>
			</div>
		</header>
	);
}

const SocialLink = (props: {
	href: string;
	title: string;
	icon: JSX.Element;
	class: string;
}) => (
	<a
		href={props.href}
		target="_blank"
		rel="noopener noreferrer"
		class={clsx(
			"group inline-flex items-center gap-2  text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300",
			props.class,
		)}
	>
		{props.icon}

		<span class="hidden sm:inline font-medium">{props.title}</span>
	</a>
);

function About() {
	const [now] = createDateNow();
	const yearsOfExperience = createMemo(() => now().getFullYear() - 2020);

	return (
		<section class="pb-8">
			<div class="prose prose-gray max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
				<p>
					I'm a self-taught software engineer passionate about building tools
					that empower people. With {yearsOfExperience()} years of professional
					experience working full-stack on everything from webapps to desktop
					apps while building with many languages including{" "}
					<a
						class="font-semibold hover:text-[#B7410E]"
						href="https://www.rust-lang.org"
						target="_blank"
						rel="noopener"
					>
						Rust
					</a>{" "}
					and{" "}
					<a
						class="font-semibold hover:text-[#3178C6]"
						href="https://www.typescriptlang.org"
						target="_blank"
						rel="noopener"
					>
						TypeScript
					</a>
					.
				</p>
			</div>
		</section>
	);
}

const WorkingOn = () => (
	<section class="pb-8">
		<SectionTitle>What i'm working on?</SectionTitle>

		<div class="mt-3 ml-6 space-y-3">
			<ProjectPanel
				name="Mattrax"
				description="Manage all your Windows, Apple and Android devices from one simple dashboard"
				href="https://mattrax.app"
				logo={mattraxLogoUrl}
				logoProps="dark:invert"
				right={
					<div class="flex space-x-4">
						<a
							href="https://discord.gg/WPBHmDSfAn"
							target="_blank"
							rel="noopener"
						>
							<IconDiscord class="brightness-0 dark:invert hover:brightness-100 dark:hover:invert-0 w-5 h-5 transition-colors duration-300 ease-in-out" />
						</a>
						<a href="https://github.com/mattrax" target="_blank" rel="noopener">
							<IconGitHub class="brightness-0 dark:invert hover:brightness-100 w-5 h-5 transition-colors duration-300 ease-in-out" />
						</a>
					</div>
				}
			/>
			<ProjectPanel
				name="Specta"
				description="Rust crates for building better web apps"
				href="https://specta.dev"
				logo={spectaLogoUrl}
				right={
					<div class="flex space-x-4">
						<a
							href="https://discord.com/invite/JgqH8b4ycw"
							target="_blank"
							rel="noopener"
						>
							<IconDiscord class="brightness-0 dark:invert hover:brightness-100 dark:hover:invert-0 w-5 h-5 transition-colors duration-300 ease-in-out" />
						</a>
						<a
							href="https://github.com/specta-rs"
							target="_blank"
							rel="noopener"
						>
							<IconGitHub class="brightness-0 dark:invert hover:brightness-100 w-5 h-5 transition-colors duration-300 ease-in-out" />
						</a>
					</div>
				}
			/>
		</div>
	</section>
);

const ProjectPanel = (props: {
	name: string;
	description: string;
	href: string;
	logo: string;
	logoProps?: string;
	right?: JSX.Element;
}) => (
	<div class="flex items-center justify-between gap-4 py-2">
		<a
			href={props.href}
			target="_blank"
			rel="noopener"
			class="flex items-center gap-3 flex-1 min-w-0 transition-transform duration-300 ease-in-out motion-safe:hover:translate-x-2"
		>
			<img
				src={props.logo}
				alt={`${props.name} logo`}
				class={clsx("w-12 object-contain", props.logoProps)}
			/>
			<div class="min-w-0 flex-1">
				<div class="font-semibold text-gray-900 dark:text-gray-100">
					{props.name}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">
					{props.description}
				</div>
			</div>
		</a>
		<div class="flex items-center gap-3 shrink-0">
			<div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
				{props.right}
			</div>
		</div>
	</div>
);

const SectionTitle = (props: ParentProps) => (
	<h2 class="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-8">
		{props.children}
	</h2>
);

const skills = [
	{ name: "Rust", href: "https://www.rust-lang.org", logo: LogosRust },
	{
		name: "TypeScript",
		href: "https://www.typescriptlang.org",
		logo: LogosTypescript,
	},
	{ name: "SolidJS", href: "https://www.solidjs.com", logo: LogosSolid },
	{ name: "Vite", href: "https://vitejs.dev", logo: LogosVite },
	{
		name: "Tanstack Query",
		href: "https://tanstack.com/query",
		logo: LogosTanstack,
	},
	{ name: "Tailwind", href: "https://tailwindcss.com", logo: LogosTailwind },
	{ name: "Tauri", href: "https://tauri.app", logo: LogosTauri },
	{ name: "tRPC", href: "https://trpc.io", logo: LogosTrpc },
	{ name: "Drizzle ORM", href: "https://orm.drizzle.team", logo: LogosDrizzle },
	{ name: "PostHog", href: "https://posthog.com", logo: LogosPostHog },
	{
		name: "PlanetScale",
		href: "https://planetscale.com",
		logo: LogosPlanetscale,
	},
];

const Skills = () => {
	let containerRef: HTMLDivElement | undefined;

	onMount(() => {
		const itemWidth = 120; // Approximate width of each skill item
		const singleSetWidth = itemWidth * skills.length;

		let scrollPosition = 0;
		const interval = setInterval(() => {
			if (!containerRef) return;

			scrollPosition += 1;

			// When we've scrolled past the first set, seamlessly reset to the start
			// This works because we have the skills duplicated
			if (scrollPosition >= singleSetWidth) {
				scrollPosition = 0;
			}

			containerRef!.scrollLeft = scrollPosition;
		}, 30);

		onCleanup(() => clearInterval(interval));
	});

	return (
		<section class="pb-8">
			<SectionTitle>What I use?</SectionTitle>

			<div class="relative overflow-hidden overflow-x-auto mask-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
				<div
					ref={containerRef}
					class="flex gap-6 overflow-x-hidden"
					style={{ "scroll-behavior": "auto" }}
				>
					{/* Render skills three times for seamless infinite loop */}
					{[...skills, ...skills, ...skills].map((skill) => (
						<div class="shrink-0">
							<SkillItem
								name={skill.name}
								href={skill.href}
								logo={skill.logo}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

const SkillItem = (props: {
	href: string;
	name: string;
	logo: (_: { class: string }) => JSX.Element;
}) => (
	<a
		href={props.href}
		target="_blank"
		rel="noopener"
		class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 ease-in-out group"
		title={props.name}
	>
		{props.logo({
			class:
				"w-12 h-12 object-contain grayscale group-hover:grayscale-0 transition-colors duration-300 ease-in-out",
		})}
		<span class="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300 ease-in-out">
			{props.name}
		</span>
	</a>
);

const Experience = () => (
	<section class="pb-8">
		<SectionTitle>Work Experience</SectionTitle>

		<div class="relative border-l border-neutral-200 dark:border-neutral-700 ml-3 space-y-12">
			<WorkExperienceItem
				title={
					<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#2663EB]">
						Cap.so
					</h3>
				}
				link="https://cap.so"
				position="Contractor - Full Stack"
				period="Jul 2025 — Nov 2025"
				description="Cap is the open source screen recorder and sharing tool. I worked on the desktop application and web backend including working with GPU shaders to render higher quality cursors, building a tracking system for upload progress, overhauling the recording flow UI, and moving the camera preview to native GPU rendering."
				technologies={() => (
					<>
						<WorkExperienceItemTechnology name="Tauri" logo={LogosTauri} />
						<WorkExperienceItemTechnology name="wgpu" logo={LogosWgpu} />
						<WorkExperienceItemTechnology name="Solid" logo={LogosSolid} />
						<WorkExperienceItemTechnology
							name="Tailwind"
							logo={LogosTailwind}
						/>
						<WorkExperienceItemTechnology name="Next" logo={LogosNext} />
						<WorkExperienceItemTechnology name="PostHog" logo={LogosPostHog} />
					</>
				)}
			/>

			<WorkExperienceItem
				title={
					<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#C790FF]">
						CrabNebula
					</h3>
				}
				link="https://crabnebula.dev"
				position="Contractor - Full Stack"
				period="Apr 2025 — Jun 2025"
				description="I worked on client projects and also the Specta. I worked on an AI computer control application and also ran training sessions for a development team on using Tauri effectively."
			/>

			<WorkExperienceItem
				title={
					<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:bg-linear-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 hover:from-violet-500 hover:to-fuchsia-500 bg-clip-text group-hover:text-transparent">
						Spacedrive
					</h3>
				}
				link="https://spacedrive.com"
				position="Founding Engineer - Full Stack"
				period="May 2022 — May 2024"
				description="Building the file manager for the future. I worked on building the desktop application, Rust core for filesystem operations and peer to peer networking system. I also developed the system for us to ship our Rust core inside a React Native app."
				technologies={() => (
					<>
						<WorkExperienceItemTechnology name="Tauri" logo={LogosTauri} />
						<WorkExperienceItemTechnology name="React" logo={LogosReact} />
						<WorkExperienceItemTechnology
							name="Tailwind"
							logo={LogosTailwind}
						/>
						<WorkExperienceItemTechnology
							name="React Native"
							logo={LogosReact}
						/>
					</>
				)}
			/>

			<WorkExperienceItem
				title={
					<h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700">
						Freelancer
					</h3>
				}
				period="Aug 2020 — May 2022"
				description="I worked for multiple clients to bring their vision to life. I built multiple Windows Device Management servers, a dash camera manager application in Electron and worked on a web interface for managing a telephony system."
				technologies={() => (
					<>
						<WorkExperienceItemTechnology name="Windows" logo={LogosWindows} />
						<WorkExperienceItemTechnology name="Go" logo={LogosGo} />
						<WorkExperienceItemTechnologySplit />

						<WorkExperienceItemTechnology
							name="Electron"
							logo={LogosElectron}
						/>
						<WorkExperienceItemTechnology name="Svelte" logo={LogosSvelte} />
						<WorkExperienceItemTechnologySplit />

						<WorkExperienceItemTechnology name="Next" logo={LogosNext} />
						<WorkExperienceItemTechnology
							name="Tailwind"
							logo={LogosTailwind}
						/>
						<WorkExperienceItemTechnology name="Python" logo={LogosPython} />
					</>
				)}
			/>
		</div>
	</section>
);

const WorkExperienceItem = (props: {
	title: JSX.Element;
	position?: string;
	period?: string;
	description: string;
	link?: string;
	// TODO: Change this to just `JSX.Element`. Seems to break hydration right now???
	technologies?: () => JSX.Element;
}) => (
	<div class="relative pl-8 md:pl-12 group">
		{/* Timeline dot */}
		<div class="absolute -left-1.25 top-2 h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600 ring-4 ring-white dark:ring-gray-900 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-300 transition-colors duration-200"></div>

		<div class="group transition-transform duration-200 motion-safe:hover:translate-x-1">
			<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
				<Show when={props.link} fallback={props.title}>
					<a href={props.link} target="_blank" rel="noopener">
						{props.title}
					</a>
				</Show>

				<Show when={props.period}>
					<span class="text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
						{props.period}
					</span>
				</Show>
			</div>
			<Show when={props.position}>
				<div class="text-md font-medium text-neutral-700 dark:text-neutral-300 mb-3">
					{props.position}
				</div>
			</Show>
			<p class="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm mb-4">
				{props.description}
			</p>
			<Show when={props.technologies}>
				<div class="flex flex-wrap gap-3 mt-3 items-center">
					{props.technologies?.()}
				</div>
			</Show>
		</div>
	</div>
);

const WorkExperienceItemTechnology = (props: {
	name: string;
	logo: (_: { class: string }) => JSX.Element;
}) => (
	<div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
		{props.logo({ class: "w-4 h-4" })}
		<span class="text-xs font-medium text-gray-700 dark:text-gray-300">
			{props.name}
		</span>
	</div>
);

const WorkExperienceItemTechnologySplit = () => (
	<div class="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
);

const Contact = () => (
	<section class="pb-8 mt-4">
		<div class="prose prose-gray max-w-none text-gray-600 dark:text-gray-400 leading-relaxed text-md">
			<p>
				If you'd like to collaborate or chat, feel free to email me at{" "}
				<button
					type="button"
					class="cursor-pointer hover:underline"
					onClick={(e) => {
						window.location.href = `mailto:${e.currentTarget.textContent.replace(" at ", "@")}`;
					}}
				>
					oscar at otbeaumont.me
				</button>
			</p>
		</div>
	</section>
);

function Footer() {
	const [date] = createDateNow();
	const currentYear = createMemo(() => date().getFullYear());

	return (
		<footer class="pt-8 border-t border-gray-200 dark:border-gray-700">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<p class="text-gray-500 dark:text-gray-400">
					© {currentYear()} Oscar Beaumont
				</p>

				<ThemeSwitcher />
			</div>
		</footer>
	);
}

export function ThemeSwitcher() {
	const { colorMode, setColorMode, toggleColorMode } = useColorMode();

	return (
		<div class="flex space-x-2">
			<button
				type="button"
				onClick={toggleColorMode}
				class="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
				title={`Theme: ${colorMode() === "light" ? "Light" : colorMode() === "dark" ? "Dark" : "System"} (click to cycle)`}
				aria-label={`Current theme: ${colorMode() === "light" ? "Light" : colorMode() === "dark" ? "Dark" : "System"}. Click to cycle themes.`}
			>
				{colorMode() === "light" ? (
					<HeroSun class="w-4 h-4 text-gray-700 dark:text-gray-300" />
				) : (
					<HeroMoon class="w-4 h-4 text-gray-700 dark:text-gray-300" />
				)}
			</button>
			<button
				type="button"
				onClick={() => setColorMode("system")}
				class="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
				aria-label="Use system theme"
			>
				<HeroDesktop class="w-4 h-4 text-gray-700 dark:text-gray-300" />
			</button>
		</div>
	);
}
