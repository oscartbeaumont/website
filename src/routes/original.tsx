// TODO: Link to blog
export default function Home() {
  return (
    <div class="max-w-2xl m-auto px-8 py-4 font-sans border-s-stone-400 border-x-1">
      <MeCard />
    </div>
  );
}

// TODO: Right click for the branding page

// TODO: Click it many times for easter egg?
// TODO: Social media links
function MeCard() {
  return (
    <div class="flex space-x-4">
      <img src="https://github.com/oscartbeaumont.png" alt="Oscar Beaumont" class="rounded-full h-40 w-40" />
      <div>
        <h1 class="text-4xl font-bold">Oscar Beaumont</h1>
        <p>Software Engineer</p>
      </div>
    </div>
  )
}

// TODO: Discuss projects and link to them. Maybe render stars?
// TODO: Discuss skills
function Projects() {}

// TODO: Information for getting in contact with me
function HireMe() {}
