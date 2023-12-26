import { type JSX, type ParentProps } from "solid-js";
import type { IconProps } from "./Logos";

export function IconLayout(props: ParentProps) {
  return <div class="flex space-x-2">{props.children}</div>;
}

export function Icon(props: {
  name: string;
  href: string;
  icon: (_: IconProps) => JSX.Element;
}) {
  return (
    <a
      href={props.href}
      class="flex flex-col no-underline items-center px-2"
      target="_blank"
    >
      {props.icon({ class: "h-[50px]" })}
      {/* <span class="font-light">{props.name}</span> */}
    </a>
  );
}
