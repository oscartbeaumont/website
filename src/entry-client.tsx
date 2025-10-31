// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY,
  {
    api_host: '/ph_4DkU',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
  }
);

mount(() => <StartClient />, document.getElementById("app")!);
