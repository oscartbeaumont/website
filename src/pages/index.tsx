// @ts-expect-error
import meJpg from "../../public/assets/me.jpg?optimse";

export default function Page() {
  return (
    <div class="md:flex px-6">
      <div class="py-5 pr-5">
        <h3 class="text-4xl pb-4">Hi, I'm Oscar</h3>
        <p class="text-xl">
          I'm a software developer based in Perth, Australia. I have a huge
          passion for technology and enjoy everything from systems
          administration through to software development. I am self-taught and
          love creating solutions to help people use technology effectively.
        </p>
      </div>
      <img
        src={meJpg}
        alt="Oscar Beaumont"
        class="mx-auto md:mx-0 my-4 md:my-0 w-full max-w-xs object-top object-scale-down"
      />
    </div>
  );
}
