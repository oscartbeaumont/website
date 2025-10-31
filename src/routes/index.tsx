import { createSignal, For } from "solid-js";
import imageUrl from "./assets/logo.jpeg";

export default function Home() {
  return (
    <div class="min-h-screen bg-white text-gray-900">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div class="max-w-4xl mx-auto px-6 py-12">
        <Header />
        <About />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="mb-16">
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
            Software Engineer <span class="text-md font-light">from <a href="#todo" target="_blank" rel="noopener noreferrer">Western Australia</a></span>
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
    <section class="mb-16">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">About</h2>
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-700 leading-relaxed mb-4">
          I'm a passionate software engineer who loves building elegant solutions to complex problems.
          With expertise in modern web technologies and systems design, I create applications that are
          both performant and user-friendly.
        </p>
        <p class="text-gray-700 leading-relaxed">
          When I'm not coding, you can find me exploring new technologies, contributing to open source
          projects, or sharing knowledge with the developer community.
        </p>
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
      stars: "12.5k",
      link: "https://github.com/spacedriveapp/spacedrive"
    },
    {
      name: "rspc",
      description: "A blazing fast and lightweight RPC framework for Rust with TypeScript bindings. Type-safe APIs made simple.",
      tech: ["Rust", "TypeScript", "WebAssembly"],
      stars: "1.2k",
      link: "https://github.com/oscartbeaumont/rspc"
    },
    {
      name: "Prisma Client Rust",
      description: "Type-safe database client for Rust. Bringing the power of Prisma to the Rust ecosystem.",
      tech: ["Rust", "Database", "Code Generation"],
      stars: "1.8k",
      link: "https://github.com/Brendonovich/prisma-client-rust"
    }
  ];

  const [selectedProject, setSelectedProject] = createSignal(0);

  return (
    <section class="mb-16">
      <h2 class="text-2xl font-semibold mb-8 text-gray-800">Recent Projects</h2>

      {/* Horizontal scrolling carousel */}
      <div class="mb-6">
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          <For each={projects}>
            {(project, index) => (
              <button
                onClick={() => setSelectedProject(index())}
                class={`flex-shrink-0 px-6 py-3 rounded-lg border transition-all duration-200 font-medium snap-start ${
                  selectedProject() === index()
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
                }`}
              >
                {project.name}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Selected project details */}
      <ProjectCard project={projects[selectedProject()]} />
    </section>
  );
}

function ProjectCard(props: { project: any }) {
  const { project } = props;

  return (
    <div class="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200">
      <div class="flex items-start justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-900">{project.name}</h3>
        <div class="flex items-center gap-1 text-sm text-gray-500">
          <StarIcon />
          <span>{project.stars}</span>
        </div>
      </div>
      <p class="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
      <div class="flex flex-wrap gap-2 mb-4">
        {project.tech.map((tech: string) => (
          <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {tech}
          </span>
        ))}
      </div>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        View Project
        <ExternalLinkIcon />
      </a>
    </div>
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
    <section class="mb-16">
      <h2 class="text-2xl font-semibold mb-8 text-gray-800">Skills & Technologies</h2>
      <div class="grid md:grid-cols-2 gap-8">
        {skillCategories.map((category) => (
          <div>
            <h3 class="text-lg font-medium mb-4 text-gray-800">{category.title}</h3>
            <div class="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span class="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition-colors duration-200">
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

function Contact() {
  return (
    <section class="mb-16">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">Let's Work Together</h2>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">
          I'm always interested in hearing about new opportunities and exciting projects.
          Whether you're looking to build something amazing or just want to say hello,
          feel free to reach out!
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:hello@oscartbeaumont.dev"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <EmailIcon />
            Get in Touch
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <DocumentIcon />
            View Resume
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [currentYear] = createSignal(new Date().getFullYear());

  return (
    <footer class="pt-8 border-t border-gray-200 text-center text-gray-500">
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
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      {getIcon()}
      <span class="hidden sm:inline font-medium">{props.icon}</span>
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

function EmailIcon() {
  return (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
