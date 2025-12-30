import { createSignal, For } from "solid-js";
import imageUrl from "./assets/logo.jpeg";

export default function Home() {
  return (
    <div class="min-h-screen bg-[#F1F0F0] text-[#211E1E]">
      <div class="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <Header />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="mb-20">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <div class="relative group">
          <div class="absolute inset-0 bg-[#03B000] translate-x-2 translate-y-2 rounded-lg"></div>
          <img
            src={imageUrl}
            alt="Oscar Beaumont"
            class="relative h-32 w-32 object-cover border-4 border-[#211E1E] rounded-lg shadow-[4px_4px_0px_0px_rgba(33,30,30,1)] transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
          />
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-5xl md:text-7xl font-black mb-4 tracking-tight uppercase">
            Oscar<br />Beaumont
          </h1>
          <p class="text-xl md:text-2xl font-bold mb-6 border-l-4 border-[#03B000] pl-4">
            Software Engineer from Western Australia
          </p>
          <div class="flex gap-4 items-center justify-center md:justify-start flex-wrap">
            <SocialLink href="https://github.com/oscartbeaumont" icon="GitHub" />
            <SocialLink href="https://twitter.com/oscartbeaumont" icon="Twitter" />
            <SocialLink href="https://linkedin.com/in/oscartbeaumont" icon="LinkedIn" />
          </div>
        </div>
      </div>
    </header>
  );
}

function About() {
  return (
    <section class="mb-16">
      <div class="bg-white border-4 border-[#211E1E] rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(33,30,30,1)]">
        <h2 class="text-3xl md:text-4xl font-black mb-6 uppercase flex items-center gap-3">
          <span class="inline-block w-3 h-3 bg-[#03B000]"></span>
          About
        </h2>
        <div class="space-y-4 text-lg">
          <p class="leading-relaxed">
            I'm a self-taught software engineer who loves to create solutions to help people use technology effectively. I started development in high-school, learning from YouTube tutorials and have loved it ever since.
          </p>
          <p class="leading-relaxed">
            For the past {new Date().getFullYear() - 2020} years I've been working professionally on everything from low-level FFI and networking all the way up to fullstack webapp development.
          </p>
          <p class="font-bold border-t-2 border-[#211E1E] pt-4">
            📧 oscar at otbeaumont.me
          </p>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const experiences = [
    {
      company: "Spacedrive",
      role: "Co-Founder & Core Developer",
      period: "2021 - Present",
      description: "Building a cross-platform file manager with Rust and React. Managing a team of open-source contributors and leading architectural decisions.",
      tags: ["Rust", "React", "TypeScript", "Tauri"],
      color: "bg-[#FF6B6B]"
    },
    {
      company: "Open Source",
      role: "Maintainer",
      period: "2020 - Present",
      description: "Created and maintain multiple popular open-source projects including rspc and Prisma Client Rust. Active contributor to the Rust and TypeScript ecosystems.",
      tags: ["Rust", "TypeScript", "OSS"],
      color: "bg-[#4ECDC4]"
    }
  ];

  return (
    <section class="mb-16">
      <h2 class="text-3xl md:text-4xl font-black mb-8 uppercase flex items-center gap-3">
        <span class="inline-block w-3 h-3 bg-[#FF6B6B]"></span>
        Work Experience
      </h2>
      <div class="space-y-6">
        <For each={experiences}>
          {(exp) => (
            <div class="bg-white border-4 border-[#211E1E] rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(33,30,30,1)] hover:shadow-[8px_8px_0px_0px_rgba(33,30,30,1)] hover:-translate-y-1 transition-all">
              <div class={`${exp.color} h-2`}></div>
              <div class="p-6">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                  <div>
                    <h3 class="text-2xl font-black">{exp.company}</h3>
                    <p class="text-lg font-bold text-[#656363]">{exp.role}</p>
                  </div>
                  <span class="bg-[#211E1E] text-white px-4 py-1 font-bold text-sm uppercase self-start">
                    {exp.period}
                  </span>
                </div>
                <p class="text-base leading-relaxed mb-4">{exp.description}</p>
                <div class="flex flex-wrap gap-2">
                  {exp.tags.map((tag: string) => (
                    <span class="px-3 py-1 bg-[#F1F0F0] border-2 border-[#211E1E] font-bold text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
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
      name: "Spacedrive",
      description: "A file manager from the future, built with Rust and React. Cross-platform file organization made beautiful and efficient.",
      tech: ["Rust", "React", "TypeScript", "Tauri"],
      stars: "43.9k",
      link: "https://github.com/spacedriveapp/spacedrive",
      color: "bg-[#FF6B6B]"
    },
    {
      name: "rspc",
      description: "A blazing fast and lightweight RPC framework for Rust with TypeScript bindings. Type-safe APIs made simple.",
      tech: ["Rust", "TypeScript", "WebAssembly"],
      stars: "3.1k",
      link: "https://github.com/oscartbeaumont/rspc",
      color: "bg-[#4ECDC4]"
    },
    {
      name: "Prisma Client Rust",
      description: "Type-safe database client for Rust. Bringing the power of Prisma to the Rust ecosystem.",
      tech: ["Rust", "Database", "Code Generation"],
      stars: "1.9k",
      link: "https://github.com/Brendonovich/prisma-client-rust",
      color: "bg-[#FFE66D]"
    }
  ];

  return (
    <section class="mb-16">
      <h2 class="text-3xl md:text-4xl font-black mb-8 uppercase flex items-center gap-3">
        <span class="inline-block w-3 h-3 bg-[#4ECDC4]"></span>
        Personal Projects
      </h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <For each={projects}>
          {(project) => (
            <div class="bg-white border-4 border-[#211E1E] rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(33,30,30,1)] hover:shadow-[10px_10px_0px_0px_rgba(33,30,30,1)] hover:-translate-y-1 transition-all group">
              <div class={`${project.color} h-2`}></div>
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-2xl font-black">{project.name}</h3>
                  <div class="flex items-center gap-1 bg-[#211E1E] text-white px-3 py-1 font-bold text-sm">
                    <StarIcon />
                    <span>{project.stars}</span>
                  </div>
                </div>
                <p class="text-base leading-relaxed mb-4">{project.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech: string) => (
                    <span class="px-3 py-1 bg-[#F1F0F0] border-2 border-[#211E1E] font-bold text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 bg-[#211E1E] text-white px-4 py-2 font-bold text-sm uppercase border-2 border-[#211E1E] hover:bg-white hover:text-[#211E1E] transition-colors"
                >
                  View Project
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}

function Skills() {
  const skillCategories = [
    {
      title: "Languages",
      skills: ["Rust", "TypeScript", "JavaScript", "Python", "Go", "C++"],
      color: "bg-[#FF6B6B]"
    },
    {
      title: "Frontend",
      skills: ["React", "SolidJS", "Vue", "Svelte", "TailwindCSS", "Next.js"],
      color: "bg-[#4ECDC4]"
    },
    {
      title: "Backend",
      skills: ["Node.js", "Rust", "PostgreSQL", "Redis", "GraphQL", "REST APIs"],
      color: "bg-[#FFE66D]"
    },
    {
      title: "Tools",
      skills: ["Docker", "AWS", "Git", "Linux", "Webpack", "Vite"],
      color: "bg-[#95E1D3]"
    }
  ];

  return (
    <section class="mb-16">
      <h2 class="text-3xl md:text-4xl font-black mb-8 uppercase flex items-center gap-3">
        <span class="inline-block w-3 h-3 bg-[#FFE66D]"></span>
        Skills & Technologies
      </h2>
      <div class="grid md:grid-cols-2 gap-6">
        {skillCategories.map((category) => (
          <div class="bg-white border-4 border-[#211E1E] rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(33,30,30,1)]">
            <div class={`${category.color} px-6 py-3 border-b-4 border-[#211E1E]`}>
              <h3 class="text-xl font-black uppercase">{category.title}</h3>
            </div>
            <div class="p-6">
              <div class="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span class="px-4 py-2 bg-[#F1F0F0] border-2 border-[#211E1E] font-bold text-sm hover:bg-[#211E1E] hover:text-white transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const [currentYear] = createSignal(new Date().getFullYear());

  return (
    <footer class="pt-12 mt-12 border-t-4 border-[#211E1E]">
      <div class="text-center">
        <p class="text-lg font-bold">
          © {currentYear()} Oscar Beaumont
        </p>
        <p class="text-sm font-medium text-[#656363] mt-2">
          Built with SolidJS and TailwindCSS
        </p>
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
      default:
        return props.icon;
    }
  };

  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 bg-white border-3 border-[#211E1E] px-4 py-2 font-bold text-sm uppercase shadow-[4px_4px_0px_0px_rgba(33,30,30,1)] hover:shadow-[6px_6px_0px_0px_rgba(33,30,30,1)] hover:-translate-y-1 transition-all"
    >
      {getIcon()}
      <span>{props.icon}</span>
    </a>
  );
}

// Simple SVG Icons
function StarIcon() {
  return (
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
