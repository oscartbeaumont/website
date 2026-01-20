import type { ParentProps } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import { Link, Meta, Title } from "@solidjs/meta";
import openGraphImage from "../assets/og.png";
import { openGraphImageSize } from "../constants";

const title = "Oscar Beaumont";
const description =
	"I'm a software developer based in Perth, Australia. I am self-taught and love creating solutions to help people use technology effectively.";
const canonical = "http://otbeaumont.me";

export default function Layout(props: ParentProps) {
	const origin = isServer
		? getRequestEvent()!.nativeEvent.url.origin
		: window.location.origin;
	const path = isServer
		? getRequestEvent()!.nativeEvent.url.pathname
		: window.location.pathname;

	return (
		<>
			<Title>Oscar Beaumont</Title>
			<Meta
				name="description"
				content="I'm a software developer based in Perth, Australia. I am self-taught and love creating solutions to help people use technology effectively."
			/>
			<Link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
			{import.meta.env.PROD && (
				<Link rel="canonical" href={`${canonical}${path}`} />
			)}

			<Meta property="og:locale" content="en_US" />
			<Meta property="og:title" content={title} />
			<Meta property="og:description" content={description} />
			<Meta property="og:type" content="website" />
			{import.meta.env.PROD && (
				<Meta property="og:url" content={`${canonical}${path}`} />
			)}
			<Meta property="og:image" content={`${origin}${openGraphImage}`} />
			<Meta
				property="og:image:width"
				content={openGraphImageSize[0].toString()}
			/>
			<Meta
				property="og:image:height"
				content={openGraphImageSize[1].toString()}
			/>
			<Meta property="og:image:type" content="image/png" />
			<Meta property="og:image:alt" content="Oscar Beaumont" />
			<Meta property="twitter:card" content="summary_large_image" />

			<Meta property="twitter:image" content={`${origin}${openGraphImage}`} />
			<Meta
				property="twitter:image:width"
				content={openGraphImageSize[0].toString()}
			/>
			<Meta
				property="twitter:image:height"
				content={openGraphImageSize[1].toString()}
			/>
			<Meta property="twitter:image:type" content="image/png" />
			<Meta property="twitter:image:alt" content="Oscar Beaumont" />

			{props.children}
		</>
	);
}
