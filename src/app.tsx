import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";
import { pageRoutes } from "virtual:file-routes";
import { isAddySite } from "./host";
import "./app.css";

const Router = createRouter({
	routes: fileRoutes(pageRoutes),
	// The standalone Addy site serves the Addy page from its root instead of
	// redirecting to `/addy`. `transformUrl` only affects route matching, so the
	// browser URL stays `/`.
	transformUrl: (pathname) =>
		isAddySite() && pathname === "/" ? "/addy" : pathname,
});

export default function App() {
	return <Router>{(props) => props.children}</Router>;
}
