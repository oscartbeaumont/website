import { getRequestEvent, renderToStream } from "@solidjs/web";
import manifest from "virtual:solid-manifest";
import App from "./app";
import Document from "./Document";

export function render() {
	const nonce = getRequestEvent()?.locals.nonce as string | undefined;
	return renderToStream(
		() => (
			<Document nonce={nonce}>
				<App />
			</Document>
		),
		{ manifest, nonce },
	);
}
