// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import "posthog-js/dist/exception-autocapture";
import posthog from "posthog-js/dist/module.no-external";

posthog.init("phc_p4ybAvaYqJojhuZD0dVGExGoCCqbWViGzlxQc0AuWUv", {
	api_host: "/ph_4DkU",
	ui_host: "https://us.posthog.com",
	defaults: "2025-05-24",
	person_profiles: "identified_only",
	capture_exceptions: true,
	debug: import.meta.env.DEV,
});

mount(() => <StartClient />, document.getElementById("app")!);
