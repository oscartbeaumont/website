// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import posthog from "posthog-js/dist/module.no-external";

if (!import.meta.env.DEV)
	posthog.init("phc_p4ybAvaYqJojhuZD0dVGExGoCCqbWViGzlxQc0AuWUv", {
		api_host: "/ph_4DkU",
		ui_host: "https://us.posthog.com",
		person_profiles: "identified_only",
	});

mount(() => <StartClient />, document.getElementById("app")!);
