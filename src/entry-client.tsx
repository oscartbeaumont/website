// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
// import posthog from 'posthog-js';
import posthog from 'posthog-js/dist/module.no-external'

console.log("GOT", document.currentScript, document.currentScript?.nonce);

// const nonce = document.querySelector('script[nonce]')?.getAttribute('nonce');
// console.log("GOT", nonce);
// if (!import.meta.env.DEV)
	posthog.init("phc_p4ybAvaYqJojhuZD0dVGExGoCCqbWViGzlxQc0AuWUv", {
		api_host: "/ph_4DkU",
		ui_host: "https://us.posthog.com",
		person_profiles: "identified_only",
		// // This is safe because a nonce is designed to prevent code execution in the first place.
		// // If the attacker already has it they can just steal the nonce like we do.
		// prepare_external_dependency_script: (script) => {
  // 		if (nonce)
  //       script.nonce = nonce;
  //     return script
  //   },
  //   prepare_external_dependency_stylesheet: (stylesheet) => {
  //     if (nonce)
  //       stylesheet.nonce = nonce;
  //     return stylesheet
  //   }
	});

mount(() => <StartClient />, document.getElementById("app")!);
