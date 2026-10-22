import { Meta, Title } from "@solidjs/meta";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import { For } from "solid-js";

import {
	awards,
	education,
	experience,
	profile,
	projects,
	skillGroups,
	skills,
	yearsOfExperience,
} from "../../resume-data";

const openSource = [
	{
		name: "specta",
		description: "Type-safe IPC and code generation for Rust applications.",
		href: "https://github.com/specta-rs/specta",
	},
	{
		name: "tauri-specta",
		description: "Generate TypeScript bindings for Tauri commands.",
		href: "https://github.com/specta-rs/tauri-specta",
	},
	{
		name: "tauri-plugin-midi",
		description: "MIDI input and output for Tauri applications.",
		href: "https://github.com/specta-rs/tauri-plugin-midi",
	},
	{
		name: "rspc",
		description: "End-to-end typesafe APIs for Rust and TypeScript; archived.",
		href: "https://github.com/specta-rs/rspc",
	},
];

export default function Resume() {
	const years = yearsOfExperience();
	const updated = new Date().toLocaleDateString("en-AU", {
		month: "long",
		year: "numeric",
	});
	const selectedProjects = projects.filter((project) =>
		["Specta", "Spotistats"].includes(project.name),
	);

	return (
		<div class="min-h-screen bg-[#edf1f4] px-3 py-4 font-[Inter_Variable,ui-sans-serif,system-ui,sans-serif] text-[#18232e] antialiased sm:px-5 sm:py-7 print:bg-white print:p-0">
			<Title>Oscar Beaumont — Resume</Title>
			<Meta
				name="description"
				content="Resume for Oscar Beaumont, a software engineer from Western Australia."
			/>

			<div class="mx-auto mb-3 flex w-full max-w-[210mm] items-center justify-between gap-4 print:hidden">
				<a
					class="text-[13px] font-semibold text-[#43515b] no-underline transition-colors hover:text-[#275d8c]"
					href="/"
				>
					← otbeaumont.me
				</a>
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-2 border-0 bg-[#18232e] px-4 py-2.5 font-[inherit] text-xs font-semibold text-white transition-colors hover:bg-[#275d8c]"
					onClick={() => window.print()}
					title="Open the print dialog and choose “Save as PDF”"
				>
					Download PDF
				</button>
			</div>

			<main
				id="resume"
				class="mx-auto box-border flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white px-5 pt-7 pb-1 font-[Inter_Variable,ui-sans-serif,system-ui,sans-serif] shadow-[0_12px_40px_-24px_rgb(24_35_46_/_0.35)] sm:px-10 print:min-h-[297mm] print:w-[210mm] print:max-w-none print:px-10 print:shadow-none print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]"
			>
				<header class="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-5 pb-2.5 sm:grid-cols-[120px_minmax(0,1fr)] print:grid-cols-[120px_minmax(0,1fr)]">
					<img
						src={profile.photo}
						alt={profile.name}
						width="120"
						height="136"
						class="aspect-[120/136] w-full object-cover"
					/>
					<div class="flex min-w-0 flex-col gap-[7px]">
						<p class="m-0 font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] tracking-[0.51px] text-[#275d8c] uppercase">
							Curriculum Vitae
						</p>
						<h1 class="m-0 font-[Manrope_Variable,ui-sans-serif,sans-serif] text-[26px] leading-none font-extrabold tracking-[-0.045em] text-[#18232e] sm:text-[38px] print:text-[38px]">
							{profile.name}
						</h1>
						<p class="m-0 text-[9.3px] leading-3 font-extrabold tracking-[0.88px] text-[#275d8c] uppercase">
							{profile.role} &nbsp;·&nbsp; {profile.location}
						</p>
						<p class="m-0 text-[10.8px] leading-[15px] text-[#43515b]">
							{profile.summary(years)}
						</p>
					</div>
				</header>

				<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-[#dce3e8] py-[9px] sm:flex-nowrap sm:gap-x-1.5 print:flex-nowrap print:gap-x-1.5">
					<ContactLink
						icon="mail"
						href={`mailto:${profile.email}`}
						label={profile.email}
					/>
					<ContactLink
						icon="phone"
						href={`tel:${profile.phoneHref}`}
						label={profile.phone}
					/>
					<ContactLink
						icon="globe"
						href={profile.websiteHref}
						label={profile.website}
					/>
					<ContactLink
						icon="github"
						href={profile.github.href}
						label="oscartbeaumont"
						title="GitHub: oscartbeaumont"
					/>
					<ContactLink
						icon="linkedin"
						href={profile.linkedin.href}
						label="oscartbeaumont"
						title="LinkedIn: oscartbeaumont"
					/>
				</div>

				<section class="mt-[5px]">
					<SectionHeading number="01" label="Experience" />
					<div class="mt-[7px] flex flex-col">
						<For each={experience}>
							{(job, index) => (
								<article class="grid grid-cols-[22px_minmax(0,1fr)] items-start gap-x-2.5 gap-y-2 py-[11px] sm:grid-cols-[22px_144px_minmax(0,1fr)] print:break-inside-avoid print:grid-cols-[22px_144px_minmax(0,1fr)]">
									<div class="flex h-[18px] w-[22px] items-center justify-center rounded-[3px] bg-[#eaf1f7] font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-none font-semibold text-[#275d8c]">
										{String(index() + 1).padStart(2, "0")}
									</div>
									<div class="flex min-w-0 flex-col gap-1 border-l border-[#d6e3ed] pl-[9px]">
										<h3 class="m-0 text-xs leading-[15px] font-bold text-[#18232e]">
											{job.company}
										</h3>
										<p class="m-0 text-[9.3px] leading-[13px] text-[#687783]">
											{job.company === "Spacedrive" ? (
												<>
													Founding Engineer —<br />
													Full Stack
												</>
											) : (
												job.position
											)}
										</p>
										<p class="m-0 font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] text-[#275d8c]">
											{job.period.toUpperCase()}
										</p>
									</div>
									<div class="col-start-2 flex min-w-0 flex-col gap-[5px] sm:col-start-auto print:col-start-auto">
										<ul class="m-0 flex list-none flex-col gap-0.5 p-0 text-[11.1px] leading-4 text-[#18232e]">
											<For each={job.highlights}>
												{(highlight) => (
													<li class="grid grid-cols-[9px_minmax(0,1fr)] items-start gap-[5px]">
														<span
															aria-hidden="true"
															class="text-[10.32px] leading-[14px] font-semibold text-[#275d8c]"
														>
															—
														</span>
														<span>{highlight}</span>
													</li>
												)}
											</For>
										</ul>
										<p class="m-0 pt-0.5 pl-[14px] font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] text-[#687783]">
											{job.resumeTech.join(" · ").toUpperCase()}
										</p>
									</div>
								</article>
							)}
						</For>
					</div>
				</section>

				<section class="mt-[5px]">
					<SectionHeading number="02" label="Technical Range" />
					<div class="mt-2.5 grid grid-cols-2 items-start gap-[18px] sm:grid-cols-4 print:grid-cols-4">
						<For each={skillGroups}>
							{(group) => (
								<div class="flex min-w-0 flex-col gap-1.5">
									<h3 class="m-0 font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] font-semibold text-[#275d8c] uppercase">
										{group === "Frontend & tooling"
											? "Frontend"
											: group === "Desktop & native"
												? "Desktop"
												: group === "Backend & platform"
													? "Platform"
													: group}
									</h3>
									<p class="m-0 text-[9.3px] leading-[14px] text-[#43515b]">
										{skills
											.filter((skill) => skill.group === group)
											.map((skill) => skill.name)
											.join(" · ")}
									</p>
								</div>
							)}
						</For>
					</div>
				</section>

				<section class="mt-[5px]">
					<SectionHeading number="03" label="Open Source" />
					<div class="mt-[7px]">
						<For each={selectedProjects}>
							{(project) => (
								<ProjectRow
									kind="Project"
									name={project.name}
									description={`${project.description}.`}
									href={project.href}
									domain={new URL(project.href).host.replace(/^www\./, "")}
								/>
							)}
						</For>
						<For each={openSource}>
							{(project) => (
								<ProjectRow
									kind="Open Source"
									name={project.name}
									description={project.description}
									href={project.href}
								/>
							)}
						</For>
					</div>
				</section>

				<section class="mt-[5px] print:break-inside-avoid">
					<SectionHeading number="04" label="Education & Award" />
					<div class="mt-[7px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:flex-row print:items-center print:justify-between">
						<For each={education}>
							{(item) => (
								<div class="flex min-w-0 flex-1 items-start gap-3">
									<span class="w-7 shrink-0 pt-0.5 font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] font-semibold text-[#275d8c]">
										{item.period}
									</span>
									<div class="min-w-0">
										<h3 class="m-0 text-[10.3px] leading-[13px] font-bold text-[#18232e]">
											{item.institution}
										</h3>
										<p class="m-0 text-[9.3px] leading-[14px] text-[#687783]">
											{item.qualification}&nbsp; · &nbsp;{item.location}
										</p>
									</div>
								</div>
							)}
						</For>
						<For each={awards}>
							{(award) => (
								<div class="flex shrink-0 flex-col gap-0.5 bg-[#eaf1f7] px-2.5 py-[7px] sm:w-[228px] print:w-[228px]">
									<span class="font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] text-[#275d8c] uppercase">
										Award
									</span>
									<span class="text-[9.3px] leading-[13px] font-bold text-[#18232e]">
										{award.title}&nbsp; · &nbsp;{award.year}
									</span>
								</div>
							)}
						</For>
					</div>
				</section>

				<footer class="mt-[5px] flex justify-between border-t border-[#dce3e8] pt-[7px] font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-[14px] tracking-[0.22px] text-[#687783]">
					<span>{profile.website}/resume</span>
					<span>Updated {updated}</span>
				</footer>
			</main>
		</div>
	);
}

function ContactLink(props: {
	icon: "mail" | "phone" | "globe" | "github" | "linkedin";
	href: string;
	label: string;
	title?: string;
}) {
	return (
		<a
			href={props.href}
			title={props.title}
			aria-label={props.title}
			class="inline-flex shrink-0 items-center gap-1.5 text-[10px] leading-3 text-[#43515b] no-underline hover:text-[#275d8c] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#275d8c]"
		>
			<svg
				class="size-[11px] shrink-0 text-[#275d8c]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{props.icon === "mail" && (
					<>
						<rect x="2" y="4" width="20" height="16" rx="2" />
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
					</>
				)}
				{props.icon === "phone" && (
					<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z" />
				)}
				{props.icon === "globe" && (
					<>
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
					</>
				)}
				{props.icon === "github" && (
					<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22" />
				)}
				{props.icon === "linkedin" && (
					<>
						<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
						<rect x="2" y="9" width="4" height="12" />
						<circle cx="4" cy="4" r="2" />
					</>
				)}
			</svg>
			{props.label}
		</a>
	);
}

function SectionHeading(props: { number: string; label: string }) {
	return (
		<div class="flex items-center gap-[9px] py-[7px] print:break-after-avoid">
			<span class="font-[IBM_Plex_Mono,monospace] text-[9.3px] leading-3 text-[#275d8c]">
				{props.number}
			</span>
			<h2 class="m-0 text-[10.2px] leading-[13px] font-extrabold tracking-[0.75px] text-[#18232e] uppercase">
				{props.label}
			</h2>
			<div class="h-px flex-1 bg-[#dce3e8]" />
		</div>
	);
}

function ProjectRow(props: {
	kind: string;
	name: string;
	description: string;
	href: string;
	domain?: string;
}) {
	return (
		<div class="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-2 py-[3px] text-[9.3px] leading-[13px] shadow-[inset_0_-1px_0_#dce3e8] last:shadow-none sm:grid-cols-[72px_110px_minmax(0,1fr)_145px] print:break-inside-avoid print:grid-cols-[72px_110px_minmax(0,1fr)_145px]">
			<span class="font-[IBM_Plex_Mono,monospace] text-[#687783] uppercase">
				{props.kind}
			</span>
			<a
				class="col-start-2 font-[Manrope_Variable,ui-sans-serif,sans-serif] text-[10px] leading-[14px] font-bold text-[#18232e] no-underline hover:text-[#275d8c]"
				href={props.href}
				target="_blank"
				rel="noopener"
			>
				{props.name}
			</a>
			<span class="col-span-2 col-start-1 min-w-0 text-[9.4px] text-[#43515b] sm:col-span-1 sm:col-start-auto print:col-span-1 print:col-start-auto">
				{props.description}
			</span>
			<span class="hidden font-[IBM_Plex_Mono,monospace] text-[#687783] sm:inline print:inline">
				{props.domain}
			</span>
		</div>
	);
}
