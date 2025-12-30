import { For } from "solid-js";
import imageUrl from "./assets/logo.jpeg";

export default function Home() {
  return (
    <div class="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      <div class="max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-20 md:space-y-32">
        <Header />
        <div class="space-y-20 md:space-y-32">
          <About />
          <Experience />
          <Projects />
          <Skills />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-8 animate-fade-in">
      <div class="text-center md:text-left space-y-4">
        <div class="space-y-2">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Oscar Beaumont
          </h1>
          <p class="text-xl text-gray-600 font-medium">
            Software Engineer
          </p>
        </div>
        <p class="text-gray-500 max-w-md leading-relaxed">
          Building high-performance software with Rust and TypeScript. 
          Currently simplifying file management at Spacedrive.
        </p>
        <div class="flex gap-5 justify-center md:justify-start pt-2">
          <SocialLink href="https://github.com/oscartbeaumont" icon="GitHub" />
          <SocialLink href="https://twitter.com/oscartbeaumont" icon="Twitter" />
          <SocialLink href="https://linkedin.com/in/oscartbeaumont" icon="LinkedIn" />
        </div>
      </div>
      
      <div class="relative group shrink-0">
        <div class="absolute inset-0 bg-gray-200 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
        <img
          src={imageUrl}
          alt="Oscar Beaumont"
          class="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>
    </header>
  );
}

function About() {
  const yearsExperience = new Date().getFullYear() - 2020;
  
  return (
    <section>
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">About</h2>
      <div class="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg">
        <p>
          I'm a self-taught software engineer passionate about building tools that empower people. 
          With over {yearsExperience} years of professional experience, I bridge the gap between low-level systems programming and modern web development.
        </p>
        <p class="mt-4">
          I specialize in <strong>Rust</strong> and <strong>TypeScript</strong>, creating type-safe, performant solutions. 
          My journey started with YouTube tutorials in high school and has evolved into building widely-used open source tools and commercial products.
        </p>
      </div>
    </section>
  );
}

function Experience() {
  const jobs = [
    {
      role: "Software Engineer & Maintainer",
      company: "Spacedrive",
      period: "2021 — Present",
      description: "Building a distributed file system and management tool. Responsible for core architecture, Rust backend development, and integration with the frontend.",
      link: "https://spacedrive.com"
    },
    // Add more experience here
  ];

  return (
    <section>
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8">Work Experience</h2>
      <div class="relative border-l border-gray-200 ml-3 space-y-12">
        <For each={jobs}>
          {(job) => (
            <div class="relative pl-8 md:pl-12">
              <span class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-white"></span>
              
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{job.role}</h3>
                <span class="text-sm font-mono text-gray-500 tabular-nums">{job.period}</span>
              </div>
              
              <a href={job.link} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium mb-3 block">
                {job.company}
              </a>
              
              <p class="text-gray-600 leading-relaxed">
                {job.description}
              </p>
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
      description: "A blazing fast and lightweight RPC framework for Rust with TypeScript bindings. Allows you to build type-safe APIs easily.",
      tech: ["Rust", "TypeScript"],
      stats: "1.2k+ Stars",
      link: "https://github.com/oscartbeaumont/rspc"
    },
    {
      name: "Prisma Client Rust",
      description: "Bringing the power of the Prisma ORM to the Rust ecosystem. Fully type-safe database access.",
      tech: ["Rust", "Prisma", "SQL"],
      stats: "1.8k+ Stars",
      link: "https://github.com/Brendonovich/prisma-client-rust"
    },
     {
      name: "Spacedrive",
      description: "A file manager from the future. Distributed, secure, and intuitive.",
      tech: ["Rust", "Tauri", "React"],
      stats: "12k+ Stars",
      link: "https://github.com/spacedriveapp/spacedrive"
    }
  ];

  return (
    <section>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400">Personal Projects</h2>
        <a href="https://github.com/oscartbeaumont" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all on GitHub &rarr;
        </a>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <For each={projects}>
          {(project) => (
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              class="group block p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <span class="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                  {project.stats}
                </span>
              </div>
              
              <p class="text-gray-600 text-sm leading-relaxed mb-6 h-16">
                {project.description}
              </p>
              
              <div class="flex flex-wrap gap-2">
                <For each={project.tech}>
                  {(t) => (
                    <span class="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
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
  const skills = {
    Languages: ["Rust", "TypeScript", "JavaScript", "Go", "SQL"],
    Frontend: ["React", "SolidJS", "TailwindCSS", "Next.js", "Tauri"],
    Backend: ["Node.js", "PostgreSQL", "Redis", "GraphQL", "Docker"],
    Tools: ["Git", "Linux", "AWS", "Vite", "Figma"]
  };

  return (
    <section>
      <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8">Skills & Tools</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <For each={Object.entries(skills)}>
          {([category, items]) => (
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-4">{category}</h3>
              <ul class="space-y-2">
                <For each={items}>
                  {(item) => (
                    <li class="text-gray-600 text-sm hover:text-gray-900 transition-colors cursor-default">
                      {item}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer class="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
      <p>© {new Date().getFullYear()} Oscar Beaumont</p>
      <div class="flex gap-6">
        <a href="mailto:oscar@otbeaumont.me" class="hover:text-gray-600 transition-colors">Email</a>
        <a href="https://github.com/oscartbeaumont" target="_blank" class="hover:text-gray-600 transition-colors">GitHub</a>
        <a href="https://twitter.com/oscartbeaumont" target="_blank" class="hover:text-gray-600 transition-colors">Twitter</a>
      </div>
    </footer>
  );
}

function SocialLink(props: { href: string; icon: string }) {
  const icons = {
    GitHub: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
      </svg>
    ),
    Twitter: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
         <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 4.09 4.09 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.25 8.25 0 0 1 2 18.41 11.61 11.61 0 0 0 8.29 20.25c7.55 0 11.67-6.26 11.67-11.67v-.53A8.33 8.33 0 0 0 22 5.8z" />
      </svg>
    ),
    LinkedIn: (
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M5 3a2 2 0 100 4 2 2 0 000-4zM3 9h4v12H3V9zm12 0h-4v12h4v-6.02c0-2.32 1.98-3.98 4-3.98s4 1.66 4 3.98V21h4v-7.14c0-4.08-3.46-7.36-7.38-7.36-2.26 0-3.98 1.14-4.62 2.14V9z" clip-rule="evenodd" />
      </svg>
    )
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="text-gray-400 hover:text-gray-900 transition-colors duration-200"
      aria-label={props.icon}
    >
      {icons[props.icon as keyof typeof icons]}
    </a>
  );
}
