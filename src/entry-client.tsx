import { hydrate, isServer } from "@solidjs/web";
import "posthog-js/dist/exception-autocapture";
import posthog from "posthog-js/dist/module.no-external";
import App from "./app";
import Document from "./Document";

if (!isServer && !import.meta.env.DEV)
	posthog.init("phc_p4ybAvaYqJojhuZD0dVGExGoCCqbWViGzlxQc0AuWUv", {
		api_host: "/ph_4DkU",
		ui_host: "https://us.posthog.com",
		defaults: "2025-05-24",
		person_profiles: "identified_only",
		capture_exceptions: true,
	});

hydrate(
	() => (
		<Document>
			<App />
		</Document>
	),
	document,
);
