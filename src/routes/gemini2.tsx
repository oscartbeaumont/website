import { createSignal, For, Show } from "solid-js";
import imageUrl from "./assets/logo.jpeg";

export default function Home() {
  return (
    <div class="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <div class="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <Header />
        <main class="space-y-24">
          <About />
          <Experience />
          <Projects />
          <Skills />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="mb-20 animate-fade-in">
      <div class="flex flex-col-reverse md:flex-row items-start md:items-center gap-8 md:gap-12">
        <div class="flex-1">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-neutral-900">
            Oscar Beaumont
          </h1>
          <p class="text-lg text-neutral-600 mb-6 leading-relaxed max-w-lg">
            Software Engineer based in <a href="https://en.wikipedia.org/wiki/Western_Australia" target="_blank" rel="noopener noreferrer" class="underline decoration-neutral-300 hover:decoration-neutral-600 transition-colors">Western Australia</a>. 
            Building high-performance tools and applications with Rust & TypeScript.
          </p>
          <div class="flex gap-4">
            <SocialLink href="https://github.com/oscartbeaumont" icon="GitHub" />
            <SocialLink href="https://twitter.com/oscartbeaumont" icon="Twitter" />
            <SocialLink href="https://linkedin.com/in/oscartbeaumont" icon="LinkedIn" />
            <SocialLink href="mailto:oscar@otbeaumont.me" icon="Email" />
          </div>
        </div>
        <div class="relative shrink-0">
          <div class="absolute inset-0 rounded-full bg-neutral-200 blur-sm transform translate-y-2"></div>
          <img
            src={imageUrl}
            alt="Oscar Beaumont"
            class="relative rounded-full h-28 w-28 md:h-32 md:w-32 object-cover border-4 border-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300"
          />
        </div>
      </div>
    </header>
  );
}

function About() {
  return (
    <section>
      <SectionTitle>About Me</SectionTitle>
      <div class="prose prose-neutral max-w-none text-neutral-600">
        <p>
          I'm a self-taught software engineer obsessed with building tools that empower others. 
          My journey started in high school with YouTube tutorials and has evolved into a career 
          spanning low-level systems programming to full-stack web development.
        </p>
        <p class="mt-4">
          I specialize in <strong>Rust</strong> and <strong>TypeScript</strong>, focusing on performance, 
          type safety, and developer experience.
        </p>
      </div>
    </section>
  );
}

function Experience() {
  const experiences = [
    {
      company: "Spacedrive",
      role: "Core Engineer",
      period: "2022 — Present",
      description: "Building a file manager from the future. Responsible for the Rust core, database integration, and cross-platform architecture. Working with Tauri, Rust, and React to deliver a high-performance local-first experience.",
      link: "https://spacedrive.com"
    },
    {
      company: "Freelance / Open Source",
      role: "Full Stack Developer",
      period: "2020 — 2022",
      description: `Developed various full-stack applications and open-source libraries. Created rspc and contributed to the Rust ecosystem. Gained extensive experience with low-level FFI, networking, and modern web frameworks.`,
      link: undefined
    }
  ];

  return (
    <section>
      <SectionTitle>Work Experience</SectionTitle>
      <div class="relative border-l border-neutral-200 ml-3 space-y-12">
        <For each={experiences}>
          {(job) => (
            <div class="relative pl-8 md:pl-12 group">
              {/* Timeline dot */}
              <div class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-neutral-300 ring-4 ring-white group-hover:bg-neutral-900 transition-colors duration-200"></div>
              
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                <h3 class="text-lg font-bold text-neutral-900">
                  {job.company}
                </h3>
                <span class="text-sm font-medium text-neutral-500 tabular-nums">
                  {job.period}
                </span>
              </div>
              <div class="text-md font-medium text-neutral-700 mb-3">{job.role}</div>
              <p class="text-neutral-600 leading-relaxed text-sm">
                {job.description}
              </p>
              <Show when={job.link}>
                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center mt-3 text-sm font-medium text-neutral-900 hover:underline decoration-neutral-400 underline-offset-2"
                >
                  Visit Website
                  <ArrowUpRightIcon class="w-3 h-3 ml-1" />
                </a>
              </Show>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}

function Projects() {
  const projects = [
    {
      name: "rspc",
      description: "A blazing fast and lightweight RPC framework for Rust with TypeScript bindings. Bringing trpc-like experience to Rust backends.",
      tech: ["Rust", "TypeScript", "Macro"],
      stars: "1.2k+",
      link: "https://github.com/oscartbeaumont/rspc"
    },
    {
      name: "Prisma Client Rust",
      description: "Type-safe database client for Rust. Bringing the power of the Prisma ORM and ecosystem to Rust developers.",
      tech: ["Rust", "Prisma", "Codegen"],
      stars: "1.8k+",
      link: "https://github.com/Brendonovich/prisma-client-rust"
    },
    {
      name: "Personal Website",
      description: "My corner of the internet. Built with SolidJS and TailwindCSS to showcase my work and experiments.",
      tech: ["SolidJS", "Tailwind", "Vite"],
      stars: undefined,
      link: "https://github.com/oscartbeaumont/website"
    }
  ];

  return (
    <section>
      <SectionTitle>Featured Projects</SectionTitle>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <For each={projects}>
          {(project) => (
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              class="block p-6 rounded-xl bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-sm transition-all duration-200 group"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <Show when={project.stars}>
                  <div class="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    <StarIcon />
                    {project.stars}
                  </div>
                </Show>
              </div>
              <p class="text-sm text-neutral-600 mb-6 leading-relaxed h-20 overflow-hidden text-ellipsis">
                {project.description}
              </p>
              <div class="flex flex-wrap gap-2">
                <For each={project.tech}>
                  {(t) => (
                    <span class="text-xs font-medium text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-md">
                      {t}
                    </span>
                  )}
                </For>
              </div>
            </a>
          )}
        </For>
      </div>
    </section>
  );
}

function Skills() {
  const skills = [
    "Rust", "TypeScript", "React", "SolidJS", 
    "Node.js", "PostgreSQL", "Docker", "AWS", 
    "Linux", "Go", "C++", "GraphQL"
  ];

  return (
    <section>
      <SectionTitle>Technical Skills</SectionTitle>
      <div class="flex flex-wrap gap-x-3 gap-y-2">
        <For each={skills}>
          {(skill) => (
            <div class="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors cursor-default">
              {skill}
            </div>
          )}
        </For>
      </div>
    </section>
  );
}

function SectionTitle(props: { children: any }) {
  return (
    <h2 class="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-8">
      {props.children}
    </h2>
  );
}

function Footer() {
  const [currentYear] = createSignal(new Date().getFullYear());

  return (
    <footer class="pt-12 mt-12 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-500 gap-4">
      <p>© {currentYear()} Oscar Beaumont. Built with SolidJS and TailwindCSS.</p>
      <div class="flex gap-6">
        <a href="https://github.com/oscartbeaumont" class="hover:text-neutral-900 transition-colors">GitHub</a>
        <a href="https://twitter.com/oscartbeaumont" class="hover:text-neutral-900 transition-colors">Twitter</a>
        <a href="mailto:oscar@otbeaumont.me" class="hover:text-neutral-900 transition-colors">Email</a>
      </div>
    </footer>
  );
}

function SocialLink(props: { href: string; icon: string }) {
  const getIcon = () => {
    switch (props.icon) {
      case 'GitHub':
        return <GitHubIcon />;
      case 'Twitter':
        return <TwitterIcon />;
      case 'LinkedIn':
        return <LinkedInIcon />;
      case 'Email':
        return <EmailIcon />;
      default:
        return null;
    }
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="text-neutral-400 hover:text-neutral-900 transition-colors duration-200"
      title={props.icon}
    >
      {getIcon()}
    </a>
  );
}

// Icons
function ArrowUpRightIcon(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}
