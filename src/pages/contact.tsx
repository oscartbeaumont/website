// @ts-expect-error
import me2Jpg from "../../public/assets/me2.jpg?optimse";

export default function Page() {
  return (
    <div class="md:flex px-6">
      <div class="py-5 pr-5">
        <h3 class="text-4xl pb-4">Contact Me</h3>
        <p class="text-xl">
          If you are interested in working together or discussing any of my
          projects feel free to reach out via email.
        </p>
        <p class="text-xl py-2">
          If your question is related to an issue in one of my open-source
          projects please include a detailed summary of what is not working and
          what you have tried.
        </p>
        <a href="mailto:oscar@otbeaumont.me" target="_blank">
          <p class="text-lg w-full text-green-500 text-center content-center">
            oscar [at] otbeaumont.me
          </p>
        </a>
      </div>
      <img
        src={me2Jpg}
        alt="Oscar Beaumont"
        class="hidden md:block w-auto max-w-xs object-top object-scale-down"
      />
    </div>
  );
}
