import config from "../config";

export default function Page() {
  return (
    <div class="py-5 px-5">
      <h3 class="text-4xl pb-4">My Skills</h3>

      {Object.entries(config.skills).map(([skillCategory, skills]) => (
        <div class="pb-4">
          <h5 class="text-xl">{skillCategory}:</h5>
          <ul class="list-disc ml-6 mb-2">
            {Object.entries(skills).map(([name, href]) => (
              <li>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  class={href ? "text-green-500" : ""}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p class="text-lg py-2">
        These are some of my current skills. I enjoy learning new technologies
        and different approaches to software development which help to improve
        the developer experience and final product. To check out my skills in
        action look at my{" "}
        <a
          href="https://github.com/oscartbeaumont"
          target="_blank"
          rel="noopener"
          class="text-green-500"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
