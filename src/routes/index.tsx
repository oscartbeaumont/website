import { type JSX, createMemo, Show, type ParentProps } from "solid-js";
import { createDate,
  createDateNow,
createTimeAgo } from "@solid-primitives/date";
import imageUrl from "./assets/logo.jpeg";
import mattraxLogoUrl from "./assets/matrax-logo.png";
import spectaLogoUrl from "./assets/specta-logo.png";

export default function Home() {
  return (
    <div class="min-h-screen bg-white text-gray-900">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <Header />
        <About />
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
            <SocialLink href="https://github.com/oscartbeaumont" title="GitHub" icon={GitHubIcon} />
            <SocialLink href="https://twitter.com/oscartbeaumont" title="Twitter" icon={TwitterIcon} />
            <SocialLink href="https://linkedin.com/in/oscartbeaumont" title="LinkedIn" icon={LinkedInIcon} />
          </div>
        </div>
      </div>
    </header>
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
                <DiscordIcon />
              </a>
              <a href="https://github.com/mattrax" target="_blank" rel="noopener">
                <GitHubIcon />
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
                  <DiscordIcon />
                </a>
                <a href="https://github.com/specta-rs" target="_blank" rel="noopener">
                  <GitHubIcon />
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
    <Show when={props.link}>
      <a
        href={props.link}
        target="_blank"
        rel="noopener"
        class="inline-flex items-center mt-3 text-sm font-medium text-neutral-900 hover:underline decoration-neutral-400 underline-offset-2"
      >
        Visit Website
        <ArrowUpRightIcon class="w-3 h-3 ml-1" />
      </a>
    </Show>
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

// Simple SVG Icons
function ArrowUpRightIcon(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
    </svg>
  )
}
