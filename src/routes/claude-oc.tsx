import { createSignal, For } from "solid-js";
import imageUrl from "./assets/logo.jpeg";

export default function Home() {
  return (
    <div class="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div class="max-w-6xl mx-auto px-6 py-16">
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
    <header class="mb-24">
      <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 blur-xl"></div>
          <img
            src={imageUrl}
            alt="Oscar Beaumont"
            class="relative rounded-full h-40 w-40 border-2 border-gray-800 shadow-2xl"
          />
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-6xl md:text-7xl font-bold mb-4 tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Oscar Beaumont
          </h1>
          <p class="text-2xl text-gray-400 mb-6 font-medium">
            Software Engineer <span class="text-lg font-normal">from Western Australia</span>
          </p>
          <div class="flex gap-6 items-center justify-center md:justify-start">
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
    <section class="mb-24">
      <h2 class="text-3xl font-bold mb-8 text-white">About</h2>
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-300 leading-relaxed text-lg mb-4">
          I'm a self-taught software engineer who loves to create solutions to help people use technology effectively. I started development in high-school, learning from YouTube tutorials and have loved it ever since. For the past {new Date().getFullYear() - 2020} years i've been working professionally on everything from low-level FFI and networking all the way up to fullstack webapp development.
        </p>
         <p class="text-gray-300 leading-relaxed text-lg">Feel free to reach out via email at <a href="mailto:oscar@otbeaumont.me" class="text-blue-400 hover:text-blue-300 transition-colors">oscar at otbeaumont.me</a></p>
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
      description: "Building a cross-platform file manager from the future. Leading development of the Rust backend, TypeScript frontend, and creating rspc - a type-safe RPC framework.",
      highlights: ["Built rspc framework adopted by 1k+ developers", "Architected core file system and indexing engine", "Led team of 15+ contributors"],
      tech: ["Rust", "React", "TypeScript", "Tauri"]
    },
    {
      company: "Freelance Development",
      role: "Full-Stack Developer",
      period: "2020 - 2021",
      description: "Worked with various clients on web applications, mobile apps, and automation tools. Specialized in rapid prototyping and scalable architecture.",
      highlights: ["Delivered 20+ projects across web and mobile", "Built custom CMS and e-commerce solutions", "Automated business workflows saving clients 100+ hours/month"],
      tech: ["TypeScript", "React", "Node.js", "PostgreSQL"]
    },
    {
      company: "Open Source",
      role: "Maintainer & Contributor",
      period: "2019 - Present",
      description: "Active contributor to the Rust and web development ecosystem. Created and maintain several popular libraries used by thousands of developers.",
      highlights: ["rspc: 1.2k+ stars", "Prisma Client Rust: Core contributor", "Multiple packages with 50k+ downloads"],
      tech: ["Rust", "TypeScript", "Open Source"]
    }
  ];

  return (
    <section class="mb-24">
      <h2 class="text-3xl font-bold mb-12 text-white">Work Experience</h2>
      <div class="space-y-12">
        <For each={experiences}>
          {(exp) => (
            <div class="relative pl-8 border-l-2 border-gray-800 hover:border-gray-700 transition-colors">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0a0a0a]"></div>
              <div class="mb-2">
                <h3 class="text-2xl font-bold text-white mb-1">{exp.role}</h3>
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-400">
                  <span class="font-semibold">{exp.company}</span>
                  <span class="hidden sm:inline text-gray-600">•</span>
                  <span class="text-sm">{exp.period}</span>
                </div>
              </div>
              <p class="text-gray-300 mb-4 leading-relaxed">{exp.description}</p>
              <ul class="space-y-2 mb-4">
                <For each={exp.highlights}>
                  {(highlight) => (
                    <li class="text-gray-400 flex items-start gap-2">
                      <span class="text-blue-500 mt-1">▸</span>
                      <span>{highlight}</span>
                    </li>
                  )}
                </For>
              </ul>
              <div class="flex flex-wrap gap-2">
                {exp.tech.map((tech: string) => (
                  <span class="px-3 py-1 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-md hover:border-gray-700 transition-colors">
                    {tech}
                  </span>
                ))}
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
      description: "A file manager from the future, built with Rust and React. Cross-platform file organization made beautiful and efficient. Leading a team to reimagine how we interact with files across all our devices.",
      tech: ["Rust", "React", "TypeScript", "Tauri"],
      stars: "12.5k",
      link: "https://github.com/spacedriveapp/spacedrive",
      featured: true
    },
    {
      name: "rspc",
      description: "A blazing fast and lightweight RPC framework for Rust with TypeScript bindings. Type-safe APIs made simple. Powers Spacedrive's client-server communication.",
      tech: ["Rust", "TypeScript", "WebAssembly"],
      stars: "1.2k",
      link: "https://github.com/oscartbeaumont/rspc",
      featured: true
    },
    {
      name: "Prisma Client Rust",
      description: "Type-safe database client for Rust. Bringing the power of Prisma to the Rust ecosystem. Core contributor helping shape the future of Rust database tooling.",
      tech: ["Rust", "Database", "Code Generation"],
      stars: "1.8k",
      link: "https://github.com/Brendonovich/prisma-client-rust",
      featured: false
    }
  ];

  return (
    <section class="mb-24">
      <h2 class="text-3xl font-bold mb-12 text-white">Featured Projects</h2>
      <div class="grid gap-6">
        <For each={projects}>
          {(project) => (
            <ProjectCard project={project} />
          )}
        </For>
      </div>
    </section>
  );
}

function ProjectCard(props: { project: any }) {
  const { project } = props;

  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      class={`block border border-gray-800 rounded-lg p-8 hover:border-gray-700 hover:bg-gray-900/30 transition-all duration-200 group ${project.featured ? 'bg-gradient-to-br from-gray-900/40 to-gray-900/20' : 'bg-gray-900/20'}`}
    >
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
        <div class="flex items-center gap-2 text-gray-400">
          <StarIcon />
          <span class="font-semibold">{project.stars}</span>
        </div>
      </div>
      <p class="text-gray-300 mb-6 leading-relaxed text-lg">{project.description}</p>
      <div class="flex flex-wrap gap-2">
        {project.tech.map((tech: string) => (
          <span class="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-md">
            {tech}
          </span>
        ))}
      </div>
    </a>
  );
}

function Skills() {
  const skillCategories = [
    {
      title: "Languages",
      skills: ["Rust", "TypeScript", "JavaScript", "Python", "Go", "C++"]
    },
    {
      title: "Frontend",
      skills: ["React", "SolidJS", "Vue", "Svelte", "TailwindCSS", "Next.js"]
    },
    {
      title: "Backend",
      skills: ["Node.js", "Rust", "PostgreSQL", "Redis", "GraphQL", "REST APIs"]
    },
    {
      title: "Tools",
      skills: ["Docker", "AWS", "Git", "Linux", "Webpack", "Vite"]
    }
  ];

  return (
    <section class="mb-24">
      <h2 class="text-3xl font-bold mb-12 text-white">Skills & Technologies</h2>
      <div class="grid md:grid-cols-2 gap-8">
        {skillCategories.map((category) => (
          <div class="bg-gray-900/20 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
            <h3 class="text-xl font-bold mb-4 text-white">{category.title}</h3>
            <div class="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span class="px-3 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-md text-sm hover:border-gray-700 hover:bg-gray-800 transition-colors">
                  {skill}
                </span>
              ))}
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
    <footer class="pt-12 border-t border-gray-800 text-center text-gray-500">
      <p>© {currentYear()} Oscar Beaumont. Built with SolidJS and TailwindCSS.</p>
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
      class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
    >
      {getIcon()}
      <span class="hidden sm:inline font-medium">{props.icon}</span>
    </a>
  );
}

// Simple SVG Icons
function StarIcon() {
  return (
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
