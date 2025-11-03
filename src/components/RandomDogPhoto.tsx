import { Show, createEffect, createSignal } from "solid-js";

const THE_DOG_API_KEY = "8d0ae78c-af47-469c-9d46-5c00e6fbb4b3";

export function RandomDogPhoto() {
  const [imgUrl, setImgUrl] = createSignal(undefined);

  createEffect(() => {
    fetch("https://api.thedogapi.com/v1/images/search?size=full", {
      headers: {
        "x-api-key": THE_DOG_API_KEY,
      },
    }).then(async (res) => {
      const body = await res.json();
      setImgUrl(body[0].url);
    });
  });

  return (
    <Show
      when={imgUrl()}
      fallback={
        <svg
          version="1.1"
          id="L9"
          xmlns="http://www.w3.org/2000/svg"
          // @ts-expect-error: SolidJS is probs missing it?
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 100 100"
          enable-background="new 0 0 0 0"
          xml:space="preserve"
          class="w-24 m-auto"
        >
          <path
            fill="black"
            d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              dur="1s"
              from="0 50 50"
              to="360 50 50"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      }
    >
      <img
        src={imgUrl()}
        alt="Random Dog GIF from TheDogAPI"
        class="w-96 m-auto"
      />
    </Show>
  );
}
