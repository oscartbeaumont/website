import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import "./app.css";

const title = "Oscar Beaumont";
const description =
	"I'm a software developer based in Perth, Australia. I am self-taught and love creating solutions to help people use technology effectively.";
const canonical = "http://otbeaumont.me";

export default function App() {
	const origin = isServer
		? getRequestEvent()!.nativeEvent.url.origin
		: window.location.origin;

	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Suspense>{props.children}</Suspense>

					<Title>Oscar Beaumont</Title>
					<Meta
						name="description"
						content="I'm a software developer based in Perth, Australia. I am self-taught and love creating solutions to help people use technology effectively."
					/>
					<Link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
					{import.meta.env.PROD && <Link rel="canonical" href={canonical} />}

					<Meta property="og:locale" content="en_US" />
					<Meta property="og:title" content={title} />
					<Meta property="og:description" content={description} />
					<Meta property="og:type" content="website" />
					{import.meta.env.PROD && (
						<Meta property="og:url" content={canonical} />
					)}

					{/* TODO: Replace this with Solid OpenGraph */}
					<Meta property="og:image" content={`${origin}/assets/me.jpg`} />
					{/*<OpenGraph origin={origin}>
            <DynamicImage>
              <div>This is very cool!</div>
            </DynamicImage>
          </OpenGraph>*/}
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
