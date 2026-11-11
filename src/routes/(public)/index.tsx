import { useNavigate } from "@solidjs/router";
import { isServer, type JSX } from "@solidjs/web";
import clsx from "clsx";
import {
	createMemo,
	createSignal,
	For,
	onSettled,
	type ParentProps,
	Show,
} from "solid-js";
import IconArrowUpRight from "~icons/heroicons/arrow-up-right20-solid.jsx";

import { createDateNow } from "../../date";
import {
	type Experience as ExperienceItem,
	experience,
	type Project,
	profile,
	projects,
	skills,
	socials,
	yearsOfExperience,
} from "../../resume-data";

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
						src={profile.photo}
						alt={profile.name}
						class="relative rounded-full h-36 w-36 border-2 border-gray-50 dark:border-gray-800 shadow-sm"
						onContextMenu={(e) => {
							e.preventDefault();
							navigate("/brand");
						}}
					/>
				</div>
				<div class="flex-1 text-center md:text-left">
					<h1 class="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
						{profile.name}
					</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
						{profile.role}{" "}
						<span class="text-md font-light">
							from{" "}
							<a
								href={profile.locationHref}
								target="_blank"
								rel="noopener"
								class="hover:text-[#00A5AF]"
							>
								{profile.homeLocation}
							</a>
						</span>
					</p>
					<div class="flex gap-6 items-center justify-center md:justify-start">
						<For each={socials}>
							{(social) => (
								<SocialLink
									title={social.title}
									href={social.href}
									icon={social.icon}
									iconClass={social.iconClass}
									class={social.animation}
								/>
							)}
						</For>
					</div>
				</div>
			</div>
		</header>
	);
}

const SocialLink = (props: {
	href: string;
	title: string;
	icon: (props: { class: string }) => JSX.Element;
	iconClass: string;
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
		{props.icon({ class: props.iconClass })}

		<span class="hidden sm:inline font-medium">{props.title}</span>
	</a>
);

function About() {
	const [now] = createDateNow();
	const years = createMemo(() => yearsOfExperience(now()));

	return (
		<section class="pb-8">
			<div class="prose prose-gray max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
				<p>
					I'm a self-taught software engineer who is passionate about building
					tools that empower people. With {years()} years of professional
					experience working on everything from webapps to desktop apps and
					building with many languages including{" "}
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

const tierOneProjects = projects.filter((project) => project.tier === 1);
const tierTwoProjects = projects.filter((project) => project.tier !== 1);

const WorkingOn = () => (
	<section class="pb-6">
		<SectionTitle compact>What i'm working on?</SectionTitle>

		<div class="mt-3 sm:ml-6">
			<For each={tierOneProjects}>
				{(project) => <FeaturedProject {...project} />}
			</For>
			<div class="mt-3 flex flex-col">
				<For each={tierTwoProjects}>
					{(project) => <ProjectRow {...project} />}
				</For>
			</div>
		</div>

		<div class="mt-4 sm:ml-6 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-2 sm:gap-x-4">
			<a
				href="https://tauri.app"
				target="_blank"
				rel="noopener"
				class="group inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
			>
				<IconLogosTauri class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
				<span>Tauri Working Group Member</span>
			</a>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<span class="text-xs font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider leading-none">
					Previously
				</span>
				<a
					href="https://github.com/oscartbeaumont/netlify-dynamic-dns"
					target="_blank"
					rel="noopener"
					class="group inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 motion-safe:animate-[spawnIn_0.4s_0s_both]"
				>
					<IconLogosNetlifyIcon class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
					<span>Netlify Dynamic DNS</span>
				</a>
				<a
					href="https://github.com/oscartbeaumont/vite-plugin-relay"
					target="_blank"
					rel="noopener"
					class="group inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 motion-safe:animate-[spawnIn_0.4s_0.1s_both]"
				>
					<IconLogosRelay class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
					<span>vite-plugin-relay</span>
				</a>
				<a
					href="https://github.com/oscartbeaumont/ElectronPlayer"
					target="_blank"
					rel="noopener"
					class="group inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 motion-safe:animate-[spawnIn_0.4s_0.2s_both]"
				>
					<IconLogosElectron class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
					<span>ElectronPlayer</span>
				</a>
			</div>
		</div>
	</section>
);

const ProjectRow = (props: Project) => {
	return (
		<div class="flex items-start gap-3 py-1">
			<a
				href={props.href}
				target="_blank"
				rel="noopener"
				class="group flex min-w-0 flex-1 flex-col transition-transform duration-300 ease-in-out motion-safe:hover:translate-x-2"
			>
				<span class="flex h-6 items-center gap-2.5">
					<img
						src={props.logo}
						alt={`${props.name} logo`}
						class={clsx("h-6 w-6 shrink-0 object-contain", props.logoClass)}
					/>
					<span class="flex min-w-0 items-center gap-1">
						<span class="truncate text-[15px] font-semibold text-gray-900 dark:text-gray-100">
							{props.name}
						</span>
						<IconArrowUpRight
							class="h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-500"
							aria-hidden="true"
						/>
					</span>
				</span>
				<span class="mt-0.5 text-[12.5px] leading-snug text-gray-600 dark:text-gray-400">
					{props.description}
				</span>
			</a>
			<div class="flex h-6 shrink-0 items-center gap-2.5">
				<For each={props.links ?? []}>
					{(link) => (
						<a
							href={link.href}
							target="_blank"
							rel="noopener"
							title={link.title}
							aria-label={link.title}
							class="flex items-center"
						>
							{link.icon({
								class:
									"brightness-0 dark:invert hover:brightness-100 dark:hover:invert-0 h-[18px] w-[18px] transition-colors duration-300 ease-in-out",
							})}
						</a>
					)}
				</For>
			</div>
		</div>
	);
};

const FeaturedProject = (props: Project) => {
	return (
		<div class="py-1">
			<div class="flex items-center justify-between gap-4">
				<a
					href={props.href}
					target="_blank"
					rel="noopener"
					class="group flex min-w-0 flex-1 items-center gap-3 transition-transform duration-300 ease-in-out motion-safe:hover:translate-x-2"
				>
					<img
						src={props.logo}
						alt={`${props.name} logo`}
						class={clsx("h-10 w-10 shrink-0 object-contain", props.logoClass)}
					/>
					<div class="min-w-0">
						<div class="flex items-center gap-1">
							<div class="text-base font-semibold text-gray-900 dark:text-gray-100">
								{props.name}
							</div>
							<IconArrowUpRight
								class="h-4 w-4 shrink-0 text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-500"
								aria-hidden="true"
							/>
						</div>
						<div class="text-[13.5px] leading-snug text-gray-600 dark:text-gray-400">
							{props.description}
						</div>
					</div>
				</a>
				<div class="flex shrink-0 items-center gap-2">
					<For each={props.links ?? []}>
						{(link) => (
							<a
								href={link.href}
								target="_blank"
								rel="noopener"
								title={link.title}
								aria-label={link.title}
								class="flex items-center"
							>
								{link.icon({
									class:
										"brightness-0 dark:invert hover:brightness-100 dark:hover:invert-0 w-5 h-5 transition-colors duration-300 ease-in-out",
								})}
							</a>
						)}
					</For>
				</div>
			</div>
			{props.subsections?.length ? (
				<div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 sm:pl-[52px]">
					<For each={props.subsections}>
						{(subsection, index) => (
							<>
								<Show when={index() > 0}>
									<span
										aria-hidden="true"
										class="text-gray-300 dark:text-gray-600"
									>
										·
									</span>
								</Show>
								<SubsectionLink {...subsection} />
							</>
						)}
					</For>
				</div>
			) : null}
		</div>
	);
};

const SubsectionLink = (props: {
	href: string;
	name: string;
	logo?: (props: { class?: string }) => JSX.Element;
	deprecated?: boolean;
}) => (
	<a
		href={props.href}
		target="_blank"
		rel="noopener"
		title={props.deprecated ? `${props.name} (deprecated)` : undefined}
		class={clsx(
			"-mx-1 -my-0.5 inline-flex items-center gap-1 rounded px-1 py-0.5 font-mono text-[11px] transition-colors duration-200",
			props.deprecated
				? "text-gray-300 line-through decoration-dotted hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800"
				: "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300",
		)}
	>
		<Show when={props.logo}>
			{(logo) => (
				<span
					class={clsx(
						"h-3 w-3 shrink-0 [&>svg]:h-3 [&>svg]:w-3",
						props.deprecated && "opacity-50",
					)}
				>
					{logo()({ class: "h-3 w-3" })}
				</span>
			)}
		</Show>
		<span>{props.name}</span>
	</a>
);

const SectionTitle = (props: ParentProps<{ compact?: boolean }>) => (
	<h2
		class={clsx(
			"text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider",
			props.compact ? "mb-4" : "mb-8",
		)}
	>
		{props.children}
	</h2>
);

const Skills = () => {
	let containerRef: HTMLDivElement | undefined;
	let wrapperRef: HTMLDivElement | undefined;

	onSettled(() => {
		let animationFrame: number | undefined;
		let clone: HTMLDivElement | undefined;
		let previousTime: number | undefined;

		animationFrame = requestAnimationFrame(() => {
			if (!containerRef || !wrapperRef) return;

			// Clone the skills container for seamless scrolling
			clone = containerRef.cloneNode(true) as HTMLDivElement;
			wrapperRef.appendChild(clone);

			const totalWidth = containerRef.scrollWidth;
			let translateX = 0;
			const pixelsPerSecond = 33;

			const step = (time: number) => {
				if (!wrapperRef) return;
				if (previousTime === undefined) previousTime = time;

				const delta = time - previousTime;
				previousTime = time;

				translateX -= (pixelsPerSecond * delta) / 1000;

				// Reset when we've scrolled one full width
				if (Math.abs(translateX) >= totalWidth) {
					translateX += totalWidth;
				}

				wrapperRef.style.transform = `translateX(${translateX}px)`;
				animationFrame = requestAnimationFrame(step);
			};

			animationFrame = requestAnimationFrame(step);
		});

		return () => {
			if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
			if (wrapperRef) wrapperRef.style.transform = "";
			clone?.remove();
		};
	});

	return (
		<section class="pb-8">
			<SectionTitle compact>What I use?</SectionTitle>

			<div class="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
				<div
					ref={wrapperRef}
					class="flex"
					style={{ "will-change": "transform" }}
				>
					<div ref={containerRef} class="flex gap-6 shrink-0">
						<For each={skills.filter((skill) => skill.featured)}>
							{(skill) => (
								<div class="shrink-0">
									<SkillItem
										name={skill.name}
										href={skill.href}
										logo={skill.logo}
									/>
								</div>
							)}
						</For>
					</div>
				</div>
			</div>
		</section>
	);
};

const SkillItem = (props: {
	href: string;
	name: string;
	logo: (props: { class: string }) => JSX.Element;
}) => (
	<a
		href={props.href}
		target="_blank"
		rel="noopener"
		class="w-24 flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 ease-in-out group"
		title={props.name}
	>
		{props.logo({
			class:
				"w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-colors duration-300 ease-in-out",
		})}
		<span class="min-h-[2rem] text-center text-xs leading-tight font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300 ease-in-out">
			{props.name}
		</span>
	</a>
);

const Experience = () => (
	<section class="pb-8">
		<SectionTitle>Work Experience</SectionTitle>

		<div class="relative border-l border-neutral-200 dark:border-neutral-700 ml-3 space-y-12">
			<For each={experience}>{(job) => <WorkExperienceItem job={job} />}</For>
		</div>
	</section>
);

const WorkExperienceItem = (props: { job: ExperienceItem }) => (
	<div class="relative pl-8 md:pl-12 group">
		{/* Timeline dot */}
		<div class="absolute -left-1.25 top-2 h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600 ring-4 ring-white dark:ring-gray-900 group-hover:bg-neutral-900 dark:group-hover:bg-neutral-300 transition-colors duration-200"></div>

		<div class="group transition-transform duration-200 motion-safe:hover:translate-x-1">
			<div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
				<Show
					when={props.job.href}
					fallback={<h3 class="text-lg font-bold">{props.job.company}</h3>}
				>
					<a href={props.job.href} target="_blank" rel="noopener">
						<h3
							class={clsx(
								"text-lg font-bold text-neutral-900 dark:text-neutral-100",
								props.job.companyClass,
							)}
						>
							{props.job.company}
						</h3>
					</a>
				</Show>

				<span class="text-sm font-mono text-gray-500 dark:text-gray-400 tabular-nums">
					{props.job.period}
				</span>
			</div>
			<Show when={props.job.company !== "Freelancer"}>
				<div class="text-md font-medium text-neutral-700 dark:text-neutral-300 mb-3">
					{props.job.position}
				</div>
			</Show>
			<p class="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm mb-4">
				{props.job.description()}
			</p>
			<Show when={props.job.technologies}>
				{(technologies) => (
					<div class="flex flex-wrap gap-3 mt-3 items-center">
						<For each={technologies()}>
							{(technology) =>
								technology === "split" ? (
									<WorkExperienceItemTechnologySplit />
								) : (
									<WorkExperienceItemTechnology
										name={technology.name}
										logo={technology.logo}
									/>
								)
							}
						</For>
					</div>
				)}
			</Show>
		</div>
	</div>
);

const WorkExperienceItemTechnology = (props: {
	name: string;
	logo: (props: { class: string }) => JSX.Element;
}) => (
	<div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
		{props.logo({ class: "w-4 h-4" })}
		<span class="text-xs font-medium text-gray-700 dark:text-gray-300 text-nowrap">
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
	const [colorMode, setMode] = createSignal<"light" | "dark" | "system">(
		isServer
			? "system"
			: ((localStorage.getItem("kb-color-mode") as
					| "light"
					| "dark"
					| "system"
					| null) ?? "system"),
	);
	const setColorMode = (mode: "light" | "dark" | "system") => {
		localStorage.setItem("kb-color-mode", mode);
		document.documentElement.dataset.kbTheme =
			mode === "system"
				? matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light"
				: mode;
		setMode(mode);
	};
	const toggleColorMode = () =>
		setColorMode(
			colorMode() === "light"
				? "dark"
				: colorMode() === "dark"
					? "system"
					: "light",
		);

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
					<IconHeroiconsSun20Solid class="w-4 h-4 text-gray-700 dark:text-gray-300" />
				) : (
					<IconHeroiconsMoon20Solid class="w-4 h-4 text-gray-700 dark:text-gray-300" />
				)}
			</button>
			<button
				type="button"
				onClick={() => setColorMode("system")}
				class="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
				aria-label="Use system theme"
			>
				<IconHeroiconsComputerDesktop20Solid class="w-4 h-4 text-gray-700 dark:text-gray-300" />
			</button>
		</div>
	);
}
