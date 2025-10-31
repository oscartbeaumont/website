// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import posthog from 'posthog-js';

if (!import.meta.env.DEV)
	posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
		api_host: "/ph_4DkU",
		ui_host: "https://us.posthog.com",
		person_profiles: "identified_only",
	});

mount(() => <StartClient />, document.getElementById("app")!);
