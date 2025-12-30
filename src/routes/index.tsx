import { type JSX, createMemo, Show, type ParentProps } from "solid-js";
import { createDate,
  createDateNow,
createTimeAgo } from "@solid-primitives/date";
import imageUrl from "./assets/logo.jpeg";
import mattraxLogoUrl from "./assets/matrax-logo.png";
import spectaLogoUrl from "./assets/specta-logo.png";

import IconDiscord from '~icons/logos/discord-icon';
import IconGitHub from '~icons/logos/github-icon';
import IconTwitter from '~icons/logos/twitter';
import IconLinkedIn from '~icons/logos/linkedin-icon';

import LogosRust from '~icons/logos/rust';
import LogosTypescript from '~icons/logos/typescript-icon';
import LogosSolid from '~icons/logos/solidjs-icon';
import LogosTanstack from "~icons/simple-icons/tanstack";
import LogosTailwind from "~icons/logos/tailwindcss-icon";
import LogosTauri from "~icons/logos/tauri";
import LogosTrpc from "~icons/logos/trpc";
import LogosDrizzle from "~icons/catppuccin/drizzle-orm";
import LogosPostHog from "~icons/logos/posthog-icon";
import LogosPlanetscale from "~icons/simple-icons/planetscale";

export default function Home() {
  return (
    <div class="min-h-screen bg-white text-gray-900">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <Header />
        <About />
        <Skills />
        <Experience />
        <Footer />
      </div>
    </div>
  );
}

const Header = () => (
    <header class="mb-8">
      <div class="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
          <img
            src={imageUrl}
            alt="Oscar Beaumont"
            class="relative rounded-full h-32 w-32 border-2 border-gray-100 shadow-sm"
          />
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            Oscar Beaumont
          </h1>
          <p class="text-xl text-gray-600 mb-4 leading-relaxed font-medium">
            Software Engineer <span class="text-md font-light">from <a href="https://maps.app.goo.gl/5F1tMoTEUg9WpGXW8" target="_blank" rel="noopener">Western Australia</a></span>
          </p>
          <div class="flex gap-6 items-center justify-center md:justify-start">
            <SocialLink href="https://github.com/oscartbeaumont" title="GitHub" icon={<IconGitHub class="brightness-0 w-5 h-5" />} />
            <SocialLink href="https://twitter.com/oscartbeaumont" title="Twitter" icon={<IconTwitter class="brightness-0 w-5 h-5" />} />
            <SocialLink href="https://linkedin.com/in/oscartbeaumont" title="LinkedIn" icon={<IconLinkedIn class="brightness-0 w-5 h-5" />} />
          </div>
        </div>
      </div>
    </header>
  );

const SocialLink = (props: { href: string; title: string; icon: JSX.Element }) => (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      {props.icon}
      <span class="hidden sm:inline font-medium">{props.title}</span>
    </a>
);

function About() {
  const [startDate] = createDate("Sep 1, 2020");
  const [timeago]= createTimeAgo(startDate);

  return (
    <section class="pb-8">
      <div class="prose prose-gray max-w-none text-gray-700 leading-relaxed text-lg">
        <p>
          I'm a self-taught software engineer passionate about building tools that empower people.
          With {timeago()} years of professional experience working full-stack on everything from webapps to desktop apps and building with many languages including <a class="font-semibold" href="https://www.rust-lang.org" target="_blank" rel="noopener">Rust</a> and <a class="font-semibold" href="https://www.typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>.
        </p>

        <p class="mt-4">
          I am currently working on:
        </p>

        <div class="mt-3 ml-6 space-y-3">
          <ProjectPanel
            name="Mattrax"
            description="Manage all your Windows, Apple and Android devices from one simple dashboard"
            href="https://mattrax.app"
            logo={mattraxLogoUrl}
            right={<div class="flex space-x-4">
              <a href="https://discord.gg/WPBHmDSfAn" target="_blank" rel="noopener">
                <IconDiscord class="brightness-0 w-5 h-5" />
              </a>
              <a href="https://github.com/mattrax" target="_blank" rel="noopener">
                <IconGitHub class="brightness-0 w-5 h-5" />
              </a>
            </div>}
          />
          <ProjectPanel
              name="Specta"
              description="Rust crates for building better web apps"
              href="https://specta.dev"
              logo={spectaLogoUrl}
              right={<div class="flex space-x-4">
                <a href="https://discord.com/invite/JgqH8b4ycw" target="_blank" rel="noopener">
                  <IconDiscord class="brightness-0 w-5 h-5" />
                </a>
                <a href="https://github.com/specta-rs" target="_blank" rel="noopener">
                  <IconGitHub class="brightness-0 w-5 h-5" />
                </a>
              </div>}
          />
        </div>

        <p class="mt-4">
          Feel free to reach out via email at oscar at otbeaumont.me
        </p>
      </div>
    </section>
  );
}

const ProjectPanel = (props: { name: string; description: string; href: string; logo: string; right?: JSX.Element }) => <div class="flex items-center justify-between gap-4 py-2">
  <a href={props.href} target="_blank" rel="noopener" class="flex items-center gap-3 flex-1 min-w-0">
    <img
      src={props.logo}
      alt={`${props.name} logo`}
      class="w-12 object-contain"
    />
    <div class="min-w-0 flex-1">
      <div class="font-semibold text-gray-900">{props.name}</div>
      <div class="text-sm text-gray-600">{props.description}</div>
    </div>
  </a>
  <div class="flex items-center gap-3 shrink-0">
    <div class="flex items-center gap-1 text-sm text-gray-500">
      {props.right}
    </div>
  </div>
</div>;

const SectionTitle = (props: ParentProps) => <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-8">
  {props.children}
</h2>;

const Skills = () => {
  return (
    <section class="pb-8">
      <SectionTitle>Skills</SectionTitle>

      <div class="grid grid-cols-4 md:grid-cols-9 gap-6">
        <SkillItem name="Rust" href="https://www.rust-lang.org" logo={LogosRust} />
        <SkillItem name="TypeScript" href="https://www.typescriptlang.org" logo={LogosTypescript} />
        <SkillItem name="SolidJS" href="https://www.solidjs.com" logo={LogosSolid} />
        <SkillItem name="Tanstack Query" href="https://tanstack.com/query" logo={LogosTanstack} />
        <SkillItem name="Tailwind" href="https://tailwindcss.com" logo={LogosTailwind} />
        <SkillItem name="Tauri" href="https://tauri.app" logo={LogosTauri} />
        <SkillItem name="tRPC" href="https://trpc.io" logo={LogosTrpc} />
        <SkillItem name="Drizzle ORM" href="https://orm.drizzle.team" logo={LogosDrizzle} />
        <SkillItem name="PostHog" href="https://posthog.com" logo={LogosPostHog} />
        <SkillItem name="PlanetScale" href="https://planetscale.com" logo={LogosPlanetscale} />
      </div>
    </section>
  );
};

const SkillItem = (props: { href: string; name: string; logo: (_: { class: string }) => JSX.Element }) => (
  <a
    href={props.href}
    target="_blank"
    rel="noopener"
    class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
    title={props.name}
  >
    {props.logo({
      class: "w-12 h-12 object-contain grayscale group-hover:grayscale-0 transition-all duration-200"
    })}
    <span class="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
      {props.name}
    </span>
  </a>
);

const Experience = () => (
  <section class="pb-8">
    <SectionTitle>Work Experience</SectionTitle>

    <div class="relative border-l border-neutral-200 ml-3 space-y-12">
      <WorkExperienceItem company="Spacedrive" position="Full Stack Developer" period="2022 — Present" description="Building a file manager from the future. Responsible for the Rust core, database integration, and cross-platform architecture. Working with Tauri, Rust, and React to deliver a high-performance local-first experience." link="https://spacedrive.com" />
      <WorkExperienceItem company="Cap" position="Full Stack Developer" period="2021 — 2022" description="Developed a full-stack application using React and Node.js. Implemented a RESTful API using Express.js and MongoDB." />
    </div>
  </section>
);

const WorkExperienceItem = (props: { company: string; position: string; period: string; description: string; link?: string }) => (
  <div class="relative pl-8 md:pl-12 group">
    {/* Timeline dot */}
    <div class="absolute -left-1.25 top-2 h-2.5 w-2.5 rounded-full bg-neutral-300 ring-4 ring-white group-hover:bg-neutral-900 transition-colors duration-200"></div>

    <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
      <h3 class="text-lg font-bold text-neutral-900">
        {props.company}
      </h3>
      <span class="text-sm font-mono text-gray-500 tabular-nums">
        {props.period}
      </span>
    </div>
    <div class="text-md font-medium text-neutral-700 mb-3">{props.position}</div>
    <p class="text-neutral-600 leading-relaxed text-sm">
      {props.description}
    </p>
    {/*<Show when={props.link}>
      <a
        href={props.link}
        target="_blank"
        rel="noopener"
        class="inline-flex items-center mt-3 text-sm font-medium text-neutral-900 hover:underline decoration-neutral-400 underline-offset-2"
      >
        Visit Website
        <ArrowUpRightIcon class="w-3 h-3 ml-1" />
      </a>
    </Show>*/}
  </div>
);

function Footer() {
  const [date] = createDateNow();
  const currentYear = createMemo(() => date().getFullYear());

  return (
    <footer class="pt-8 border-t border-gray-200 text-center text-gray-500">
      <p>© {currentYear()} Oscar Beaumont. Built with <a href="https://solidjs.com" target="_blank" rel="noopener" class="hover:underline">SolidJS</a> and <a href="https://tailwindcss.com" target="_blank" rel="noopener" class="hover:underline">TailwindCSS</a>.</p>
    </footer>
  );
}
