// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import "posthog-js/dist/exception-autocapture";
import posthog from "posthog-js/dist/module.no-external";
import { isServer } from "solid-js/web";

if (!isServer && !import.meta.env.DEV)
	posthog.init("phc_p4ybAvaYqJojhuZD0dVGExGoCCqbWViGzlxQc0AuWUv", {
		api_host: "/ph_4DkU",
		ui_host: "https://us.posthog.com",
		defaults: "2025-05-24",
		person_profiles: "identified_only",
		capture_exceptions: true,
	});

mount(() => <StartClient />, document.getElementById("app")!);
