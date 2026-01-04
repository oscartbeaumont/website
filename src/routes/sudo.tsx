import { redirect } from "@solidjs/router";
// import { HttpHeader, HttpStatusCode } from "@solidjs/start";
import { createResource } from "solid-js";
import { getRequestEvent } from "solid-js/web";

async function todo() {
	"use server";

	const auth = getRequestEvent()?.request.headers.get("Authorization");
	if (!auth) throw redirect("/login");

	return "bruh";
}

export default function Page() {
	const [data] = createResource(() => todo(), { deferStream: true });

	// const auth = getRequestEvent()?.request.headers.get("Authorization");
	// if (!auth) {
	//   return <>
	//     <HttpStatusCode code={401} />
	//     <HttpHeader name="WWW-Authenticate" value="Basic realm='admin'" />
	//     <p>Unauthenticated</p>
	//   </>;
	// }

	// TODO: Logout?
	return <p>Authenticated {data()}</p>;
}
